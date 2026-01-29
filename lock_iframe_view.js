/**
 * Akshat Network Hub
 * Akshat Prasad
 * Learning Club Authorized JavaScript Code
 *
 * lock_iframe_view.js  — High-core security iframe/referrer protection logic
 *
 * Purpose:
 * - Prevent unauthorized embedding (iframe) and unauthorized external linking to pages that include this script.
 * - If the page is embedded or reached from an external site (outside the allowed GitHub Pages host + repo),
 *   show an alert and redirect the visitor to a dedicated error page.
 * - Provide hardened, multi-layered checks and best-effort "frame-bust" behavior.
 *
 * Security/Behavior highlights:
 * - Strict referrer validation against allowed host + repo segment.
 * - Fallbacks for cross-origin framed contexts using document.referrer.
 * - Attempt to break out of a hostile frame by navigating top-level when possible.
 * - Detect anchor/hash and query-based doorway links and treat them as possible external doorway attempts.
 * - Detect meta Content-Security-Policy frame-ancestors directives (if present in meta tag) and respect them.
 * - Avoid redirect loops and minimize false positives for direct navigation/bookmarks.
 *
 * Notes & Limitations:
 * - JavaScript cannot read response headers like X-Frame-Options or remote CSP; it can only read <meta http-equiv="Content-Security-Policy">.
 * - No secret/server-side key is used here; it is a client-side defense-in-depth measure. For stronger protection, use server headers (X-Frame-Options, CSP frame-ancestors) on your hosting/CDN.
 * - Customize ALLOWED_HOST, ALLOWED_ORIGINS_ALLOWLIST, and ERROR_PATHS below for your site and error pages.
 */

