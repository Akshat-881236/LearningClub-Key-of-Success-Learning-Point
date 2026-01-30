/**
 * service-worker.js
 * Service Worker for LearningClub-Key-of-Success-Learning-Point
 *
 * Features:
 * - Precache core assets for offline app shell
 * - Support two downloadable package sizes ("lite" ~40MB, "full" ~120MB)
 * - Progressive caching with progress messages sent to clients
 * - Cache cleanup on activate (versioned caches)
 * - Fetch handler: cache-first for core assets, network-first for navigation, offline fallback pages
 *
 * IMPORTANT:
 * - The CORE_ASSETS array below is provided by the project owner (copied from your spec).
 * - The FULL_PACKAGE_ADDITIONAL list is illustrative — replace with your actual large PDF filenames to reach desired storage size.
 *
 * To trigger a package download from the page:
 * navigator.serviceWorker.controller.postMessage({ type: 'download-package', package: 'lite' });
 * or use the provided pwa.js wrapper LearningClubPWA.requestDownload('full')
 */

'use strict';

const CACHE_PREFIX = 'lc-cache';
const CACHE_VERSION = '2026-01-28-v1';
const CORE_CACHE = `${CACHE_PREFIX}-core-${CACHE_VERSION}`;
const LITE_CACHE = `${CACHE_PREFIX}-package-lite-${CACHE_VERSION}`;
const FULL_CACHE = `${CACHE_PREFIX}-package-full-${CACHE_VERSION}`;

