// Initialize Swiper
const initSwiper = () => {
    new Swiper('.swiper', {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        centeredSlides: true,
        autoplay: {
            delay: 3500,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            640: {
                slidesPerView: 2,
            },
            1024: {
                slidesPerView: 3,
            },
        },
    });
};

// Pinterest Feed Integration
const loadPinterestFeed = async () => {
    const pinterestFeed = document.getElementById('pinterest-feed');
    if (!pinterestFeed) {
        console.error('Pinterest feed element not found');
        return;
    }
    
    // Show loading state
    pinterestFeed.innerHTML = `
        <div class="swiper-slide loading-slide">
            <div class="loading-spinner"></div>
            <p class="loading-text">Loading Pinterest feed...</p>
        </div>
    `;

    try {
        console.log('Fetching Pinterest feed...');
        const response = await fetch('/.netlify/functions/pinterest', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin'
        });
        
        console.log('Pinterest API response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Pinterest API response:', data);
        
        if (!data.success || !data.pins?.length) {
            console.error('No pins available:', data.error || 'Unknown error');
            throw new Error(data.error || 'No pins available');
        }

        // Clear loading state
        pinterestFeed.innerHTML = '';
        
        // Add pins to the carousel
        data.pins.forEach(pin => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            
            // Create the HTML string with proper escaping
            const title = pin.title ? escapeHtml(pin.title) : 'View on Pinterest';
            const description = pin.description ? escapeHtml(pin.description) : '';
            const imageAlt = pin.title ? escapeHtml(pin.title) : 'Pinterest Pin';
            
            slide.innerHTML = `
                <a href="${escapeHtml(pin.link)}" target="_blank" rel="noopener noreferrer" class="pin-link">
                    <div class="pin-image-container">
                        <img src="${escapeHtml(pin.imageUrl)}" 
                             alt="${imageAlt}" 
                             loading="lazy"
                             onerror="this.onerror=null; this.src='https://via.placeholder.com/600x400/1a1a1a/00f5d4?text=Image+Not+Available';">
                        <div class="pin-overlay">
                            <h3>${title}</h3>
                            ${description ? `<p>${description}</p>` : ''}
                        </div>
                    </div>
                </a>
            `;
            pinterestFeed.appendChild(slide);
        });

        console.log('Initializing Swiper...');
        if (typeof Swiper !== 'undefined') {
            initSwiper();
            console.log('Swiper initialized successfully');
        } else {
            console.error('Swiper is not defined');
            throw new Error('Swiper library not loaded');
        }
    } catch (error) {
        console.error('Error loading Pinterest feed:', error);
        loadPlaceholderContent();
    }
};

// Helper function to escape HTML and prevent XSS
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Load placeholder content if Pinterest feed fails
const loadPlaceholderContent = () => {
    const pinterestFeed = document.getElementById('pinterest-feed');
    pinterestFeed.innerHTML = ''; // Clear any existing content
    
    const placeholderImages = [
        { title: 'Graphic Design', image: 'https://via.placeholder.com/600x400/1a1a1a/00f5d4?text=Graphic+Design' },
        { title: 'Brand Design', image: 'https://via.placeholder.com/600x400/1a1a1a/00f5d4?text=Brand+Design' },
        { title: 'UI/UX Design', image: 'https://via.placeholder.com/600x400/1a1a1a/00f5d4?text=UI/UX+Design' },
    ];

    placeholderImages.forEach(item => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        slide.innerHTML = `
            <div class="pin-image-container">
                <img src="${item.image}" alt="${item.title}" loading="lazy">
                <div class="pin-overlay">
                    <h3>${item.title}</h3>
                </div>
            </div>
        `;
        pinterestFeed.appendChild(slide);
    });

    initSwiper();
};

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Contact form handling
const contactForm = document.getElementById('contact-form');
const submitButton = contactForm.querySelector('button[type="submit"]');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Disable submit button and show loading state
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value
    };

    try {
        const response = await fetch('/.netlify/functions/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            // Show success message
            showNotification('Message sent successfully! Check your email for confirmation.', 'success');
            contactForm.reset();
        } else {
            showNotification('Failed to send message. Please try again.', 'error');
        }
    } catch (error) {
        showNotification('Failed to send message. Please try again.', 'error');
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = 'Send Message';
    }
});

// Notification system
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Fade in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Theme toggle functionality
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const icon = themeToggle.querySelector('i');
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
    });
}

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all sections and elements that should animate
document.querySelectorAll('section, .skill-category, .tool').forEach(el => {
    observer.observe(el);
});

// Initialize Pinterest feed when the page loads
document.addEventListener('DOMContentLoaded', loadPinterestFeed);
