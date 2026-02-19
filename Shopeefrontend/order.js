function toast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.style.display = "block";
  setTimeout(() => (t.style.display = "none"), 2500);
}

function getOrderFromStorage() {
  const order = localStorage.getItem("pagariyaOrder");
  return order ? JSON.parse(order) : [];
}

function calculateOrderTotals(order) {
  const subtotal = order.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  const deliveryCharge = subtotal >= 500 ? 0 : 30;
  const discount = subtotal >= 1000 ? subtotal * 0.05 : 0;
  const grandTotal = subtotal + deliveryCharge - discount;

  return { subtotal, deliveryCharge, discount, grandTotal };
}

function renderOrder() {
  const order = getOrderFromStorage();
  const container = document.getElementById("order-items-container");

  if (!container) return;

  if (!order.length) {
    container.innerHTML = `<p>No items found. Go back to cart.</p>`;
    return;
  }

  container.innerHTML = order
    .map(
      (it) => `
      <div class="item">
        <div>
          <div style="font-weight:800;">${it.name}</div>
          <div style="color:#666;font-size:13px;">Qty: ${it.quantity}</div>
        </div>
        <div style="font-weight:800;">₹${Number(it.price) * Number(it.quantity)}</div>
      </div>
    `
    )
    .join("");

  const totals = calculateOrderTotals(order);

  document.getElementById("order-subtotal").textContent = `₹${totals.subtotal.toFixed(2)}`;
  document.getElementById("order-delivery").textContent =
    totals.deliveryCharge === 0 ? "FREE" : `₹${totals.deliveryCharge.toFixed(2)}`;
  document.getElementById("order-discount").textContent = `-₹${totals.discount.toFixed(2)}`;
  document.getElementById("order-grand-total").textContent = `₹${totals.grandTotal.toFixed(2)}`;
}

// ===== Location capture =====
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
      setLocStatus(`Location: Set ✅ (${currentLocation.lat}, ${currentLocation.lng}) ±${currentLocation.accuracy}m`);
    },
    (err) => {
      setLocStatus("Location: Permission denied / error");
      console.warn(err);
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

async function placeOrderEmailOnly() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const order = getOrderFromStorage();

  if (!token) {
    toast("Please login first");
    window.location.href = "login.html";
    return;
  }

  if (!order.length) {
    toast("No items to place order");
    window.location.href = "cart.html";
    return;
  }

  const totals = calculateOrderTotals(order);

  const addressNote = (document.getElementById("addressNote")?.value || "").trim();
  const locToSend = currentLocation
    ? { ...currentLocation, addressNote }
    : addressNote
      ? { lat: null, lng: null, accuracy: null, addressNote }
      : null;

  const payload = {
    items: order.map((it) => ({
      name: it.name,
      price: Number(it.price),
      quantity: Number(it.quantity),
    })),
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
    // clear cart and order
    localStorage.removeItem("pagariyaCart");
    localStorage.removeItem("pagariyaOrder");

    // optional: go to orders page after 1 sec
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
