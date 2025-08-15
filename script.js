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
        // Only handle mouse hover in home experience, not in other sections
        if (this.isHomeSection) {
            // Show navbar when mouse is near the top of the screen
            if (e.clientY < 100) {
                this.nav.classList.add('visible');
            } else if (e.clientY > 150) {
                // Only hide if we're not at the very top of the page
                if (window.scrollY > 50) {
                    this.nav.classList.remove('visible');
                }
            }
        }
    }

    updateNavVisibility() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        
        // Check if we're still in the home experience (home + transition sections)
        // Only show navbar always when we reach other sections (about, projects, resume)
        const transitionEnd = this.transitionSection.offsetTop + this.transitionSection.offsetHeight;
        this.isHomeSection = scrollY < transitionEnd - windowHeight * 0.2;
        
        if (this.isHomeSection) {
            // In home experience: show only at very top or on mouse hover
            if (scrollY < 50) {
                this.nav.classList.add('visible');
            } else {
                this.nav.classList.remove('visible');
            }
            this.nav.classList.remove('always-visible');
        } else {
            // Outside home experience: always show
            this.nav.classList.add('always-visible');
            this.nav.classList.remove('visible');
        }
    }

    updateHomeSection(progress) {
        const backgroundImage = document.querySelector('.background-image');
        const backgroundOverlay = document.querySelector('.background-overlay');
        const homeContent = document.querySelector('.home-content');
        
        // Smoother parallax effect on background
        backgroundImage.style.transform = `translateY(${progress * 20}%) scale(${1 + progress * 0.1})`;
        
        // More gradual overlay fade
        const overlayOpacity = 0.3 + (progress * 0.4);
        backgroundOverlay.style.background = `linear-gradient(180deg, 
            rgba(15, 66, 63, ${overlayOpacity * 0.3}) 0%, 
            rgba(15, 66, 63, ${overlayOpacity * 0.5}) 50%, 
            rgba(15, 66, 63, ${overlayOpacity}) 100%)`;
        
        // Smoother fade out of home content
        const contentOpacity = Math.max(0, 1 - (progress * 1.5));
        homeContent.style.opacity = contentOpacity;
        homeContent.style.transform = `translateY(${progress * -30}px)`;
        
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
        if (this.currentSection === sectionName) return;
        
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
                title: 'Sentinel',
                description: 'Real-time OSINT intelligence platform with autonomous content discovery, hybrid retrieval (vector + knowledge graph), and AI-powered brief generation from 40+ live sources.',
                image: null, // Will show placeholder
                tags: ['ai', 'python', 'osint', 'nlp', 'web'],
                github: 'https://github.com/yourusername/sentinel',
                devpost: null,
                featured: true
            },
            {
                id: 'fairusebot',
                title: 'FairUseBot',
                description: 'A RAG-powered chatbot that provides personalized copyright and fair use guidance with Creative Commons music search for different user roles.',
                image: null,
                tags: ['ai', 'rag', 'web', 'react', 'nlp'],
                github: 'https://github.com/yourusername/fairusebot',
                devpost: 'https://devpost.com/software/fairusebot',
                featured: true
            }
            // Add more projects here as needed
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
        const githubIcon = project.github ? `<a href="${project.github}" target="_blank" rel="noopener" class="project-link" title="GitHub">⚡</a>` : '';
        const devpostIcon = project.devpost ? `<a href="${project.devpost}" target="_blank" rel="noopener" class="project-link" title="Devpost">🏆</a>` : '';
        
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
        const cards = document.querySelectorAll('.project-card');
        
        cards.forEach((card, index) => {
            const cardTags = card.dataset.tags.split(' ');
            const shouldShow = filter === 'all' || cardTags.includes(filter);
            
            // Add stagger delay for animation
            setTimeout(() => {
                if (shouldShow) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            }, index * 50);
        });
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
    new MouseFollowTitle();
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