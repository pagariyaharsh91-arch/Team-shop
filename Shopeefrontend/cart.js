// Cart Functions
function getCartFromStorage() {
    const cart = localStorage.getItem('pagariyaCart');
    return cart ? JSON.parse(cart) : [];
}

function saveCartToStorage(cart) {
    localStorage.setItem('pagariyaCart', JSON.stringify(cart));
}

function calculateTotals() {
    const cart = getCartFromStorage();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let deliveryCharge = 0;
    let discount = 0;
    
    // Free delivery on orders above ₹500
    if (subtotal >= 500) {
        deliveryCharge = 0;
    } else {
        deliveryCharge = 30; // Default delivery charge
    }
    
    // Apply discount for orders above ₹1000
    if (subtotal >= 1000) {
        discount = subtotal * 0.05; // 5% discount
    }
    
    const grandTotal = subtotal + deliveryCharge - discount;
    
    return {
        subtotal: Math.round(subtotal * 100) / 100,
        deliveryCharge: Math.round(deliveryCharge * 100) / 100,
        discount: Math.round(discount * 100) / 100,
        grandTotal: Math.round(grandTotal * 100) / 100
    };
}

function updateQuantity(productId, newQuantity) {
    let cart = getCartFromStorage();
    
    if (newQuantity <= 0) {
        // Remove item if quantity is 0 or less
        cart = cart.filter(item => (item._id || item.id) !== productId);
    } else {
        // Update quantity
        const product = cart.find(item => (item._id || item.id) === productId);
        if (product) {
            product.quantity = newQuantity;
        }
    }
    
    saveCartToStorage(cart);
    renderCart();
    updateSummary();
}

function removeItem(productId) {
    let cart = getCartFromStorage();
    cart = cart.filter(item => (item._id || item.id) !== productId);
    saveCartToStorage(cart);
    renderCart();
    updateSummary();
}

function renderCart() {
    const cart = getCartFromStorage();
    const cartContainer = document.getElementById('cart-items-container');
    const emptyMessage = document.getElementById('empty-cart-message');
    
    // Update cart badge
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartBadge = document.querySelector('.cart-badge');
    if (cartBadge) {
        cartBadge.textContent = totalItems;
    }
    
    if (cart.length === 0) {
        cartContainer.style.display = 'none';
        emptyMessage.style.display = 'flex';
        document.getElementById('place-order-btn').disabled = true;
        return;
    }
    
    cartContainer.style.display = 'block';
    emptyMessage.style.display = 'none';
    cartContainer.innerHTML = '';
    
    cart.forEach(item => {
        const itemId = item._id || item.id;
        const itemTotal = item.price * item.quantity;
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="https://via.placeholder.com/80/2C2C2C/2C2C2C?text=${encodeURIComponent(item.name)}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <h3 class="cart-item-name">${item.name}</h3>
                <p class="cart-item-price">₹${item.price}</p>
            </div>
            <div class="cart-item-quantity">
                <button class="qty-btn qty-minus" data-product-id="${itemId}">
                    <i class="fas fa-minus"></i>
                </button>
                <input type="number" class="qty-input" value="${item.quantity}" data-product-id="${itemId}" min="1">
                <button class="qty-btn qty-plus" data-product-id="${itemId}">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            <div class="cart-item-total">
                <p class="item-total">₹${itemTotal}</p>
            </div>
            <div class="cart-item-remove">
                <button class="remove-btn" data-product-id="${itemId}" title="Remove item">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        cartContainer.appendChild(cartItem);
    });
    
    // Attach event listeners
    attachCartEventListeners();
    document.getElementById('place-order-btn').disabled = false;
}

function attachCartEventListeners() {
    // Quantity plus buttons
    document.querySelectorAll('.qty-plus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = btn.dataset.productId;
            const cart = getCartFromStorage();
            const product = cart.find(item => (item._id || item.id) === productId);
            if (product) {
                updateQuantity(productId, product.quantity + 1);
            }
        });
    });
    
    // Quantity minus buttons
    document.querySelectorAll('.qty-minus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = btn.dataset.productId;
            const cart = getCartFromStorage();
            const product = cart.find(item => (item._id || item.id) === productId);
            if (product) {
                updateQuantity(productId, product.quantity - 1);
            }
        });
    });
    
    // Quantity input fields
    document.querySelectorAll('.qty-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const productId = input.dataset.productId;
            const newQuantity = parseInt(input.value) || 1;
            updateQuantity(productId, newQuantity);
        });
    });
    
    // Remove buttons
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = btn.dataset.productId;
            removeItem(productId);
        });
    });
}

function updateSummary() {
    const totals = calculateTotals();
    
    document.getElementById('subtotal').textContent = `₹${totals.subtotal.toFixed(2)}`;
    document.getElementById('delivery-charge').textContent = totals.deliveryCharge === 0 ? 'FREE' : `₹${totals.deliveryCharge.toFixed(2)}`;
    document.getElementById('discount').textContent = `-₹${totals.discount.toFixed(2)}`;
    document.getElementById('grand-total').textContent = `₹${totals.grandTotal.toFixed(2)}`;
    
    // Update delivery message
    const deliveryMessage = document.getElementById('delivery-message');
    if (totals.subtotal >= 500) {
        deliveryMessage.textContent = '✓ Free delivery applied';
        deliveryMessage.style.color = 'var(--primary-green)';
    } else {
        const remaining = Math.ceil(500 - totals.subtotal);
        deliveryMessage.textContent = `Add ₹${remaining} more for free delivery`;
    }
}

// Place Order Button (MongoDB Integration)
function initPlaceOrderButton() {
  const placeOrderBtn = document.getElementById("place-order-btn");

  if (!placeOrderBtn) return;

  placeOrderBtn.addEventListener("click", async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first!");
      window.location.href = "login.html";
      return;
    }

    const cart = getCartFromStorage(); // pagariyaCart
    if (!cart || cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    // Convert cart items to backend format
    const items = cart.map((item) => ({
      name: item.name || item.productName || item.title || "Item",
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 1),
    }));

    // Calculate totals (must send to backend)
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const deliveryCharge = subtotal >= 500 ? 0 : 40;
    const discount = 0;
    const total = subtotal + deliveryCharge - discount;

    try {
      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ items, subtotal, deliveryCharge, discount, total }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Order failed!");
        return;
      }

      // Clear cart + redirect
      saveCartToStorage([]);
      alert("Order placed successfully ✅");
      window.location.href = "order.html";
    } catch (err) {
      alert("Server error! Please check backend is running.");
    }
  });
}



// Update cart badge
function updateCartBadge() {
    const cart = getCartFromStorage();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartBadge = document.querySelector('#cartBadge');
    if (cartBadge) {
        cartBadge.textContent = totalItems;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    renderCart();
    updateSummary();
    initPlaceOrderButton();
});
async function placeOrderToMongo() {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first!");
    window.location.href = "login.html";
    return;
  }

  const cart = getCartFromStorage();
  if (!cart.length) {
    alert("Cart is empty!");
    return;
  }

  const items = cart.map((item) => ({
    name: item.name || item.productName || "Item",
    price: Number(item.price || 0),
    quantity: Number(item.quantity || 1),
  }));

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryCharge = subtotal >= 500 ? 0 : 40;
  const discount = 0;
  const total = subtotal + deliveryCharge - discount;

  try {
    const res = await fetch("http://localhost:5000/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ items, subtotal, deliveryCharge, discount, total }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Order failed");
      return;
    }

    saveCartToStorage([]);
    alert("Order placed successfully ✅");
    window.location.href = "order.html";
  } catch {
    alert("Server error");
  }
}