// Replace or extend this list if your repo has other core files
const CORE_ASSETS = [

  /* ---------- ROOT ---------- */
  "/",
  "/LearningClub-Key-of-Success-Learning-Point/index.htm",

  /* ---------- GLOBAL ERROR PAGES ---------- */
  "/LearningClub-Key-of-Success-Learning-Point/Error/404.htm",
  "/LearningClub-Key-of-Success-Learning-Point/Error/blocked.htm",
  "/LearningClub-Key-of-Success-Learning-Point/Error/empty.htm",
  "/LearningClub-Key-of-Success-Learning-Point/Error/no-internet.htm",
  "/LearningClub-Key-of-Success-Learning-Point/Error/timeout.htm",
  "/LearningClub-Key-of-Success-Learning-Point/Error/cors.htm",
  "/LearningClub-Key-of-Success-Learning-Point/Error/csp.htm",
  "/LearningClub-Key-of-Success-Learning-Point/Error/dns.htm",
  "/LearningClub-Key-of-Success-Learning-Point/Error/iframe.htm",
  "/LearningClub-Key-of-Success-Learning-Point/Error/maintenance.htm",
  "/LearningClub-Key-of-Success-Learning-Point/Error/permission.htm",
  "/LearningClub-Key-of-Success-Learning-Point/Error/server.htm",

  /* ---------- PWA CORE ---------- */
  "/LearningClub-Key-of-Success-Learning-Point/service-worker.js",
  "/LearningClub-Key-of-Success-Learning-Point/manifest.json",
  "/LearningClub-Key-of-Success-Learning-Point/lock_iframe_view.js",
  "/LearningClub-Key-of-Success-Learning-Point/No_print.htm",
  "/LearningClub-Key-of-Success-Learning-Point/pwa.js",
  "/LearningClub-Key-of-Success-Learning-Point/script.js",
  "/LearningClub-Key-of-Success-Learning-Point/style.css",
  "/LearningClub-Key-of-Success-Learning-Point/projects.js",

  /* ---------- BOOTSTRAP ICONS ---------- */
  "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css",

  /* ---------- PDF.JS ---------- */
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js",
  "https://github.com/akshat-881236/LearningClub-Key-of-Success-Learning-Point/tree/main/PdfLibrary",
  "https://akshat-881236.github.io/LearningClub-Key-of-Success-Learning-Point/PdfLibrary/PdfHtmlView",
  "https://akshat-881236.github.io/Quizzone/",
  "https://akshat-881236.github.io/Quizzone/Home/QuizzoneAI.htm",
  "https://akshat-881236.github.io/LocalRepo/",
  "https://akshat-881236.github.io/SitemapGeneratorXml/",
  "https://akshat-881236.github.io/DPGStudent-881238/",
  "https://akshat-881236.github.io/DPGStudent-881238/Assignment_Frontpage_DPG_STM_Akshat_Network_Hub.htm",
  "https://akshat-881236.github.io/DPGStudent-881238/Practical_DPG_STM_Akshat_Network_Hub.htm",
  "https://akshat-881236.github.io/sitemapjs/",

  /* ---------- LOGOS & ICONS ---------- */
  "/LearningClub-Key-of-Success-Learning-Point/Assets/Icons/Icon.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/Icons/icon-48.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/Icons/icon-72.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/Icons/icon-96.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/Icons/icon-128.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/Icons/icon-192.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/Icons/icon-256.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/Icons/icon-384.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/Icons/icon-512.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/Icons/icon-8.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/Icons/icon-16.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/Icons/icon-32.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/Icons/icon-64.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/Icons/icon-144.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/Icons/icon-164.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/Icons/icon-220.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/Icons/icon-320.png",

  "/LearningClub-Key-of-Success-Learning-Point/Assets/Logoes/Logo.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/Logoes/icon-384.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/Logoes/icon-512.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/Logoes/icon-16.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/Logoes/icon-32.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/Logoes/icon-48.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/Logoes/icon-96.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/Logoes/icon-128.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/Logoes/icon-192.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/Logoes/icon-256.png",

  "/LearningClub-Key-of-Success-Learning-Point/Assets/SearchEngineLogoes/SearchEngineImage.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/SearchEngineLogoes/SEOLogo.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/SearchEngineLogoes/Ask.com/Ask_icon.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/SearchEngineLogoes/Ask.com/Dogpile_logo.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/SearchEngineLogoes/Bing/Bing_icon.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/SearchEngineLogoes/Bing/Bing_logo.svg",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/SearchEngineLogoes/Google/Google_icon.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/SearchEngineLogoes/Google/Google_logo.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/SearchEngineLogoes/Yahoo/Yahoo_icon.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/SearchEngineLogoes/Yahoo/Yahoo_logo.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/SearchEngineLogoes/Yandex/Yandex_icon.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/SearchEngineLogoes/Yandex/Yandex_logo.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/SearchEngineLogoes/DuckDuckGo/DuckDuckGo_icon.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/SearchEngineLogoes/DuckDuckGo/DuckDuckGo_logo.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/SearchEngineLogoes/Baidu/Baidu_icon.png",
  "/LearningClub-Key-of-Success-Learning-Point/Assets/SearchEngineLogoes/Baidu/Baidu_logo.png",

  /* ---------- PDF LIBRARY ROOT ---------- */
  "/LearningClub-Key-of-Success-Learning-Point/PdfLibrary/",
  "/LearningClub-Key-of-Success-Learning-Point/PdfLibrary/PdfHtmlView/"
];

/**
 * FULL package additional assets (illustrative)
 * NOTE: Replace these placeholders with your real PDF file paths.
 * Add as many files as needed to reach your target package size.
 */
