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

  /* ---------- helpers ---------- */

  function loadCSS(href) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }

  function loadJS(src, defer = true) {
    const script = document.createElement("script");
    script.src = src;
    script.defer = defer;
    document.head.appendChild(script);
  }

  async function loadJSON(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("JSON load failed");
    return res.json();
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

  /* ---------- MAIN GATE ---------- */

  if (location.hostname !== ALLOWED_HOST) {
    blockAndRedirect();
    return;
  }

  /* =========================
     ✅ AUTHORIZED → LOAD CORE
     ========================= */

  // Core CSS
  loadCSS("/LearningClub-Key-of-Success-Learning-Point/style.css");
  loadCSS("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css");

  // Core JS
  loadJS("https://akshat-881236.github.io/LearningClub-Key-of-Success-Learning-Point/lock_iframe_view.js");
  loadJS("https://akshat-881236.github.io/TrackerJS/MITLicense-Term-of-Use--Privacy.min.js");
  loadJS("https://akshat-881236.github.io/sitemapjs/breadcrumb.js");
  loadJS("https://akshat-881236.github.io/TrackerJS/akshatnetworkhub.min.js");
  loadJS("https://akshat-881236.github.io/TrackerJS/tracker.js");
  loadJS("https://akshat-881236.github.io/TrackerJS/trackermeta.js");
  loadJS("https://akshat-881236.github.io/TrackerJS/ui.js");
  loadJS("https://akshat-881236.github.io/TrackerJS/index.js");
  loadJS("https://akshat-881236.github.io/TrackerJS/akshat-add-nav.js");
  loadJS("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js");
  loadJS("/LearningClub-Key-of-Success-Learning-Point/PageNotFound.min.js");
  loadJS("/LearningClub-Key-of-Success-Learning-Point/projects.js");
  loadJS("/LearningClub-Key-of-Success-Learning-Point/script.js");
  loadJS("/LearningClub-Key-of-Success-Learning-Point/pwa.js");

  // Optional JSON config
  loadJSON("/TrackerJS/config.json")
    .then((config) => {
      window.ANH_CONFIG = config;
    })
    .catch(() => {
      console.warn("Config JSON not loaded");
    });
})();
