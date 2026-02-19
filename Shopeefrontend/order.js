function toast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.style.display = "block";
  setTimeout(() => (t.style.display = "none"), 2500);
}

// ---------- Helpers ----------
function safeJSONParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

// Price can be "₹165", "165/-", "165 per kg", etc.
function parsePrice(val) {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return Number.isFinite(val) ? val : 0;

  const s = String(val).trim();
  // Keep digits and dot only
  const cleaned = s.replace(/[^0-9.]/g, "");
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

function parseQty(val) {
  const num = Number(val);
  if (!Number.isFinite(num) || num <= 0) return 1;
  return Math.floor(num);
}

// Normalize item fields (because different pages may store different shapes)
function normalizeItem(raw) {
  const name = raw?.name || raw?.title || raw?.productName || "Item";
  const price = parsePrice(raw?.price);
  const quantity = parseQty(raw?.quantity ?? raw?.qty ?? 1);

  return { name, price, quantity };
}

// ---------- Storage read (supports multiple keys) ----------
function getOrderFromStorage() {
  // Priority: order keys first
  const possibleKeys = ["pagariyaOrder", "order", "checkoutItems", "cart", "pagariyaCart"];

  for (const k of possibleKeys) {
    const v = localStorage.getItem(k);
    if (!v) continue;

    const data = safeJSONParse(v, null);
    if (Array.isArray(data) && data.length) {
      return data.map(normalizeItem);
    }
  }
  return [];
}

function calculateOrderTotals(items) {
  const subtotal = items.reduce((sum, it) => {
    return sum + it.price * it.quantity;
  }, 0);

  const deliveryCharge = subtotal >= 500 ? 0 : (subtotal > 0 ? 30 : 0);
  const discount = subtotal >= 1000 ? subtotal * 0.05 : 0;
  const grandTotal = subtotal + deliveryCharge - discount;

  return { subtotal, deliveryCharge, discount, grandTotal };
}

// ---------- Render ----------
function renderOrder() {
  const items = getOrderFromStorage();
  const container = document.getElementById("order-items-container");

  if (!container) return;

  if (!items.length) {
    container.innerHTML = `<p>No items found. Go back to cart.</p>`;
    // also reset totals UI if exists
    setText("order-subtotal", "₹0.00");
    setText("order-delivery", "₹0.00");
    setText("order-discount", "-₹0.00");
    setText("order-grand-total", "₹0.00");
    return;
  }

  container.innerHTML = items
    .map(
      (it) => `
      <div class="item" style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #eee;">
        <div>
          <div style="font-weight:800;">${escapeHtml(it.name)}</div>
          <div style="color:#666;font-size:13px;">Qty: ${it.quantity}</div>
        </div>
        <div style="font-weight:800;">₹${(it.price * it.quantity).toFixed(2)}</div>
      </div>
    `
    )
    .join("");

  const totals = calculateOrderTotals(items);

  setText("order-subtotal", `₹${totals.subtotal.toFixed(2)}`);
  setText("order-delivery", totals.deliveryCharge === 0 ? "FREE" : `₹${totals.deliveryCharge.toFixed(2)}`);
  setText("order-discount", `-₹${totals.discount.toFixed(2)}`);
  setText("order-grand-total", `₹${totals.grandTotal.toFixed(2)}`);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ===== Location capture (optional) =====
let currentLocation = null;

function setLocStatus(text) {
  const el = document.getElementById("locStatus");
  if (el) el.textContent = text;
}

function getLocation() {
  if (!navigator.geolocation) {
    setLocStatus("Location: Not supported");
    return;
  }

  setLocStatus("Location: Fetching... allow permission");

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude, accuracy } = pos.coords;
      currentLocation = {
        lat: Number(latitude.toFixed(6)),
        lng: Number(longitude.toFixed(6)),
        accuracy: Math.round(accuracy),
        addressNote: "",
      };
      setLocStatus(
        `Location: Set ✅ (${currentLocation.lat}, ${currentLocation.lng}) ±${currentLocation.accuracy}m`
      );
    },
    () => {
      setLocStatus("Location: Permission denied / error");
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

async function placeOrderEmailOnly() {
  const token = localStorage.getItem("token");
  const user = safeJSONParse(localStorage.getItem("user"), null);
  const items = getOrderFromStorage();

  if (!token) {
    toast("Please login first");
    window.location.href = "login.html";
    return;
  }

  if (!items.length) {
    toast("No items to place order");
    window.location.href = "cart.html";
    return;
  }

  const totals = calculateOrderTotals(items);

  const addressNote = (document.getElementById("addressNote")?.value || "").trim();
  const locToSend = currentLocation
    ? { ...currentLocation, addressNote }
    : addressNote
    ? { lat: null, lng: null, accuracy: null, addressNote }
    : null;

  const payload = {
    items,
    subtotal: Number(totals.subtotal.toFixed(2)),
    deliveryCharge: Number(totals.deliveryCharge.toFixed(2)),
    discount: Number(totals.discount.toFixed(2)),
    total: Number(totals.grandTotal.toFixed(2)),
    customerName: user?.name || "Customer",
    customerPhone: user?.phone || "",
    customerEmail: user?.email || "",
    location: locToSend,
  };

  const btn = document.getElementById("confirm-order-btn");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Placing...";
  }

  try {
    const res = await fetch("http://localhost:5000/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast(data.message || "Order failed");
      return;
    }

    toast("Order placed ✅ Email sent");

    // ✅ IMPORTANT: clear ALL cart/order keys (because your project uses multiple)
    ["pagariyaCart", "cart", "pagariyaOrder", "order", "checkoutItems"].forEach((k) =>
      localStorage.removeItem(k)
    );

    setTimeout(() => {
      window.location.href = "myorders.html";
    }, 900);
  } catch (e) {
    toast("Server not running / Network error");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Place Order (Email)";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderOrder();

  const locBtn = document.getElementById("get-location-btn");
  if (locBtn) locBtn.addEventListener("click", getLocation);

  const confirmBtn = document.getElementById("confirm-order-btn");
  if (confirmBtn) confirmBtn.addEventListener("click", placeOrderEmailOnly);
});