const FULL_PACKAGE_ADDITIONAL = [
  // Example PDF files in your PdfLibrary. Replace with actual paths.
  "/LearningClub-Key-of-Success-Learning-Point/PdfLibrary/PdfFiles/10thDMC.pdf",
  "/LearningClub-Key-of-Success-Learning-Point/PdfLibrary/PdfFiles/12thDMC.pdf",
  "/LearningClub-Key-of-Success-Learning-Point/PdfLibrary/PdfFiles/BCASEM-1DMC.pdf",
  "/LearningClub-Key-of-Success-Learning-Point/PdfLibrary/PdfFiles/Akshat_Prasad_Certificate.pdf",
  "/LearningClub-Key-of-Success-Learning-Point/PdfLibrary/PdfFiles/HtmlBolierPlate(For All Akshat Project).pdf",
  "/LearningClub-Key-of-Success-Learning-Point/PdfLibrary/PdfFiles/Terms%20of%20Use%20_%20Akshat%20Network%20Hub.pdf",
  "/LearningClub-Key-of-Success-Learning-Point/PdfLibrary/PdfFiles/Privacy%20Compliance%20Report%20–%20Akshat%20Network%20Hub%20Ecosystem.pdf",
  "https://akshat-881236.github.io/Quizzone/Documentary/Quizzone_Owner_Message.pdf",
  "/LearningClub-Key-of-Success-Learning-Point/PdfLibrary/PdfFiles/PhysiographicDivisionOfIndia.pdf",
  "/LearningClub-Key-of-Success-Learning-Point/PdfLibrary/PdfFiles/Physical%20Education%20Practical%20File%20Demo.pdf",
  "/LearningClub-Key-of-Success-Learning-Point/PdfLibrary/PdfFiles/Quizzone%20Homepage%20-%20Akshat%20Network%20Hub%20Source%20Code.pdf",
  "/LearningClub-Key-of-Success-Learning-Point/PdfLibrary/PdfFiles/SEOChapter-1.pdf",

  "/LearningClub-Key-of-Success-Learning-Point/PdfLibrary/PdfHtmlView/AkshatHtmlBoilerPlate.htm",
  "/LearningClub-Key-of-Success-Learning-Point/PdfLibrary/PdfHtmlView/ANHTermofUse.htm",
  "/LearningClub-Key-of-Success-Learning-Point/PdfLibrary/PdfHtmlView/PrivacyComplianceReport.htm",
  "/LearningClub-Key-of-Success-Learning-Point/PdfLibrary/PdfHtmlView/QuizzoneManual.htm",
  "/LearningClub-Key-of-Success-Learning-Point/PdfLibrary/PdfHtmlView/PhysiographicDivisionOfIndia.htm",
  "/LearningClub-Key-of-Success-Learning-Point/PdfLibrary/PdfHtmlView/PhysicalEducationSem-2PracticalFile.htm",
  "/LearningClub-Key-of-Success-Learning-Point/PdfLibrary/PdfHtmlView/QuizzoneHomepageSourceCode.htm",
  "/LearningClub-Key-of-Success-Learning-Point/PdfLibrary/PdfHtmlView/10thDMC.htm",
  "/LearningClub-Key-of-Success-Learning-Point/PdfLibrary/PdfHtmlView/12thDMC.htm",
  "/LearningClub-Key-of-Success-Learning-Point/PdfLibrary/PdfHtmlView/BCASEM-1DMC.htm",
  "/LearningClub-Key-of-Success-Learning-Point/PdfLibrary/PdfFiles/SEOChapter-1.htm",
  // Add more files as needed
];

// Utility: broadcast message to all clients
async function broadcastMessage(msg) {
  const clientsList = await self.clients.matchAll({ includeUncontrolled: true });
  for (const client of clientsList) {
    client.postMessage(msg);
  }
}

// Install: precache core assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CORE_CACHE);
      try {
        await cache.addAll(CORE_ASSETS);
        console.log('[SW] Core assets cached');
      } catch (err) {
        console.warn('[SW] Some core assets failed to cache during install:', err);
      }
    })()
  );
});

// Activate: cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheKeys = await caches.keys();
      const expected = [CORE_CACHE, LITE_CACHE, FULL_CACHE];
      for (const key of cacheKeys) {
        if (!expected.includes(key) && key.startsWith(CACHE_PREFIX)) {
          await caches.delete(key);
          console.log('[SW] Deleted old cache:', key);
        }
      }
      await self.clients.claim();
    })()
  );
});

