/* VH Group – main.js */

/* ---- Hero Slider ---- */
(function () {
  const slides = document.querySelectorAll('.hero__slide');
  const dotsWrap = document.getElementById('heroDots');
  const prev = document.getElementById('heroPrev');
  const next = document.getElementById('heroNext');
  let cur = 0;
  let timer;

  if (!slides.length) return;

  // Build dots
  slides.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.className = 'hero__dot' + (i === 0 ? ' active' : '');
    btn.setAttribute('aria-label', 'Slide ' + (i + 1));
    btn.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(btn);
  });

  function goTo(idx) {
    slides[cur].classList.remove('active');
    dotsWrap.children[cur].classList.remove('active');
    cur = (idx + slides.length) % slides.length;
    slides[cur].classList.add('active');
    dotsWrap.children[cur].classList.add('active');
  }

  function autoPlay() {
    clearInterval(timer);
    timer = setInterval(() => goTo(cur + 1), 5500);
  }

  prev.addEventListener('click', () => { goTo(cur - 1); autoPlay(); });
  next.addEventListener('click', () => { goTo(cur + 1); autoPlay(); });

  autoPlay();
})();

/* ---- Header scroll effect ---- */
(function () {
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
})();

/* ---- Mobile nav ---- */
(function () {
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  document.body.appendChild(overlay);

  function close() {
    burger.classList.remove('open');
    nav.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  function open() {
    burger.classList.add('open');
    nav.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  burger.addEventListener('click', () => {
    nav.classList.contains('open') ? close() : open();
  });
  overlay.addEventListener('click', close);

  // Close on nav link click (mobile)
  nav.querySelectorAll('.nav__link').forEach(l => l.addEventListener('click', close));
})();

/* ---- Active nav link on scroll ---- */
(function () {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav__link');
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 120;
    sections.forEach(sec => {
      if (scrollY >= sec.offsetTop && scrollY < sec.offsetTop + sec.offsetHeight) {
        links.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === '#' + sec.id);
        });
      }
    });
  }, { passive: true });
})();

/* ---- Vehicle filter tabs ---- */
(function () {
  const tabs = document.querySelectorAll('.tab-btn');
  const cards = document.querySelectorAll('.car-card');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;
      cards.forEach(card => {
        const show = filter === 'all' || card.dataset.cat === filter;
        card.style.transition = 'opacity 0.3s, transform 0.3s';
        if (show) {
          card.style.display = '';
          setTimeout(() => { card.style.opacity = '1'; card.style.transform = ''; }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.92)';
          setTimeout(() => { card.style.display = 'none'; }, 310);
        }
      });
    });
  });
})();

/* ---- Fav button toggle ---- */
document.querySelectorAll('.car-card__fav').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
    const icon = btn.querySelector('i');
    icon.classList.toggle('far');
    icon.classList.toggle('fas');
  });
});

/* ---- Counter animation ---- */
(function () {
  const nums = document.querySelectorAll('.stat-card__num');
  if (!nums.length) return;

  const animate = (el) => {
    const target = +el.dataset.target;
    const duration = 1800;
    const step = target / (duration / 16);
    let current = 0;
    const t = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current);
      if (current >= target) clearInterval(t);
    }, 16);
  };

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animate(e.target);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  nums.forEach(n => obs.observe(n));
})();

/* ---- Scroll reveal ---- */
(function () {
  const revealEls = [
    ...document.querySelectorAll('.car-card, .service-card, .stat-card, .testimonial-card, .contact-info-card, .about__value')
  ];
  revealEls.forEach(el => el.classList.add('reveal'));

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => obs.observe(el));
})();

/* ---- Back to top ---- */
(function () {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ---- Financing simulator ---- */
function calcSim() {
  const price = parseFloat(document.getElementById('simPrice').value);
  const down = parseFloat(document.getElementById('simDown').value) || 0;
  const quotas = parseInt(document.getElementById('simQuotas').value);
  const resultEl = document.getElementById('simResult');
  const outEl = document.getElementById('simOut');

  if (!price || price < 1000) {
    alert('Ingresá un valor de vehículo válido.');
    return;
  }
  const principal = price * (1 - down / 100);
  const rate = 0.018; // ~1.8% mensual estimado
  const cuota = principal * (rate * Math.pow(1 + rate, quotas)) / (Math.pow(1 + rate, quotas) - 1);
  outEl.textContent = '$' + cuota.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  resultEl.style.display = 'block';
}

/* ---- Contact form ---- */
document.getElementById('contactForm')?.addEventListener('submit', function (e) {
  e.preventDefault();
  const data = new FormData(this);
  const nombre = data.get('nombre');
  const telefono = data.get('telefono');
  const interes = data.get('interes');
  const mensaje = data.get('mensaje') || '';

  const wa = `https://wa.me/595985000000?text=${encodeURIComponent(
    `Hola! Soy ${nombre} (${telefono}).\n*Consulta:* ${interes}.\n${mensaje ? 'Mensaje: ' + mensaje : ''}`
  )}`;
  window.open(wa, '_blank');
});

/* ---- Search form ---- */
document.getElementById('searchForm')?.addEventListener('submit', function (e) {
  e.preventDefault();
  document.getElementById('vehiculos').scrollIntoView({ behavior: 'smooth' });
});

/* ---- Smooth anchor scroll (fallback) ---- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
