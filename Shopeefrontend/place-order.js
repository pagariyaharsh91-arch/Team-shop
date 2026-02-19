// Place Order Page Functions

function getCartFromStorage() {
    const cart = localStorage.getItem('pagariyaCart');
    return cart ? JSON.parse(cart) : [];
}

function calculateTotals(cart) {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let deliveryCharge = 0;
    let discount = 0;
    
    if (subtotal >= 500) {
        deliveryCharge = 0;
    } else {
        deliveryCharge = 30;
    }
    
    if (subtotal >= 1000) {
        discount = subtotal * 0.05;
    }
    
    const grandTotal = subtotal + deliveryCharge - discount;
    
    return {
        subtotal: Math.round(subtotal * 100) / 100,
        deliveryCharge: Math.round(deliveryCharge * 100) / 100,
        discount: Math.round(discount * 100) / 100,
        grandTotal: Math.round(grandTotal * 100) / 100
    };
}

function renderOrderSummary() {
    const cart = getCartFromStorage();
    
    if (cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }
    
    const container = document.getElementById('order-items-container');
    container.innerHTML = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item-row';
        orderItem.innerHTML = `
            <div class="item-info">
                <p class="item-name">${item.name}</p>
                <p class="item-qty">Qty: ${item.quantity}</p>
            </div>
            <div class="item-price">
                <p>₹${item.price} × ${item.quantity}</p>
                <p class="item-subtotal">₹${itemTotal}</p>
            </div>
        `;
        container.appendChild(orderItem);
    });
    
    // Update totals
    const totals = calculateTotals(cart);
    document.getElementById('po-subtotal').textContent = `₹${totals.subtotal.toFixed(2)}`;
    document.getElementById('po-delivery').textContent = totals.deliveryCharge === 0 ? 'FREE' : `₹${totals.deliveryCharge.toFixed(2)}`;
    document.getElementById('po-discount').textContent = `-₹${totals.discount.toFixed(2)}`;
    document.getElementById('po-grand-total').textContent = `₹${totals.grandTotal.toFixed(2)}`;
}

function validatePlaceOrderForm() {
    const fullName = document.getElementById('po-name').value.trim();
    const mobile = document.getElementById('po-mobile').value.trim();
    const address = document.getElementById('po-address').value.trim();
    
    let isValid = true;
    
    // Clear previous errors
    document.getElementById('po-name-error').textContent = '';
    document.getElementById('po-mobile-error').textContent = '';
    document.getElementById('po-address-error').textContent = '';
    
    // Validate Full Name
    if (!fullName) {
        document.getElementById('po-name-error').textContent = 'Full name is required';
        isValid = false;
    } else if (fullName.length < 2) {
        document.getElementById('po-name-error').textContent = 'Full name must be at least 2 characters';
        isValid = false;
    }
    
    // Validate Mobile Number
    if (!mobile) {
        document.getElementById('po-mobile-error').textContent = 'Mobile number is required';
        isValid = false;
    } else if (!/^\d{10}$/.test(mobile)) {
        document.getElementById('po-mobile-error').textContent = 'Mobile number must be 10 digits';
        isValid = false;
    }
    
    // Validate Address
    if (!address) {
        document.getElementById('po-address-error').textContent = 'Address is required';
        isValid = false;
    } else if (address.length < 5) {
        document.getElementById('po-address-error').textContent = 'Address must be at least 5 characters';
        isValid = false;
    }
    
    return isValid;
}

function generateWhatsAppMessage(fullName, mobile, address, note) {
    const cart = getCartFromStorage();
    const totals = calculateTotals(cart);
    const storeName = 'Pagariya Super Shop';
    
    let message = `*${storeName}* - Order Request\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `*Customer Details:*\n`;
    message += `Name: ${fullName}\n`;
    message += `Mobile: ${mobile}\n`;
    message += `Address: ${address}\n`;
    
    if (note && note.trim()) {
        message += `Note: ${note}\n`;
    }
    
    message += `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `*Order Items:*\n`;
    
    cart.forEach(item => {
        const lineTotal = item.price * item.quantity;
        message += `• ${item.name} × ${item.quantity} = ₹${lineTotal}\n`;
    });
    
    message += `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `Subtotal: ₹${totals.subtotal.toFixed(2)}\n`;
    
    if (totals.deliveryCharge > 0) {
        message += `Delivery: ₹${totals.deliveryCharge.toFixed(2)}\n`;
    } else {
        message += `Delivery: FREE\n`;
    }
    
    if (totals.discount > 0) {
        message += `Discount: -₹${totals.discount.toFixed(2)}\n`;
    }
    
    message += `\n*Grand Total: ₹${totals.grandTotal.toFixed(2)}*\n\n`;
    message += `Please confirm my order. Thank you!`;
    
    return message;
}

function handlePlaceOrderSubmit(e) {
    e.preventDefault();
    
    // Validate form
    if (!validatePlaceOrderForm()) {
        return;
    }
    
    // Get form data
    const fullName = document.getElementById('po-name').value.trim();
    const mobile = document.getElementById('po-mobile').value.trim();
    const address = document.getElementById('po-address').value.trim();
    const note = document.getElementById('po-note').value.trim();
    
    // Generate WhatsApp message
    const message = generateWhatsAppMessage(fullName, mobile, address, note);
    
    // Open WhatsApp
    const phoneNumber = '919423492692';
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
    
    // Clear cart and show success message
    setTimeout(() => {
        localStorage.removeItem('pagariyaCart');
        showSuccessMessage();
        
        // Reset form
        document.getElementById('place-order-form').reset();
        
        // Redirect to home after 3 seconds
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    }, 500);
}

function showSuccessMessage() {
    const successMessage = document.getElementById('po-success-message');
    if (successMessage) {
        successMessage.style.display = 'flex';
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 4000);
    }
}

function updateCartBadge() {
    const cart = getCartFromStorage();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartBadge = document.querySelector('.cart-badge');
    if (cartBadge) {
        cartBadge.textContent = totalItems;
    }
}

function initPlaceOrderPage() {
    // Form submission
    const form = document.getElementById('place-order-form');
    if (form) {
        form.addEventListener('submit', handlePlaceOrderSubmit);
    }
    
    // Back button
    const backBtn = document.getElementById('po-back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'cart.html';
        });
    }
    
    // Render order summary
    renderOrderSummary();
    
    // Update cart badge
    updateCartBadge();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initPlaceOrderPage();
});
