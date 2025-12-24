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
        this.updateNavVisibility();
    }

    handleScroll() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;

        // Detect scroll direction
        this.scrollingDown = scrollY > this.lastScrollY;

        // Home section background parallax - extended range for smoother transition
        if (scrollY < windowHeight * 1.2) {
            const progress = scrollY / (windowHeight * 1.2);
            this.updateHomeSection(progress);
        }

        // Transition section content reveal
        const transitionTop = this.transitionSection.offsetTop;
        const transitionProgress = Math.max(0, Math.min(1, (scrollY - transitionTop + windowHeight * 0.8) / windowHeight));

        if (transitionProgress > 0.2 && !this.contentReveal.classList.contains('visible')) {
            this.contentReveal.classList.add('visible');
        }

        // Update navbar visibility
        this.updateNavVisibility();

        this.lastScrollY = scrollY;
    }

    handleMouseMove(e) {
        // Show navbar when mouse is near the top of the screen
        if (e.clientY < 100) {
            this.nav.classList.add('visible');
        }
    }

    updateNavVisibility() {
        const scrollY = window.scrollY;

        // Always hide when scrolling down (except at very top)
        if (this.scrollingDown && scrollY > 100) {
            this.nav.classList.remove('visible');
            this.nav.classList.remove('always-visible');
        }
        // Show when scrolling up
        else if (!this.scrollingDown && scrollY > 100) {
            this.nav.classList.add('visible');
        }
        // Always show at very top of page
        else if (scrollY < 100) {
            this.nav.classList.add('visible');
        }
    }

    updateHomeSection(progress) {
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

// Navigation Manager
class Navigation {
    constructor() {
        this.navBtns = document.querySelectorAll('.nav-btn');
        this.actionBtns = document.querySelectorAll('.action-btn[data-section]');
        this.sections = {
            home: [document.getElementById('home'), document.getElementById('transition')],
            about: [document.getElementById('about')],
            projects: [document.getElementById('projects')],
            resume: [document.getElementById('resume')]
        };
        
        this.currentSection = 'home';
        this.init();
    }

    init() {
        // Add click handlers to nav buttons
        this.navBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSection(btn.dataset.section);
            });
        });

        // Add click handlers to action buttons
        this.actionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSection(btn.dataset.section);
            });
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            const section = e.state?.section || 'home';
            this.showSection(section, false);
        });
    }

    showSection(sectionName, pushState = true) {
        // Hide all sections
        Object.values(this.sections).flat().forEach(section => {
            if (section) {
                section.style.display = 'none';
                section.classList.remove('active');
            }
        });

        // Show requested sections
        if (this.sections[sectionName]) {
            this.sections[sectionName].forEach(section => {
                if (section) {
                    section.style.display = sectionName === 'home' ? 'flex' : 'block';
                    section.classList.add('active');
                }
            });
        }

        // Update nav buttons
        this.navBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.section === sectionName);
        });

        // Scroll to top of new section
        if (sectionName !== 'home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // For home, scroll to the actual home section
            document.getElementById('home').scrollIntoView({ behavior: 'smooth' });
        }

        // Update browser history
        if (pushState) {
            const url = sectionName === 'home' ? '/' : `#${sectionName}`;
            history.pushState({ section: sectionName }, '', url);
        }

        this.currentSection = sectionName;
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
            <div class="project-card ${project.featured ? 'featured' : ''}" data-tags="${project.tags.join(' ')}">
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
            const aMatches = filter === 'all' || a.dataset.tags.split(' ').includes(filter);
            const bMatches = filter === 'all' || b.dataset.tags.split(' ').includes(filter);

            if (aMatches && !bMatches) return -1;
            if (!aMatches && bMatches) return 1;
            return 0;
        });

        // Reorder DOM and update visibility
        sortedCards.forEach((card) => {
            grid.appendChild(card);

            const cardMatches = filter === 'all' || card.dataset.tags.split(' ').includes(filter);
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

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    new WatercolorPaint();
    // new MouseFollowTitle(); // Disabled for new layout
    new ScrollEffects();
    new Navigation();
    new SmoothScroll();
    new ButtonEffects();
    new PerformanceManager();
    new ProjectsManager();

    // Handle initial URL
    const currentHash = window.location.hash.substring(1);
    if (currentHash && ['about', 'projects', 'resume'].includes(currentHash)) {
        // Small delay to ensure everything is initialized
        setTimeout(() => {
            const nav = new Navigation();
            nav.showSection(currentHash, false);
        }, 100);
    }
});

// Preload critical resources
window.addEventListener('load', () => {
    // Add any preloading logic here if needed
    console.log('Website fully loaded');
});

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