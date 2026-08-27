document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.classList.add('js');

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canAnimate = typeof window.anime === 'function' && !reduceMotion;
    const chapters = [...document.querySelectorAll('.chapter')];
    const railLinks = [...document.querySelectorAll('.rail-link')];
    const animate = (targets, options) => canAnimate && window.anime({ targets, ...options });
    const pointer = { x: 0, y: 0 };

    function createStarfield() {
        const canvas = document.getElementById('starfield');
        if (!canvas) return;
        const context = canvas.getContext('2d');
        let width = 0;
        let height = 0;
        let scale = 1;
        let stars = [];

        const makeStars = () => {
            const count = Math.min(380, Math.floor((width * height) / 4600));
            stars = Array.from({ length: count }, (_, index) => ({
                x: Math.random() * width,
                y: Math.random() * height,
                r: index % 23 === 0 ? Math.random() * 1.3 + .8 : Math.random() * .75 + .15,
                a: Math.random() * .65 + .18,
                twinkle: Math.random() * Math.PI * 2,
                speed: Math.random() * .00035 + .00008
            }));
        };

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            scale = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.floor(width * scale);
            canvas.height = Math.floor(height * scale);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            context.setTransform(scale, 0, 0, scale, 0, 0);
            makeStars();
        };

        const draw = time => {
            context.clearRect(0, 0, width, height);
            const wash = context.createRadialGradient(width * .72, height * .42, 0, width * .72, height * .42, width * .72);
            wash.addColorStop(0, 'rgba(28, 53, 102, .16)');
            wash.addColorStop(.45, 'rgba(14, 23, 55, .07)');
            wash.addColorStop(1, 'rgba(2, 3, 10, 0)');
            context.fillStyle = wash;
            context.fillRect(0, 0, width, height);

            stars.forEach(star => {
                const pulse = reduceMotion ? 1 : .72 + Math.sin(time * star.speed + star.twinkle) * .28;
                const x = star.x + pointer.x * star.r * 2.2;
                const y = star.y + pointer.y * star.r * 1.4;
                context.beginPath();
                context.arc(x, y, star.r, 0, Math.PI * 2);
                context.fillStyle = `rgba(205, 224, 255, ${star.a * pulse})`;
                context.fill();
                if (star.r > 1.25) {
                    context.strokeStyle = `rgba(158, 217, 255, ${star.a * .35})`;
                    context.beginPath(); context.moveTo(x - 5, y); context.lineTo(x + 5, y); context.stroke();
                    context.beginPath(); context.moveTo(x, y - 5); context.lineTo(x, y + 5); context.stroke();
                }
            });
            window.requestAnimationFrame(draw);
        };

        resize();
        window.addEventListener('resize', resize, { passive: true });
        window.requestAnimationFrame(draw);
    }

    function createPlanets() {
        if (!window.THREE) return;
        const textureBase = 'images/planets/';
        const configs = [
            { selector: '.planet--home', texture: 'earth.jpg', speed: .000065, tilt: -.16, light: [-3, 1.8, 4], atmosphere: 0x5aaeff },
            { selector: '.planet--projects', texture: 'jupiter.jpg', speed: .00009, tilt: -.055, light: [-4, 2.1, 3], atmosphere: 0xd1a57c },
            { selector: '.planet--experience', texture: 'neptune.jpg', speed: .00007, tilt: -.48, light: [3, 1.2, 4], atmosphere: 0x467cff },
            { selector: '.planet--education', texture: 'mars.jpg', speed: .000075, tilt: -.44, light: [-3, 2.4, 4], atmosphere: 0xd86b42 },
            { selector: '.planet--contact', texture: 'venus.jpg', speed: .000045, tilt: .15, light: [3.5, 1.5, 4], atmosphere: 0xe5ad73 },
            { selector: '.planet--resume', texture: 'saturn.jpg', speed: .000075, tilt: -.28, light: [-3.5, 2, 4], atmosphere: 0xd6bd8d, rings: true }
        ];
        const rendered = [];
        const loader = new THREE.TextureLoader();
        configs.forEach(config => {
            const element = document.querySelector(config.selector);
            if (!element) return;

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(31, 1.45, .1, 100);
            camera.position.z = 3.45;
            const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
            if ('outputColorSpace' in renderer && THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
            else if ('outputEncoding' in renderer && THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;
            if (THREE.ACESFilmicToneMapping) {
                renderer.toneMapping = THREE.ACESFilmicToneMapping;
                renderer.toneMappingExposure = 1.02;
            }
            element.appendChild(renderer.domElement);

            const texture = loader.load(textureBase + config.texture);
            if ('colorSpace' in texture && THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
            else if ('encoding' in texture && THREE.sRGBEncoding) texture.encoding = THREE.sRGBEncoding;
            texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

            const radius = config.rings ? .73 : .9;
            const geometry = new THREE.SphereGeometry(radius, 96, 64);
            const material = new THREE.MeshStandardMaterial({ map: texture, roughness: .78, metalness: 0 });
            const planet = new THREE.Mesh(geometry, material);
            planet.rotation.z = config.tilt;
            scene.add(planet);

            const sun = new THREE.DirectionalLight(0xfff8e8, 3.25);
            sun.position.set(...config.light);
            scene.add(sun);
            scene.add(new THREE.AmbientLight(0x1b2a50, .14));
            const bounce = new THREE.DirectionalLight(config.atmosphere, .22);
            bounce.position.set(-config.light[0], -2, -3);
            scene.add(bounce);

            const atmosphere = new THREE.Mesh(
                new THREE.SphereGeometry(radius * 1.025, 72, 48),
                new THREE.ShaderMaterial({
                    uniforms: { glowColor: { value: new THREE.Color(config.atmosphere) } },
                    vertexShader: 'varying vec3 n; varying vec3 v; void main(){ n=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); v=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }',
                    fragmentShader: 'uniform vec3 glowColor; varying vec3 n; varying vec3 v; void main(){ float rim=pow(1.0-max(dot(n,v),0.0),4.2); gl_FragColor=vec4(glowColor,rim*.62); }',
                    blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, side: THREE.FrontSide
                })
            );
            atmosphere.rotation.z = config.tilt;
            scene.add(atmosphere);

            if (config.rings) {
                const ringMaterial = new THREE.ShaderMaterial({
                    transparent: true,
                    side: THREE.DoubleSide,
                    depthWrite: false,
                    vertexShader: 'varying float ringRadius; void main(){ ringRadius=length(position.xy); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
                    fragmentShader: 'varying float ringRadius; void main(){ float t=clamp((ringRadius-.91)/.57,0.0,1.0); float edge=smoothstep(0.0,.07,t)*(1.0-smoothstep(.91,1.0,t)); float cassini=1.0-smoothstep(.0,.018,abs(t-.58)); float bands=.58+.18*sin(t*78.0)+.1*sin(t*213.0); float alpha=edge*bands*(1.0-.82*cassini)*.62; vec3 inner=vec3(.78,.70,.57); vec3 outer=vec3(.94,.87,.72); gl_FragColor=vec4(mix(inner,outer,t),alpha); }'
                });
                const ring = new THREE.Mesh(new THREE.RingGeometry(.91, 1.48, 160, 1), ringMaterial);
                ring.rotation.x = 1.23;
                ring.rotation.z = -.18;
                scene.add(ring);
            }

            const resize = () => {
                const width = Math.max(1, element.clientWidth);
                const height = Math.max(1, element.clientHeight);
                renderer.setSize(width, height, false);
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
            };
            resize();
            rendered.push({ planet, atmosphere, scene, camera, renderer, resize, speed: config.speed, baseX: planet.rotation.x });
        });

        let lastTime = performance.now();
        const render = time => {
            const delta = Math.min(42, time - lastTime);
            lastTime = time;
            rendered.forEach(item => {
                if (!reduceMotion) item.planet.rotation.y += delta * item.speed;
                item.planet.rotation.x += ((pointer.y * .035) - item.planet.rotation.x) * .025;
                item.atmosphere.rotation.y = item.planet.rotation.y;
                item.atmosphere.rotation.x = item.planet.rotation.x;
                item.renderer.render(item.scene, item.camera);
            });
            window.requestAnimationFrame(render);
        };
        window.addEventListener('resize', () => rendered.forEach(item => item.resize()), { passive: true });
        window.requestAnimationFrame(render);
    }

    window.addEventListener('pointermove', event => {
        pointer.x = (event.clientX / window.innerWidth - .5) * 2;
        pointer.y = (event.clientY / window.innerHeight - .5) * 2;
    }, { passive: true });

    createStarfield();
    createPlanets();

    const timeElement = document.getElementById('local-time');
    const updateClock = () => { if (timeElement) timeElement.textContent = new Date().toLocaleTimeString('en-US', { hour12: false }); };
    updateClock(); window.setInterval(updateClock, 1000);

    railLinks.forEach(link => link.addEventListener('click', () => {
        document.getElementById(link.dataset.target)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }));

    const reveal = chapter => {
        if (chapter.dataset.revealed) return;
        chapter.dataset.revealed = 'true'; chapter.classList.add('is-visible');
        animate(chapter.querySelectorAll('.reveal-item'), { opacity: [0, 1], translateY: [24, 0], duration: 850, delay: window.anime.stagger(105), easing: 'easeOutExpo' });
    };
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        railLinks.forEach(link => link.classList.toggle('is-active', link.dataset.target === entry.target.dataset.section));
    }), { threshold: .38 });
    chapters.forEach(chapter => observer.observe(chapter));

    animate('.topbar', { opacity: [0, 1], translateY: [-18, 0], duration: 750, easing: 'easeOutExpo' });
    animate('.section-rail', { opacity: [0, 1], translateX: [20, 0], delay: 220, duration: 750, easing: 'easeOutExpo' });
    animate('.hero-title .title-line', { opacity: [0, 1], translateY: ['105%', '0%'], delay: window.anime ? window.anime.stagger(145, { start: 220 }) : 0, duration: 1050, easing: 'easeOutExpo' });
    animate('.orbit-line--a', { rotate: '+=360deg', duration: 30000, easing: 'linear', loop: true });
    animate('.orbit-line--b', { rotate: '-=360deg', duration: 42000, easing: 'linear', loop: true });

    document.getElementById('contact-form')?.addEventListener('submit', event => {
        event.preventDefault();
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();
        const status = document.getElementById('form-status');
        if (!name || !email || !message) { status.textContent = 'Please complete every field.'; return; }
        status.textContent = 'Opening your email app…';
        window.location.href = `mailto:mason.tyler.wooldridge@gmail.com?subject=${encodeURIComponent(`Portfolio message from ${name}`)}&body=${encodeURIComponent(`From: ${name} (${email})\n\n${message}`)}`;
    });
});
