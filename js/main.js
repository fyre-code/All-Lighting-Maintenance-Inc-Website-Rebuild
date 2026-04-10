document.addEventListener('DOMContentLoaded', () => {

  // =====================
  // DYNAMIC FOOTER YEAR
  // =====================
  const yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // =====================
  // MOBILE NAV TOGGLE
  // =====================
  const hamburger = document.getElementById('hamburger');
  const mainNav = document.getElementById('main-nav');
  const siteHeader = document.getElementById('site-header');

  if (hamburger && mainNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);
      mainNav.classList.toggle('nav-open', isOpen);
    });

    // Close menu when a nav link is clicked
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', false);
        mainNav.classList.remove('nav-open');
      });
    });
  }

  // =====================
  // SMOOTH SCROLL WITH HEADER OFFSET
  // =====================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const headerHeight = siteHeader ? siteHeader.offsetHeight : 0;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });

  // =====================
  // HEADER SCROLL STATE
  // =====================
  if (siteHeader) {
    const onScroll = () => {
      siteHeader.classList.toggle('scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
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
  // CONTACT FORM
  // =====================
  // NOTE: To make this form submit for real, replace the action="#" on
  // the <form> with your Formspree endpoint:
  //   action="https://formspree.io/f/YOUR_FORM_ID"  method="POST"
  // Then remove the e.preventDefault() call below.
  const contactForm = document.querySelector('.contact-form');
  const formSuccess = document.querySelector('.form-success');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      contactForm.style.display = 'none';
      if (formSuccess) formSuccess.style.display = 'block';
      setTimeout(() => {
        contactForm.reset();
        contactForm.style.display = 'flex';
        if (formSuccess) formSuccess.style.display = 'none';
      }, 4000);
    });
  }

});
