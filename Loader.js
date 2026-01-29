/* =========================
   Akshat Network Hub
   Secure Loader.js
   ========================= */

(function () {
  const ALLOWED_HOST = "akshat-881236.github.io";
  const REDIRECT_URL =
    "https://" + ALLOWED_HOST + "/LearningClub-Key-of-Success-Learning-Point/";
  const ACCESS_COMMENT =
    "This content is restricted to the official Learning Club domain.";

  /* ---------- helpers (promise-based, resilient) ---------- */

  function loadCSS(href, timeout = 10000) {
    return new Promise((resolve, reject) => {
      try {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        let finished = false;

        link.onload = () => {
          if (finished) return;
          finished = true;
          resolve({ href, type: "css", ok: true });
        };
        link.onerror = (e) => {
          if (finished) return;
          finished = true;
          reject({ href, type: "css", ok: false, error: e });
        };

        // Some browsers don't reliably fire onload for link; use timeout fallback
        const t = setTimeout(() => {
          if (finished) return;
          finished = true;
          // Treat timeout as a warning but resolve so other resources still load
          console.warn(`CSS load timed out for ${href}`);
          resolve({ href, type: "css", ok: false, timeout: true });
        }, timeout);

        document.head.appendChild(link);
      } catch (err) {
        reject({ href, type: "css", ok: false, error: err });
      }
    });
  }

  function loadJS(src, defer = true, timeout = 15000) {
    return new Promise((resolve, reject) => {
      try {
        const script = document.createElement("script");
        script.src = src;
        script.defer = !!defer;
        script.async = false; // preserve relative ordering when appended sequentially
        let finished = false;

        script.onload = () => {
          if (finished) return;
          finished = true;
          resolve({ src, type: "js", ok: true });
        };
        script.onerror = (e) => {
          if (finished) return;
          finished = true;
          reject({ src, type: "js", ok: false, error: e });
        };

        // Fallback timeout
        const t = setTimeout(() => {
          if (finished) return;
          finished = true;
          console.warn(`JS load timed out for ${src}`);
          resolve({ src, type: "js", ok: false, timeout: true });
        }, timeout);

        document.head.appendChild(script);
      } catch (err) {
        reject({ src, type: "js", ok: false, error: err });
      }
    });
  }

  async function loadJSON(url) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("JSON load failed: " + res.status + " " + res.statusText);
      const data = await res.json();
      return { url, type: "json", ok: true, data };
    } catch (err) {
      return { url, type: "json", ok: false, error: err };
    }
  }

  /* ---------- unauthorized UI ---------- */

  function blockAndRedirect() {
    document.documentElement.innerHTML = "";

    document.body.innerHTML = `
      <style>
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .anh-blocker {
          position: fixed;
          inset: 0;
          background: radial-gradient(circle at top, #1a1a1a, #000);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: system-ui, sans-serif;
          z-index: 999999;
        }
        .anh-card {
          max-width: 520px;
          padding: 32px;
          text-align: center;
          border-radius: 16px;
          background: rgba(255,255,255,.06);
          backdrop-filter: blur(12px);
          animation: pulse 2s infinite;
        }
        .anh-timer {
          font-size: 28px;
          font-weight: bold;
          color: #00d1ff;
          margin-top: 10px;
        }
      </style>

      <div class="anh-blocker">
        <div class="anh-card">
          <h1 style="color:#ff4d4d">Access Restricted</h1>
          <p>This domain is not authorized.</p>
          <p><b>Reason:</b> ${ACCESS_COMMENT}</p>
          <p>Redirecting in</p>
          <div class="anh-timer" id="anhTimer">10</div>
        </div>
      </div>
    `;

    let seconds = 10;
    const el = document.getElementById("anhTimer");

    const t = setInterval(() => {
      seconds--;
      el.textContent = seconds;
      if (seconds <= 0) {
        clearInterval(t);

        /* new-tab redirect (popup-safe) */
        const a = document.createElement("a");
        a.href = REDIRECT_URL;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
      }
    }, 1000);

    throw new Error("Unauthorized Host – Loader halted");
  }

  /* ---------- resource list (add/remove/ reorder here) ---------- */

  // Put every .css, .js and .json you want loaded when domain is verified
  const RESOURCES = [
    // CSS
    "/LearningClub-Key-of-Success-Learning-Point/style.css",
    "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css",

    // JS (order preserved)
    "https://akshat-881236.github.io/LearningClub-Key-of-Success-Learning-Point/lock_iframe_view.js",
    "https://akshat-881236.github.io/TrackerJS/MITLicense-Term-of-Use--Privacy.min.js",
    "https://akshat-881236.github.io/sitemapjs/breadcrumb.js",
    "https://akshat-881236.github.io/TrackerJS/akshatnetworkhub.min.js",
    "https://akshat-881236.github.io/TrackerJS/tracker.js",
    "https://akshat-881236.github.io/TrackerJS/trackermeta.js",
    "https://akshat-881236.github.io/TrackerJS/ui.js",
    "https://akshat-881236.github.io/TrackerJS/index.js",
    "https://akshat-881236.github.io/TrackerJS/akshat-add-nav.js",
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js",
    "/LearningClub-Key-of-Success-Learning-Point/PageNotFound.min.js",
    "/LearningClub-Key-of-Success-Learning-Point/projects.js",
    "/LearningClub-Key-of-Success-Learning-Point/script.js",
    "/LearningClub-Key-of-Success-Learning-Point/pwa.js",

    // JSON (optional config files)
    "/TrackerJS/config.json"
  ];

  /* ---------- utility ---------- */

  function getExtension(url) {
    const stripped = url.split("?")[0].split("#")[0];
    const parts = stripped.split(".");
    if (parts.length === 1) return "";
    return parts.pop().toLowerCase();
  }

  function filenameKeyFromUrl(url) {
    const stripped = url.split("?")[0].split("#")[0];
    const parts = stripped.split("/");
    const name = parts.pop() || parts.pop(); // handle trailing slash
    return name.replace(/[^a-z0-9_\-\.]/gi, "_");
  }

  /* ---------- MAIN GATE ---------- */

  if (location.hostname !== ALLOWED_HOST) {
    blockAndRedirect();
    return;
  }

  /* =========================
     ✅ AUTHORIZED → LOAD ALL RESOURCES
     ========================= */

  // Container for loaded JSONs:
  window.ANH_JSONS = window.ANH_JSONS || {};

  // Load resources sequentially to preserve the listed order (safe for inter-dependent scripts).
  (async function loadAllSequentially(list) {
    for (const res of list) {
      const ext = getExtension(res);

      try {
        if (ext === "css") {
          // Wait for each stylesheet to attempt to load before moving on (so order is predictable)
          const r = await loadCSS(res).catch((err) => {
            console.warn("CSS failed:", err);
            return err;
          });
          console.debug("CSS loaded/attempted:", r && r.href ? r.href : res);
        } else if (ext === "js") {
          // Load script and wait for it (preserves order)
          const r = await loadJS(res, true).catch((err) => {
            console.warn("JS failed:", err);
            return err;
          });
          console.debug("JS loaded/attempted:", r && r.src ? r.src : res);
        } else if (ext === "json") {
          const r = await loadJSON(res);
          if (r.ok && r.data !== undefined) {
            const key = filenameKeyFromUrl(res);
            window.ANH_JSONS[key] = r.data;
            // If this is your main config.json keep the legacy window.ANH_CONFIG reference
            if (key.toLowerCase().includes("config")) {
              window.ANH_CONFIG = r.data;
            }
            console.debug("JSON loaded:", res, "-> key:", key);
          } else {
            console.warn("JSON not loaded:", res, r && r.error ? r.error : "");
          }
        } else {
          // Unknown extension — attempt fetch for safety, but do not block
          console.warn("Unknown extension for resource, attempting fetch:", res);
          try {
            await fetch(res, { method: "GET", cache: "no-store" });
            console.debug("Fetched unknown resource type (ok):", res);
          } catch (err) {
            console.warn("Failed to fetch unknown resource:", res, err);
          }
        }
      } catch (err) {
        // Catch-all: log and continue to next resource
        console.error("Resource loader caught error for", res, err);
      }
    }

    console.info("Loader: all resources attempted. JSONs available on window.ANH_JSONS");
  })(RESOURCES);
})();