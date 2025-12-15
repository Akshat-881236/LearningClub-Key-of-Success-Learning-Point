document.addEventListener("DOMContentLoaded", () => {

  /* USER GREETING */
  const greeting = document.getElementById("user-greeting");
  const session = JSON.parse(localStorage.getItem("LC_SESSION"));
  const users   = JSON.parse(localStorage.getItem("LC_USERS")) || {};

  if (session && users[session.email]) {
    greeting.textContent = `Welcome, ${users[session.email].name}`;
  }

  /* LIVE DATE & TIME */
  function updateTime() {
    const now = new Date();
    document.getElementById("live-date").textContent =
      now.toLocaleDateString();
    document.getElementById("live-time").textContent =
      now.toLocaleTimeString();
  }
  updateTime();
  setInterval(updateTime, 1000);

  /* ACCOUNT BUTTON */
  document.getElementById("nav-account-btn").onclick = () => {
    document.getElementById("auth-spa-modal")
      ?.classList.remove("hidden");
  };

  /* NOTIFICATION (PLACEHOLDER) */
  document.getElementById("nav-notification").onclick = () => {
    alert("Notification center coming soon");
  };

});

document.addEventListener("DOMContentLoaded", () => {

  const notifyBtn = document.getElementById("nav-notification");
  const notifyBox = document.getElementById("notification-centre");
  const notifyList = document.getElementById("notify-list");
  const clearBtn = document.getElementById("clear-notify");

  const session = JSON.parse(localStorage.getItem("LC_SESSION"));
  const userKey = session?.email || "GUEST";

  const STORAGE_KEY = "LC_NOTIFICATIONS";

  /* ===============================
     LOAD NOTIFICATIONS
  ================================ */
  function loadNotifications() {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    return all[userKey] || [];
  }

  function saveNotifications(list) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    all[userKey] = list;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }

  function renderNotifications() {
    notifyList.innerHTML = "";
    const list = loadNotifications();

    if (!list.length) {
      notifyList.innerHTML =
        "<div class='notify-item'>No notifications</div>";
      return;
    }

    list.forEach(n => {
      const div = document.createElement("div");
      div.className = "notify-item unread";
      div.innerHTML = `
        ${n.message}
        <time>${new Date(n.time).toLocaleString()}</time>
      `;
      notifyList.appendChild(div);
    });
  }

  /* ===============================
     TOGGLE CENTRE
  ================================ */
  notifyBtn.onclick = (e) => {
    e.stopPropagation();
    notifyBox.classList.toggle("hidden");
    renderNotifications();
  };

  /* ===============================
     AUTO CLOSE
  ================================ */
  document.addEventListener("click", () => {
    notifyBox.classList.add("hidden");
  });

  notifyBox.onclick = e => e.stopPropagation();

  /* ===============================
     CLEAR
  ================================ */
  clearBtn.onclick = () => {
    saveNotifications([]);
    renderNotifications();
  };

  /* ===============================
     DEMO NOTIFICATIONS
     (AUTO PUSH)
  ================================ */
  if (loadNotifications().length === 0) {
    saveNotifications([
      {
        message: "Welcome to Learning Club 🎓",
        time: Date.now()
      },
      {
        message: "New resources added today 📚",
        time: Date.now()
      }
    ]);
  }

});

function pushNotification(message) {
  const session = JSON.parse(localStorage.getItem("LC_SESSION"));
  const userKey = session?.email || "GUEST";

  const STORAGE_KEY = "LC_NOTIFICATIONS";
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

  all[userKey] = all[userKey] || [];
  all[userKey].unshift({
    message,
    time: Date.now()
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}
