"use strict";

const authModal   = document.getElementById("auth-spa-modal");
const openAuthBtn = document.getElementById("open-auth-manual");
const closeAuthBtn= document.getElementById("close-auth");
const logoutBtn   = document.getElementById("logout-btn");

const tabs        = document.querySelectorAll(".auth-tabs button");
const submitBtn  = document.getElementById("auth-submit");

const emailEl    = document.getElementById("auth-email");
const passEl     = document.getElementById("auth-password");
const captchaBox = document.getElementById("captcha-box");
const captchaInp = document.getElementById("captcha-input");

const signupBox  = document.querySelector(".signup-only");
const nameEl     = document.getElementById("auth-name");
const contactEl  = document.getElementById("auth-contact");
const ageEl      = document.getElementById("auth-age");
const confirmEl  = document.getElementById("auth-confirm");

let currentMode = "login";
let authTimer   = 30000; // 30 seconds
let timerHandle = null;

document.addEventListener("DOMContentLoaded", () => {
  generateCaptcha();
  setupAuthTabs();
  setupButtons();
  autoAuthTrigger();
  checkSession();
});

document.getElementById("menu-logo").onclick = () => {
  document.getElementById("sidebar").classList.toggle("hidden");
};

function openAuth() {
  authModal.classList.remove("hidden");
}

function closeAuth() {
  authModal.classList.add("hidden");
}

function setupButtons() {
  openAuthBtn.onclick  = openAuth;
  closeAuthBtn.onclick = closeAuth;
  logoutBtn.onclick    = logout;
  submitBtn.onclick    = handleSubmit;
}

function setupAuthTabs() {
  tabs.forEach(tab => {
    tab.onclick = () => switchMode(tab.dataset.mode);
  });
}

function switchMode(mode) {
  currentMode = mode;
  signupBox.classList.toggle("hidden", mode !== "signup");
  logoutBtn.classList.add("hidden");
}

function generateCaptcha() {
  captchaBox.textContent =
    Math.random().toString(36).substring(2, 7).toUpperCase();
}

function validateCaptcha() {
  return captchaInp.value === captchaBox.textContent;
}

function autoAuthTrigger() {
  timerHandle = setTimeout(() => {
    openAuth();
    authTimer *= 3;
    autoAuthTrigger();
  }, authTimer);
}

function checkSession() {
  const session = JSON.parse(localStorage.getItem("LC_SESSION"));
  if (session && session.loggedIn) {
    logoutBtn.classList.remove("hidden");
  }
}

function logout() {
  localStorage.removeItem("LC_SESSION");
  alert("Logged out successfully");
  closeAuth();
}

function handleSubmit() {
  if (!validateCaptcha()) {
    generateCaptcha();
    return alert("Invalid Captcha");
  }

  if (currentMode === "login") login();
  if (currentMode === "signup") signup();
  if (currentMode === "recover") recoverPassword();
}

function signup() {
  if (ageEl.value < 18) return alert("Age must be 18+");
  if (passEl.value !== confirmEl.value) return alert("Passwords do not match");

  const users = JSON.parse(localStorage.getItem("LC_USERS")) || {};

  if (users[emailEl.value]) {
    return alert("Duplicate account detected. Please login.");
  }

  const user = {
    id: Math.floor(10000000 + Math.random() * 90000000),
    name: nameEl.value,
    email: emailEl.value,
    contact: contactEl.value,
    age: ageEl.value,
    password: passEl.value
  };

  users[emailEl.value] = user;

  localStorage.setItem("LC_USERS", JSON.stringify(users));
  localStorage.setItem("LC_SESSION", JSON.stringify({
    email: emailEl.value,
    loggedIn: true
  }));

  alert("Account created & logged in");
  closeAuth();
}

function login() {
  const users = JSON.parse(localStorage.getItem("LC_USERS")) || {};
  const user = users[emailEl.value];

  if (!user) return alert("Account not found");
  if (user.password !== passEl.value) return alert("Wrong password");

  localStorage.setItem("LC_SESSION", JSON.stringify({
    email: emailEl.value,
    loggedIn: true
  }));

  alert("Logged in successfully");
  closeAuth();
}

function recoverPassword() {
  const users = JSON.parse(localStorage.getItem("LC_USERS")) || {};
  const user = users[emailEl.value];

  if (!user) return alert("Account not found");

  const verify = prompt("Enter your Contact Number to verify:");
  if (verify !== user.contact) return alert("Verification failed");

  const newPass = prompt("Enter new password:");
  user.password = newPass;

  users[emailEl.value] = user;
  localStorage.setItem("LC_USERS", JSON.stringify(users));

  alert("Password reset successfully");
  switchMode("login");
}