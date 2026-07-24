/* =====================================================
   CONFIGURATION
===================================================== */

const API_BASE = "http://localhost:5000";
const CART_KEY = "pagariyaCart";
const PRODUCT_LIMIT = 20;


/* =====================================================
   GLOBAL VARIABLES
===================================================== */

let allProducts = [];


/* =====================================================
   DOM ELEMENTS
===================================================== */

const mobileMenuBtn =
    document.querySelector(".mobile-menu-btn");

const navLinks =
    document.querySelector(".nav-links");

const searchBar =
    document.querySelector(".search-bar");

const searchButton =
    document.querySelector(".search-btn");

const themeToggle =
    document.getElementById("themeToggle");


/* =====================================================
   MOBILE MENU
===================================================== */

if (mobileMenuBtn && navLinks) {

    mobileMenuBtn.addEventListener("click", () => {

        if (navLinks.style.display === "none") {

            navLinks.style.display = "flex";

        } else {

            navLinks.style.display = "none";

        }

    });

}


/* =====================================================
   CART STORAGE
===================================================== */

function getCartFromStorage() {

    return JSON.parse(
        localStorage.getItem(CART_KEY) || "[]"
    );

}


function saveCartToStorage(cart) {

    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );

}


function updateCartBadge() {

    const cart =
        getCartFromStorage();


    const total =
        cart.reduce(
            (sum, item) =>
                sum + item.quantity,
            0
        );


    const badge =
        document.querySelector(".cart-badge");


    if (badge) {

        badge.textContent = total;

    }

}


/* =====================================================
   FETCH PRODUCTS FROM BACKEND
===================================================== */

async function fetchProducts() {


    const container =
        document.querySelector(
            ".products-grid"
        );


    if (!container) {

        return;

    }


    container.innerHTML = `

        <div class="fallback-ui">

            ⏳ Loading products...

        </div>

    `;


    try {


        const response =
            await fetch(
                `${API_BASE}/api/products`
            );


        if (!response.ok) {

            throw new Error(
                "API request failed"
            );

        }


        const data =
            await response.json();


        allProducts =
            Array.isArray(data)
                ? data.slice(
                    0,
                    PRODUCT_LIMIT
                )
                : [];


        if (
            allProducts.length === 0
        ) {

            showEmptyState(
                container
            );

            return;

        }


        renderProducts(
            allProducts
        );


    } catch (error) {


        console.error(
            "Error fetching products:",
            error
        );


        showErrorState(
            container
        );

    }

}


/* =====================================================
   RENDER PRODUCTS
===================================================== */

