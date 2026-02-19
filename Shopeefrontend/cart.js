const PRIMARY_CART_KEY = "pagariyaCart";
const FALLBACK_CART_KEY = "cart";

function readJSON(key) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}
function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getCart() {
  let cart = readJSON(PRIMARY_CART_KEY);
  if (Array.isArray(cart) && cart.length) return cart;

  cart = readJSON(FALLBACK_CART_KEY);
  if (Array.isArray(cart) && cart.length) {
    writeJSON(PRIMARY_CART_KEY, cart);
    return cart;
  }
  return [];
}

function saveCart(cart) {
  writeJSON(PRIMARY_CART_KEY, cart);
  writeJSON(FALLBACK_CART_KEY, cart);
}

function calculate(cart) {
  const subtotal = cart.reduce((s, it) => s + Number(it.price || 0) * Number(it.quantity || 1), 0);
  const deliveryCharge = subtotal >= 500 ? 0 : 30;
  const discount = subtotal >= 1000 ? subtotal * 0.05 : 0;
  const grandTotal = subtotal + deliveryCharge - discount;
  return { subtotal, deliveryCharge, discount, grandTotal };
}

function setText(id, txt) {
  const el = document.getElementById(id);
  if (el) el.textContent = txt;
}

function showEmpty(show) {
  const empty = document.getElementById("empty-cart-message");
  const list = document.getElementById("cart-items-container");
  if (!empty || !list) return;
  empty.style.display = show ? "block" : "none";
  list.style.display = show ? "none" : "block";
}

function updateBadge(cart) {
  const badge = document.querySelector(".cart-badge");
  if (!badge) return;
  const count = cart.reduce((s, it) => s + Number(it.quantity || 1), 0);
  badge.textContent = count;
}

function render() {
  const cart = getCart();
  const container = document.getElementById("cart-items-container");
  const btn = document.getElementById("place-order-btn");

  if (!container) return;

  if (!cart.length) {
    showEmpty(true);
    setText("subtotal", "₹0");
    setText("delivery-charge", "₹0");
    setText("discount", "-₹0");
    setText("grand-total", "₹0");
    if (btn) btn.disabled = true;
    updateBadge(cart);
    return;
  }

  showEmpty(false);

  container.innerHTML = cart.map((it, idx) => {
    const name = it.name || it.productName || "Item";
    const price = Number(it.price || 0);
    const qty = Number(it.quantity || 1);
    return `
      <div style="background:#fff;border:1px solid #eee;border-radius:14px;padding:14px;margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;">
          <div>
            <div style="font-weight:800">${name}</div>
            <div style="color:#666;margin-top:6px;">₹${price} × ${qty}</div>
          </div>
          <div style="display:flex;gap:10px;align-items:center;">
            <button type="button" onclick="decQty(${idx})">-</button>
            <b>${qty}</b>
            <button type="button" onclick="incQty(${idx})">+</button>
            <button type="button" onclick="removeItem(${idx})">Remove</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  const t = calculate(cart);
  setText("subtotal", `₹${t.subtotal.toFixed(2)}`);
  setText("delivery-charge", t.deliveryCharge === 0 ? "FREE" : `₹${t.deliveryCharge.toFixed(2)}`);
  setText("discount", `-₹${t.discount.toFixed(2)}`);
  setText("grand-total", `₹${t.grandTotal.toFixed(2)}`);

  const msg = document.getElementById("delivery-message");
  if (msg) msg.textContent = t.subtotal >= 500 ? "You got FREE delivery ✅" : `Add ₹${Math.ceil(500 - t.subtotal)} more for FREE delivery`;

  if (btn) btn.disabled = false;
  updateBadge(cart);
}

window.incQty = function (idx) {
  const cart = getCart();
  if (!cart[idx]) return;
  cart[idx].quantity = Number(cart[idx].quantity || 1) + 1;
  saveCart(cart);
  render();
};

window.decQty = function (idx) {
  const cart = getCart();
  if (!cart[idx]) return;
  cart[idx].quantity = Math.max(1, Number(cart[idx].quantity || 1) - 1);
  saveCart(cart);
  render();
};

window.removeItem = function (idx) {
  const cart = getCart();
  cart.splice(idx, 1);
  saveCart(cart);
  render();
};

function initPlaceOrder() {
  const btn = document.getElementById("place-order-btn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const cart = getCart();
    if (!cart.length) return;

    // store snapshot for confirmation page
    localStorage.setItem("pagariyaOrder", JSON.stringify(cart));
    location.href = "confirm-order.html";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  render();
  initPlaceOrder();
});