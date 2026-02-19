// ==================== ORDER PAGE FUNCTIONALITY ====================
// WhatsApp Integration for Order Placement

document.addEventListener('DOMContentLoaded', function() {
    loadOrderSummary();
    setupOrderForm();
});

// Load and display order summary from localStorage
function loadOrderSummary() {
    const orderSummary = JSON.parse(localStorage.getItem('orderSummary') || 'null');
    const emptyMessage = document.getElementById('empty-order-message');
    const orderContent = document.getElementById('order-content');
    
    if (!orderSummary || !orderSummary.items || orderSummary.items.length === 0) {
        emptyMessage.style.display = 'flex';
        orderContent.style.display = 'none';
        return;
    }
    
    emptyMessage.style.display = 'none';
    orderContent.style.display = 'grid';
    
    // Display order items
    const orderItemsContainer = document.getElementById('order-items');
    orderItemsContainer.innerHTML = '';
    
    orderSummary.items.forEach(item => {
        const itemElement = createOrderItemElement(item);
        orderItemsContainer.appendChild(itemElement);
    });
    
    // Update totals
    document.getElementById('order-subtotal').textContent = `₹${orderSummary.subtotal}`;
    document.getElementById('order-shipping').textContent = orderSummary.shipping === 0 ? 'Free' : `₹${orderSummary.shipping}`;
    document.getElementById('order-tax').textContent = `₹${orderSummary.tax}`;
    document.getElementById('order-final-total').textContent = `₹${orderSummary.total}`;
}

// Create order item HTML element
function createOrderItemElement(item) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'order-item';
    
    const itemTotal = item.price * item.quantity;
    
    itemDiv.innerHTML = `
        <div class="order-item-info">
            <div class="order-item-name">${item.name}</div>
            <div class="order-item-qty">Qty: ${item.quantity} × ₹${item.price}</div>
        </div>
        <div class="order-item-price">₹${itemTotal}</div>
    `;
    
    return itemDiv;
}

// Setup order form submission
function setupOrderForm() {
    const orderForm = document.getElementById('orderForm');
    
    if (orderForm) {
        orderForm.addEventListener('submit', handleOrderSubmit);
    }
}

