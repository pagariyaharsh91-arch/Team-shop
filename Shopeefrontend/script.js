/* ================= CONFIG ================= */
const API_BASE = "http://localhost:5000";
const CART_KEY = "pagariyaCart";
const PRODUCT_LIMIT = 20;

let allProducts = [];

/* ================= MOBILE MENU ================= */
const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
const navLinks = document.querySelector(".nav-links");

if (mobileMenuBtn && navLinks) {
  mobileMenuBtn.addEventListener("click", () => {
    navLinks.style.display =
      navLinks.style.display === "none" ? "flex" : "none";
  });
}

/* ================= CART STORAGE ================= */
function getCartFromStorage() {
  return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
}

function saveCartToStorage(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function updateCartBadge() {
  const cart = getCartFromStorage();
  const total = cart.reduce((s, i) => s + i.quantity, 0);
  const badge = document.querySelector(".cart-badge");
  if (badge) badge.textContent = total;
}

/* ================= FETCH PRODUCTS ================= */
async function fetchProducts() {
  const container = document.querySelector(".products-grid");
  if (!container) return;

  // ⏳ Loading state
  container.innerHTML = `
    <div class="fallback-ui">
      ⏳ Loading products…
    </div>
  `;

  try {
    const res = await fetch(`${API_BASE}/api/products`);
    if (!res.ok) throw new Error("API failed");

    const data = await res.json();
    allProducts = Array.isArray(data) ? data.slice(0, PRODUCT_LIMIT) : [];

    if (!allProducts.length) {
      showEmptyState(container);
      return;
    }

    renderProducts(allProducts);

  } catch (err) {
    console.error(err);
    showErrorState(container);
  }
}

/* ================= RENDER PRODUCTS ================= */
function renderProducts(products) {
  const container = document.querySelector(".products-grid");
  if (!container) return;

  container.innerHTML = "";

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";

    const imagePath = product.image || "images/products/placeholder.jpg";

    card.innerHTML = `
      <div class="product-image-container">
        <img src="${imagePath}" alt="${product.name}" class="product-image">
        <div class="badge badge-bestseller">NEW</div>
      </div>

      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">
          ${product.quantity > 0 ? `Stock: ${product.quantity}` : "Out of Stock"}
        </p>

        <div class="product-footer">
          <span class="product-price">₹${product.price}</span>

          <button class="add-btn" ${product.quantity <= 0 ? "disabled" : ""}
            data-product-id="${product._id}"
            data-product-name="${product.name}"
            data-product-price="${product.price}">
            Add +
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

/* ================= FALLBACK STATES ================= */
function showEmptyState(container) {
  container.innerHTML = `
    <div class="fallback-ui">
      📦 No products available right now.<br/>
      Please check back later.
    </div>
  `;
}

function showErrorState(container) {
  container.innerHTML = `
    <div class="fallback-ui error">
      ❌ Unable to load products.<br/>
      Please refresh the page.
    </div>
  `;
}

/* ================= ADD TO CART ================= */
function addProductToCart(product) {
  const cart = getCartFromStorage();
  // Use _id if available (from backend), fallback to id (for hardcoded products)
  const productId = product._id || product.id;
  const existing = cart.find(i => (i._id || i.id) === productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      _id: product._id || product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
  }

  saveCartToStorage(cart);
  updateCartBadge();
  showNotification(`${product.name} added to cart`);
}

/* ================= ATTACH ADD BUTTONS ================= */
function attachAddButtonListeners() {
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const productId = btn.dataset.productId;
      const productName = btn.dataset.productName;
      const productPrice = parseFloat(btn.dataset.productPrice);
      
      if (productId && productName && productPrice) {
        addProductToCart({
          id: productId,
          name: productName,
          price: productPrice
        });
      }
    });
  });
}

/* ================= NOTIFICATION ================= */
function showNotification(message) {
  const note = document.createElement("div");
  note.className = "toast";
  note.textContent = message;

  document.body.appendChild(note);

  setTimeout(() => note.classList.add("show"), 10);
  setTimeout(() => {
    note.classList.remove("show");
    setTimeout(() => note.remove(), 300);
  }, 2500);
}

/* ================= RESPONSIVE HEADER ================= */
function adjustHeaderForResponsive() {
  if (!navLinks) return;
  navLinks.style.display = window.innerWidth <= 768 ? "none" : "flex";
}

window.addEventListener("resize", adjustHeaderForResponsive);

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  adjustHeaderForResponsive();
  attachAddButtonListeners();
  fetchProducts();
});

console.log("✅ Frontend loaded with product limit + fallback UI");