document.addEventListener('DOMContentLoaded', () => {
    // === DOM Elements ===
    const htmlBlock = document.documentElement;
    const splashScreen = document.getElementById('splash-screen');
    const greetingPopup = document.getElementById('greeting-popup');
    const openGiftBtn = document.getElementById('open-gift-btn');
    const loadingText = document.getElementById('loading-text');
    
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const nav = document.getElementById('floating-dock');
    
    const themeBtn = document.getElementById('theme-btn');
    const themePalette = document.getElementById('theme-palette');
    const themeOptions = document.querySelectorAll('.theme-option');
    
    const musicBtn = document.getElementById('music-btn');
    const bgMusic = document.getElementById('bg-music');
    const musicText = document.getElementById('music-text');
    
    const cutCakeBtn = document.getElementById('cut-cake-btn');
    const birthdayCake = document.getElementById('birthday-cake');
    const flashOverlay = document.getElementById('flash-overlay');
    const cakeRevealedText = document.getElementById('cake-revealed-text');
    
    const navInstallItem = document.getElementById('nav-install-item');
    const navInstallBtn = document.getElementById('nav-install-btn');
    
    let deferredPrompt;

    // === Splash Screen (5.5 secs Animated sequence) ===
    const loadingPhrases = [
        "Baking the cake...",
        "Lighting the candles...",
        "Wrapping the gifts...",
        "Gathering the memories...",
        "Almost ready..."
    ];
    let phraseIndex = 0;
    
    const textInterval = setInterval(() => {
        phraseIndex = (phraseIndex + 1) % loadingPhrases.length;
        loadingText.style.opacity = 0;
        setTimeout(() => {
            loadingText.innerText = loadingPhrases[phraseIndex];
            loadingText.style.opacity = 1;
        }, 500);
    }, 1200);

    setTimeout(() => {
        clearInterval(textInterval);
        splashScreen.style.opacity = '0';
        setTimeout(() => {
            splashScreen.style.display = 'none';
            
            // Show ONE-TIME greeting popup after splash
            if(!localStorage.getItem('giftOpened_Arif')) {
                greetingPopup.classList.remove('hidden');
            } else {
                initTypingAnimation();
            }
        }, 800);
    }, 5500); // 5.5 seconds total loading screen

    // === Interaction to open gift & play audio safely ===
    openGiftBtn.addEventListener('click', () => {
        greetingPopup.classList.add('hidden');
        localStorage.setItem('giftOpened_Arif', 'true');
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
        initTypingAnimation();
        
        // Play music implicitly and robustly. Start volume at 0 and fade up.
        if (bgMusic.paused) {
            bgMusic.volume = 0;
            let playPromise = bgMusic.play();
            if (playPromise !== undefined) {
                playPromise.then(_ => {
                    musicBtn.classList.remove('paused');
                    musicText.innerText = "Pause";
                    // Fade in audio smoothly
                    let vol = 0;
                    const fadeInterval = setInterval(() => {
                        if(vol < 0.5) {
                            vol += 0.05;
                            bgMusic.volume = Math.min(vol, 0.5);
                        } else {
                            clearInterval(fadeInterval);
                        }
                    }, 200);
                }).catch(error => {
                    console.log("Autoplay prevented or file missing: " + error);
                    bgMusic.volume = 0.5; // Reset volume so manual click works
                });
            }
        }
    });

    // === Navigation & Scroll ===
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('nav-active');
        hamburger.classList.toggle('toggle');
        // Animate links
        navLinks.querySelectorAll('li').forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            }
        });
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('nav-active');
            hamburger.classList.remove('toggle');
            navLinks.querySelectorAll('li').forEach((li) => { li.style.animation = ''; });
        });
    });

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Intersection Observer for buttery fade-up animations
    const fadeElements = document.querySelectorAll('.fade-up');
    const appearOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };
    
    const appearOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('appear');
            observer.unobserve(entry.target);
        });
    }, appearOptions);
    
    fadeElements.forEach(el => appearOnScroll.observe(el));

    // === Live Age Counter (from DOB April 22 1975) ===
    const dob = new Date('1975-04-22T00:00:00'); 
    
    function updateCounter() {
        const now = new Date();
        // Logic for exact Years, Months, Days, Hr, Min, Sec
        let years = now.getFullYear() - dob.getFullYear();
        let months = now.getMonth() - dob.getMonth();
        let days = now.getDate() - dob.getDate();
        
        if (days < 0) {
            months--;
            const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            days += prevMonth.getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        document.getElementById('c-years').innerText = String(years).padStart(2, '0');
        document.getElementById('c-months').innerText = String(months).padStart(2, '0');
        document.getElementById('c-days').innerText = String(days).padStart(2, '0');
        document.getElementById('c-hours').innerText = String(hours).padStart(2, '0');
        document.getElementById('c-minutes').innerText = String(minutes).padStart(2, '0');
        document.getElementById('c-seconds').innerText = String(seconds).padStart(2, '0');
    }
    
    setInterval(updateCounter, 1000);
    updateCounter();

    // === Theme System (Dock Integration) ===
    const savedTheme = localStorage.getItem('bdayTheme') || 'dark-blue';
    setTheme(savedTheme);

    themeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        themePalette.classList.toggle('show');
    });

    themeOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            const theme = e.target.getAttribute('data-theme');
            setTheme(theme);
            themePalette.classList.remove('show');
        });
    });

    // Close palette if clicking outside
    document.addEventListener('click', (e) => {
        if(!e.target.closest('.dock-theme-container')) {
            themePalette.classList.remove('show');
        }
    });

    function setTheme(theme) {
        htmlBlock.setAttribute('data-theme', theme);
        localStorage.setItem('bdayTheme', theme);
        
        themeOptions.forEach(opt => opt.classList.remove('active'));
        const activeOpt = document.querySelector(`.theme-option[data-theme="${theme}"]`);
        if(activeOpt) activeOpt.classList.add('active');
        
        // Update meta theme color
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        const colors = {
            'dark-blue': '#0a0f1c',
            'royal-gold': '#1c150a',
            'soft-pink': '#1f0b12',
            'neon-glow': '#0d0014',
            'matrix-green': '#001a09',
            'sunset-orange': '#1a0a00'
        };
        if(themeColorMeta) themeColorMeta.setAttribute('content', colors[theme]);
    }

    // === EPIC Cake Cutting ===
    let isCakeCut = false;
    cutCakeBtn.addEventListener('click', () => {
        if(isCakeCut) return;
        
        // Flashbang Effect
        flashOverlay.classList.add('active');
        setTimeout(() => {
            flashOverlay.classList.remove('active');
            flashOverlay.classList.add('fade');
        }, 50);

        birthdayCake.classList.add('cut');
        cutCakeBtn.innerText = "Yay! Happy Birthday! 🎉";
        cutCakeBtn.style.transform = "scale(0.95)";
        isCakeCut = true;

        // Reveal the secret text inside the cake slice after a short delay
        setTimeout(() => {
            cakeRevealedText.classList.add('revealed');
        }, 500);

        // Shockwave screen shake effect
        document.body.classList.add('shake');
        setTimeout(() => document.body.classList.remove('shake'), 600);

        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200, 100, 500, 200, 600]);
        }

        // MASSIVE Confetti bursts
        const duration = 4 * 1000;
        const end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 10,
                angle: 60,
                spread: 100,
                origin: { x: 0, y: 0.8 },
                colors: ['#3b82f6', '#d4af37', '#f472b6', '#fff', '#22c55e', '#f97316']
            });
            confetti({
                particleCount: 10,
                angle: 120,
                spread: 100,
                origin: { x: 1, y: 0.8 },
                colors: ['#3b82f6', '#d4af37', '#f472b6', '#fff', '#22c55e', '#f97316']
            });
            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
        
        // Try playing music automatically on cake cut if not playing
        if(bgMusic.paused) {
            toggleMusic();
        }
    });

    // === Modern Music Controls ===
    if(bgMusic.volume === 1) bgMusic.volume = 0.5;
    
    function toggleMusic() {
        if (bgMusic.paused) {
            bgMusic.play().then(() => {
                musicBtn.classList.remove('paused');
                musicText.innerText = "Pause";
            }).catch(e => console.log('Audio error:', e));
        } else {
            bgMusic.pause();
            musicBtn.classList.add('paused');
            musicText.innerText = "Play Song";
        }
    }
    
    musicBtn.addEventListener('click', toggleMusic);

    // === Message Typewriting (Static) ===
    const typedTextEl = document.getElementById('typed-message');
    const hiddenMsg = document.getElementById('hidden-message');
    const cursorHTML = '<span class="cursor"></span>';
    
    function initTypingAnimation() {
        const fullText = hiddenMsg.innerHTML.replace(/<br>/g, '\n').trim();
        typedTextEl.innerHTML = cursorHTML;
        let charIndex = 0;
        typedTextEl.innerHTML = '';
        
        function type() {
            if (charIndex < fullText.length) {
                if(fullText.charAt(charIndex) === '\n') {
                    typedTextEl.innerHTML += '<br>';
                } else {
                    typedTextEl.innerHTML += fullText.charAt(charIndex);
                }
                charIndex++;
                setTimeout(type, 50);
            } else {
                typedTextEl.innerHTML += cursorHTML;
            }
        }
        
        const msgObserver = new IntersectionObserver((entries) => {
            if(entries[0].isIntersecting) {
                type();
                msgObserver.disconnect();
            }
        }, { threshold: 0.5 });
        
        msgObserver.observe(document.getElementById('message'));
    }

    // === PWA Install Inside Hamburger ===
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Show Install option in hamburger menu only if NOT installed
        if(!window.matchMedia('(display-mode: standalone)').matches) {
            navInstallItem.classList.remove('hidden');
        }
    });

    navInstallBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if(outcome === 'accepted') {
                navInstallItem.classList.add('hidden');
            }
            deferredPrompt = null;
        }
    });

    window.addEventListener('appinstalled', () => {
        navInstallItem.classList.add('hidden');
    });
    
    // Register Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(r => console.log('SW setup successful'))
                .catch(e => console.log('SW setup failed', e));
        });
    }

    // ==========================================
    // CRAZY EFFECTS & PHYSICS
    // ==========================================

    // 1. Ambient Floating Fireflies
    function createFireflies() {
        const fireflyCount = 40;
        for(let i=0; i<fireflyCount; i++) {
            let fly = document.createElement('div');
            fly.className = 'firefly';
            fly.style.left = Math.random() * 100 + 'vw';
            fly.style.animationDuration = (Math.random() * 15 + 8) + 's';
            fly.style.animationDelay = (Math.random() * 10) + 's';
            document.body.appendChild(fly);
        }
    }
    createFireflies();

    // 2. 3D Tilt Physics for Glass Cards
    const glassCards = document.querySelectorAll('.glass-card');
    glassCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Calculate tilt 
            const rotateX = ((y - centerY) / centerY) * -12; // max tilt degrees
            const rotateY = ((x - centerX) / centerX) * 12;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
        });
    });

    // 3. Magic Cursor Particle Trail
    const magicCanvas = document.getElementById('magic-canvas');
    if (magicCanvas) {
        const ctx = magicCanvas.getContext('2d');
        magicCanvas.width = window.innerWidth;
        magicCanvas.height = window.innerHeight;

        let particlesArray = [];
        const mouse = { x: null, y: null };

        // Handle Mouse/Touch to spawn particles
        function spawnParticles(x, y) {
            mouse.x = x; mouse.y = y;
            for(let i=0; i<3; i++) particlesArray.push(new Particle());
        }

        window.addEventListener('mousemove', (e) => spawnParticles(e.x, e.y));
        window.addEventListener('touchmove', (e) => spawnParticles(e.touches[0].clientX, e.touches[0].clientY), {passive: true});

        class Particle {
            constructor() {
                this.x = mouse.x;
                this.y = mouse.y;
                this.size = Math.random() * 6 + 1;
                this.speedX = Math.random() * 3 - 1.5;
                this.speedY = Math.random() * 3 - 1.5;
                this.hue = Math.random() * 60 + 30; // Gold/Yellowish
                this.color = `hsl(${this.hue}, 100%, 70%)`; 
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if(this.size > 0.1) this.size -= 0.1;
            }
            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function handleParticles() {
            for(let i=0; i<particlesArray.length; i++) {
                particlesArray[i].update();
                particlesArray[i].draw();
                if(particlesArray[i].size <= 0.2) {
                    particlesArray.splice(i, 1);
                    i--;
                }
            }
        }

        function animateParticles() {
            // Leave a trailing effect by clearing with opacity
            ctx.clearRect(0, 0, magicCanvas.width, magicCanvas.height);
            handleParticles();
            requestAnimationFrame(animateParticles);
        }
        animateParticles();

        window.addEventListener('resize', () => {
            magicCanvas.width = window.innerWidth;
            magicCanvas.height = window.innerHeight;
        });
    }

});
