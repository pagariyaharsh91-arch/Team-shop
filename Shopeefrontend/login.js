const API_BASE = "http://localhost:5000/api/auth";

/* ================= TOAST ================= */
const toastEl = document.getElementById("toast");

function showToast(message, type = "success") {
  if (!toastEl) return alert(message);

  toastEl.textContent = message;
  toastEl.style.display = "flex";

  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    toastEl.style.display = "none";
  }, 3000);
}

/* ================= TAB SWITCH ================= */
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const tab = btn.dataset.tab;

    document.getElementById("login-tab").classList.remove("active");
    document.getElementById("register-tab").classList.remove("active");

    document.getElementById(tab + "-tab").classList.add("active");
  });
});

/* ================= SHOW/HIDE PASSWORD ================= */
document.querySelectorAll(".toggle-password").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = document.getElementById(btn.dataset.target);
    const icon = btn.querySelector("i");

    if (target.type === "password") {
      target.type = "text";
      icon.classList.replace("fa-eye", "fa-eye-slash");
    } else {
      target.type = "password";
      icon.classList.replace("fa-eye-slash", "fa-eye");
    }
  });
});

/* ================= HELPERS ================= */
function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function isPhone10(v) {
  return /^\d{10}$/.test(v);
}

/* ================= LOGIN ================= */
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const identifier = document.getElementById("loginPhone").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!identifier || !password) {
    return showToast("Fill all login fields", "error");
  }

  if (!isEmail(identifier) && !isPhone10(identifier)) {
    return showToast("Enter valid phone/email", "error");
  }

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return showToast(data.message || "Login failed", "error");
    }

    /* Save token */
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    showToast("Login successful ✅");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 800);

  } catch (err) {
    showToast("Server not running / Network error", "error");
  }
});

/* ================= REGISTER ================= */
document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("registerName").value.trim();
  const phone = document.getElementById("registerPhone").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value.trim();
  const confirmPassword = document.getElementById("registerConfirm").value.trim();

  if (!name || !phone || !password || !confirmPassword) {
    return showToast("Fill required fields", "error");
  }

  if (!isPhone10(phone)) {
    return showToast("Phone must be 10 digits", "error");
  }

  if (email && !isEmail(email)) {
    return showToast("Invalid email", "error");
  }

  if (password.length < 6) {
    return showToast("Password minimum 6 characters", "error");
  }

  if (password !== confirmPassword) {
    return showToast("Passwords not match", "error");
  }

  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone,
        email,
        password,
        confirmPassword,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return showToast(data.message || "Register failed", "error");
    }

    showToast("Register successful ✅");

    document.getElementById("registerForm").reset();

    /* Switch to login tab */
    document.querySelector('.tab-btn[data-tab="login"]').click();

  } catch (err) {
    showToast("Server not running / Network error", "error");
  }
});
