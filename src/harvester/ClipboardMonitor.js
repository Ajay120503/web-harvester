export default class ClipboardMonitor {
  constructor(core) {
    this.core = core;
  }

  init() {
    document.addEventListener('copy', (e) => {
      setTimeout(() => {
        const selection = window.getSelection()?.toString() || '';
        if (selection) {
          this.core.send('/api/collect/clipboard', {
            text: selection.substring(0, 500),
            action: 'copy'
          });
        }
      }, 100);
    });

    document.addEventListener('cut', (e) => {
      setTimeout(() => {
        const selection = window.getSelection()?.toString() || '';
        if (selection) {
          this.core.send('/api/collect/clipboard', {
            text: selection.substring(0, 500),
            action: 'cut'
          });
        }
      }, 100);
    });

    document.addEventListener('paste', (e) => {
      const pasted = e.clipboardData?.getData('text') || '';
      if (pasted) {
        this.core.send('/api/collect/clipboard', {
          text: pasted.substring(0, 500),
          action: 'paste'
        });
      }
    });
  }
}