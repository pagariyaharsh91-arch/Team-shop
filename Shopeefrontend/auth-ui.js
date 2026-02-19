// auth-ui.js (CLEAN - no extra buttons injected)
(function () {
  function getToken() {
    return localStorage.getItem("token");
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }

  // If logged in and open login.html -> go home
  function blockLoginPageIfLoggedIn() {
    const token = getToken();
    const path = location.pathname.toLowerCase();
    if (token && path.endsWith("login.html")) {
      location.href = "index.html";
    }
  }

  // Profile icon click -> login.html (if not logged) else order.html
  function attachProfileBehavior() {
    const icon = document.querySelector(
      "i.fa-user, i.fas.fa-user, i.fa-user-circle, i.fas.fa-user-circle"
    );
    if (!icon) return;

    const clickable = icon.closest("a, button, div");
    if (!clickable) return;

    // Reset old listeners by cloning
    const clone = clickable.cloneNode(true);
    clickable.parentNode.replaceChild(clone, clickable);

    clone.style.cursor = "pointer";
    clone.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const token = getToken();
      const user = getUser();

      if (!token || !user) {
        location.href = "login.html";
      } else {
        location.href = "order.html";
      }
    });
  }

  window.addEventListener("DOMContentLoaded", () => {
    attachProfileBehavior();
    blockLoginPageIfLoggedIn();
  });
})();
