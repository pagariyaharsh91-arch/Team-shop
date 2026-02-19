// ================= ORDER.JS (CONFIRM -> SAVE MONGO -> WHATSAPP) =================

// ---------- STORAGE ----------
function getOrderFromStorage() {
  const order = localStorage.getItem("pagariyaOrder");
  return order ? JSON.parse(order) : [];
}

function calculateOrderTotals(order) {
  const subtotal = order.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  let deliveryCharge = subtotal >= 500 ? 0 : 30;
  let discount = subtotal >= 1000 ? subtotal * 0.05 : 0;

  const grandTotal = subtotal + deliveryCharge - discount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    deliveryCharge: Math.round(deliveryCharge * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    grandTotal: Math.round(grandTotal * 100) / 100,
  };
}

// ---------- UI (OPTIONAL: your existing summary render can stay) ----------
function renderOrderSummary() {
  const order = getOrderFromStorage();

  // if no order -> go cart
  if (!order.length) {
    window.location.href = "cart.html";
    return;
  }

  // If you already have order summary UI, keep it.
  // This is a safe no-op if your elements don’t exist.
  const container = document.getElementById("order-items-container");
  if (container) {
    container.innerHTML = "";
    order.forEach((item) => {
      const div = document.createElement("div");
      div.className = "order-item";
      div.innerHTML = `
        <div class="order-item-details">
          <p class="order-item-name">${item.name}</p>
          <p class="order-item-quantity">Qty: ${item.quantity}</p>
        </div>
        <div class="order-item-price">
          <p>₹${item.price} × ${item.quantity}</p>
          <p class="order-item-total">₹${Number(item.price) * Number(item.quantity)}</p>
        </div>
      `;
      container.appendChild(div);
    });
  }

  const totals = calculateOrderTotals(order);
  const subEl = document.getElementById("order-subtotal");
  const delEl = document.getElementById("order-delivery");
  const disEl = document.getElementById("order-discount");
  const grandEl = document.getElementById("order-grand-total");

  if (subEl) subEl.textContent = `₹${totals.subtotal.toFixed(2)}`;
  if (delEl) delEl.textContent = totals.deliveryCharge === 0 ? "FREE" : `₹${totals.deliveryCharge.toFixed(2)}`;
  if (disEl) disEl.textContent = `-₹${totals.discount.toFixed(2)}`;
  if (grandEl) grandEl.textContent = `₹${totals.grandTotal.toFixed(2)}`;
}

// ---------- WHATSAPP ----------
function generateWhatsAppMessage(order, totals) {
  const storeName = "Pagariya Super Shop";
  let message = `*${storeName}*\n\n`;
  message += `*Order Request*\n`;
  message += `━━━━━━━━━━━━━━━━\n\n`;

  message += `*Items:*\n`;
  order.forEach((item) => {
    message += `• ${item.name} × ${item.quantity} = ₹${Number(item.price) * Number(item.quantity)}\n`;
  });

  message += `\n━━━━━━━━━━━━━━━━\n`;
  message += `*Subtotal:* ₹${totals.subtotal.toFixed(2)}\n`;
  message += `*Delivery:* ${totals.deliveryCharge === 0 ? "FREE" : `₹${totals.deliveryCharge.toFixed(2)}`}\n`;
  if (totals.discount > 0) message += `*Discount:* -₹${totals.discount.toFixed(2)}\n`;
  message += `\n*Total: ₹${totals.grandTotal.toFixed(2)}*\n\n`;
  message += `Please confirm my order. Thank you!`;

  return message;
}

function openWhatsApp(order, totals) {
  const phoneNumber = "919423492692"; // ✅ your shop WhatsApp number (no +)
  const message = generateWhatsAppMessage(order, totals);
  const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  window.open(whatsappURL, "_blank");
}

// ---------- MONGO SAVE ----------
async function saveOrderToMongo(order, totals) {
  const token = localStorage.getItem("token");
  if (!token) {
    // Not logged in -> we can still do WhatsApp, but Mongo save skipped
    return { skipped: true, message: "Not logged in, skipped Mongo save" };
  }

  const items = order.map((it) => ({
    name: it.name,
    price: Number(it.price),
    quantity: Number(it.quantity),
  }));

  const payload = {
    items,
    subtotal: totals.subtotal,
    deliveryCharge: totals.deliveryCharge,
    discount: totals.discount,
    total: totals.grandTotal, // ✅ backend expects "total"
  };

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
    throw new Error(data.message || "Order save failed");
  }

  return data;
}

// ---------- CONFIRM BUTTON: SAVE THEN WHATSAPP ----------
async function handleConfirmOrderClick() {
  const order = getOrderFromStorage();
  if (!order.length) {
    alert("No items in order");
    return;
  }

  const totals = calculateOrderTotals(order);

  // Optional: disable button to avoid double click
  const btn = document.getElementById("confirm-order-btn");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Processing...";
  }

  try {
    // 1) Mongo save first (backend)
    await saveOrderToMongo(order, totals);
  } catch (e) {
    // If Mongo save fails (token/ server), still allow WhatsApp so order is not lost
    console.warn("Mongo save failed:", e.message);
    // Optional user message:
    // alert("Mongo save failed, sending to WhatsApp only.");
  } finally {
    // 2) After save attempt -> WhatsApp open
    openWhatsApp(order, totals);

    // 3) Clear cart/order after opening WhatsApp
    setTimeout(() => {
      localStorage.removeItem("pagariyaCart");
      localStorage.removeItem("pagariyaOrder");
    }, 500);

    // 4) restore button
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Confirm Order";
    }
  }
}

// ---------- INIT ----------
function initOrderButtons() {
  const confirmBtn = document.getElementById("confirm-order-btn");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", handleConfirmOrderClick);
  }

  const backBtn = document.getElementById("back-to-cart-btn");
  if (backBtn) {
    backBtn.addEventListener("click", () => (window.location.href = "cart.html"));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderOrderSummary();
  initOrderButtons();
});
