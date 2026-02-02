// Watercolor Paint Effect
class WatercolorPaint {
    constructor() {
        this.canvas = document.getElementById('watercolorCanvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.watercolorColor = '#0000ff'; 

        this.init();
    }

    init() {
        // Set canvas size to match window
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());

        // Click event for tiger meow
        this.canvas.addEventListener('click', (e) => this.handleClick(e));

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.startDrawing(touch);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.draw(touch);
        });
        this.canvas.addEventListener('touchend', () => this.stopDrawing());
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        this.lastX = (e.clientX || e.pageX) - rect.left;
        this.lastY = (e.clientY || e.pageY) - rect.top;
    }

    stopDrawing() {
        this.isDrawing = false;
    }

    draw(e) {
        if (!this.isDrawing) return;

        const rect = this.canvas.getBoundingClientRect();
        const currentX = (e.clientX || e.pageX) - rect.left;
        const currentY = (e.clientY || e.pageY) - rect.top;

        // Create watercolor effect with multiple layers
        const layers = 10; // Number of overlapping circles for watercolor effect

        for (let i = 0; i < layers; i++) {
            // Random offset for organic watercolor look
            const offsetX = (Math.random() - 0.5) * 20;
            const offsetY = (Math.random() - 0.5) * 20;

            // Varying size and opacity for depth
            const size = 30 + Math.random() * 20;
            const opacity = 0.05 + Math.random() * 0.05;

            // Create gradient for each blob
            const gradient = this.ctx.createRadialGradient(
                currentX + offsetX, currentY + offsetY, 0,
                currentX + offsetX, currentY + offsetY, size
            );

            // Parse the hex color and add alpha
            const r = parseInt(this.watercolorColor.slice(1, 3), 16);
            const g = parseInt(this.watercolorColor.slice(3, 5), 16);
            const b = parseInt(this.watercolorColor.slice(5, 7), 16);

            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${opacity})`);
            gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${opacity * 0.5})`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(
                currentX + offsetX - size,
                currentY + offsetY - size,
                size * 2,
                size * 2
            );
        }

        // Draw connecting stroke for smooth lines
        this.ctx.strokeStyle = `rgb(0,0,255,0.02)`;
        this.ctx.lineWidth = 30;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(currentX, currentY);
        this.ctx.stroke();

        this.lastX = currentX;
        this.lastY = currentY;
    }

    handleClick(e) {
        // Check if click is on tiger image and play meow sound
        const tigerImage = document.querySelector('.tiger-image');
        if (!tigerImage) return;

        const rect = tigerImage.getBoundingClientRect();
        const clickX = e.clientX;
        const clickY = e.clientY;

        // Check if click is within tiger bounds
        if (clickX >= rect.left && clickX <= rect.right &&
            clickY >= rect.top && clickY <= rect.bottom) {
            const meowSound = new Audio('images/meow.mp3');
            meowSound.play().catch(error => {
                console.log('Meow failed:', error);
            });
        }
    }
}

// Mouse following effect for main title
class MouseFollowTitle {
    constructor() {
        this.mainTitle = document.getElementById('mainTitle');
        this.mouseX = 0;
        this.mouseY = 0;
        this.titleX = 0;
        this.titleY = 0;
        this.titleRotation = 0;
        this.targetRotation = 0;
        
        this.init();
    }

    init() {
        document.addEventListener('mousemove', (e) => this.updateMouse(e));
        this.animate();
    }

    updateMouse(e) {
        const rect = this.mainTitle.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        this.mouseX = (e.clientX - centerX) / window.innerWidth;
        this.mouseY = (e.clientY - centerY) / window.innerHeight;
        this.targetRotation = this.mouseX * 10; // Reduced rotation intensity
    }

    animate() {
        // Smooth interpolation
        this.titleX += (this.mouseX * 20 - this.titleX) * 0.1;
        this.titleY += (this.mouseY * 20 - this.titleY) * 0.1;
        this.titleRotation += (this.targetRotation - this.titleRotation) * 0.1;
        
        if (this.mainTitle) {
            this.mainTitle.style.transform = `translate(${this.titleX}px, ${this.titleY}px) rotate(${this.titleRotation}deg)`;
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

// Scroll Effects Manager
class ScrollEffects {
    constructor() {
        this.homeSection = document.getElementById('home');
        this.transitionSection = document.getElementById('transition');
        this.contentReveal = document.querySelector('.content-reveal');
        this.nav = document.querySelector('.nav');
        this.lastScrollY = 0;
        this.isHomeSection = true;
        this.scrollingDown = false;

        this.init();
    }

    init() {
        window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));

        // Initial check
        this.handleScroll();
        if (this.nav) {
            this.updateNavVisibility();
        }
    }

    handleScroll() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;

        // Detect scroll direction
        this.scrollingDown = scrollY > this.lastScrollY;

        // Home section background parallax - extended range for smoother transition
        if (this.homeSection && scrollY < windowHeight * 1.2) {
            const progress = scrollY / (windowHeight * 1.2);
            this.updateHomeSection(progress);
        }

        // Transition section content reveal
        if (this.transitionSection && this.contentReveal) {
            const transitionTop = this.transitionSection.offsetTop;
            const transitionProgress = Math.max(0, Math.min(1, (scrollY - transitionTop + windowHeight * 0.8) / windowHeight));

            if (transitionProgress > 0.2 && !this.contentReveal.classList.contains('visible')) {
                this.contentReveal.classList.add('visible');
            }
        }

        // Update navbar visibility
        if (this.nav) {
            this.updateNavVisibility();
        }

        this.lastScrollY = scrollY;
    }

