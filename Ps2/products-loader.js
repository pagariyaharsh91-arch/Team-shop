// products-loader.js - Complete E-commerce Implementation
// CSV/XLSX Upload -> Backend -> Categories -> Products -> Cart

const CART_KEY = "pagariya_cart";
const ITEMS_PER_PAGE = 5;
const API_BASE = "http://localhost:5000";

// State
let allProducts = [];
let currentCategory = null;
let currentPage = 1;

// DOM Elements
let fileUpload, uploadBtn, uploadStatus;
let categoriesSection, categoriesGrid;
let categoryModal, modalTitle, modalProducts;
let modalCloseBtn, paginationContainer, prevBtn, nextBtn, pageNumbers, pageInfo;
let cartBadge, noProductsMsg;

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  initDOM();
  bindEvents();
  updateCartBadge();
});

function initDOM() {
  fileUpload = document.getElementById("fileUpload");
  uploadBtn = document.getElementById("uploadBtn");
  uploadStatus = document.getElementById("uploadStatus");

  categoriesSection = document.getElementById("categoriesSection");
  categoriesGrid = document.getElementById("categoriesGrid");
  noProductsMsg = document.getElementById("noProductsMsg");

  categoryModal = document.getElementById("categoryModal");
  modalTitle = document.getElementById("modalTitle");
  modalProducts = document.getElementById("modalProducts");
  modalCloseBtn = document.getElementById("modalCloseBtn");

  paginationContainer = document.getElementById("paginationContainer");
  prevBtn = document.getElementById("prevBtn");
  nextBtn = document.getElementById("nextBtn");
  pageNumbers = document.getElementById("pageNumbers");
  pageInfo = document.getElementById("pageInfo");

  cartBadge = document.getElementById("cartBadge");
}

function bindEvents() {
  uploadBtn.addEventListener("click", () => fileUpload.click());
  fileUpload.addEventListener("change", handleFileUpload);

  modalCloseBtn.addEventListener("click", closeModal);
  prevBtn.addEventListener("click", () => goToPage(currentPage - 1));
  nextBtn.addEventListener("click", () => goToPage(currentPage + 1));
}

// ================= FILE UPLOAD =================
async function handleFileUpload() {
  const file = fileUpload.files[0];
  if (!file) return;

  if (!/\.(csv|xlsx|xls)$/i.test(file.name)) {
    setStatus("❌ Only CSV / XLSX allowed", "error");
    return;
  }

  setStatus("⏳ Uploading file...", "info");

  try {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch(`${API_BASE}/api/import/upload-xlsx`, {
      method: "POST",
      body: fd,
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Upload failed");
    }

    setStatus(`✅ Uploaded (${data.recordsProcessed} items)`, "success");

    await loadProductsFromBackend();

  } catch (err) {
    setStatus(`❌ ${err.message}`, "error");
  }
}

// ================= LOAD PRODUCTS =================
async function loadProductsFromBackend() {
  const res = await fetch(`${API_BASE}/api/products`);
  const data = await res.json();

  allProducts = data.map((p) => ({
    id: p._id,
    name: p.name,
    size: p.size,
    price: p.price,
    stock: p.stock,
    category: p.category || "Daily Essentials",
  }));

  if (!allProducts.length) {
    noProductsMsg.style.display = "block";
    return;
  }

  noProductsMsg.style.display = "none";
  categoriesSection.style.display = "block";
  displayCategories();
}

// ================= CATEGORIES =================
function displayCategories() {
  categoriesGrid.innerHTML = "";

  const categories = [...new Set(allProducts.map(p => p.category))];

  categories.forEach(cat => {
    const count = allProducts.filter(p => p.category === cat).length;

    const card = document.createElement("div");
    card.className = "category-card";
    card.innerHTML = `
      <h3>${escapeHtml(cat)}</h3>
      <p>${count} items</p>
    `;

    card.onclick = () => openCategory(cat);
    categoriesGrid.appendChild(card);
  });
}

function openCategory(category) {
  currentCategory = category;
  currentPage = 1;
  modalTitle.textContent = category;
  categoryModal.style.display = "flex";
  renderProducts();
}

function closeModal() {
  categoryModal.style.display = "none";
}

// ================= PRODUCTS + PAGINATION =================
function renderProducts() {
  const products = allProducts.filter(p => p.category === currentCategory);
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = products.slice(start, start + ITEMS_PER_PAGE);

  modalProducts.innerHTML = "";
  pageItems.forEach(p => modalProducts.appendChild(createProductCard(p)));

  updatePagination(totalPages, products.length);
}

function updatePagination(totalPages, totalItems) {
  paginationContainer.style.display = totalPages > 1 ? "flex" : "none";
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}

function goToPage(page) {
  currentPage = page;
  renderProducts();
}

// ================= PRODUCT CARD =================
function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";

  card.innerHTML = `
    <h4>${escapeHtml(product.name)}</h4>
    <p>${product.size || ""}</p>
    <p>₹${product.price}</p>
    <button ${product.stock ? "" : "disabled"}>
      ${product.stock ? "Add to Cart" : "Out of Stock"}
    </button>
  `;

  card.querySelector("button").onclick = () => addToCart(product);
  return card;
}

// ================= CART =================
function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(product) {
  const cart = getCart();
  const item = cart.find(i => i.id === product.id);

  if (item) item.qty++;
  else cart.push({ ...product, qty: 1 });

  saveCart(cart);
}

function updateCartBadge() {
  const total = getCart().reduce((s, i) => s + i.qty, 0);
  cartBadge.textContent = total;
}

// ================= HELPERS =================
function setStatus(msg, type) {
  uploadStatus.textContent = msg;
  uploadStatus.style.color =
    type === "error" ? "#ff4d4f" :
    type === "success" ? "#52C41A" :
    "#1890ff";
}

function escapeHtml(text) {
  const d = document.createElement("div");
  d.textContent = text;
  return d.innerHTML;
}