(function () {
  'use strict';

  /* =========================
     CONFIGURATION
     ========================= */
  var ALLOWED_HOST = 'akshat-881236.github.io'; // allowed host (your GitHub Pages host)
  // Allowed origins (full origin strings) that are explicitly allowed to embed/link.
  // Example: 'https://akshat-881236.github.io' or specific partner sites if needed.
  var ALLOWED_ORIGINS_ALLOWLIST = [
    'https://' + ALLOWED_HOST
  ];

  // Error page paths (relative to origin). Adjust if your repo/paths differ.
  var ERROR_PATHS = {
    NOT_FOUND: '/LearningClub-Key-of-Success-Learning-Point/Error/404.htm',
    EMPTY: '/LearningClub-Key-of-Success-Learning-Point/Error/empty.htm',
    IFRAME: '/LearningClub-Key-of-Success-Learning-Point/Error/iframe.htm',
    BLOCKED: '/LearningClub-Key-of-Success-Learning-Point/Error/blocked.htm',
    OFFLINE: '/LearningClub-Key-of-Success-Learning-Point/Error/no-internet.htm',
    TIMEOUT: '/LearningClub-Key-of-Success-Learning-Point/Error/timeout.htm',
    PERMISSION: '/LearningClub-Key-of-Success-Learning-Point/Error/permission.htm',
    CORS: '/LearningClub-Key-of-Success-Learning-Point/Error/cors.htm',
    CSP: '/LearningClub-Key-of-Success-Learning-Point/Error/csp.htm',
    DNS: '/LearningClub-Key-of-Success-Learning-Point/Error/dns.htm',
    SERVER: '/LearningClub-Key-of-Success-Learning-Point/Error/server.htm',
    MAINTENANCE: '/LearningClub-Key-of-Success-Learning-Point/Error/maintenance.htm'
  };

  var ALERT_MESSAGES = {
    IFRAME: 'This page may not be displayed inside frames on unauthorized sites. You will be redirected.',
    BLOCKED: 'Access blocked: this page was reached from an unauthorized site. You will be redirected.',
    OFFLINE: 'No internet connection detected. Redirecting to offline information page.',
    PERMISSION: 'Permission error while checking access. You will be redirected.',
    CSP: 'Content Security Policy prohibits framing or allowed origins are restricted. Redirecting.',
    DEFAULT: 'Access violation detected. You will be redirected.'
  };

  /* =========================
     ALSO ONLOAD CHECK PAGE URL MATCH ALLOW PATTERNS . URL MUST MATCH ABOVE RULES
     ========================= */

/* Optional comment shown to user (can be customized or left empty) */
const ACCESS_COMMENT = "This content is restricted to the official Learning Club domain.";

if (location.hostname !== ALLOWED_HOST) {
  // Alert with optional comment
  alert(
    "Access Denied: Unauthorized Host.\n\n" +
    (ACCESS_COMMENT ? "Note: " + ACCESS_COMMENT + "\n\n" : "") +
    "You will be redirected to the official Learning Club site."
  );

  const redirectURL =
    "https://" + ALLOWED_HOST + "/LearningClub-Key-of-Success-Learning-Point/";

  // Open official site in new tab
  window.open(redirectURL, "_blank", "noopener,noreferrer");

  /* ===== HARD BLOCK CURRENT PAGE ===== */

  // Stop page loading
  document.documentElement.innerHTML = "";

  // Optional visual block message
  document.body.innerHTML = `
    <div style="
      display:flex;
      align-items:center;
      justify-content:center;
      height:100vh;
      background:#0b0b0b;
      color:#ffffff;
      font-family:Arial, sans-serif;
      text-align:center;
      padding:20px;
    ">
      <div>
        <h1 style="color:#ff4d4d;">Access Restricted</h1>
        <p>This page is not authorized to run on this domain.</p>
        ${ACCESS_COMMENT ? `<p><b>Reason:</b> ${ACCESS_COMMENT}</p>` : ""}
        <p>Please use the official Learning Club website.</p>
      </div>
    </div>
  `;

  // Stop all further JS execution
  throw new Error("Unauthorized Host Blocked");
}



  /* =========================
     HELPERS
     ========================= */

  function resolveErrorUrl(path) {
    try {
      return new URL(path, location.origin).href;
    } catch (e) {
      return location.origin.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
    }
  }

  function getRepoSegment() {
    var parts = location.pathname.split('/').filter(function (p) { return p.length > 0; });
    return parts.length > 0 ? parts[0] : '';
  }

  var REPO_SEGMENT = getRepoSegment();

  function isUrlAllowedForRepo(urlString) {
    try {
      var u = new URL(urlString);
      if (u.hostname !== ALLOWED_HOST) return false;
      if (REPO_SEGMENT) {
        var normalizedPath = u.pathname;
        return normalizedPath === '/' + REPO_SEGMENT || normalizedPath.indexOf('/' + REPO_SEGMENT + '/') === 0;
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  function originIsExplicitlyAllowed(origin) {
    return ALLOWED_ORIGINS_ALLOWLIST.indexOf(origin) !== -1;
  }

  function isOnAnyErrorPage() {
    var current = location.pathname;
    for (var k in ERROR_PATHS) {
      if (!ERROR_PATHS.hasOwnProperty(k)) continue;
      if (current === ERROR_PATHS[k]) return true;
    }
    return false;
  }

  function showAlertAndRedirect(type) {
    var msg = ALERT_MESSAGES[type] || ALERT_MESSAGES.DEFAULT;
    var errPath = ERROR_PATHS[type] || ERROR_PATHS.BLOCKED;
    var dest = resolveErrorUrl(errPath);

    // Don't redirect if already there
    if (location.href === dest) return;

    // Try to alert (may be blocked by some browsers), then navigate top-level if possible.
    try {
      // give a tiny delay to allow alert/pop to render
      alert(msg);
    } catch (e) {
      // ignore
    }

    // Best-effort: attempt to navigate the top window (frame-bust). If not allowed, fallback to self.
    try {
      if (window.top && window.top !== window.self) {
        // Assigning top.location is generally allowed for navigation even cross-origin
        window.top.location.replace(dest);
      } else {
        window.location.replace(dest);
      }
    } catch (err) {
      // fallback
      try {
        window.location.href = dest;
      } catch (e) {
        // nothing else we can do
      }
    }
  }

  // Safe parse for URL; returns null on failure
  function tryParseUrl(s) {
    try {
      return new URL(s);
    } catch (e) {
      return null;
    }
  }

  // Check for meta CSP frame-ancestors and whether it would already block framing
  function metaCSPDisallowsFraming() {
    try {
      var meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (!meta) return false;
      var content = meta.getAttribute('content') || '';
      var m = /frame-ancestors\s+([^;]+)/i.exec(content);
      if (!m) return false;
      // If frame-ancestors contains 'none' or doesn't include allowed origin, we treat it as restrictive
      var directive = m[1].trim().toLowerCase();
      if (directive === "'none'" || directive === 'none') return true;
      var origin = location.origin.toLowerCase();
      if (directive.indexOf(origin) !== -1) return false; // allows our origin
      // If it lists only our origin, that's okay; otherwise it may be restrictive; treat as CSP-enforced
      return true;
    } catch (e) {
      return false;
    }
  }

  // If the URL contains hash or suspicious "doorway" query keys, treat specially
  function urlContainsDoorwayIndicators() {
    var h = location.hash || '';
    if (h && h.length > 1) return true; // any fragment anchored from external link often used
    var q = location.search || '';
    if (!q) return false;
    // common doorway param keys (extend as desired)
    var keys = ['ref', 'from', 'source', 'utm_source', 'utm_medium', 'via', 'affiliate', 'partner'];
    try {
      var params = new URLSearchParams(q);
      for (var i = 0; i < keys.length; i++) {
        if (params.has(keys[i])) return true;
      }
    } catch (e) {
      // if parsing fails, consider it suspicious
      return true;
    }
    return false;
  }

  /* =========================
     MAIN PROTECTION LOGIC
     ========================= */

  (function main() {
    // Avoid blocking on error pages (prevent loops)
    if (isOnAnyErrorPage()) return;

    // 1) Offline check
    if (typeof navigator !== 'undefined' && navigator && navigator.onLine === false) {
      showAlertAndRedirect('OFFLINE');
      return;
    }

    // 2) If meta CSP already prevents framing, prefer to signal CSP error page rather than double-block
    if (metaCSPDisallowsFraming()) {
      // if CSP already blocks framing, redirect to CSP error page when framed or when suspicious
      if (window.top && window.top !== window.self) {
        showAlertAndRedirect('CSP');
        return;
      }
    }

    // 3) If inside an iframe
    if (window.top && window.top !== window.self) {
      // Try to detect and validate parent origin
      try {
        // Attempt to read top.location.origin/href (works only same-origin)
        var topHref = window.top.location.href;
        if (!isUrlAllowedForRepo(topHref) && !originIsExplicitlyAllowed((new URL(topHref)).origin)) {
          showAlertAndRedirect('IFRAME');
          return;
        }
        // allowed parent, permit framing
        return;
      } catch (err) {
        // Cross-origin parent: fall back to document.referrer or attempt a safe postMessage handshake (best-effort)
        var ref = (document.referrer || '').trim();
        if (!ref) {
          // No referrer and cross-origin parent -> treat as hostile
          showAlertAndRedirect('IFRAME');
          return;
        }
        var parsed = tryParseUrl(ref);
        if (!parsed) {
          showAlertAndRedirect('IFRAME');
          return;
        }
        var origin = parsed.origin;
        // If the referrer origin is explicitly allowed, allow
        if (originIsExplicitlyAllowed(origin)) {
          return;
        }
        // If referrer is same allowed host + repo segment, allow
        if (isUrlAllowedForRepo(ref)) {
          return;
        }
        // If referrer is from same allowed host but different repo, treat as blocked
        if (parsed.hostname === ALLOWED_HOST && !isUrlAllowedForRepo(ref)) {
          showAlertAndRedirect('BLOCKED');
          return;
        }

        // Otherwise unknown cross-origin parent that referenced this page -> block
        showAlertAndRedirect('IFRAME');
        return;
      }
    }

    // 4) Not framed (top-level). Validate document.referrer — if referrer exists and is external, block.
    try {
      var referrer = (document.referrer || '').trim();
      if (referrer) {
        var parsedRef = tryParseUrl(referrer);
        if (!parsedRef) {
          // malformed referrer: treat as permission problem
          showAlertAndRedirect('PERMISSION');
          return;
        }
        // If referrer origin is explicitly allowed, allow
        if (originIsExplicitlyAllowed(parsedRef.origin)) {
          // allowed referrer
        } else if (!isUrlAllowedForRepo(referrer)) {
          // External referrer - block
          showAlertAndRedirect('BLOCKED');
          return;
        }
      } else {
        // No referrer -> direct typed/bookmark. Allow.
      }
    } catch (e) {
      showAlertAndRedirect('PERMISSION');
      return;
    }

    // 5) Check for doorway indicator in URL (hash or known query params) combined with external referrer
    try {
      if (urlContainsDoorwayIndicators()) {
        // If there is a doorway indicator but referrer is empty (bookmark), allow.
        // If there's a doorway indicator and referrer exists but is external -> block.
        var ref = (document.referrer || '').trim();
        if (ref) {
          var parsedRef = tryParseUrl(ref);
          if (parsedRef && !isUrlAllowedForRepo(ref) && !originIsExplicitlyAllowed(parsedRef.origin)) {
            showAlertAndRedirect('BLOCKED');
            return;
          }
        }
      }
    } catch (e) {
      // ignore and continue
    }

    // 6) Passed all checks: allowed access. You may add additional logging/analytics here if desired.
    return;
  })();

  /* =========================
     Optional: expose a simple API for runtime override or whitelist updates.
     WARNING: Exposing these globally can weaken security if untrusted scripts run on the page.
     Use only if you control all scripts on the page and need dynamic allowlisting.
     ========================= */

  try {
    Object.defineProperty(window, 'AkshatLockFrame', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: {
        resolveErrorUrl: resolveErrorUrl,
        addAllowedOrigin: function (origin) {
          try {
            var o = origin.trim();
            if (o && ALLOWED_ORIGINS_ALLOWLIST.indexOf(o) === -1) {
              ALLOWED_ORIGINS_ALLOWLIST.push(o);
            }
            return true;
          } catch (e) {
            return false;
          }
        },
        listAllowedOrigins: function () {
          return ALLOWED_ORIGINS_ALLOWLIST.slice();
        }
      }
    });
  } catch (e) {
    // ignore if we can't define global
  }

})();