    handleMouseMove(e) {
        // Show navbar when mouse is near the top of the screen
        if (this.nav && e.clientY < 100) {
            this.nav.classList.remove('hidden');
        }
    }

    updateNavVisibility() {
        if (!this.nav) return;

        const scrollY = window.scrollY;
        const onChatPage = document.querySelector('.chat-section.active');

        // On chat page: hide nav when scrolling down (except at very top)
        if (onChatPage) {
            if (this.scrollingDown && scrollY > 50) {
                this.nav.classList.add('hidden');
            }
            // Show when scrolling up or at top
            else {
                this.nav.classList.remove('hidden');
            }
        }
        // On other pages: use original behavior
        else {
            // Always hide when scrolling down (except at very top)
            if (this.scrollingDown && scrollY > 100) {
                this.nav.classList.add('hidden');
            }
            // Show when scrolling up or at top
            else {
                this.nav.classList.remove('hidden');
            }
        }
    }

    updateHomeSection(progress) {
        if (!this.homeSection) return;

        const backgroundImage = document.querySelector('.background-image');
        const backgroundOverlay = document.querySelector('.background-overlay');
        const homeContent = document.querySelector('.home-content');

        // Only update if old background elements exist
        if (backgroundImage) {
            backgroundImage.style.transform = `translateY(${progress * 20}%) scale(${1 + progress * 0.1})`;
        }

        if (backgroundOverlay) {
            const overlayOpacity = 0.3 + (progress * 0.4);
            backgroundOverlay.style.background = `linear-gradient(180deg,
                rgba(15, 66, 63, ${overlayOpacity * 0.3}) 0%,
                rgba(15, 66, 63, ${overlayOpacity * 0.5}) 50%,
                rgba(15, 66, 63, ${overlayOpacity}) 100%)`;
        }

        // Smoother fade out of home content
        if (homeContent) {
            const contentOpacity = Math.max(0, 1 - (progress * 1.5));
            homeContent.style.opacity = contentOpacity;
            homeContent.style.transform = `translateY(${progress * -30}px)`;
        }

        // Add scrolled class for additional effects
        if (progress > 0.05) {
            this.homeSection.classList.add('scrolled');
        } else {
            this.homeSection.classList.remove('scrolled');
        }
    }

    handleResize() {
        // Recalculate on resize
        this.handleScroll();
    }
}

// Spinner Manager
class SpinnerManager {
    constructor() {
        this.interests = [
            {
                name: 'taylor swift world domination',
                image: 'images/interests/taylor.png'
            },
            {
                name: 'tigers (meow meow meow)',
                image: 'images/interests/tiger.png'
            },
            {
                name: 'theme parks',
                image: 'images/interests/coaster.png'
            },
            {
                name: 'claude (anthropic pls hire me)',
                image: 'images/interests/claude.png'
            },
            {
                name: 'broadway (the reason i want to move to nyc)',
                image: 'images/interests/broadway.png'
            },
            {
                name: 'addiction to twitter',
                image: 'images/interests/twitter.png'
            },
            {
                name: 'fixing punctuation on wikipedia',
                image: 'images/interests/wikipedia.png'
            },
            {
                name: 'reading bad thriller novels and then getting annoyed when they are bad',
                image: 'images/interests/books.png'
            },
            {
                name: 'jorts (the best article of clothing ever invented)',
                image: 'images/interests/jorts.png'
            }
        ];

        this.spinnerItems = document.getElementById('spinnerItems');
        this.randomBtn = document.getElementById('randomBtn');
        this.interestImage = document.getElementById('interestImage');
        this.currentIndex = 0;
        this.isScrolling = false;

        if (this.spinnerItems && this.randomBtn) {
            this.init();
        }
    }

    init() {
        this.renderSpinner();
        this.randomBtn.addEventListener('click', () => this.spinToRandom());
        this.spinnerItems.addEventListener('wheel', (e) => this.handleScroll(e));

        // Make spinner items clickable
        this.spinnerItems.addEventListener('click', (e) => {
            const item = e.target.closest('.spinner-item');
            if (item) {
                const index = parseInt(item.dataset.index);
                const copyIndex = parseInt(item.dataset.copy);
                this.scrollToIndexAndCopy(index, copyIndex);
            }
        });

        // Add drag functionality
        this.addDragFunctionality();

        // Set initial image
        this.updateImage(0);
    }

    addDragFunctionality() {
        let isDragging = false;
        let startY = 0;
        let startScrollY = 0;
        let currentTransform = 0;

        const wrapper = this.spinnerItems.parentElement;

        wrapper.addEventListener('mousedown', (e) => {
            isDragging = true;
            startY = e.clientY;
            const transform = this.spinnerItems.style.transform;
            const match = transform.match(/translateY\((-?\d+\.?\d*)px\)/);
            startScrollY = match ? parseFloat(match[1]) : 0;
            wrapper.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const deltaY = e.clientY - startY;
            currentTransform = startScrollY + deltaY;
            this.spinnerItems.style.transition = 'none';
            this.spinnerItems.style.transform = `translateY(${currentTransform}px)`;
        });

        document.addEventListener('mouseup', () => {
            if (!isDragging) return;
            isDragging = false;
            wrapper.style.cursor = 'grab';

            // Snap to nearest item
            const itemHeight = 100;
            const containerHeight = 500;
            const copies = 5;
            const middleCopy = Math.floor(copies / 2);

            // Calculate which item we're closest to
            const currentOffset = currentTransform;
            const baseOffset = containerHeight / 2 - itemHeight / 2;
            const totalOffset = currentOffset - baseOffset;
            const totalItems = this.interests.length;

            // Find nearest item across all copies
            const nearestTotalIndex = Math.round(-totalOffset / itemHeight);
            const nearestIndex = ((nearestTotalIndex % totalItems) + totalItems) % totalItems;

            this.spinnerItems.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
            this.scrollToIndex(nearestIndex);
        });

        wrapper.style.cursor = 'grab';
    }