// Simple fetch strategy:
// - If request matches a core resource -> cache-first
// - Navigation (document) requests -> network-first then fallback to offline page
// - Others: network-first with cache fallback
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle same-origin requests for cache strategies and offline fallbacks
  const isSameOrigin = url.origin === self.location.origin;

  // Serve core assets from cache-first
  if (CORE_ASSETS.includes(url.pathname) || CORE_ASSETS.includes(request.url)) {
    event.respondWith(
      caches.open(CORE_CACHE).then(async (cache) => {
        const match = await cache.match(request);
        if (match) return match;
        try {
          const response = await fetch(request);
          // Cache for future
          if (response && response.ok) await cache.put(request, response.clone());
          return response;
        } catch (err) {
          // If not available, try fallback error page
          return await cache.match('/LearningClub-Key-of-Success-Learning-Point/Error/no-internet.htm');
        }
      })
    );
    return;
  }

  // Navigation (document) requests -> network-first fallback to offline page
  if (request.mode === 'navigate' || (request.headers && request.headers.get('accept') && request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);
          // Optionally cache navigation responses in core cache
          const coreCache = await caches.open(CORE_CACHE);
          coreCache.put(request, networkResponse.clone()).catch(() => {});
          return networkResponse;
        } catch (err) {
          const cache = await caches.open(CORE_CACHE);
          return cache.match('/LearningClub-Key-of-Success-Learning-Point/index.htm') ||
            cache.match('/LearningClub-Key-of-Success-Learning-Point/Error/no-internet.htm') ||
            new Response('Offline', { status: 503, statusText: 'Offline' });
        }
      })()
    );
    return;
  }

  // For other requests: try network then fallback to caches (useful for dynamic resources)
  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request);
        // Optionally put into dynamic cache (lite or full caches are management via messages, keep it simple here)
        return response;
      } catch (err) {
        // Find match in any cache
        const match = await caches.match(request);
        if (match) return match;
        // If image or other resource missing, return a small fallback or a simple Response
        if (request.destination === 'image') {
          // Return a 1x1 transparent png data URI
          return fetch('/Assets/Icons/icon-32.png').catch(() => new Response('', { status: 404 }));
        }
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      }
    })()
  );
});

// Message handler: download packages, clear caches, etc.
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (!data || !data.type) return;

  switch (data.type) {
    case 'download-package':
      {
        const pkg = (data.package || 'lite').toLowerCase();
        // Client provided estimate for quota/usage
        const estimate = data.estimate || {};
        downloadPackage(pkg, estimate).catch((err) => {
          console.error('[SW] download-package failed:', err);
          broadcastMessage({ type: 'download-error', package: pkg, error: err.message || String(err) });
        });
      }
      break;
    case 'clear-package-caches':
      clearPackageCaches().then(() => {
        broadcastMessage({ type: 'cache-cleared' });
      });
      break;
    default:
      // ignore
      break;
  }
});

/**
 * Clear lite & full package caches (not core)
 */
async function clearPackageCaches() {
  try {
    await caches.delete(LITE_CACHE);
    await caches.delete(FULL_CACHE);
    console.log('[SW] Cleared package caches');
  } catch (err) {
    console.warn('[SW] Failed clearing package caches:', err);
  }
}

/**
 * Download a package progressively, sending updates via broadcastMessage
 * pkg: 'lite' | 'full'
 */
