document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', function() {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - sectionHeight / 3) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    });

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    const backToTopButton = document.getElementById('back-to-top');

    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.style.display = 'block';
        } else {
            backToTopButton.style.display = 'none';
        }
    });

    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    const heroH2 = document.getElementById('hero-h2');
    const text = (heroH2?.textContent || '').trim();
    let index = 0;
    const speed = 40;
    if (heroH2) heroH2.textContent = '';

    function typeWriter() {
        if (heroH2 && index < text.length) {
            heroH2.textContent += text.charAt(index);
            index++;
            setTimeout(typeWriter, speed);
        }
    }

    typeWriter();

    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
        themeToggle.textContent = 'Light Mode';
    } else {
        themeToggle.textContent = 'Dark Mode';
    }

    const particlesConfigLight = {
        particles: {
            number: { value: 75 },
            color: { value: ["#0c4fa8", "#3a79c2", "#87add6"] },
            shape: {
                type: ["circle"]
            },
            opacity: {
                value: 0.42,
                random: true
            },
            size: {
                value: 3,
                random: true
            },
            line_linked: {
                enable: true,
                distance: 140,
                color: "#6d8fb7",
                opacity: 0.2,
                width: 1
            },
            move: {
                speed: 1.5,
                out_mode: "out"
            }
        },
        interactivity: {
            events: {
                onhover: { enable: true, mode: "grab" },
                onclick: { enable: true, mode: "push" }
            },
            modes: {
                grab: {
                    distance: 150,
                    line_linked: {
                        opacity: 0.45
                    }
                },
                push: {
                    particles_nb: 2
                }
            }
        },
        retina_detect: true
    };

    const particlesConfigDark = {
        particles: {
            number: { value: 70 },
            color: { value: ["#9bc6ff", "#5f95d1"] },
            shape: { type: "circle" },
            opacity: { value: 0.4 },
            size: { value: 3 },
            line_linked: {
                enable: true,
                distance: 135,
                color: "#7caee3",
                opacity: 0.3,
                width: 1
            },
            move: { speed: 1.4 }
        },
        interactivity: {
            events: {
                onhover: { enable: true, mode: "grab" },
                onclick: { enable: true, mode: "push" }
            },
            modes: {
                grab: {
                    distance: 145,
                    line_linked: {
                        opacity: 0.45
                    }
                },
                push: {
                    particles_nb: 2
                }
            }
        }
    };

    function initParticles() {
        if (window.pJSDom && window.pJSDom.length > 0) {
            window.pJSDom[0].pJS.fn.vendors.destroypJS();
            window.pJSDom = [];
        }

        const currentTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
        const particlesConfig = currentTheme === 'dark' ? particlesConfigDark : particlesConfigLight;

        particlesJS('particles-js', particlesConfig);
    }

    initParticles();

    themeToggle.addEventListener('click', function() {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            themeToggle.textContent = 'Light Mode';
            localStorage.setItem('theme', 'dark');
        } else {
            themeToggle.textContent = 'Dark Mode';
            localStorage.setItem('theme', 'light');
        }
        initParticles();
    });

    const faders = document.querySelectorAll('.fade-in');

    const appearOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('show');
                observer.unobserve(entry.target);
            }
        });
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });

    const contactForm = document.getElementById('contact-form');

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        if (name === '' || email === '' || message === '') {
            alert('Please fill out all fields.');
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        emailjs.send('masonwooldridgeportfolio', 'masonwooldridgeportfolio', {
            from_name: name,
            from_email: email,
            message: message
        })
        .then(function() {
            alert('Your message has been sent!');
            contactForm.reset();
        }, function(error) {
            alert('FAILED...', error);
        });
    });
    
});
