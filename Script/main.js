// Main script for homepage dynamic content
const API_BASE = window.location.origin + '/api';

// Content management
class ContentManager {
    constructor() {
        this.currentLanguage = 'en';
        this.content = {
            hero: [],
            slideshow: []
        };
    }

    // Fetch content from API
    async fetchContent(section = null, language = 'en') {
        try {
            const params = new URLSearchParams({
                language: language,
                ...(section && { section })
            });
            
            const response = await fetch(`${API_BASE}/content?${params}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching content:', error);
            return [];
        }
    }

    // Load and render hero content
    async loadHeroContent(language = 'en') {
        try {
            const heroContent = await this.fetchContent('hero', language);
            this.renderHeroContent(heroContent, language);
        } catch (error) {
            console.error('Error loading hero content:', error);
        }
    }

    // Render hero section
    renderHeroContent(content, language) {
        const isArabic = language === 'ar';
        const heroSection = document.getElementById(isArabic ? 'hero-section-arabic' : 'hero-section');
        
        if (!heroSection || content.length === 0) return;

        // Find the main hero content (usually order 0 or first item)
        const mainHero = content.find(item => item.order === 0) || content[0];
        
        if (mainHero) {
            const titleElement = document.getElementById(isArabic ? 'hero-title-arabic' : 'hero-title');
            const subtitleElement = document.getElementById(isArabic ? 'hero-subtitle-arabic' : 'hero-subtitle');
            
            if (titleElement) titleElement.textContent = mainHero.title;
            if (subtitleElement) subtitleElement.textContent = mainHero.body;
        }
    }

    // Load and render slideshow content
    async loadSlideshowContent(language = 'en') {
        try {
            const slideshowContent = await this.fetchContent('slideshow', language);
            this.renderSlideshowContent(slideshowContent, language);
        } catch (error) {
            console.error('Error loading slideshow content:', error);
        }
    }

    // Render slideshow
    renderSlideshowContent(content, language) {
        const isArabic = language === 'ar';
        const slideshowContainer = document.getElementById(isArabic ? 'slideshow-content-arabic' : 'slideshow-content');
        const indicatorsContainer = document.getElementById(isArabic ? 'slideshow-indicators-arabic' : 'slideshow-indicators');
        
        if (!slideshowContainer || content.length === 0) return;

        // Sort content by order
        const sortedContent = content.sort((a, b) => a.order - b.order);

        // Generate slideshow HTML
        const slidesHTML = sortedContent.map((item, index) => {
            const activeClass = index === 0 ? 'active' : '';
            const linkHTML = item.metadata?.link ? 
                `<a href="${item.metadata.link}" target="_blank">` : 
                '<div>';
            const closeLinkHTML = item.metadata?.link ? '</a>' : '</div>';
            
            return `
                <div class="carousel-item ${activeClass}">
                    ${linkHTML}
                        <img src="${item.imageUrl || 'https://placehold.co/1200x800'}" 
                             class="d-block w-100" 
                             alt="${this.escapeHtml(item.title)}">
                    ${closeLinkHTML}
                    <div class="carousel-caption d-none d-md-block">
                        <h5>${this.escapeHtml(item.title)}</h5>
                        ${item.body ? `<p>${this.escapeHtml(item.body)}</p>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        // Generate indicators HTML
        const indicatorsHTML = sortedContent.map((_, index) => {
            const activeClass = index === 0 ? 'active' : '';
            const ariaCurrent = index === 0 ? 'aria-current="true"' : '';
            const target = isArabic ? '#slideshow-arabic' : '#slideshow';
            
            return `
                <button type="button" 
                        data-bs-target="${target}" 
                        data-bs-slide-to="${index}" 
                        class="${activeClass}" 
                        ${ariaCurrent}
                        title="Slide ${index + 1}">
                </button>
            `;
        }).join('');

        // Update DOM
        slideshowContainer.innerHTML = slidesHTML;
        if (indicatorsContainer) {
            indicatorsContainer.innerHTML = indicatorsHTML;
        }

        // Reinitialize Bootstrap carousel if needed
        this.reinitializeCarousel(isArabic);
    }

    // Reinitialize Bootstrap carousel
    reinitializeCarousel(isArabic) {
        const carouselId = isArabic ? '#slideshow-arabic' : '#slideshow';
        const carouselElement = document.querySelector(carouselId);
        
        if (carouselElement && window.bootstrap) {
            // Dispose existing carousel instance
            const existingCarousel = bootstrap.Carousel.getInstance(carouselElement);
            if (existingCarousel) {
                existingCarousel.dispose();
            }
            
            // Create new carousel instance
            new bootstrap.Carousel(carouselElement, {
                interval: 5000,
                wrap: true
            });
        }
    }

    // Load all content for current language
    async loadAllContent(language = 'en') {
        this.currentLanguage = language;
        await Promise.all([
            this.loadHeroContent(language),
            this.loadSlideshowContent(language)
        ]);
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize content manager
const contentManager = new ContentManager();

// Language switching functionality
function switchLanguage(language) {
    contentManager.loadAllContent(language);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Load initial content
    contentManager.loadAllContent('en');
    
    // Setup language switching
    document.querySelectorAll('[id^="switch-to-arabic"]').forEach(element => {
        element.addEventListener('click', function(e) {
            e.preventDefault();
            switchLanguage('ar');
        });
    });

    document.querySelectorAll('[id^="switch-to-english"]').forEach(element => {
        element.addEventListener('click', function(e) {
            e.preventDefault();
            switchLanguage('en');
        });
    });
});

// Legacy functions for compatibility
const currentSection = document.getElementById("current-section");
const menuToggle = document.getElementById("menu-toggle");
const menu = document.getElementById("menu");

if (menuToggle && menu) {
    menuToggle.addEventListener("click", () => {
        menu.style.display = menu.style.display === "block" ? "none" : "block";
    });
}

function changeSection(section) {
    if (currentSection) {
        currentSection.textContent = section;
    }
    if (menu) {
        menu.style.display = "none";
    }
}

// Toggle FAQ answers visibility when clicked
document.querySelectorAll('.faq-question').forEach((question) => {
    question.addEventListener('click', () => {
        const faqItem = question.closest('.faq-item');
        if (faqItem) {
            faqItem.classList.toggle('active');
        }
    });
});