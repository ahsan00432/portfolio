/**
 * Ahsan's Upgraded Premium Portfolio Logic
 * Features: Canvas Particles, Typewriter Effect, Intersection Revelations, Form Handler, Mobile Toggle
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. INTERACTIVE CANVAS PARTICLE MATRIX
       ========================================================================== */
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Inject canvas into the page structure dynamically
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1'; // Place behind HTML elements
    canvas.style.pointerEvents = 'none'; // Don't block button clicks
    document.body.appendChild(canvas);

    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme === 'light') document.body.classList.add('light-theme');
    if (themeToggle) {
        const updateThemeLabel = () => {
            const isLight = document.body.classList.contains('light-theme');
            themeToggle.textContent = isLight ? '☾' : '☼';
            themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
        };
        updateThemeLabel();
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            localStorage.setItem('portfolio-theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
            updateThemeLabel();
        });
    }

    let particles = [];
    const mouse = { x: null, y: null, radius: 150 };

    // Track mouse coordinates across the dark layout
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // Reset mouse when it leaves the browser window
    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Keep canvas perfectly responsive
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    }
    window.addEventListener('resize', resizeCanvas);

    // Particle Object Template Structure
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.6; // Gentle X movement speed
            this.vy = (Math.random() - 0.5) * 0.6; // Gentle Y movement speed
            this.radius = Math.random() * 2 + 1;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce smoothly off boundaries
            if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

            // Interactive mouse magnetism push
            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    // Soft repelling push away from mouse cursor
                    let force = (mouse.radius - distance) / mouse.radius;
                    this.x -= (dx / distance) * force * 2;
                    this.y -= (dy / distance) * force * 2;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(16, 185, 129, 0.4)'; // Transparent Emerald Glow
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        // Calculate density dynamically based on screen resolution
        const quantity = Math.floor((canvas.width * canvas.height) / 9000);
        for (let i = 0; i < Math.min(quantity, 120); i++) {
            particles.push(new Particle());
        }
    }

    // Connect close points with glowing interactive web lines
    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                let dx = particles[i].x - particles[j].x;
                let dy = particles[i].y - particles[j].y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 110) {
                    // Line opacity fades out the further apart the particles get
                    let alpha = ((110 - distance) / 110) * 0.15;
                    ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    // Persistent Loop Animation Execution Engine
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        drawConnections();
        requestAnimationFrame(animate);
    }

    // Trigger Canvas Engine Initializer
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
    animate();


    /* ==========================================================================
       2. TYPEWRITER EFFECT (Hero Text Rendering)
       ========================================================================== */
    const heroPara = document.querySelector('.hero p');
    if (heroPara) {
        const originalText = heroPara.textContent;
        heroPara.textContent = '';
        
        let index = 0;
        function typeWriter() {
            if (index < originalText.length) {
                heroPara.textContent += originalText.charAt(index);
                index++;
                setTimeout(typeWriter, 50);
            }
        }
        setTimeout(typeWriter, 600);
    }


    /* ==========================================================================
       3. INTERSECTION SCROLL-REVEAL OBSERVER
       ========================================================================== */
    const revealElements = document.querySelectorAll('.project-card, .skills-list li, .about-text');
    
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(25px)';
        el.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                scrollObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => scrollObserver.observe(el));


    /* ==========================================================================
       4. NAV LINK ACTIVE STATES ON SCROLL
       ========================================================================== */
    const sections = document.querySelectorAll('section, header');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        const scrollPosition = window.scrollY + 150;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });


    /* ==========================================================================
       5. STANDARD VALIDATION FORM SUBMISSION (Only if using local handling)
       ========================================================================== */
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value.trim();
            const submitBtn = contactForm.querySelector('button[type="submit"]');

            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Sending...';
            submitBtn.disabled = true;

            fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email: document.getElementById('email').value.trim(),
                    message: document.getElementById('message').value.trim()
                })
            }).then(response => response.json().then(data => ({ ok: response.ok, data })))
            .then(({ ok, data }) => {
                if (!ok) throw new Error(data.error || 'Unable to send your message.');
                contactForm.reset();
                if (formStatus) formStatus.textContent = `Thanks, ${name}. I’ll be in touch soon.`;
            })
            .catch(error => {
                if (formStatus) formStatus.textContent = error.message;
            })
            .finally(() => {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            });
        });
    }

    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const projectCount = document.getElementById('project-count');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            let visibleCount = 0;
            filterButtons.forEach(item => item.classList.remove('is-active'));
            button.classList.add('is-active');
            projectCards.forEach(card => {
                const isVisible = filter === 'all' || card.dataset.category === filter;
                card.hidden = !isVisible;
                if (isVisible) visibleCount++;
            });
            if (projectCount) projectCount.textContent = `${String(visibleCount).padStart(2, '0')} projects`;
        });
    });


    /* ==========================================================================
       6. SLEEK RESPONSIVE HAMBURGER NAVIGATION TOGGLE LOGIC
       ========================================================================== */
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const mobileLinks = document.querySelectorAll('.nav-links a');

    if (menuToggle && navMenu) {
        // Toggle action on hamburger button press
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('is-active');
            navMenu.classList.toggle('is-active');
        });

        // Close full-frame drop shadow layout menu when an entry choice link is clicked
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('is-active');
                navMenu.classList.remove('is-active');
            });
        });
    }
});