    renderSpinner() {
        // Create multiple copies for infinite scroll effect
        const copies = 5;
        let html = '';

        for (let i = 0; i < copies; i++) {
            this.interests.forEach((interest, index) => {
                const actualIndex = index;
                html += `<div class="spinner-item" data-index="${actualIndex}" data-copy="${i}">${interest.name}</div>`;
            });
        }

        this.spinnerItems.innerHTML = html;

        // Start with middle copy centered to create infinite look
        const itemHeight = 100;
        const containerHeight = 500;
        const middleCopy = Math.floor(copies / 2);
        // Center the first item of the middle copy
        const offset = -(middleCopy * this.interests.length * itemHeight) + (containerHeight / 2 - itemHeight / 2);
        this.spinnerItems.style.transform = `translateY(${offset}px)`;
    }

    scrollToIndexAndCopy(index, copyIndex) {
        const itemHeight = 100;
        const containerHeight = 500;
        const totalItems = this.interests.length;
        const copies = 5;
        const middleCopy = Math.floor(copies / 2);

        this.currentIndex = index;

        // Calculate offset for the specific copy that was clicked
        const targetIndex = copyIndex * totalItems + index;
        const offset = containerHeight / 2 - itemHeight / 2 - (targetIndex * itemHeight);

        // Set scrolling flag
        this.isScrolling = true;

        this.spinnerItems.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        this.spinnerItems.style.transform = `translateY(${offset}px)`;

        // After animation, snap back to middle copy if needed
        setTimeout(() => {
            if (copyIndex !== middleCopy) {
                this.spinnerItems.style.transition = 'none';
                const centerOffset = containerHeight / 2 - itemHeight / 2 - (middleCopy * totalItems + index) * itemHeight;
                this.spinnerItems.style.transform = `translateY(${centerOffset}px)`;

                setTimeout(() => {
                    this.spinnerItems.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    this.isScrolling = false;
                }, 50);
            } else {
                this.isScrolling = false;
            }
        }, 500);

        // Update selected state and opacity based on distance
        document.querySelectorAll('.spinner-item').forEach(item => {
            const itemIndex = parseInt(item.dataset.index);
            const distance = Math.abs(itemIndex - index);

            item.classList.remove('selected', 'near-selected', 'far-selected');

            if (distance === 0) {
                item.classList.add('selected');
            } else if (distance === 1) {
                item.classList.add('near-selected');
            } else if (distance === 2) {
                item.classList.add('far-selected');
            }
        });

        this.updateImage(index);
    }

    scrollToIndex(index, animate = true, direction = 0) {
        const itemHeight = 100;
        const containerHeight = 500;
        const totalItems = this.interests.length;
        const copies = 5;
        const middleCopy = Math.floor(copies / 2);

        // Handle wrapping by using different copies
        let targetCopy = middleCopy;

        // If wrapping from last to first (going down)
        if (this.currentIndex === totalItems - 1 && index === 0 && direction > 0) {
            targetCopy = middleCopy + 1;
        }
        // If wrapping from first to last (going up)
        else if (this.currentIndex === 0 && index === totalItems - 1 && direction < 0) {
            targetCopy = middleCopy - 1;
        }

        this.currentIndex = index;

        // Calculate offset using the appropriate copy
        const targetIndex = targetCopy * totalItems + index;
        const offset = containerHeight / 2 - itemHeight / 2 - (targetIndex * itemHeight);

        // Set scrolling flag
        this.isScrolling = true;

        if (!animate) {
            this.spinnerItems.style.transition = 'none';
        } else {
            this.spinnerItems.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        }

        this.spinnerItems.style.transform = `translateY(${offset}px)`;

        if (!animate) {
            setTimeout(() => {
                this.spinnerItems.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
                this.isScrolling = false;
            }, 50);
        } else {
            // After animation, snap back to middle copy if we wrapped
            setTimeout(() => {
                if (targetCopy !== middleCopy) {
                    this.spinnerItems.style.transition = 'none';
                    const centerOffset = containerHeight / 2 - itemHeight / 2 - (middleCopy * totalItems + index) * itemHeight;
                    this.spinnerItems.style.transform = `translateY(${centerOffset}px)`;

                    setTimeout(() => {
                        this.spinnerItems.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
                        this.isScrolling = false;
                    }, 50);
                } else {
                    this.isScrolling = false;
                }
            }, 500);
        }

        // Update selected state and opacity based on distance
        document.querySelectorAll('.spinner-item').forEach(item => {
            const itemIndex = parseInt(item.dataset.index);
            const distance = Math.abs(itemIndex - index);

            item.classList.remove('selected', 'near-selected', 'far-selected');

            if (distance === 0) {
                item.classList.add('selected');
            } else if (distance === 1) {
                item.classList.add('near-selected');
            } else if (distance === 2) {
                item.classList.add('far-selected');
            }
        });

        this.updateImage(index);
    }

    handleScroll(e) {
        e.preventDefault();

        // Prevent scrolling during animation
        if (this.isScrolling) {
            return;
        }

        const delta = e.deltaY > 0 ? 1 : -1;
        let newIndex = this.currentIndex + delta;

        // Wrap around with seamless transition
        if (newIndex < 0) {
            newIndex = this.interests.length - 1;
        } else if (newIndex >= this.interests.length) {
            newIndex = 0;
        }

        this.scrollToIndex(newIndex, true, delta);
    }

