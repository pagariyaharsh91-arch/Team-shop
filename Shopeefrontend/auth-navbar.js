/**
 * auth-navbar.js
 * Manages Login/Logout button visibility based on localStorage authentication
 * Checks token and user in localStorage
 */
(function() {
  function initAuthNavbar() {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    const isLoggedIn = !!(token && user);

    // Find all buttons and links with text containing "login" or "logout"
    const allElements = document.querySelectorAll("button, a, [role='button']");
    
    allElements.forEach(element => {
      const text = element.textContent.trim().toLowerCase();
      
      // Hide/show login buttons based on login status
      if (text.includes("login")) {
        element.style.display = isLoggedIn ? "none" : "";
      }
      
      // Hide/show logout buttons based on login status
      if (text.includes("logout")) {
        element.style.display = isLoggedIn ? "" : "none";
        
        // Attach logout handler if not already attached
        if (isLoggedIn && !element.hasAttribute("data-logout-handler")) {
          element.setAttribute("data-logout-handler", "true");
          element.addEventListener("click", handleLogout);
        }
      }
    });
  }

  function handleLogout(e) {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
  }

  // Run when DOM is ready
  document.addEventListener("DOMContentLoaded", initAuthNavbar);
})();
