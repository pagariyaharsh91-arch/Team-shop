console.log("PAYAL-PRODUCTS-LOADER-123");
const CART_KEY = "pagariya_cart";
const API_BASE = "http://localhost:5000";

let allProducts = [];

let fileUpload;
let uploadStatus;
let productsGrid;
let cartBadge;
let noProductsMsg;

document.addEventListener("DOMContentLoaded", () => {
  console.log("products-loader.js loaded");

  initDOM();
  bindEvents();
  updateCartBadge();
  loadProductsFromBackend();
});

function initDOM() {
  fileUpload = document.getElementById("fileUpload");
  uploadStatus = document.getElementById("uploadStatus");
  productsGrid = document.getElementById("productsGrid");
  cartBadge = document.getElementById("cartBadge");
  noProductsMsg = document.getElementById("noProductsMsg");

  console.log("DOM ready:", {
    fileUpload,
    uploadStatus,
    productsGrid,
    cartBadge,
    noProductsMsg
  });
}

function bindEvents() {
  if (!fileUpload) {
    console.error("fileUpload input not found");
    return;
  }

  fileUpload.addEventListener("change", async (e) => {
    console.log("File selected:", e.target.files[0]);
    await handleFileUpload();
  });
}

async function handleFileUpload() {
  try {
    const file = fileUpload.files[0];

    if (!file) {
      setStatus("❌ No file selected", "error");
      return;
    }

    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      setStatus("❌ Only XLSX / XLS allowed", "error");
      return;
    }

    const token = localStorage.getItem("shopToken");

    if (!token) {
      setStatus("❌ Shop login required", "error");
      return;
    }

    setStatus("⏳ Uploading file...", "info");
    console.log("Uploading started...");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/api/import/upload-xlsx`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    console.log("Upload response status:", res.status);

    const data = await res.json();
    console.log("Upload response data:", data);

    if (!res.ok || !data.success) {
      throw new Error(data.error || data.message || "Upload failed");
    }

    setStatus(`✅ Uploaded (${data.recordsProcessed} items) for ${data.shop}`, "success");

    await loadProductsFromBackend();
  } catch (err) {
    console.error("handleFileUpload error:", err);
    setStatus(`❌ ${err.message}`, "error");
  }
}

async function loadProductsFromBackend() {
  try {
    const shopData = JSON.parse(localStorage.getItem("shopData") || "null");

    if (!shopData) {
      console.log("No shopData found");
      return;
    }

    console.log("Loading products for shop:", shopData.name);

    const res = await fetch(`${API_BASE}/api/products?shop=${encodeURIComponent(shopData.name)}`);
    const data = await res.json();

    console.log("Products API response:", data);

    allProducts = Array.isArray(data) ? data : [];

    renderProducts();
  } catch (err) {
    console.error("loadProductsFromBackend error:", err);
    setStatus("❌ Failed to load products", "error");
  }
}

function renderProducts() {
  if (!productsGrid) {
    console.error("productsGrid not found");
    return;
  }

  productsGrid.innerHTML = "";

  if (!allProducts.length) {
    if (noProductsMsg) noProductsMsg.style.display = "block";
    return;
  }

  if (noProductsMsg) noProductsMsg.style.display = "none";

  allProducts.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";

    const imageSrc =
      product.image && product.image.trim()
        ? product.image
        : "https://via.placeholder.com/220x160?text=No+Image";

    card.innerHTML = `
      <div class="product-image-container">
        <img src="${imageSrc}" alt="${escapeHtml(product.name)}" class="product-image">
      </div>
      <div class="product-info">
        <h3 class="product-name">${escapeHtml(product.name)}</h3>
        <p class="product-description">Stock: ${product.quantity ?? 0}</p>
        <div class="product-footer">
          <span class="product-price">₹${product.price ?? 0}</span>
          <button class="add-btn">Add +</button>
        </div>
      </div>
    `;

    const btn = card.querySelector(".add-btn");
    btn.addEventListener("click", () => addToCart(product));

    productsGrid.appendChild(card);
  });

  console.log("Products rendered:", allProducts.length);
}

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find((item) => item._id === product._id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image || "",
      qty: 1
    });
  }

  saveCart(cart);
}

function updateCartBadge() {
  if (!cartBadge) return;

  const total = getCart().reduce((sum, item) => sum + item.qty, 0);
  cartBadge.textContent = total;
}

function setStatus(msg, type) {
  if (!uploadStatus) {
    console.error("uploadStatus element not found");
    return;
  }

  uploadStatus.textContent = msg;
  uploadStatus.style.color =
    type === "error" ? "#ff4d4f" :
    type === "success" ? "#52C41A" :
    "#1890ff";

  console.log("STATUS:", msg);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text || "";
  return div.innerHTML;
}