    spinToRandom() {
        // Add multiple rotations for effect
        const randomIndex = Math.floor(Math.random() * this.interests.length);
        const extraSpins = 2 + Math.floor(Math.random() * 3);
        const totalIndex = randomIndex + (extraSpins * this.interests.length);

        // Animate through the spins
        const itemHeight = 100;
        const containerHeight = 500;
        const finalOffset = containerHeight / 2 - itemHeight / 2 - (totalIndex * itemHeight);

        this.spinnerItems.style.transition = 'transform 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        this.spinnerItems.style.transform = `translateY(${finalOffset}px)`;

        setTimeout(() => {
            this.scrollToIndex(randomIndex, false);
        }, 2000);
    }

    updateImage(index) {
        const interest = this.interests[index];
        if (this.interestImage && interest) {
            // Simply update the image (no transition needed since it spins continuously)
            this.interestImage.src = interest.image;
            this.interestImage.alt = interest.name;

            // Handle image load errors
            this.interestImage.onerror = () => {
                console.log(`Image not found: ${interest.image}`);
            };
        }
    }
}

// Smooth scroll for internal links
class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        // Handle anchor links
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="#"]')) {
                e.preventDefault();
                const targetId = e.target.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    }
}

// Interactive Button Effects
class ButtonEffects {
    constructor() {
        this.init();
    }

    init() {
        // Add hover effects to buttons
        document.querySelectorAll('.action-btn, .nav-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-3px) scale(1.02)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0) scale(1)';
            });

            btn.addEventListener('mousedown', () => {
                btn.style.transform = 'translateY(-1px) scale(0.98)';
            });

            btn.addEventListener('mouseup', () => {
                btn.style.transform = 'translateY(-3px) scale(1.02)';
            });
        });
    }
}

// Performance optimized scroll handler
class PerformanceManager {
    constructor() {
        this.ticking = false;
        this.init();
    }

    init() {
        // Optimize scroll events
        window.addEventListener('scroll', () => {
            if (!this.ticking) {
                requestAnimationFrame(() => {
                    // Scroll handlers will be called here
                    this.ticking = false;
                });
                this.ticking = true;
            }
        }, { passive: true });
    }
}

// Projects Manager
class ProjectsManager {
    constructor() {
        this.projects = [
            {
                id: 'sentinel',
                title: 'sentinel',
                description: 'osint system that auto-ingests 80+ news feeds and does vector search + entity extraction + knowledge graphs. hybrid bm25/semantic retrieval with raptor hierarchical summarization. exports markdown intelligence briefings with temporal weighting and graph-based relationships.',
                image: 'images/sentinel.png',
                tags: ['python', 'fastapi', 'chromadb', 'spacy', 'networkx', 'scikit',  'web scraping', 'vector search', 'knowledge graphs', 'nlp', 'machine learning', 'ai', 'web'],
                github: 'https://github.com/leahuriarte/sentinel',
                devpost: null,
                featured: true
            },
            {
                id: 'fairusebot',
                title: 'fair use bot',
                description: 'legal chatbot for copyright/fair use help across different user roles. searches creative commons audio via openverse api, auto-generates citations in mla/apa/chicago, gives personalized legal advice with integrated audio playback. winner at bruin ai hackathon 2025.',
                image: 'images/fair use bot.png',
                tags: ['python', 'fastapi', 'javascript', 'uvicorn', 'web', 'ai'],
                github: 'https://github.com/leahuriarte/fairusebot',
                devpost: 'https://devpost.com/software/fairusebot',
                featured: true
            },
            {
                id: 'legalese',
                title: 'legalese explainer',
                description: 'turns legal pdfs into plain english using rag + gemini ai. detects document types, flags risks, extracts key terms. interactive q&a lets you ask about uploaded docs. exports analysis reports.',
                image: 'images/legalese-explainer.png',
                tags: ['javascript', 'node.js', 'express', 'rag', 'nlp', 'web', 'ai'],
                github: 'https://github.com/leahuriarte/legalese-explainer',
                devpost: null,
                featured: true
            },
            {
                id: 'quantum-select',
                title: 'quantum select',
                description: 'quantum rag system using qaoa to optimize snippet selection for max relevance and min redundancy. combines bm25 + semantic embeddings with quantum optimization for diverse content from wikipedia. detects contradictions and visualizes quantum results.',
                image: 'images/quantum select.png',
                tags: ['python', 'quantum computing', 'qaoa', 'rag', 'classiq', 'bm25', 'qubo', 'nltk', 'numpy', 'matplotlib', 'ai'],
                github: 'https://github.com/leahuriarte/quantum-select',
                devpost: null,
                featured: false
            },
            {
                id: 'fair-reads',
                title: 'fair reads',
                description: 'analyzes news articles for sentiment bias using logistic regression + tf-idf. shows you alternative perspectives from different political leanings on the same topic so you can escape echo chambers. third place at hack cupertino 2023.',
                image: 'images/fair reads.png',
                tags: ['python', 'flask', 'machine learning', 'nlp', 'scikit', 'nltk', 'sentiment analysis', 'javascript', 'web scraping', 'web', 'ai'],
                github: 'https://github.com/leahuriarte/fairreads',
                devpost: 'https://devpost.com/software/fair-reads',
                featured: false
            },
            {
                id: 'unhcr-map',
                title: 'UNHCR refugee map',
                description: 'interactive refugee data viz with dual leaflet maps showing host/origin countries color-coded by population density. year selection 2000-2024, demographic breakdowns with age/gender charts, sortable tables. built for unhcr via harvey mudd code for change.',
                image: 'images/refugee-map.png',
                tags: ['react', 'javascript', 'vite', 'leaflet', 'd3', 'express', 'node.js', 'geojson', 'web'],
                github: 'https://github.com/leahuriarte/refugee-map-app',
                devpost: null,
                featured: false
            },
            {
                id: 'shopstory',
                title: 'shop story',
                description: 'react based mini-app of shopify shopping analytics as instagram stories. gemini ai analyzes saved products for aesthetic insights, color palettes, carbon footprint, small business detection. scrapbook ui with animated galleries and social sharing. chosen to deploy on shopify shop app, over 10 million users.',
                image: 'images/shop story.png',
                tags: ['react', 'typescript', 'vite', 'tailwind',  'mobile first',  'data visualization', 'ai'],
                github: 'https://github.com/leahuriarte/shopstory',
                devpost: null,
                featured: false
            },
            {
                id: 'lingolift',
                title: 'lingo lift',
                description: 'ai language tutor with conversational practice at custom difficulty levels. real-time error analysis and feedback, auto-generates vocab quizzes based on your mistakes. personalized assessments for reinforcement. second place at treasure hacks.',
                image: 'images/lingo lift.png',
                tags: ['python', 'flask', 'javascript', 'jquery', 'ai', 'nlp', 'chatbot', 'web'],
                github: 'https://github.com/leahuriarte/lingolift',
                devpost: 'https://devpost.com/software/lingolift',
                featured: false
            },
            {
                id: 'synapse',
                title: 'synapse',
                description: 'tracks knowledge through claude conversations and builds dynamic knowledge graphs. hybrid nlp concept detection, vector alignment via gemini embeddings, canvas lms integration for syllabi. interactive mermaid graphs with mastery tracking and learning gap analysis. made for hackmit 2025.',
                image: 'images/synapse.png',
                tags: ['node.js', 'express', 'sqlite', 'mermaid', 'knowledge-graphs',  'nlp', 'rag', 'web', 'ai'],
                github: 'https://github.com/leahuriarte/synapse',
                devpost: null,
                featured: false
            },
            {
                id: 'skinskan',
                title: 'skin skan',
                description: 'medical ai that classifies skin lesions into 11 categories (8 lesion types + 3 burn severity levels). fine-tuned resnet18 with data augmentation and transfer learning via fastai. first place at sonoma hacks 3.0.',
                image: 'images/skin-skan.png',
                tags: ['python', 'flask', 'fastai', 'machine learning', 'computer vision', 'pytorch', 'deep learning', 'resnet18', 'transfer learning', 'classification', 'web', 'ai'],
                github: 'https://github.com/leahuriarte/skinskan',
                devpost: 'https://devpost.com/software/skin-skan',
                featured: false
            }
        ];
        
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.renderProjects();
        this.setupFilters();
    }

