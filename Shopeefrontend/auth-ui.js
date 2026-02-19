// auth-ui.js (safe: does not remove/replace icon)
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

  // profile icon click: not logged -> alert + login, logged -> orders
  function handleProfileClick() {
    document.addEventListener(
      "click",
      (e) => {
        const profileLink =
          e.target.closest('a[aria-label="Login"]') ||
          e.target.closest('a[href="login.html"]') ||
          e.target.closest(".icon-btn");

        // only if it contains fa-user
        if (!profileLink || !profileLink.querySelector(".fa-user")) return;

        e.preventDefault();

        const token = getToken();
        const user = getUser();

        if (!token || !user) {
          alert("Please login first!");
          location.href = "login.html";
          return;
        }

        location.href = "order.html";
      },
      true
    );
  }

  // if logged in and open login.html -> go home
  function blockLoginIfLoggedIn() {
    const token = getToken();
    const user = getUser();
    const path = location.pathname.toLowerCase();
    if (token && user && path.endsWith("login.html")) {
      location.href = "index.html";
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    handleProfileClick();
    blockLoginIfLoggedIn();
  });
})();