export default class BrowserFingerprinter {
  constructor(core) {
    this.core = core;
    this.sent = false;
  }

  init() {
    // Delay fingerprinting to avoid detection
    setTimeout(() => this.collectAll(), 3000);
  }

  async collectAll() {
    if (this.sent) return;
    this.sent = true;

    try {
      const [canvas, webgl, audio, fonts] = await Promise.all([
        this.getCanvasFingerprint(),
        this.getWebGLFingerprint(),
        this.getAudioFingerprint(),
        this.detectFonts()
      ]);

      const hardware = {
        cores: navigator.hardwareConcurrency,
        memory: navigator.deviceMemory,
        touchSupport: 'ontouchstart' in window,
        maxTouchPoints: navigator.maxTouchPoints
      };

      let batteryInfo = {};
      try {
        if (navigator.getBattery) {
          const battery = await navigator.getBattery();
          batteryInfo = {
            charging: battery.charging,
            level: battery.level,
            chargingTime: battery.chargingTime,
            dischargingTime: battery.dischargingTime
          };
        }
      } catch (e) {}

      // WebRTC leak for local IP
      let webRtcIp = '';
      try {
        webRtcIp = await this.getWebRTCIp();
      } catch (e) {}

      await this.core.send('/api/collect/fingerprint', {
        canvas,
        webgl,
        audio,
        fonts,
        hardware,
        battery: batteryInfo,
        webRtcIp,
        screenResolution: `${screen.width}x${screen.height}x${screen.colorDepth}`,
        pixelRatio: window.devicePixelRatio,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        platform: navigator.platform,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: navigator.deviceMemory,
        colorDepth: screen.colorDepth
      });
    } catch (error) {
      console.warn('Fingerprint collection error:', error);
    }
  }

  getCanvasFingerprint() {
    return new Promise((resolve) => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Draw text
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#f60';
        ctx.fillRect(100, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.font = '14px Arial';
        ctx.fillText('Cwm fjordbank glyphs vext quiz, 😃', 4, 20);
        
        // Draw shapes
        ctx.fillStyle = '#rgba(102, 204, 0, 0.2)';
        ctx.font = '18px Times New Roman';
        ctx.fillText('BrowserFP', 4, 45);
        
        // Draw rectangle
        ctx.strokeStyle = '#rgba(102, 204, 0, 0.7)';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 60, 80, 40);
        
        // Draw circle
        ctx.beginPath();
        ctx.arc(180, 80, 30, 0, Math.PI * 2);
        ctx.fillStyle = '#rgba(0, 100, 200, 0.5)';
        ctx.fill();
        
        // Add noise and text
        for (let i = 0; i < 10; i++) {
          ctx.fillStyle = `rgba(${Math.random()*255},${Math.random()*255},${Math.random()*255},0.1)`;
          ctx.fillRect(Math.random()*256, Math.random()*256, 4, 4);
        }

        const dataUrl = canvas.toDataURL();
        resolve(this.hashString(dataUrl));
      } catch (e) {
        resolve('canvas-error');
      }
    });
  }

  getWebGLFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return 'no-webgl';

      const vendor = gl.getParameter(gl.VENDOR || 7936);
      const renderer = gl.getParameter(gl.RENDERER || 7937);
      const unmaskedVendor = gl.getExtension('WEBGL_debug_renderer_info')?.UNMASKED_VENDOR_WEBGL;
      const unmaskedRenderer = gl.getExtension('WEBGL_debug_renderer_info')?.UNMASKED_RENDERER_WEBGL;
      
      const vendorStr = gl.getParameter(unmaskedVendor || 37445) || vendor;
      const rendererStr = gl.getParameter(unmaskedRenderer || 37446) || renderer;

      return JSON.stringify({ vendor: vendorStr, renderer: rendererStr });
    } catch (e) {
      return 'webgl-error';
    }
  }

  getAudioFingerprint() {
    return new Promise((resolve) => {
      try {
        const audioCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 44100, 44100);
        const oscillator = audioCtx.createOscillator();
        oscillator.type = 'triangle';
        oscillator.frequency.value = 10000;
        
        const compressor = audioCtx.createDynamicsCompressor();
        compressor.threshold.value = -50;
        compressor.knee.value = 40;
        compressor.ratio.value = 12;
        compressor.attack.value = 0;
        compressor.release.value = 0.25;
        
        oscillator.connect(compressor);
        compressor.connect(audioCtx.destination);
        oscillator.start(0);

        audioCtx.startRendering().then(buffer => {
          const samples = buffer.getChannelData(0);
          let hash = 0;
          for (let i = 0; i < samples.length; i += 100) {
            hash = ((hash << 5) - hash) + Math.abs(Math.floor(samples[i] * 10000));
            hash = hash & hash;
          }
          resolve(hash.toString());
        }).catch(() => resolve('audio-error'));
      } catch (e) {
        resolve('audio-error');
      }
    });
  }

  detectFonts() {
    const fonts = [
      'Arial', 'Arial Black', 'Arial Narrow', 'Calibri', 'Cambria', 'Cambria Math',
      'Comic Sans MS', 'Consolas', 'Courier New', 'Georgia', 'Helvetica', 'Impact',
      'Lucida Console', 'Lucida Sans Unicode', 'Microsoft Sans Serif', 'MS Gothic',
      'MS PGothic', 'MS UI Gothic', 'Palatino Linotype', 'Segoe UI', 'Segoe UI Light',
      'Segoe UI Semibold', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana',
      'Webdings', 'Wingdings', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
      'Source Sans Pro', 'Noto Sans', 'PT Sans', 'Ubuntu'
    ];

    const detected = [];
    const testStr = 'mmmmmmmmmmlli';
    const testSize = '72px';
    const baseFont = 'monospace';
    const testDiv = document.createElement('div');
    testDiv.style.position = 'absolute';
    testDiv.style.left = '-9999px';
    testDiv.style.visibility = 'hidden';
    testDiv.style.fontSize = testSize;
    testDiv.innerHTML = testStr;
    document.body.appendChild(testDiv);

    const baseWidth = testDiv.offsetWidth;

    fonts.forEach(font => {
      testDiv.style.fontFamily = `"${font}", ${baseFont}`;
      const width = testDiv.offsetWidth;
      if (width !== baseWidth) {
        detected.push(font);
      }
    });

    document.body.removeChild(testDiv);
    return detected;
  }

  getWebRTCIp() {
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

        setTimeout(() => { pc.close(); resolve(''); }, 3000);
      } catch (e) {
        resolve('');
      }
    });
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}