    renderProjects() {
        const grid = document.getElementById('projectsGrid');
        if (!grid) return;

        // Sort projects: featured first, then by order
        const sortedProjects = [...this.projects].sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return 0;
        });

        grid.innerHTML = sortedProjects.map(project => this.createProjectCard(project)).join('');

        // Add click handlers for project tags
        this.setupProjectTagHandlers();
    }

    createProjectCard(project) {
        const githubIcon = project.github ? `<a href="${project.github}" target="_blank" rel="noopener" class="project-link" title="GitHub">github</a>` : '';
        const devpostIcon = project.devpost ? `<a href="${project.devpost}" target="_blank" rel="noopener" class="project-link" title="Devpost">devpost</a>` : '';
        
        const imageContent = project.image 
            ? `<img src="${project.image}" alt="${project.title}">`
            : '🚀';

        const tagsHtml = project.tags.map(tag => 
            `<span class="project-tag" data-tag="${tag}">${tag}</span>`
        ).join('');

        return `
            <div class="project-card ${project.featured ? 'featured' : ''}" data-tags="${project.tags.join('|')}">
                <div class="project-image">
                    ${imageContent}
                </div>
                <div class="project-content">
                    <div class="project-header">
                        <h3 class="project-title">${project.title}</h3>
                        <div class="project-links">
                            ${githubIcon}
                            ${devpostIcon}
                        </div>
                    </div>
                    <p class="project-description">${project.description}</p>
                    <div class="project-tags">
                        ${tagsHtml}
                    </div>
                </div>
            </div>
        `;
    }

    setupFilters() {
        const filterTags = document.querySelectorAll('.filter-tag');
        
        filterTags.forEach(tag => {
            tag.addEventListener('click', () => {
                const filter = tag.dataset.filter;
                this.filterProjects(filter);
                
                // Update active filter
                filterTags.forEach(t => t.classList.remove('active'));
                tag.classList.add('active');
            });
        });
    }

    setupProjectTagHandlers() {
        const projectTags = document.querySelectorAll('.project-tag');
        
        projectTags.forEach(tag => {
            tag.addEventListener('click', (e) => {
                e.stopPropagation();
                const tagName = tag.dataset.tag;
                this.filterProjects(tagName);
                
                // Update filter buttons
                const filterButtons = document.querySelectorAll('.filter-tag');
                filterButtons.forEach(btn => btn.classList.remove('active'));
                const matchingFilter = document.querySelector(`[data-filter="${tagName}"]`);
                if (matchingFilter) {
                    matchingFilter.classList.add('active');
                }
            });
        });
    }

    filterProjects(filter) {
        this.currentFilter = filter;
        const grid = document.getElementById('projectsGrid');
        if (!grid) return;

        // Get all project cards
        const cards = Array.from(document.querySelectorAll('.project-card'));

        // FLIP: First - record current positions
        const firstPositions = cards.map(card => ({
            card,
            rect: card.getBoundingClientRect()
        }));

        // Sort projects: matching ones first, then non-matching at bottom
        const sortedCards = cards.sort((a, b) => {
            const aMatches = filter === 'all' || a.dataset.tags.split('|').includes(filter);
            const bMatches = filter === 'all' || b.dataset.tags.split('|').includes(filter);

            if (aMatches && !bMatches) return -1;
            if (!aMatches && bMatches) return 1;

            // Randomize the order within matching and non-matching groups
            return Math.random() - 0.5;
        });

        // Reorder DOM and update visibility
        sortedCards.forEach((card) => {
            grid.appendChild(card);

            const cardMatches = filter === 'all' || card.dataset.tags.split('|').includes(filter);
            if (cardMatches) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });

        // FLIP: Last - get new positions
        const lastPositions = cards.map(card => ({
            card,
            rect: card.getBoundingClientRect()
        }));

        // FLIP: Invert - calculate differences and animate
        firstPositions.forEach((first, index) => {
            const last = lastPositions.find(l => l.card === first.card);
            if (!last) return;

            const deltaX = first.rect.left - last.rect.left;
            const deltaY = first.rect.top - last.rect.top;

            // Skip animation if no movement
            if (deltaX === 0 && deltaY === 0) return;

            // Invert: apply transform to put card back at original position
            first.card.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            first.card.style.transition = 'none';

            // Force reflow
            first.card.offsetHeight;

            // Play: animate to new position
            first.card.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
            first.card.style.transform = 'translate(0, 0)';
        });

        // Clean up transition styles after animation
        setTimeout(() => {
            cards.forEach(card => {
                card.style.transition = '';
                card.style.transform = '';
            });
        }, 500);
    }

    addProject(project) {
        // Add new project to the beginning (top)
        this.projects.unshift(project);
        this.renderProjects();
    }
}