// ==================== MAIN ORDER SUBMISSION HANDLER ====================
// Handle order form submission with WhatsApp integration
function handleOrderSubmit(e) {
    e.preventDefault();
    
    // ==================== STEP 1: VALIDATE CART ====================
    // Check if cart is empty before proceeding
    const cart = getCart();
    if (!cart || cart.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    // ==================== STEP 2: GET FORM DATA ====================
    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const email = document.getElementById('cust-email').value.trim();
    const address = document.getElementById('cust-address').value.trim();
    const city = document.getElementById('cust-city').value.trim();
    const pincode = document.getElementById('cust-pincode').value.trim();
    const instructions = document.getElementById('cust-instructions').value.trim();
    const terms = document.getElementById('cust-terms').checked;
    
    // ==================== STEP 3: VALIDATE REQUIRED FIELDS ====================
    // Check if essential customer details are missing
    if (!name || !phone || !address) {
        alert('Please fill in Name, Phone, and Address fields');
        return;
    }
    
    // Validate phone number (10+ digits)
    if (!/^\d{10}/.test(phone.replace(/\D/g, ''))) {
        showOrderMessage('Please enter a valid phone number (10 digits)', 'error');
        return;
    }
    
    // Validate pincode (6 digits)
    if (!pincode || !/^\d{6}$/.test(pincode)) {
        showOrderMessage('Please enter a valid 6-digit pincode', 'error');
        return;
    }
    
    // Validate terms acceptance
    if (!terms) {
        showOrderMessage('Please accept the terms and conditions', 'error');
        return;
    }
    
    // ==================== STEP 4: GET ORDER SUMMARY ====================
    const orderSummary = JSON.parse(localStorage.getItem('orderSummary') || 'null');
    
    if (!orderSummary || !orderSummary.items || orderSummary.items.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    // ==================== STEP 5: CREATE WHATSAPP MESSAGE ====================
    // Format the order data into a readable WhatsApp message
    const whatsappMessage = createWhatsAppMessage(
        name,
        phone,
        address,
        city,
        pincode,
        instructions,
        orderSummary
    );
    
    // ==================== STEP 6: SEND TO WHATSAPP ====================
    // Use wa.me API to send message via WhatsApp
    // Format: https://wa.me/[phone-number]/?text=[message]
    const phoneNumber = '9423492692'; // Placeholder WhatsApp number
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappURL = `https://wa.me/${phoneNumber}/?text=${encodedMessage}`;
    
    // ==================== STEP 7: SAVE ORDER LOCALLY ====================
    // Create and save order data to localStorage
    const orderData = {
        orderId: 'ORD-' + Date.now(),
        timestamp: new Date().toLocaleString(),
        customer: {
            name,
            phone,
            email,
            address,
            city,
            pincode,
            instructions
        },
        items: orderSummary.items,
        totals: {
            subtotal: orderSummary.subtotal,
            shipping: orderSummary.shipping,
            tax: orderSummary.tax,
            total: orderSummary.total
        }
    };
    
    // Save order to localStorage
    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(orderData);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // ==================== STEP 8: CLEAR CART DATA ====================
    // Clear cart and order summary after successful submission
    localStorage.setItem('cart', JSON.stringify([]));
    localStorage.removeItem('orderSummary');
    updateCartBadge(); // Update cart badge to 0
    
    // ==================== STEP 9: SHOW CONFIRMATION ====================
    // Display success message with Order ID
    // Message indicates WhatsApp will open
    const confirmationMessage = `
        ✅ Order sent successfully! Order ID: ${orderData.orderId}
        📱 WhatsApp is opening... You will be redirected to home page in 3 seconds.
    `;
    showOrderMessage(confirmationMessage, 'success');
    
    // Reset form fields
    document.getElementById('orderForm').reset();
    
    // ==================== STEP 10: REDIRECT TO WHATSAPP ====================
    // Open WhatsApp with pre-filled message in a new tab
    // This prevents website navigation and keeps user in control
    setTimeout(() => {
        window.open(whatsappURL, '_blank');
    }, 500);
    
    // ==================== STEP 11: AUTO-REDIRECT TO HOME PAGE ====================
    // After 3 seconds, redirect user back to home page (index.html)
    // This ensures the website doesn't freeze and the user naturally returns to home
    // Timeline:
    //   0ms   - Order submitted, validation passed
    //   500ms - WhatsApp opens in new tab/window
    //   3000ms - Automatic redirect to home page
    setTimeout(() => {
        // Redirect to home page
        window.location.href = 'index.html';
    }, 3000);
}

// ==================== WHATSAPP MESSAGE FORMATTER ====================
// Create a formatted WhatsApp message with order details
// This message will be URL encoded and sent via wa.me API
function createWhatsAppMessage(name, phone, address, city, pincode, instructions, orderSummary) {
    // Get current cart items
    const cart = getCart();
    
    // Build the message line by line
    let message = '';
    
    // Header
    message += '🛒 *ORDER For PAGARIYA SUPER SHOP* 🛒\n';
    message += '==========================================\n\n';
    
    // Customer Information Section
    message += '👤 *CUSTOMER DETAILS*\n';
    message += `Name: ${name}\n`;
    message += `Phone: ${phone}\n`;
    message += `Address: ${address}\n`;
    message += `City: ${city}\n`;
    message += `Pincode: ${pincode}\n`;
    if (instructions) {
        message += `Special Instructions: ${instructions}\n`;
    }
    message += '\n';
    
    // Order Items Section
    message += '📦 *ORDERED ITEMS*\n';
    message += '-------------------------------------------\n';
    
    // List each item with quantity and price
    if (cart && cart.length > 0) {
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            message += `${index + 1}. ${item.name}\n`;
            message += `   Qty: ${item.quantity} × ₹${item.price} = ₹${itemTotal}\n`;
        });
    }
    message += '-------------------------------------------\n\n';
    
    // Order Summary Section
    message += '💰 *ORDER SUMMARY*\n';
    message += `Subtotal: ₹${orderSummary.subtotal}\n`;
    message += `Shipping: ${orderSummary.shipping === 0 ? 'Free' : `₹${orderSummary.shipping}`}\n`;
    message += `Tax (5%): ₹${orderSummary.tax}\n`;
    message += `*Total Amount: ₹${orderSummary.total}*\n\n`;
    
    // Footer
    message += '==========================================\n';
    message += '✅ Please confirm this order\n';
    message += '📱 We will contact you shortly for payment\n';
    message += 'Thank you for your order! 🙏';
    
    return message;
}
function showOrderMessage(message, type) {
    const messageEl = document.getElementById('orderMessage');
    messageEl.textContent = message;
    messageEl.className = `order-message ${type}`;
    messageEl.style.display = 'block';
    messageEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
