/**
 * Reusable Carousel Component
 * Usage: Create a carousel with the HTML structure and call new Carousel(containerSelector, options)
 */

class Carousel {
    constructor(containerSelector, options = {}) {
        this.container = document.querySelector(containerSelector);
        
        if (!this.container) {
            console.error(`Carousel container not found: ${containerSelector}`);
            return;
        }
        
        // Default options
        this.options = {
            autoAdvance: true,
            autoAdvanceTime: 6000,
            enableKeyboard: true,
            enableTouch: true,
            loop: true,
            startSlide: 0,
            ...options
        };
        
        this.currentSlideIndex = this.options.startSlide;
        this.slides = this.container.querySelectorAll('.carousel-slide');
        this.indicators = this.container.querySelectorAll('.indicator');
        this.totalSlides = this.slides.length;
        this.autoAdvanceInterval = null;
        this.touchStartX = 0;
        this.touchEndX = 0;
        
        if (this.totalSlides === 0) {
            console.error('No carousel slides found');
            return;
        }
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.showSlide(this.currentSlideIndex);
        
        if (this.options.autoAdvance) {
            this.startAutoAdvance();
        }
        
        if (this.options.enableTouch) {
            this.setupTouchEvents();
        }
    }
    
    setupEventListeners() {
        // Navigation buttons
        const prevBtn = this.container.querySelector('.carousel-btn-prev');
        const nextBtn = this.container.querySelector('.carousel-btn-next');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.changeSlide(-1));
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.changeSlide(1));
        }
        
        // Indicators
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Keyboard navigation
        if (this.options.enableKeyboard) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') {
                    this.changeSlide(-1);
                } else if (e.key === 'ArrowRight') {
                    this.changeSlide(1);
                }
            });
        }
        
        // Pause auto-advance on hover
        this.container.addEventListener('mouseenter', () => this.stopAutoAdvance());
        this.container.addEventListener('mouseleave', () => {
            if (this.options.autoAdvance) {
                this.startAutoAdvance();
            }
        });
    }
    
    setupTouchEvents() {
        this.container.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        });
        
        this.container.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });
    }
    
    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.changeSlide(1); // Swipe left - next slide
            } else {
                this.changeSlide(-1); // Swipe right - previous slide
            }
        }
    }
    
    showSlide(index) {
        // Hide all slides and remove active from indicators
        this.slides.forEach(slide => slide.classList.remove('active'));
        this.indicators.forEach(indicator => indicator.classList.remove('active'));
        
        // Show current slide and activate indicator
        if (this.slides[index]) {
            this.slides[index].classList.add('active');
        }
        
        if (this.indicators[index]) {
            this.indicators[index].classList.add('active');
        }
    }
    
    changeSlide(direction) {
        this.currentSlideIndex += direction;
        
        if (this.options.loop) {
            // Loop around
            if (this.currentSlideIndex >= this.totalSlides) {
                this.currentSlideIndex = 0;
            } else if (this.currentSlideIndex < 0) {
                this.currentSlideIndex = this.totalSlides - 1;
            }
        } else {
            // Clamp to bounds
            this.currentSlideIndex = Math.max(0, Math.min(this.currentSlideIndex, this.totalSlides - 1));
        }
        
        this.showSlide(this.currentSlideIndex);
        
        // Reset auto-advance timer
        if (this.options.autoAdvance) {
            this.stopAutoAdvance();
            this.startAutoAdvance();
        }
    }
    
    goToSlide(index) {
        if (index >= 0 && index < this.totalSlides) {
            this.currentSlideIndex = index;
            this.showSlide(this.currentSlideIndex);
            
            // Reset auto-advance timer
            if (this.options.autoAdvance) {
                this.stopAutoAdvance();
                this.startAutoAdvance();
            }
        }
    }
    
    startAutoAdvance() {
        this.stopAutoAdvance();
        this.autoAdvanceInterval = setInterval(() => {
            this.changeSlide(1);
        }, this.options.autoAdvanceTime);
    }
    
    stopAutoAdvance() {
        if (this.autoAdvanceInterval) {
            clearInterval(this.autoAdvanceInterval);
            this.autoAdvanceInterval = null;
        }
    }
    
    // Public API methods
    next() {
        this.changeSlide(1);
    }
    
    prev() {
        this.changeSlide(-1);
    }
    
    goTo(index) {
        this.goToSlide(index);
    }
    
    destroy() {
        this.stopAutoAdvance();
        // Remove event listeners would go here if needed
    }
}

// Legacy function support for existing onclick handlers
let globalCarousels = new Map();

function changeSlide(direction, carouselId = 'default') {
    const carousel = globalCarousels.get(carouselId);
    if (carousel) {
        carousel.changeSlide(direction);
    }
}

function currentSlide(index, carouselId = 'default') {
    const carousel = globalCarousels.get(carouselId);
    if (carousel) {
        carousel.goToSlide(index - 1); // Convert from 1-based to 0-based index
    }
}

// Auto-initialize carousels on page load
document.addEventListener('DOMContentLoaded', function() {
    // Look for carousel containers and initialize them automatically
    const carouselContainers = document.querySelectorAll('.carousel-container[data-carousel]');
    
    carouselContainers.forEach(container => {
        const carouselId = container.dataset.carousel || 'default';
        const options = {};
        
        // Parse data attributes for options
        if (container.dataset.autoAdvance) {
            options.autoAdvance = container.dataset.autoAdvance === 'true';
        }
        if (container.dataset.autoAdvanceTime) {
            options.autoAdvanceTime = parseInt(container.dataset.autoAdvanceTime);
        }
        if (container.dataset.loop) {
            options.loop = container.dataset.loop === 'true';
        }
        if (container.dataset.startSlide) {
            options.startSlide = parseInt(container.dataset.startSlide);
        }
        
        const carousel = new Carousel(`[data-carousel="${carouselId}"]`, options);
        globalCarousels.set(carouselId, carousel);
    });
    
    // For backwards compatibility, initialize a default carousel if one exists without data-carousel
    const defaultCarousel = document.querySelector('.carousel-container:not([data-carousel])');
    if (defaultCarousel) {
        const carousel = new Carousel('.carousel-container:not([data-carousel])');
        globalCarousels.set('default', carousel);
    }
});