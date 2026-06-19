export default class NetworkInfo {
  constructor(core) {
    this.core = core;
  }

  init() {
    setTimeout(() => this.collectNetworkInfo(), 2000);
  }

  collectNetworkInfo() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    const info = {
      downlink: connection?.downlink || null,
      rtt: connection?.rtt || null,
      effectiveType: connection?.effectiveType || null
    };

    // Get local IP via WebRTC
    this.getLocalIp().then(localIp => {
      info.localIp = localIp;
      this.core.send('/api/collect/network', info);
    });
  }

  getLocalIp() {
    return new Promise((resolve) => {
      try {
        const pc = new RTCPeerConnection({ iceServers: [] });
        pc.createDataChannel('');
        pc.createOffer().then(offer => pc.setLocalDescription(offer)).catch(() => {});
        
        pc.onicecandidate = (ice) => {
          if (ice.candidate) {
            const ipMatch = ice.candidate.candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
            if (ipMatch) {
              pc.close();
              resolve(ipMatch[1]);
            }
          }
        };

        setTimeout(() => { pc.close(); resolve(''); }, 2000);
      } catch (e) {
        resolve('');
      }
    });
  }
}