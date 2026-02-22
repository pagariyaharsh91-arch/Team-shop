document.addEventListener('DOMContentLoaded', () => {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const productNameElement = card.querySelector('.product-name');
        
        if (productNameElement) {
            const productName = productNameElement.textContent.trim();
            
            // Convert to image naming convention: lowercase + underscores
            const imageName = productName.toLowerCase().replace(/\s+/g, '_') + '.jpg';
            const imagePath = `images/${imageName}`;
            
            // Create image element
            const img = document.createElement('img');
            img.src = imagePath;
            img.alt = productName;
            img.style.borderRadius = '8px';
            img.style.height = '140px';
            img.style.width = '100%';
            img.style.objectFit = 'cover';
            img.style.marginBottom = '8px';
            img.onerror = function() {
                this.src = 'images/default.png';
            };
            
            // Insert at the beginning of product-info
            const productInfo = card.querySelector('.product-info');
            if (productInfo) {
                productInfo.insertBefore(img, productInfo.firstChild);
            }
        }
    });
});
