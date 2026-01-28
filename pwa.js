/**
 * pwa.js
 * Registration helper and UI integration for LearningClub-Key-of-Success-Learning-Point PWA
 *
 * Responsibilities:
 * - Register service worker
 * - Expose functions to request "lite" (≈40MB) or "full" (≈120MB) offline packages
 * - Monitor storage estimate and provide progress callbacks
 *
 * Usage:
 * LearningClubPWA.init({
 *   onStateChange: (state) => { ... },
 *   onProgress: (progress) => { ... },
 *   onComplete: (info) => { ... },
 *   onError: (err) => { ... }
 * });
 * LearningClubPWA.requestDownload('lite'); // or 'full'
 * LearningClubPWA.clearCachedPackage(); // clears package caches
 */

const LearningClubPWA = (function () {
  const SW_PATH = '/LearningClub-Key-of-Success-Learning-Point/service-worker.js';
  let registration = null;
  let callbacks = {
    onStateChange: () => {},
    onProgress: () => {},
    onComplete: () => {},
    onError: () => {}
  };

  // Public init: register service worker and wire messaging
  async function init(options = {}) {
    callbacks = Object.assign(callbacks, options);

    if ('serviceWorker' in navigator) {
      try {
        registration = await navigator.serviceWorker.register(SW_PATH, { scope: '/LearningClub-Key-of-Success-Learning-Point/' });
        console.info('[PWA] ServiceWorker registered:', registration.scope);
        callbacks.onStateChange({ state: 'registered', registration });

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          const data = event.data || {};
          if (!data || !data.type) return;
          handleSWMessage(data);
        });

        // If there's an active worker notify ready
        if (navigator.serviceWorker.controller) {
          callbacks.onStateChange({ state: 'controller-active' });
        }
        return registration;
      } catch (err) {
        console.error('[PWA] ServiceWorker registration failed:', err);
        callbacks.onError(err);
        throw err;
      }
    } else {
      const err = new Error('ServiceWorker not supported in this browser.');
      callbacks.onError(err);
      throw err;
    }
  }

  // Handle incoming messages from SW
  function handleSWMessage(msg) {
    switch (msg.type) {
      case 'download-progress':
        // msg: { package, filesCached, totalFiles, cachedBytes, totalBytes }
        callbacks.onProgress(msg);
        break;
      case 'download-start':
        callbacks.onStateChange({ state: 'download-start', package: msg.package });
        break;
      case 'download-complete':
        callbacks.onComplete(msg);
        callbacks.onStateChange({ state: 'download-complete', package: msg.package });
        break;
      case 'download-error':
        callbacks.onError(msg.error || new Error('download error'));
        break;
      case 'cache-cleared':
        callbacks.onStateChange({ state: 'cache-cleared' });
        break;
      default:
        // general messages
        callbacks.onStateChange({ state: msg.type, payload: msg });
    }
  }

  // Request the service worker to download one of the packages
  // packageType: 'lite' or 'full'
  async function requestDownload(packageType = 'lite', opts = {}) {
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
      const err = new Error('No active service worker controller. Make sure the page is controlled.');
      callbacks.onError(err);
      throw err;
    }

    // Check storage estimate
    try {
      const estimate = await navigator.storage.estimate();
      const quota = estimate.quota || 0;
      const usage = estimate.usage || 0;
      // Send estimate to SW as part of the request so SW can decide whether to proceed
      navigator.serviceWorker.controller.postMessage({
        type: 'download-package',
        package: packageType,
        options: opts,
        estimate: { quota, usage }
      });
      callbacks.onStateChange({ state: 'download-requested', package: packageType, estimate });
      return { requested: true, estimate };
    } catch (err) {
      callbacks.onError(err);
      throw err;
    }
  }

  async function clearCachedPackage() {
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
      const err = new Error('No active service worker controller.');
      callbacks.onError(err);
      throw err;
    }
    navigator.serviceWorker.controller.postMessage({ type: 'clear-package-caches' });
    return true;
  }

  // Utility to check current storage usage/quota and return human readable
  async function getStorageEstimate() {
    if (!navigator.storage || !navigator.storage.estimate) return null;
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0,
      usageInMB: ((estimate.usage || 0) / (1024 * 1024)),
      quotaInMB: ((estimate.quota || 0) / (1024 * 1024))
    };
  }

  // Optional helper to detect if app is already cached (very lightweight check)
  async function isPackageCached(packageType = 'lite') {
    if (!('caches' in window)) return false;
    const cacheName = packageType === 'full' ? 'lc-package-full' : 'lc-package-lite';
    const keys = await caches.keys();
    return keys.includes(cacheName);
  }

  return {
    init,
    requestDownload,
    clearCachedPackage,
    getStorageEstimate,
    isPackageCached
  };
})();

// Expose to window for direct usage from pages
window.LearningClubPWA = LearningClubPWA;