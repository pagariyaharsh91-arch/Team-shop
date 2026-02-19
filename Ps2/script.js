// ==================== CART MANAGEMENT ==================== 
// Initialize cart from localStorage
function initializeCart() {
    const cart = localStorage.getItem('cart');
    if (!cart) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
    updateCartBadge();
}

// Get cart from localStorage
function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
}

// Add item to cart
function addToCart(productId, productName, productPrice) {
    const cart = getCart();
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            quantity: 1
        });
    }
    
    saveCart(cart);
}

// Update cart badge count
function updateCartBadge() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartBadge = document.querySelector('.cart-badge');
    if (cartBadge) {
        cartBadge.textContent = totalItems;
    }
}

// ==================== PAGE INITIALIZATION ==================== 
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart on page load
    initializeCart();
    
    // Delegate Add to Cart button clicks to support dynamically created product cards
    // This uses event delegation so newly inserted product cards (from Excel import)
    // will be handled without re-binding event listeners.
    document.addEventListener('click', function(e) {
        const btn = e.target.closest && e.target.closest('.btn-add');
        if (btn) {
            e.preventDefault();
            const productCard = btn.closest('.product-card');
            if (productCard) {
                const productId = productCard.dataset.productId;
                const productName = productCard.dataset.productName;
                const productPrice = productCard.dataset.productPrice;
                handleAddToCart(btn, productId, productName, productPrice);
            }
        }
    });

    // Search bar focus effects
    const searchBar = document.querySelector('.search-bar');
    searchBar.addEventListener('focus', function() {
        this.parentElement.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
    });

    searchBar.addEventListener('blur', function() {
        this.parentElement.style.boxShadow = 'none';
    });

    // Navigation link active state
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Product card hover effects
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.boxShadow = 'none';
        });
    });

    // Header scroll effect
    const header = document.querySelector('.header');
    let lastScrollY = 0;

    window.addEventListener('scroll', function() {
        lastScrollY = window.scrollY;
        
        if (lastScrollY > 10) {
            header.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.12)';
        } else {
            header.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        }
    });
});

// Handle Add to Cart button click
function handleAddToCart(button, productId, productName, productPrice) {
    // Visual feedback
    const originalText = button.textContent;
    button.textContent = '✓ Added';
    button.style.backgroundColor = '#45A018';

    // Add to cart
    addToCart(productId, productName, productPrice);

    // Reset button after 2 seconds
    setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = '';
    }, 2000);
}

// Handle Cart button click (for navigation)
function handleCartClick() {
    // Navigation is handled by the href attribute in HTML
}

// Smooth scroll for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Add animation on scroll for feature cards
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.feature-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Enhance product cards with animation
document.querySelectorAll('.product-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.animation = `fadeInUp 0.6s ease forwards`;
    card.style.animationDelay = `${index * 0.1}s`;
});

// Add keyframe animation to head
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);
