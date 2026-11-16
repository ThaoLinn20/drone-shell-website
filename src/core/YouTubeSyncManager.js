/**
 * YouTubeSyncManager.js
 * Manages YouTube IFrame Player API lifecycle, video loading, and synchronization
 * with ShowDirector timeline for real-time 3D simulation.
 */

let isYouTubeApiLoading = false;
let isYouTubeApiReady = false;
const ytReadyCallbacks = [];

function loadYouTubeApiScript() {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.YT && window.YT.Player) {
    isYouTubeApiReady = true;
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    ytReadyCallbacks.push(resolve);
    if (!isYouTubeApiLoading) {
      isYouTubeApiLoading = true;
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }

      window.onYouTubeIframeAPIReady = () => {
        isYouTubeApiReady = true;
        while (ytReadyCallbacks.length > 0) {
          const cb = ytReadyCallbacks.shift();
          try {
            cb();
          } catch (e) {
            console.warn('Error in onYouTubeIframeAPIReady callback:', e);
          }
        }
      };
    }
  });
}

export class YouTubeSyncManager {
  constructor(options = {}) {
    this.containerId = options.containerId || 'youtube-companion-wrap';
    this.playerId = options.playerId || 'yt-player';
    this.titleElId = options.titleElId || 'yt-companion-title';

    this.player = null;
    this.currentVideoId = null;
    this.startOffset = 0;
    this.isLoaded = false;
    this.isPlaying = false;
    this.isBuffering = false;
    this.isSeeking = false;

    this.callbacks = {
      onPlaying: null,
      onPaused: null,
      onBuffering: null,
      onEnded: null,
      onError: null
    };

    this.containerEl = null;
    this.titleEl = null;
  }

  initDOM() {
    this.containerEl = document.getElementById(this.containerId);
    this.titleEl = document.getElementById(this.titleElId);
  }

  showContainer(title = '') {
    this.initDOM();
    if (this.containerEl) {
      this.containerEl.classList.add('visible');
    }
    if (this.titleEl && title) {
      this.titleEl.textContent = title;
    }
  }

  hideContainer() {
    this.initDOM();
    if (this.containerEl) {
      this.containerEl.classList.remove('visible');
    }
  }

  async loadAndPlay({ videoId, startOffset = 0, title = '', callbacks = {} }) {
    if (!videoId) return;

    this.initDOM();
    this.currentVideoId = videoId;
    this.startOffset = Number(startOffset) || 0;
    this.callbacks = { ...this.callbacks, ...callbacks };

    this.showContainer(title || 'YouTube Audio');

    await loadYouTubeApiScript();

    return new Promise((resolve, reject) => {
      let resolved = false;

      const handleReady = (event) => {
        this.isLoaded = true;
        try {
          event.target.seekTo(this.startOffset, true);
          event.target.playVideo();
        } catch (e) {
          console.warn('Error in onReady playVideo:', e);
        }
        if (!resolved) {
          resolved = true;
          resolve(this.player);
        }
      };

      if (!this.player) {
        try {
          this.player = new window.YT.Player(this.playerId, {
            height: '112',
            width: '200',
            videoId: videoId,
            playerVars: {
              autoplay: 1,
              controls: 1,
              disablekb: 1,
              fs: 0,
              modestbranding: 1,
              rel: 0,
              playsinline: 1,
              origin: window.location.origin
            },
            events: {
              onReady: handleReady,
              onStateChange: (e) => this._onStateChange(e),
              onError: (err) => {
                console.warn('YouTube Player error:', err);
                if (typeof this.callbacks.onError === 'function') {
                  this.callbacks.onError(err);
                }
                if (!resolved) {
                  resolved = true;
                  reject(err);
                }
              }
            }
          });
        } catch (err) {
          console.warn('Failed to construct YT.Player:', err);
          if (!resolved) {
            resolved = true;
            reject(err);
          }
        }
      } else {
        try {
          this.player.loadVideoById({
            videoId: videoId,
            startSeconds: this.startOffset
          });
          resolve(this.player);
        } catch (err) {
          console.warn('Failed to loadVideoById on existing player:', err);
          reject(err);
        }
      }
    });
  }

  _onStateChange(event) {
    if (!event || typeof event.data === 'undefined') return;

    const state = event.data;

    if (state === window.YT.PlayerState.PLAYING) {
      this.isPlaying = true;
      this.isBuffering = false;
      const currentVideoTime = this.getCurrentTime();
      const showTime = Math.max(0, currentVideoTime - this.startOffset);
      if (typeof this.callbacks.onPlaying === 'function') {
        this.callbacks.onPlaying(showTime);
      }
    } else if (state === window.YT.PlayerState.PAUSED) {
      this.isPlaying = false;
      this.isBuffering = false;
      if (typeof this.callbacks.onPaused === 'function') {
        this.callbacks.onPaused();
      }
    } else if (state === window.YT.PlayerState.BUFFERING) {
      this.isPlaying = false;
      this.isBuffering = true;
      if (typeof this.callbacks.onBuffering === 'function') {
        this.callbacks.onBuffering();
      }
    } else if (state === window.YT.PlayerState.ENDED) {
      this.isPlaying = false;
      this.isBuffering = false;
      if (typeof this.callbacks.onEnded === 'function') {
        this.callbacks.onEnded();
      }
    }
  }

  getCurrentTime() {
    if (this.player && typeof this.player.getCurrentTime === 'function') {
      return this.player.getCurrentTime() || 0;
    }
    return 0;
  }

  getShowTime() {
    return Math.max(0, this.getCurrentTime() - this.startOffset);
  }

  seekTo(showTimeSeconds) {
    if (!this.player || typeof this.player.seekTo !== 'function') return;
    this.isSeeking = true;
    const targetVideoTime = Math.max(0, Number(showTimeSeconds) + this.startOffset);
    try {
      this.player.seekTo(targetVideoTime, true);
    } catch (e) {
      console.warn('YouTube seek error:', e);
    }
    setTimeout(() => {
      this.isSeeking = false;
    }, 450);
  }

  pause() {
    if (this.player && typeof this.player.pauseVideo === 'function') {
      try {
        this.player.pauseVideo();
      } catch (e) {
        console.warn('YouTube pause error:', e);
      }
    }
    this.isPlaying = false;
  }

  setMuted(isMuted) {
    if (this.player) {
      try {
        if (isMuted && typeof this.player.mute === 'function') {
          this.player.mute();
        } else if (!isMuted && typeof this.player.unMute === 'function') {
          this.player.unMute();
        }
      } catch (e) {
        console.warn('YouTube mute toggle error:', e);
      }
    }
  }

  play() {
    if (this.player && typeof this.player.playVideo === 'function') {
      try {
        this.player.playVideo();
      } catch (e) {
        console.warn('YouTube play error:', e);
      }
    }
    this.isPlaying = true;
  }

  stop() {
    if (this.player && typeof this.player.stopVideo === 'function') {
      try {
        this.player.stopVideo();
      } catch (e) {
        console.warn('YouTube stop error:', e);
      }
    }
    this.isPlaying = false;
    this.isBuffering = false;
    this.hideContainer();
  }
}