// Globe Manager for Commander Around the World
class GlobeManager {
    constructor() {
        this.container = document.getElementById('globeContainer');
        if (!this.container || typeof THREE === 'undefined') return;

        // Each location has: name, lat, lng, and photos array with {src, caption}
        this.locations = [
            {
                name: 'mount vesuvius',
                lat: 40.8224,
                lng: 14.4289,
                photos: [
                    { src: 'images/travel/vesuvius.jpeg', caption: 'at the crater' }
                ]
            },
            {
                name: 'herculaneum',
                lat: 40.80617778,
                lng: 14.34797500,
                photos: [
                    { src: 'images/travel/herculaneum.jpeg', caption: 'house of neptune and amphritite in the dining room' }
                ]
            },
            {
                name: 'pompeii',
                lat: 40.7497,
                lng: 14.5053,
                photos: [
                    { src: 'images/travel/pompeii1.jpeg', caption: 'thermopoliumg' },
                    { src: 'images/travel/pompeii2.jpeg', caption: 'large theater' }
                ]
            },
            {
                name: 'st. peter\'s basilica',
                lat: 41.9022,
                lng: 12.4539,
                photos: [
                    { src: 'images/travel/stpeters2.jpeg', caption: 'the loggia of the blessings' },
                    { src: 'images/travel/stpeters1.jpeg', caption: 'inside' }
                ]
            },
            {
                name: 'vatican museums',
                lat: 41.9065,
                lng: 12.4536,
                photos: [
                    { src: 'images/travel/vaticanmuseums.jpeg', caption: 'the school of athens' }
                ]
            },
            {
                name: 'papal audience',
                lat: 41.9022,
                lng: 12.4550,
                photos: [
                    { src: 'images/travel/papal.jpeg', caption: 'waiting for pope leo' },
                    { src: 'images/travel/papal2.jpeg', caption: 'after' },
                ]
            },
            {
                name: 'colosseum',
                lat: 41.8902,
                lng: 12.4922,
                photos: [
                    { src: 'images/travel/colosseum1.png', caption: 'inside (arena floor!)' },
                    { src: 'images/travel/colosseum2.png', caption: 'outside' },
                ]
            },
            {
                name: 'berlin zoo',
                lat: 52.5085,
                lng: 13.3364,
                photos: [
                    { src: 'images/travel/berlinzoo.png', caption: 'pandas!!! commander\'s cousin' }
                ]
            },
            {
                name: 'circle in the square theatre',
                lat: 40.762012,
                lng: -73.985184,
                photos: [
                    { src: 'images/travel/circleinthesquare.png', caption: 'seeing just in time with jonathan groff!' }
                ]
            },
            {
                name: 'gershwin theatre',
                lat: 40.762012,
                lng: -73.985184,
                photos: [
                    { src: 'images/travel/gershwin.jpeg', caption: 'we were changed for good' }
                ]
            },
            {
                name: 'lyceum theatre',
                lat: 40.757702,
                lng: -73.984772,
                photos: [
                    { src: 'images/travel/lyceum.jpeg', caption: 'oh mary! with jane krakowski' }
                ]
            },
            {
                name: 'imperial theatre',
                lat: 40.7590,
                lng: -73.9874,
                photos: [
                    { src: 'images/travel/chess.jpeg', caption: 'seeing chess!' }
                ]
            },
            {
                name: 'walter kerr theatre',
                lat: 40.7590,
                lng: -73.9857,
                photos: [
                    { src: 'images/travel/walterkerr.jpeg', caption: 'seeing chess!' }
                ]
            },
            {
                name: 'greek theatre',
                lat: 37.87421,
                lng: -122.255569,
                photos: [
                    { src: 'images/travel/greektheater.jpeg', caption: 'seeing lucy dacus!' }
                ]
            },
            {
                name: 'main street cupertino',
                lat: 37.3241,
                lng: -122.0105,
                photos: [
                    { src: 'images/travel/greektheater.jpeg', caption: 'seeing lucy dacus!' }
                ]
            }
        ];

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.globe = null;
        this.globeGroup = null; // Group to hold globe and pins together
        this.pins = [];
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.tooltip = null;
        this.hoveredPin = null;
        this.dragDistance = 0;
        this.mouseDownPos = { x: 0, y: 0 };

        this.init();
    }

