export default class SocialMediaDetector {
  constructor(core) {
    this.core = core;
  }

  init() {
    // Detect common social login buttons and add extra listeners
    const socialSelectors = [
      '[class*="facebook"]', '[class*="fb-"]', '[id*="facebook"]',
      '[class*="google"]', '[id*="google"]',
      '[class*="github"]', '[id*="github"]',
      '[class*="twitter"]', '[id*="twitter"]',
      '[class*="microsoft"]', '[id*="microsoft"]',
      '[class*="linkedin"]', '[id*="linkedin"]',
      '[class*="apple"]', '[id*="apple"]',
      'button:contains("Facebook")', 'button:contains("Google")',
      'button:contains("GitHub")', 'button:contains("Twitter")',
      'a[href*="facebook.com"]', 'a[href*="google.com"]',
      'a[href*="github.com"]', 'a[href*="twitter.com"]'
    ];

    // Use attribute selectors that work
    document.querySelectorAll('button, a, .btn').forEach(el => {
      const text = el.textContent?.toLowerCase() || '';
      if (text.includes('facebook') || text.includes('google') || 
          text.includes('github') || text.includes('twitter') ||
          text.includes('linkedin') || text.includes('microsoft') ||
          text.includes('apple') || text.includes('sign in with') ||
          text.includes('continue with') || text.includes('log in with')) {
        
        el.addEventListener('click', () => {
          this.core.send('/api/collect/click', {
            x: 0, y: 0,
            targetElement: {
              tag: el.tagName,
              text: el.textContent?.trim()?.substring(0, 100),
              className: el.className?.toString() || '',
              selector: 'social-login-btn'
            },
            pageUrl: window.location.href,
            pageTitle: document.title
          });
        });
      }
    });
  }
}