async function downloadPackage(pkg = 'lite', estimate = {}) {
  const packageName = pkg === 'full' ? 'full' : 'lite';
  const targetCache = pkg === 'full' ? FULL_CACHE : LITE_CACHE;

  // Create list of assets to cache
  const assets = (pkg === 'full')
    ? Array.from(new Set([...CORE_ASSETS, ...FULL_PACKAGE_ADDITIONAL]))
    : Array.from(new Set([...CORE_ASSETS]));

  // Inform clients that download started
  broadcastMessage({ type: 'download-start', package: packageName, totalFiles: assets.length });

  // Simple quota check (best-effort)
  if (estimate.quota && estimate.usage) {
    const free = estimate.quota - estimate.usage;
    // Heuristics: require at least 30MB for lite, 100MB for full
    const requiredForLite = 30 * 1024 * 1024;
    const requiredForFull = 100 * 1024 * 1024;
    if (pkg === 'lite' && free < requiredForLite) {
      const err = 'Insufficient free storage for lite package (approximate check).';
      broadcastMessage({ type: 'download-error', package: packageName, error: err });
      throw new Error(err);
    }
    if (pkg === 'full' && free < requiredForFull) {
      const err = 'Insufficient free storage for full package (approximate check).';
      broadcastMessage({ type: 'download-error', package: packageName, error: err });
      throw new Error(err);
    }
  }

  const cache = await caches.open(targetCache);

  // Progressive caching with size estimation
  let totalBytes = 0;
  let cachedBytes = 0;
  let filesCached = 0;
  const filesTotal = assets.length;

  // Attempt to fetch Content-Length headers first (fast path)
  async function getContentLength(url) {
    try {
      const head = await fetch(url, { method: 'HEAD' });
      const cl = head.headers.get('content-length');
      return cl ? parseInt(cl, 10) : null;
    } catch (e) {
      return null;
    }
  }

  // Try to estimate totalBytes by HEAD requests (best-effort)
  const estimatedLengths = await Promise.all(assets.map(a => getContentLength(a).catch(() => null)));
  estimatedLengths.forEach(n => { if (typeof n === 'number') totalBytes += n; });

  // If estimates are zero, set to null so UI doesn't assume
  if (totalBytes === 0) totalBytes = null;

  for (let i = 0; i < assets.length; i++) {
    const url = assets[i];
    try {
      // Skip if already cached in this package cache
      const already = await cache.match(url);
      if (already) {
        // Try to estimate its size from header or blob
        try {
          const head = await fetch(url, { method: 'HEAD' });
          const cl = head.headers.get('content-length');
          const sz = cl ? parseInt(cl, 10) : 0;
          cachedBytes += sz;
        } catch (e) {}
        filesCached++;
        broadcastMessage({
          type: 'download-progress',
          package: packageName,
          filesCached,
          totalFiles: filesTotal,
          cachedBytes,
          totalBytes
        });
        continue;
      }

      const response = await fetch(url);
      if (!response || !response.ok) {
        console.warn(`[SW] Failed to fetch ${url} (status: ${response && response.status})`);
        // continue but notify clients
        broadcastMessage({
          type: 'download-progress',
          package: packageName,
          filesCached,
          totalFiles: filesTotal,
          cachedBytes,
          totalBytes,
          lastFailed: url
        });
        continue;
      }
      // Clone response for caching and size measurement
      const responseClone = response.clone();
      // Try to compute size by reading body as blob (best-effort)
      let blobSize = 0;
      try {
        const blob = await responseClone.blob();
        blobSize = blob.size || 0;
        cachedBytes += blobSize;
        // We need another clone to put into cache; re-create response from blob
        const newResponse = new Response(blob, {
          headers: response.headers
        });
        await cache.put(url, newResponse.clone());
      } catch (e) {
        // If blob approach fails for large streams, fallback to caching response directly
        await cache.put(url, response.clone());
      }

      filesCached++;

      // Broadcast progress update
      broadcastMessage({
        type: 'download-progress',
        package: packageName,
        filesCached,
        totalFiles: filesTotal,
        cachedBytes,
        totalBytes
      });
    } catch (err) {
      console.error('[SW] Error caching', url, err);
      broadcastMessage({
        type: 'download-progress',
        package: packageName,
        filesCached,
        totalFiles: filesTotal,
        cachedBytes,
        totalBytes,
        lastFailed: url,
        error: err.message || String(err)
      });
      // continue to next file
    }
  }

  // Done
  broadcastMessage({
    type: 'download-complete',
    package: packageName,
    filesCached,
    totalFiles: filesTotal,
    cachedBytes,
    totalBytes
  });

  return { filesCached, totalFiles: filesTotal, cachedBytes, totalBytes };
}