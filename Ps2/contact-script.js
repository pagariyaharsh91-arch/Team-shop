// ==================== CONTACT FORM FUNCTIONALITY ====================

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
});

// Handle contact form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();
    
    // Validate required fields
    if (!name || !phone || !message) {
        showFormMessage('Please fill in all required fields', 'error');
        return;
    }
    
    // Validate phone number (basic validation)
    if (!/^\d{10}/.test(phone.replace(/\D/g, ''))) {
        showFormMessage('Please enter a valid phone number', 'error');
        return;
    }
    
    // Store form data (in real app, this would be sent to server)
    const contactData = {
        name,
        phone,
        email,
        subject,
        message,
        timestamp: new Date().toLocaleString()
    };
    
    // Save to localStorage for demonstration
    let contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
    contacts.push(contactData);
    localStorage.setItem('contacts', JSON.stringify(contacts));
    
    // Show success message
    showFormMessage('Thank you! We\'ll get back to you soon.', 'success');
    
    // Reset form
    document.getElementById('contactForm').reset();
    
    // Hide message after 4 seconds
    setTimeout(() => {
        const messageEl = document.getElementById('formMessage');
        messageEl.style.display = 'none';
    }, 4000);
}

// Show form message
function showFormMessage(message, type) {
    const messageEl = document.getElementById('formMessage');
    messageEl.textContent = message;
    messageEl.className = `form-message ${type}`;
    messageEl.style.display = 'block';
    messageEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
