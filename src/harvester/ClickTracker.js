export default class ClickTracker {
  constructor(core) {
    this.core = core;
    this.batch = [];
    this.batchTimer = null;
    this.BATCH_INTERVAL = 2000;
    this.MAX_BATCH = 20;
  }

  init() {
    document.addEventListener('click', this.handleClick.bind(this), true);
  }

  handleClick(event) {
    const target = event.target;
    const elementInfo = {
      tag: target.tagName?.toLowerCase() || '',
      id: target.id || '',
      className: (target.className && typeof target.className === 'string') ? target.className : '',
      text: target.textContent?.trim()?.substring(0, 100) || '',
      href: target.href || '',
      src: target.src || '',
      selector: this.getElementSelector(target),
      innerText: target.innerText?.trim()?.substring(0, 100) || ''
    };

    this.batch.push({
      x: event.clientX,
      y: event.clientY,
      targetElement: elementInfo,
      pageUrl: window.location.href,
      pageTitle: document.title,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      timestamp: Date.now()
    });

    if (this.batch.length >= this.MAX_BATCH) {
      this.flush();
    } else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => this.flush(), this.BATCH_INTERVAL);
    }
  }

  getElementSelector(el) {
    if (!el || el === document) return 'document';
    if (el.id) return `#${el.id}`;
    let path = [];
    while (el && el !== document.body && el !== document) {
      let selector = el.tagName?.toLowerCase() || '';
      if (el.id) { path.unshift(`#${el.id}`); break; }
      if (el.className && typeof el.className === 'string') {
        const classes = el.className.trim().split(/\s+/).filter(c => c).slice(0, 2);
        if (classes.length) selector += '.' + classes.join('.');
      }
      path.unshift(selector);
      el = el.parentElement;
    }
    return path.join(' > ');
  }

  async flush() {
    if (this.batch.length === 0) return;
    const batch = [...this.batch];
    this.batch = [];
    this.batchTimer = null;
    
    for (const click of batch) {
      await this.core.send('/api/collect/click', click);
    }
  }
}