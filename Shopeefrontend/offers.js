/* ================= OFFERS DATA ================= */
const offersData = [
    {
        id: 1,
        yearlyPurchase: 1300,
        discount: 1000,
        description: "Perfect for regular customers",
        rewardPercentage: 76.9 // (1000 / 1300) * 100
    },
    {
        id: 2,
        yearlyPurchase: 2500,
        discount: 2000,
        description: "Great savings for loyal customers",
        rewardPercentage: 80 // (2000 / 2500) * 100
    },
    {
        id: 3,
        yearlyPurchase: 5000,
        discount: 5000,
        description: "Best value for premium members",
        rewardPercentage: 100 // (5000 / 5000) * 100
    }
];

/* ================= RENDER OFFERS ================= */
function renderOffers() {
    const offersGrid = document.getElementById('offersGrid');
    if (!offersGrid) return;

    offersGrid.innerHTML = '';

    offersData.forEach(offer => {
        const offerCard = document.createElement('div');
        offerCard.className = 'offer-card';
        
        offerCard.innerHTML = `
            <div class="offer-card-header">
                <div class="offer-badge">${offer.rewardPercentage.toFixed(0)}%</div>
                <button class="offer-info-btn" title="How it works">
                    <i class="fas fa-info-circle"></i>
                </button>
            </div>
            
            <div class="offer-card-body">
                <div class="offer-yearly">
                    <span class="offer-label">Yearly Purchase</span>
                    <span class="offer-amount">₹${offer.yearlyPurchase.toLocaleString('en-IN')}</span>
                </div>
                
                <div class="offer-divider"></div>
                
                <div class="offer-discount">
                    <span class="offer-label">Next Month Discount</span>
                    <span class="offer-discount-amount">₹${offer.discount.toLocaleString('en-IN')}</span>
                </div>
                
                <p class="offer-description">${offer.description}</p>
            </div>
            
            <div class="offer-cta">
                <button class="offer-btn">Start Shopping</button>
            </div>
        `;

        offersGrid.appendChild(offerCard);

        // Attach info button listener
        const infoBtn = offerCard.querySelector('.offer-info-btn');
        infoBtn.addEventListener('click', () => {
            showOfferPopup(offer);
        });

        // Attach CTA button listener
        const ctaBtn = offerCard.querySelector('.offer-btn');
        ctaBtn.addEventListener('click', () => {
            // Scroll to products section
            const productsSection = document.querySelector('.products-section');
            if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

/* ================= OFFER POPUP ================= */
function showOfferPopup(offer) {
    // Check if popup already exists
    let popup = document.getElementById('offerPopup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'offerPopup';
        popup.className = 'offer-popup-overlay';
        document.body.appendChild(popup);
    }

    const popupContent = `
        <div class="offer-popup">
            <button class="popup-close">
                <i class="fas fa-times"></i>
            </button>
            
            <div class="popup-header">
                <h3>How This Offer Works</h3>
            </div>
            
            <div class="popup-body">
                <div class="popup-step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <h4>Shop & Accumulate</h4>
                        <p>Make purchases throughout the year reaching ₹${offer.yearlyPurchase.toLocaleString('en-IN')} or more</p>
                    </div>
                </div>
                
                <div class="popup-step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <h4>Automatic Qualification</h4>
                        <p>Once you reach the yearly target, you automatically qualify for this tier</p>
                    </div>
                </div>
                
                <div class="popup-step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <h4>Enjoy Discount</h4>
                        <p>Get ₹${offer.discount.toLocaleString('en-IN')} discount on your purchases next month</p>
                    </div>
                </div>
                
                <div class="popup-benefits">
                    <h4>Benefits Summary</h4>
                    <ul>
                        <li>Yearly Purchase Target: ₹${offer.yearlyPurchase.toLocaleString('en-IN')}</li>
                        <li>Monthly Discount: ₹${offer.discount.toLocaleString('en-IN')}</li>
                        <li>Reward Percentage: ${offer.rewardPercentage.toFixed(1)}%</li>
                        <li>Valid for next calendar month</li>
                    </ul>
                </div>
            </div>
            
            <div class="popup-footer">
                <button class="popup-action-btn">Got it!</button>
            </div>
        </div>
    `;

    popup.innerHTML = popupContent;
    popup.style.display = 'flex';

    // Close button handlers
    const closeBtn = popup.querySelector('.popup-close');
    const actionBtn = popup.querySelector('.popup-action-btn');
    
    closeBtn.addEventListener('click', () => {
        popup.style.display = 'none';
    });
    
    actionBtn.addEventListener('click', () => {
        popup.style.display = 'none';
    });

    // Close on background click
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            popup.style.display = 'none';
        }
    });
}

/* ================= INIT ================= */
document.addEventListener('DOMContentLoaded', () => {
    renderOffers();
    console.log('✅ Offers section loaded');
});
