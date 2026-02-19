// ==================== CART PAGE FUNCTIONALITY ====================

// Load and display cart items on page load
document.addEventListener('DOMContentLoaded', function() {
    displayCart();
    setupCheckoutValidation();
});

// Display cart items from localStorage
function displayCart() {
    const cart = getCart();
    const cartItemsContainer = document.getElementById('cart-items-container');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    
    // Clear container
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.style.display = 'none';
        emptyCartMessage.style.display = 'flex';
        document.getElementById('checkout-btn').disabled = true;
        updateOrderSummary();
        return;
    }

    // Display each cart item
    cartItemsContainer.style.display = 'flex';
    emptyCartMessage.style.display = 'none';
    document.getElementById('checkout-btn').disabled = false;

    cart.forEach(item => {
        const itemElement = createCartItemElement(item);
        cartItemsContainer.appendChild(itemElement);
    });

    // Update summary
    updateOrderSummary();
}

// Create cart item HTML element
function createCartItemElement(item) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.setAttribute('data-product-id', item.id);

    const itemTotal = item.price * item.quantity;

    itemDiv.innerHTML = `
        <div class="cart-item-image">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
        </div>
        <div class="cart-item-details">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">₹${item.price}</div>
            <div class="cart-item-controls">
                <button class="qty-btn minus-btn" data-product-id="${item.id}">−</button>
                <input type="number" class="qty-input" value="${item.quantity}" data-product-id="${item.id}" min="1">
                <button class="qty-btn plus-btn" data-product-id="${item.id}">+</button>
                <button class="cart-item-remove" data-product-id="${item.id}">Remove</button>
            </div>
        </div>
        <div class="cart-item-total">₹${itemTotal}</div>
    `;

    // Add event listeners
    const minusBtn = itemDiv.querySelector('.minus-btn');
    const plusBtn = itemDiv.querySelector('.plus-btn');
    const qtyInput = itemDiv.querySelector('.qty-input');
    const removeBtn = itemDiv.querySelector('.cart-item-remove');

    minusBtn.addEventListener('click', () => updateQuantity(item.id, item.quantity - 1));
    plusBtn.addEventListener('click', () => updateQuantity(item.id, item.quantity + 1));
    qtyInput.addEventListener('change', () => updateQuantity(item.id, parseInt(qtyInput.value) || 1));
    removeBtn.addEventListener('click', () => removeFromCart(item.id));

    return itemDiv;
}

// Update item quantity in cart
function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }

    const cart = getCart();
    const item = cart.find(i => i.id === productId);
    
    if (item) {
        item.quantity = newQuantity;
        saveCart(cart);
        displayCart();
    }
}

// Remove item from cart
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    displayCart();
}

// Update order summary
function updateOrderSummary() {
    const cart = getCart();
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.05);
    const shipping = subtotal > 500 ? 0 : 0; // Free shipping for orders > 500
    const total = subtotal + tax + shipping;

    document.getElementById('subtotal').textContent = `₹${subtotal}`;
    document.getElementById('tax').textContent = `₹${tax}`;
    document.getElementById('shipping').textContent = shipping === 0 ? 'Free' : `₹${shipping}`;
    document.getElementById('total').textContent = `₹${total}`;

    // Save order summary to localStorage for order page
    localStorage.setItem('orderSummary', JSON.stringify({
        subtotal,
        tax,
        shipping,
        total,
        items: cart
    }));
}

// Prevent negative quantities
function setupCheckoutValidation() {
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function(e) {
            const cart = getCart();
            if (cart.length === 0) {
                e.preventDefault();
                alert('Please add items to your cart before checking out');
            }
        });
    }
}
