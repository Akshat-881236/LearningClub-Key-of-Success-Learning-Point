document.addEventListener("DOMContentLoaded", () => {

  const menuLogo = document.getElementById("menu-logo");
  const sidebar  = document.getElementById("sidebar");

  if (!menuLogo || !sidebar) return;

  /* TOGGLE SIDEBAR */
  menuLogo.onclick = () => {
    sidebar.classList.toggle("hidden");
    document.body.classList.toggle("sidebar-open");
  };

  /* AUTO-HIDE ON LINK CLICK */
  sidebar.querySelectorAll("a").forEach(link => {
    link.onclick = () => {
      sidebar.classList.add("hidden");
      document.body.classList.remove("sidebar-open");
    };
  });

});