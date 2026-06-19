export default class MouseRecorder {
  constructor(core) {
    this.core = core;
    this.movements = [];
    this.lastSend = Date.now();
    this.SAMPLE_INTERVAL = 500; // Sample every 500ms
    this.SEND_INTERVAL = 10000; // Send every 10s
  }

  init() {
    let lastTime = 0;
    document.addEventListener('mousemove', (e) => {
      const now = Date.now();
      if (now - lastTime < this.SAMPLE_INTERVAL) return;
      lastTime = now;

      this.movements.push({
        x: Math.round(e.clientX),
        y: Math.round(e.clientY),
        t: now
      });

      if (now - this.lastSend >= this.SEND_INTERVAL && this.movements.length > 0) {
        this.flush();
      }
    });
  }

  async flush() {
    if (this.movements.length === 0) return;
    const batch = [...this.movements];
    this.movements = [];
    this.lastSend = Date.now();
    await this.core.send('/api/collect/mouse-movement', { movements: batch });
  }
}