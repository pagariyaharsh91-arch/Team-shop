const API_BASE = "http://localhost:5000";

function getOrderFromStorage() {
  return JSON.parse(localStorage.getItem("pagariyaOrder") || "[]");
}

function render() {
  const items = getOrderFromStorage();

  const box = document.getElementById("order-items-container");
  box.innerHTML = items.map(i => `
    <p><strong>${i.name}</strong> × ${i.quantity} — ₹${i.price * i.quantity}</p>
  `).join("");

  const subtotal = items.reduce((s,i)=>s+i.price*i.quantity,0);
  const delivery = subtotal>=500?0:30;
  const discount = 0;

  document.getElementById("order-subtotal").textContent=subtotal;
  document.getElementById("order-delivery").textContent=delivery;
  document.getElementById("order-discount").textContent=discount;
  document.getElementById("order-grand-total").textContent=subtotal+delivery-discount;
}

async function saveOrder() {
  // Check if user is logged in
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please log in to place an order");
    window.location.href = "login.html";
    return;
  }

  const name = document.getElementById("custName").value;
  const phone = document.getElementById("custPhone").value;
  const address = document.getElementById("addressNote").value;

  if(!name||!phone||!address){
    alert("Please fill all details!");
    return;
  }

  const items = getOrderFromStorage();

  try{
    const res = await fetch(`${API_BASE}/api/orders`,{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        Authorization:"Bearer "+token
      },
      body:JSON.stringify({
        items,
        customer:{name,phone,address}
      })
    });

    if(res.ok){
      alert("Order placed successfully!");
      localStorage.removeItem("pagariyaCart");
      localStorage.removeItem("pagariyaOrder");
      window.location.href = "index.html";
    }else{
      alert("Order failed");
    }

  }catch{
    alert("Server error");
  }
}

document.addEventListener("DOMContentLoaded",()=>{
  render();
  document
    .getElementById("confirm-order-btn")
    .addEventListener("click",saveOrder);
});