function renderProducts(products) {


    const container =
        document.querySelector(
            ".products-grid"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    if (products.length === 0) {

        container.innerHTML = `

            <div class="fallback-ui">

                🔍 No products found.

            </div>

        `;

        return;

    }


    products.forEach(product => {


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "product-card";


        const imagePath =
            product.image ||
            "images/products/placeholder.jpg";


        card.innerHTML = `

            <div class="product-image-container">

                <img

                    src="${imagePath}"

                    alt="${product.name}"

                    class="product-image"

                >

                <div class="badge badge-bestseller">

                    NEW

                </div>

            </div>


            <div class="product-info">

                <h3 class="product-name">

                    ${product.name}

                </h3>


                <p class="product-description">

                    ${
                        product.quantity > 0

                        ? `Stock: ${product.quantity}`

                        : "Out of Stock"

                    }

                </p>


                <div class="product-footer">


                    <span class="product-price">

                        ₹${product.price}

                    </span>


                    <button

                        class="add-btn"

                        ${
                            product.quantity <= 0
                            ? "disabled"
                            : ""
                        }

                    >

                        Add +

                    </button>


                </div>

            </div>

        `;


        container.appendChild(
            card
        );


        const addButton =
            card.querySelector(
                ".add-btn"
            );


        if (addButton) {


            addButton.addEventListener(
                "click",
                () => {


                    addProductToCart(
                        product
                    );


                    /* BUTTON ANIMATION */

                    addButton.innerHTML =
                        "✓ Added";


                    addButton.classList.add(
                        "added"
                    );


                    setTimeout(
                        () => {


                            addButton.innerHTML =
                                "Add +";


                            addButton.classList.remove(
                                "added"
                            );


                        },
                        1000
                    );

                }
            );

        }

    });

}


/* =====================================================
   PRODUCT SEARCH
===================================================== */

function searchProducts() {


    if (!searchBar) {

        return;

    }


    const searchText =
        searchBar.value
            .toLowerCase()
            .trim();


    const filteredProducts =
        allProducts.filter(
            product => {


                const productName =
                    product.name
                        .toLowerCase();


                return productName.includes(
                    searchText
                );

            }
        );


    renderProducts(
        filteredProducts
    );

}


/* =====================================================
   SEARCH WHILE TYPING
===================================================== */

if (searchBar) {


    searchBar.addEventListener(
        "input",
        () => {

            searchProducts();

        }
    );

}


/* =====================================================
   SEARCH BUTTON
===================================================== */

if (searchButton) {


    searchButton.addEventListener(
        "click",
        () => {

            searchProducts();

        }
    );

}


/* =====================================================
   ENTER KEY SEARCH
===================================================== */

if (searchBar) {


    searchBar.addEventListener(
        "keydown",
        event => {


            if (
                event.key === "Enter"
            ) {

                searchProducts();

            }

        }
    );

}


/* =====================================================
   EMPTY STATE
===================================================== */

function showEmptyState(
    container
) {


    container.innerHTML = `

        <div class="fallback-ui">

            📦 No products available right now.

            <br>

            Please check back later.

        </div>

    `;

}


/* =====================================================
   ERROR STATE
===================================================== */

function showErrorState(
    container
) {


    container.innerHTML = `

        <div class="fallback-ui error">

            ❌ Unable to load products.

            <br>

            Please refresh the page.

        </div>

    `;

}


/* =====================================================
   ADD PRODUCT TO CART
===================================================== */

function addProductToCart(
    product
) {


    const cart =
        getCartFromStorage();


    const productId =
        product._id ||
        product.id;


    const existingProduct =
        cart.find(
            item => {


                const existingId =
                    item._id ||
                    item.id;


                return existingId === productId;

            }
        );


    if (existingProduct) {


        existingProduct.quantity += 1;


    } else {


        cart.push({

            _id:
                product._id ||
                product.id,

            name:
                product.name,

            price:
                product.price,

            image:
                product.image,

            quantity: 1

        });

    }


    saveCartToStorage(
        cart
    );


    updateCartBadge();


    showNotification(

        `${product.name} added to cart`

    );

}


/* =====================================================
   TOAST NOTIFICATION
===================================================== */

function showNotification(
    message
) {


    const notification =
        document.createElement(
            "div"
        );


    notification.className =
        "toast";


    notification.textContent =
        message;


    document.body.appendChild(
        notification
    );


    setTimeout(
        () => {

            notification.classList.add(
                "show"
            );

        },
        10
    );


    setTimeout(
        () => {


            notification.classList.remove(
                "show"
            );


            setTimeout(
                () => {

                    notification.remove();

                },
                300
            );


        },
        2500
    );

}


/* =====================================================
   RESPONSIVE HEADER
===================================================== */

function adjustHeaderForResponsive() {


    if (!navLinks) {

        return;

    }


    if (
        window.innerWidth <= 768
    ) {


        navLinks.style.display =
            "none";


    } else {


        navLinks.style.display =
            "flex";

    }

}


window.addEventListener(
    "resize",
    adjustHeaderForResponsive
);


/* =====================================================
   DARK MODE / LIGHT MODE
===================================================== */

if (themeToggle) {


    themeToggle.addEventListener(
        "click",
        () => {


            document.body.classList.toggle(
                "dark-mode"
            );


            if (
                document.body.classList.contains(
                    "dark-mode"
                )
            ) {


                localStorage.setItem(
                    "theme",
                    "dark"
                );


                themeToggle.innerHTML = `

                    <i class="fas fa-sun"></i>

                `;


            } else {


                localStorage.setItem(
                    "theme",
                    "light"
                );


                themeToggle.innerHTML = `

                    <i class="fas fa-moon"></i>

                `;

            }

        }
    );

}


/* =====================================================
   LOAD SAVED THEME
===================================================== */

const savedTheme =
    localStorage.getItem(
        "theme"
    );


if (
    savedTheme === "dark"
) {


    document.body.classList.add(
        "dark-mode"
    );


    if (themeToggle) {


        themeToggle.innerHTML = `

            <i class="fas fa-sun"></i>

        `;

    }

}


/* =====================================================
   INITIALIZE WEBSITE
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {


        updateCartBadge();


        adjustHeaderForResponsive();


        fetchProducts();

    }
);


console.log(
    "✅ Pagariya Super Shop loaded successfully"
);