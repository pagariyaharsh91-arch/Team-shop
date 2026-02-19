const API_BASE = "http://localhost:5000";

function showToast(msg, ok = true) {
  const t = document.getElementById("toast");
  if (!t) return alert(msg);
  t.textContent = msg;
  t.style.display = "flex";
  t.style.background = ok ? "#52C41A" : "#ff4d4f";
  setTimeout(() => (t.style.display = "none"), 2200);
}

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function isPhone10(v) {
  return /^\d{10}$/.test(v);
}

function setError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg || "";
}

function clearErrors() {
  [
    "loginPhoneError",
    "loginPasswordError",
    "registerNameError",
    "registerPhoneError",
    "registerEmailError",
    "registerPasswordError",
    "registerConfirmError",
  ].forEach((id) => setError(id, ""));
}

// Tabs
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.tab + "-tab").classList.add("active");
    clearErrors();
  });
});

// Show/hide password
document.querySelectorAll(".toggle-password").forEach((btn) => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.target;
    const input = document.getElementById(id);
    if (!input) return;
    input.type = input.type === "password" ? "text" : "password";
  });
});

// LOGIN
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearErrors();

  const identifier = document.getElementById("loginPhone").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  let ok = true;

  if (!identifier) {
    setError("loginPhoneError", "Phone/Email required");
    ok = false;
  } else {
    // allow phone OR email
    if (!isPhone10(identifier) && !isEmail(identifier)) {
      setError("loginPhoneError", "Enter 10-digit phone or valid email");
      ok = false;
    }
  }

  if (!password) {
    setError("loginPasswordError", "Password required");
    ok = false;
  } else if (password.length < 6) {
    setError("loginPasswordError", "Min 6 characters");
    ok = false;
  }

  if (!ok) return;

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || "Login failed", false);
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    showToast("Login successful ✅");
    setTimeout(() => (location.href = "index.html"), 700);
  } catch (err) {
    showToast("Server not running / network error", false);
  }
});

// REGISTER
document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearErrors();

  const name = document.getElementById("registerName").value.trim();
  const phone = document.getElementById("registerPhone").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value.trim();
  const confirmPassword = document.getElementById("registerConfirm").value.trim();

  let ok = true;

  if (!name) {
    setError("registerNameError", "Name required");
    ok = false;
  }
  if (!phone) {
    setError("registerPhoneError", "Phone required");
    ok = false;
  } else if (!isPhone10(phone)) {
    setError("registerPhoneError", "Phone must be 10 digits");
    ok = false;
  }

  if (email && !isEmail(email)) {
    setError("registerEmailError", "Invalid email");
    ok = false;
  }

  if (!password) {
    setError("registerPasswordError", "Password required");
    ok = false;
  } else if (password.length < 6) {
    setError("registerPasswordError", "Min 6 characters");
    ok = false;
  }

  if (!confirmPassword) {
    setError("registerConfirmError", "Confirm password required");
    ok = false;
  } else if (password !== confirmPassword) {
    setError("registerConfirmError", "Passwords do not match");
    ok = false;
  }

  if (!ok) return;

  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, email, password, confirmPassword }),
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || "Register failed", false);
      return;
    }

    showToast("Registered ✅ Now login");
    // Switch to login tab automatically
    document.querySelector('.tab-btn[data-tab="login"]')?.click();
  } catch {
    showToast("Server not running / network error", false);
  }
});