    init() {
        this.setupScene();
        this.createGlobe();
        this.createPins();
        this.createTooltip();
        this.setupEventListeners();
        this.setupModal();
        this.animate();
    }

    setupScene() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        // Scene
        this.scene = new THREE.Scene();

        // Camera
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        this.camera.position.z = 3;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 3, 5);
        this.scene.add(directionalLight);

        // Add a subtle blue rim light for aesthetic
        const rimLight = new THREE.DirectionalLight(0x1e00ff, 0.3);
        rimLight.position.set(-5, 0, -5);
        this.scene.add(rimLight);
    }

    createGlobe() {
        // Create a group to hold globe, clouds, and pins together
        this.globeGroup = new THREE.Group();
        this.scene.add(this.globeGroup);

        const geometry = new THREE.SphereGeometry(1, 64, 64);

        // Load realistic NASA Earth textures
        const textureLoader = new THREE.TextureLoader();

        // NASA Blue Marble Earth texture
        const earthTexture = textureLoader.load(
            'https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg',
            () => {
                // Texture loaded successfully
                this.renderer.render(this.scene, this.camera);
            }
        );

        // Bump map for terrain elevation
        const bumpTexture = textureLoader.load(
            'https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png'
        );

        // Specular map for water reflections
        const specularTexture = textureLoader.load(
            'https://unpkg.com/three-globe@2.31.1/example/img/earth-water.png'
        );

        const material = new THREE.MeshPhongMaterial({
            map: earthTexture,
            bumpMap: bumpTexture,
            bumpScale: 0.02,
            specularMap: specularTexture,
            specular: new THREE.Color(0x333333),
            shininess: 15
        });

        this.globe = new THREE.Mesh(geometry, material);
        this.globeGroup.add(this.globe);

        // Add clouds layer
        const cloudsGeometry = new THREE.SphereGeometry(1.01, 64, 64);
        const cloudsTexture = textureLoader.load(
            'https://unpkg.com/three-globe@2.31.1/example/img/earth-clouds.png'
        );
        const cloudsMaterial = new THREE.MeshPhongMaterial({
            map: cloudsTexture,
            transparent: true,
            opacity: 0.35,
            depthWrite: false
        });
        this.clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
        this.globeGroup.add(this.clouds);

        // Add atmosphere glow
        const atmosphereGeometry = new THREE.SphereGeometry(1.15, 64, 64);
        const atmosphereMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                    gl_FragColor = vec4(0.118, 0.0, 1.0, 1.0) * intensity;
                }
            `,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.globeGroup.add(atmosphere);

        // Add star field background
        this.createStars();
    }

    createStars() {
        const starsGeometry = new THREE.BufferGeometry();
        const starCount = 2000;
        const positions = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount * 3; i += 3) {
            const radius = 50 + Math.random() * 100;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i + 2] = radius * Math.cos(phi);
        }

        starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const starsMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.5,
            transparent: true,
            opacity: 0.8
        });

        const stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(stars);
    }

    createPins() {
        this.locations.forEach((location, index) => {
            const pin = this.createPin(location, index);
            this.pins.push(pin);
            this.globeGroup.add(pin); // Add to globeGroup so pins rotate with Earth
        });
    }

    createPin(location, index) {
        const group = new THREE.Group();

        // Convert lat/lng to 3D position
        const phi = (90 - location.lat) * (Math.PI / 180);
        const theta = (location.lng + 180) * (Math.PI / 180);
        const radius = 1.02;

        const x = -radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        group.position.set(x, y, z);

        // Pin stem
        const stemGeometry = new THREE.CylinderGeometry(0.008, 0.008, 0.08, 8);
        const stemMaterial = new THREE.MeshBasicMaterial({ color: 0x1e00ff });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = 0.04;
        group.add(stem);

        // Pin head (sphere)
        const headGeometry = new THREE.SphereGeometry(0.025, 16, 16);
        const headMaterial = new THREE.MeshBasicMaterial({ color: 0x1e00ff });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 0.09;
        group.add(head);

        // Add glow effect
        const glowGeometry = new THREE.SphereGeometry(0.035, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x1e00ff,
            transparent: true,
            opacity: 0.3
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = 0.09;
        group.add(glow);

        // Orient pin to point outward from globe center
        group.lookAt(0, 0, 0);
        group.rotateX(Math.PI);

        // Store location data
        group.userData = { location, index };

        return group;
    }

    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'pin-tooltip';
        this.container.appendChild(this.tooltip);
    }

    setupEventListeners() {
        const canvas = this.renderer.domElement;

        // Mouse/touch events for rotation
        canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        canvas.addEventListener('mouseup', () => this.onMouseUp());
        canvas.addEventListener('mouseleave', () => this.onMouseUp());

        // Touch events
        canvas.addEventListener('touchstart', (e) => this.onTouchStart(e));
        canvas.addEventListener('touchmove', (e) => this.onTouchMove(e));
        canvas.addEventListener('touchend', () => this.onMouseUp());

        // Click for pin selection
        canvas.addEventListener('click', (e) => this.onClick(e));

        // Zoom
        canvas.addEventListener('wheel', (e) => this.onWheel(e));

        // Resize
        window.addEventListener('resize', () => this.onResize());
    }

    onMouseDown(e) {
        this.isDragging = true;
        this.dragDistance = 0;
        this.mouseDownPos = { x: e.clientX, y: e.clientY };
        this.previousMousePosition = {
            x: e.clientX,
            y: e.clientY
        };
    }

    onMouseMove(e) {
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        if (this.isDragging) {
            const deltaX = e.clientX - this.previousMousePosition.x;
            const deltaY = e.clientY - this.previousMousePosition.y;

            // Track total drag distance
            this.dragDistance += Math.abs(deltaX) + Math.abs(deltaY);

            // Rotate the entire group (globe + pins together)
            this.globeGroup.rotation.y += deltaX * 0.005;
            this.globeGroup.rotation.x += deltaY * 0.005;

            // Clamp vertical rotation to prevent flipping
            this.globeGroup.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.globeGroup.rotation.x));

            this.previousMousePosition = {
                x: e.clientX,
                y: e.clientY
            };
        }

        // Check for pin hover
        this.checkPinHover(e);
    }

    onMouseUp() {
        this.isDragging = false;
    }

    onTouchStart(e) {
        if (e.touches.length === 1) {
            this.isDragging = true;
            this.previousMousePosition = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        }
    }

    onTouchMove(e) {
        if (this.isDragging && e.touches.length === 1) {
            const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
            const deltaY = e.touches[0].clientY - this.previousMousePosition.y;

            // Rotate the entire group (globe + pins together)
            this.globeGroup.rotation.y += deltaX * 0.005;
            this.globeGroup.rotation.x += deltaY * 0.005;

            // Clamp vertical rotation
            this.globeGroup.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.globeGroup.rotation.x));

            this.previousMousePosition = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        }
    }

    checkPinHover(e) {
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Create array of pin heads for intersection
        const pinHeads = this.pins.map(pin => pin.children[1]); // Head is second child
        const intersects = this.raycaster.intersectObjects(pinHeads, false);

        if (intersects.length > 0) {
            const pin = intersects[0].object.parent;
            if (this.hoveredPin !== pin) {
                this.hoveredPin = pin;
                this.tooltip.textContent = pin.userData.location.name;
                this.tooltip.classList.add('visible');
            }

            // Position tooltip
            const rect = this.container.getBoundingClientRect();
            this.tooltip.style.left = (e.clientX - rect.left + 15) + 'px';
            this.tooltip.style.top = (e.clientY - rect.top - 10) + 'px';

            this.container.style.cursor = 'pointer';
        } else {
            this.hoveredPin = null;
            this.tooltip.classList.remove('visible');
            this.container.style.cursor = 'grab';
        }
    }

    onClick(e) {
        // Only register click if we didn't drag much (threshold of 5 pixels)
        if (this.dragDistance > 5) return;

        const rect = this.container.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        const pinHeads = this.pins.map(pin => pin.children[1]);
        const intersects = this.raycaster.intersectObjects(pinHeads, false);

        if (intersects.length > 0) {
            const pin = intersects[0].object.parent;
            this.openModal(pin.userData.location);
        }
    }

    onWheel(e) {
        e.preventDefault();
        const zoomSpeed = 0.001;
        this.camera.position.z += e.deltaY * zoomSpeed;
        this.camera.position.z = Math.max(1.5, Math.min(5, this.camera.position.z));
    }

    onResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    setupModal() {
        const modal = document.getElementById('photoModal');
        const overlay = document.getElementById('modalOverlay');
        const closeBtn = document.getElementById('modalClose');

        if (overlay) {
            overlay.addEventListener('click', () => this.closeModal());
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });
    }

    openModal(location) {
        const modal = document.getElementById('photoModal');
        const locationEl = document.getElementById('modalLocation');
        const photosEl = document.getElementById('modalPhotos');

        if (!modal || !locationEl || !photosEl) return;

        locationEl.textContent = location.name;

        // Generate photos HTML
        if (location.photos && location.photos.length > 0) {
            photosEl.innerHTML = location.photos.map(photo => `
                <div class="modal-photo-item">
                    <img src="${photo.src}" alt="${photo.caption}" class="modal-photo"
                         onerror="this.style.display='none'; this.nextElementSibling.textContent='photo coming soon...'">
                    <p class="modal-caption">${photo.caption}</p>
                </div>
            `).join('');
        } else {
            photosEl.innerHTML = '<p class="modal-caption">photos coming soon...</p>';
        }

        modal.classList.add('active');
    }

    closeModal() {
        const modal = document.getElementById('photoModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Slow auto-rotation when not dragging
        if (!this.isDragging && this.globeGroup) {
            this.globeGroup.rotation.y += 0.001;
        }

        // Rotate clouds slightly faster than the globe for realism
        if (this.clouds) {
            this.clouds.rotation.y += 0.0002; // Extra rotation on top of group rotation
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    new WatercolorPaint();
    // new MouseFollowTitle(); // Disabled for new layout
    new ScrollEffects();
    new SmoothScroll();
    new ButtonEffects();
    new PerformanceManager();

    // Only initialize managers if their elements exist on the page
    if (document.getElementById('projectsGrid')) {
        new ProjectsManager();
    }
    if (document.getElementById('spinnerItems')) {
        new SpinnerManager();
    }
    if (document.getElementById('globeContainer')) {
        new GlobeManager();
    }
});

// Preload critical resources
window.addEventListener('load', () => {
    // Add any preloading logic here if needed
    console.log('Website fully loaded');
});

// Scroll button functionality
const scrollButton = document.querySelector('.scroll-button');
if (scrollButton) {
    scrollButton.addEventListener('click', () => {
        const transitionSection = document.getElementById('transition');
        if (transitionSection) {
            transitionSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// Error handling
window.addEventListener('error', (e) => {
    console.warn('Script error:', e.error);
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MouseFollowTitle,
        ScrollEffects,
        Navigation,
        SmoothScroll,
        ButtonEffects,
        PerformanceManager
    };
}