const API_BASE = "http://localhost:5000";

/* ================= GET ORDER FROM STORAGE ================= */

function getOrderFromStorage() {
  return JSON.parse(localStorage.getItem("pagariyaOrder") || "[]");
}

/* ================= RENDER ORDER ================= */

function render() {

  const items = getOrderFromStorage();

  const container = document.getElementById("order-items-container");

  if (!items.length) {
    container.innerHTML = "<p>No items in order</p>";
    return;
  }

  container.innerHTML = items.map(i => `
    <p><strong>${i.name}</strong> × ${i.quantity} — ₹${i.price * i.quantity}</p>
  `).join("");

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const delivery = subtotal >= 500 ? 0 : 30;
  const discount = 0;
  const total = subtotal + delivery - discount;

  document.getElementById("order-subtotal").textContent = `₹${subtotal}`;
  document.getElementById("order-delivery").textContent = delivery === 0 ? "FREE" : `₹${delivery}`;
  document.getElementById("order-discount").textContent = `₹${discount}`;
  document.getElementById("order-grand-total").textContent = `₹${total}`;
}

/* ================= SAVE ORDER ================= */

async function saveOrder() {

  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please log in to place an order");
    window.location.href = "login.html";
    return;
  }

  const name = document.getElementById("custName").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  const address = document.getElementById("addressNote").value.trim();

  if (!name || !phone || !address) {
    alert("Please fill all details!");
    return;
  }

  const items = getOrderFromStorage();

  if (!items.length) {
    alert("Your cart is empty");
    return;
  }

  try {

    const res = await fetch(`${API_BASE}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({
        items,
        customerName: name,
        phone: phone,
        address: address
      })
    });

    const data = await res.json();

    if (res.ok) {

      alert("Order placed successfully! 🎉");

      localStorage.removeItem("pagariyaCart");
      localStorage.removeItem("pagariyaOrder");

      window.location.href = "index.html";

    } else {

      console.error(data);
      alert(data.message || "Order failed");

    }

  } catch (err) {

    console.error(err);
    alert("Server error");

  }
}

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", () => {

  render();

  const btn = document.getElementById("confirm-order-btn");

  if (btn) {
    btn.addEventListener("click", saveOrder);
  }

});