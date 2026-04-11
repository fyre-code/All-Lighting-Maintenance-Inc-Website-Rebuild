document.addEventListener('DOMContentLoaded', () => {

  // =====================
  // DYNAMIC FOOTER YEAR
  // =====================
  const yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // =====================
  // PARTICLE SYSTEM (HERO CANVAS)
  // =====================
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  const PARTICLE_COUNT = 60;
  let animationId = null;

  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    initParticles();
  }

  window.addEventListener('resize', resizeCanvas, { passive: true });

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial) {
      this.x = Math.random() * (canvas.width || window.innerWidth);
      this.y = initial
        ? Math.random() * (canvas.height || window.innerHeight)
        : (Math.random() < 0.5 ? -20 : (canvas.height || window.innerHeight) + 20);
      this.size = Math.random() * 3.5 + 1.5;        // radius 1.5–5px
      this.speedX = (Math.random() - 0.5) * 0.45;
      this.speedY = (Math.random() - 0.5) * 0.45;
      this.baseOpacity = Math.random() * 0.55 + 0.15;
      this.pulseSpeed = Math.random() * 0.018 + 0.004;
      this.pulseOffset = Math.random() * Math.PI * 2;
      this.currentOpacity = this.baseOpacity;
    }

    update(time) {
      this.x += this.speedX;
      this.y += this.speedY;

      // Sine-wave opacity pulse
      this.currentOpacity = this.baseOpacity
        + Math.sin(time * this.pulseSpeed + this.pulseOffset) * 0.15;
      this.currentOpacity = Math.max(0.04, Math.min(0.95, this.currentOpacity));

      // Wrap around edges
      const w = canvas.width;
      const h = canvas.height;
      if (this.x < -30) this.x = w + 30;
      else if (this.x > w + 30) this.x = -30;
      if (this.y < -30) this.y = h + 30;
      else if (this.y > h + 30) this.y = -30;
    }

    draw() {
      const glowRadius = this.size * 4.5;
      const gradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, glowRadius
      );
      gradient.addColorStop(0,   `rgba(255, 255, 210, ${this.currentOpacity})`);
      gradient.addColorStop(0.3, `rgba(215, 187, 57,  ${this.currentOpacity * 0.65})`);
      gradient.addColorStop(1,   `rgba(215, 187, 57,  0)`);

      ctx.beginPath();
      ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }

  function initParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
  }

  function animate(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update(time);
      p.draw();
    });
    animationId = requestAnimationFrame(animate);
  }

  // Pause animation when hero is off-screen (saves CPU/battery on mobile)
  const heroSection = document.getElementById('hero');
  if (heroSection) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!animationId) {
            resizeCanvas();
            animationId = requestAnimationFrame(animate);
          }
        } else {
          if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
          }
        }
      });
    }, { threshold: 0.05 });
    observer.observe(heroSection);
  } else {
    resizeCanvas();
    animationId = requestAnimationFrame(animate);
  }

  // =====================
  // GALLERY CAROUSEL + LIGHTBOX
  // =====================
  const track = document.getElementById('gallery-track');
  const prevBtn = document.getElementById('gallery-prev');
  const nextBtn = document.getElementById('gallery-next');
  const dotsContainer = document.getElementById('gallery-dots');
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  if (track && prevBtn && nextBtn) {
    const items = Array.from(track.querySelectorAll('.gallery-item'));
    const images = items.map(item => item.querySelector('img'));
    const total = items.length;

    // Visible count: 4 desktop, 2 tablet, 1 mobile
    function getVisible() {
      if (window.innerWidth <= 480) return 1;
      if (window.innerWidth <= 1025) return 2;
      return 4;
    }

    let current = 0;
    let visible = getVisible();
    const maxPage = () => total - visible;

    // Build dots
    function buildDots() {
      visible = getVisible();
      dotsContainer.innerHTML = '';
      const pageCount = Math.ceil(total / visible);
      for (let i = 0; i < pageCount; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i * visible));
        dotsContainer.appendChild(dot);
      }
    }

    function updateDots() {
      const dots = dotsContainer.querySelectorAll('.carousel-dot');
      const activePage = Math.floor(current / visible);
      dots.forEach((d, i) => d.classList.toggle('active', i === activePage));
    }

    function goTo(index) {
      current = Math.max(0, Math.min(index, maxPage()));
      const itemWidth = items[0].offsetWidth + 12; // width + gap
      track.style.transform = `translateX(-${current * itemWidth}px)`;
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current >= maxPage();
      updateDots();
    }

    prevBtn.addEventListener('click', () => goTo(current - visible));
    nextBtn.addEventListener('click', () => goTo(current + visible));

    window.addEventListener('resize', () => {
      visible = getVisible();
      current = 0;
      buildDots();
      goTo(0);
    });

    buildDots();
    goTo(0);

    // --- LIGHTBOX ---
    let lightboxIndex = 0;

    function openLightbox(index) {
      lightboxIndex = index;
      lightboxImg.src = images[index].src;
      lightboxImg.alt = images[index].alt;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
      lightboxPrev.disabled = index === 0;
      lightboxNext.disabled = index === total - 1;
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      lightboxImg.src = '';
    }

    items.forEach((item, i) => {
      item.addEventListener('click', () => openLightbox(i));
    });

    lightboxClose.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', e => {
      if (e.target === lightbox) closeLightbox();
    });

    lightboxPrev.addEventListener('click', () => {
      if (lightboxIndex > 0) openLightbox(lightboxIndex - 1);
    });

    lightboxNext.addEventListener('click', () => {
      if (lightboxIndex < total - 1) openLightbox(lightboxIndex + 1);
    });

    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft' && lightboxIndex > 0) openLightbox(lightboxIndex - 1);
      if (e.key === 'ArrowRight' && lightboxIndex < total - 1) openLightbox(lightboxIndex + 1);
    });
  }

});
