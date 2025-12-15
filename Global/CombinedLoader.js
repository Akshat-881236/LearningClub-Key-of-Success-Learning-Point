/* ======================================================
   Global Combined Loader
   Loads Navbar, Sidebar, Footer + CSS + JS
   ====================================================== */

(async function () {

  async function loadHTML(id, path) {
    const res = await fetch(path);
    const html = await res.text();
    document.getElementById(id).innerHTML = html;
  }

  function loadCSS(path) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = path;
    document.head.appendChild(link);
  }

  function loadJS(path) {
    const script = document.createElement("script");
    script.src = path;
    script.defer = true;
    document.body.appendChild(script);
  }

  /* LOAD CSS */
  loadCSS("Global/navbar.css");
  loadCSS("Global/sidebar.css");
  loadCSS("Global/footer.css");

  /* LOAD HTML */
  await loadHTML("global-header", "Global/navbar.htm");
  await loadHTML("sidebar", "Global/sidebar.htm");
  await loadHTML("global-footer", "Global/footer.htm");

  /* LOAD JS */
  loadJS("Global/navbar.js");
  loadJS("Global/sidebar.js");
  loadJS("Global/footer.js");

})();