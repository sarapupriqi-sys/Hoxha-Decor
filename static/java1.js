/* ---------- NAV background on scroll ---------- */
const nav = document.getElementById('site-nav');
if (nav) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) nav.classList.add('nav-scrolled');
    else nav.classList.remove('nav-scrolled');
  });
}

const heroEl = document.getElementById('hero');

function revealHero() {
  ['hero-eyebrow', 'hero-title', 'hero-sub', 'hero-cta'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.transition = 'opacity .8s ease, transform .8s ease';
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
}

window.addEventListener('load', () => {
  if (!heroEl) return;
  if (typeof gsap === 'undefined') { revealHero(); return; }
  gsap.to('#hero-eyebrow', { opacity: 1, y: 0, duration: 0.9, delay: 0.2, ease: 'power2.out' });
  gsap.to('#hero-title',   { opacity: 1, y: 0, duration: 1.1, delay: 0.4, ease: 'power3.out' });
  gsap.to('#hero-sub',     { opacity: 1, y: 0, duration: 1,   delay: 0.7, ease: 'power2.out' });
  gsap.to('#hero-cta',     { opacity: 1, y: 0, duration: 1,   delay: 0.95, ease: 'power2.out' });
});

const heroProgress = { p: 0 };
if (heroEl) {
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.create({
      trigger: '#hero', start: 'top top', end: 'bottom bottom', scrub: true,
      onUpdate: self => { heroProgress.p = self.progress; }
    });
  } else {
    const updateHeroProgress = () => {
      const r = heroEl.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      heroProgress.p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
    };
    window.addEventListener('scroll', updateHeroProgress, { passive: true });
    window.addEventListener('resize', updateHeroProgress);
    updateHeroProgress();
  }
}

/* ---------- THREE.JS: Interactive Spiral Staircase ---------- */
(function initStaircase(){
  const container = document.getElementById('stairs-canvas-container');
  if (!container || typeof THREE === 'undefined') return;
  
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(3.2, 2.4, 4.4);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (err) {
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Lights — warm, luxury tones
  scene.add(new THREE.HemisphereLight(0xE8D9B5, 0x2b1d10, 0.65));
  const key = new THREE.DirectionalLight(0xffe3ad, 1.3);
  key.position.set(4, 6, 3);
  scene.add(key);
  const rim = new THREE.PointLight(0xC9A24B, 1.1, 20);
  rim.position.set(-3, 2, -2);
  scene.add(rim);
  const fill = new THREE.PointLight(0xffffff, 0.25, 20);
  fill.position.set(0, 1, 5);
  scene.add(fill);

  const goldMat   = new THREE.MeshStandardMaterial({ color: 0xC9A24B, metalness: 0.9, roughness: 0.25 });
  const bronzeMat = new THREE.MeshStandardMaterial({ color: 0x8A5A34, metalness: 0.75, roughness: 0.38 });
  const poleMat   = new THREE.MeshStandardMaterial({ color: 0x6B4326, metalness: 0.65, roughness: 0.45 });

  const rootGroup = new THREE.Group();
  const halfA = new THREE.Group(); 
  const halfB = new THREE.Group(); 

  const totalSteps = 16;
  const radius = 1.55;
  const stepHeight = 0.24;
  const angleStep = (Math.PI * 2) / 11;

  // central pole
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.085, 0.085, totalSteps * stepHeight + 0.7, 24),
    poleMat
  );
  pole.position.y = (totalSteps * stepHeight) / 2;
  rootGroup.add(pole);

  const railPoints = [];

  for (let i = 0; i < totalSteps; i++) {
    const angle = i * angleStep;
    const y = i * stepHeight;

    const stepGeo = new THREE.BoxGeometry(1.4, 0.055, 0.55);
    const step = new THREE.Mesh(stepGeo, i % 3 === 0 ? bronzeMat : goldMat);
    const sx = Math.cos(angle) * radius * 0.5;
    const sz = Math.sin(angle) * radius * 0.5;
    step.position.set(sx, y, sz);
    step.rotation.y = -angle;

    const balGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.46, 8);
    const bal = new THREE.Mesh(balGeo, goldMat);
    const bx = Math.cos(angle) * radius;
    const bz = Math.sin(angle) * radius;
    bal.position.set(bx, y + 0.23, bz);

    const piece = new THREE.Group();
    piece.add(step);
    piece.add(bal);

    if (i < totalSteps / 2) halfA.add(piece);
    else halfB.add(piece);

    railPoints.push(new THREE.Vector3(bx, y + 0.46, bz));
  }

  const curve = new THREE.CatmullRomCurve3(railPoints);
  const railGeo = new THREE.TubeGeometry(curve, 220, 0.032, 12, false);
  const rail = new THREE.Mesh(railGeo, goldMat);
  rootGroup.add(rail);

  rootGroup.add(halfA);
  rootGroup.add(halfB);
  rootGroup.position.y = -1.7;
  scene.add(rootGroup);

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function smoothstep(a, b, x) {
    const t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  }

  const phraseLeft = document.getElementById('phrase-left');
  const phraseRight = document.getElementById('phrase-right');

  function onResize() {
    const w = container.clientWidth, h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);
let isVisible = true;
if ('IntersectionObserver' in window) {
  new IntersectionObserver(entries => {
    isVisible = entries[0].isIntersecting;
  }, { threshold: 0 }).observe(container);
}
  function animate() {
  requestAnimationFrame(animate);
  if (!isVisible) return;
  const p = heroProgress.p;

    rootGroup.rotation.y += 0.0022; 

    const split = p * 2.1;
    halfA.position.x = -split;
    halfA.rotation.y = -p * 1.1;
    halfB.position.x = split;
    halfB.rotation.y = p * 1.1;

    camera.position.y = 2.4 - p * 0.5;
    camera.position.z = 4.4 - p * 0.6;
    camera.lookAt(0, 0.6, 0);

    if (phraseLeft) phraseLeft.style.opacity = smoothstep(0.12, 0.34, p) * (1 - smoothstep(0.55, 0.72, p));
    if (phraseRight) phraseRight.style.opacity = smoothstep(0.32, 0.52, p) * (1 - smoothstep(0.74, 0.92, p));

    renderer.render(scene, camera);
  }
  animate();
})();

/* ---------- Product track: drag + wheel scroll ---------- */
(function initDrag(){
  const track = document.getElementById('product-track');
  if (!track) return;
  
  let isDown = false, startX = 0, startScroll = 0;

  track.addEventListener('pointerdown', (e) => {
    isDown = true;
    track.setPointerCapture(e.pointerId);
    startX = e.pageX;
    startScroll = track.scrollLeft;
    track.classList.add('grabbing');
  });
  track.addEventListener('pointerup', () => { isDown = false; track.classList.remove('grabbing'); });
  track.addEventListener('pointerleave', () => { isDown = false; track.classList.remove('grabbing'); });
  track.addEventListener('pointermove', (e) => {
    if (!isDown) return;
    const dx = e.pageX - startX;
    track.scrollLeft = startScroll - dx;
  });
  track.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      track.scrollLeft += e.deltaY;
    }
  }, { passive: false });
})();

/* ---------- Contact form ---------- */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', function(){
    const btn = this.querySelector('[type="submit"]');
    if (btn) btn.disabled = true;
  });
  window.addEventListener('pageshow', e => {
    const btn = contactForm.querySelector('[type="submit"]');
    if (e.persisted && btn) btn.disabled = false;
  });
}

/* ---------- Modali i Ofertës ---------- */
function openOfferModal(type) {
  const modal = document.getElementById('offerModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  const sel = document.getElementById('offerType');
  if (sel && type) sel.value = type;
}

function closeOfferModal() {
  const modal = document.getElementById('offerModal');
  if (!modal) return;
  modal.classList.add('hidden');
  document.body.style.overflow = '';
  const offerFormBox = document.getElementById('offerForm');
  const offerSuccessBox = document.getElementById('offerSuccess');
  if (offerFormBox) offerFormBox.classList.remove('hidden');
  if (offerSuccessBox) offerSuccessBox.classList.add('hidden');
}

function sendOffer(e) {
  e.preventDefault();
  const f = e.target;
  const msg = 'Përshëndetje, dua një ofertë.\n' +
    'Emri: ' + f.emri.value + '\n' +
    'Telefoni: ' + f.telefoni.value + '\n' +
    'Lloji: ' + f.lloji.value + '\n' +
    'Detaje: ' + (f.detaje.value || '-');
  const data = new FormData();
  data.append('emri', f.emri.value);
  data.append('telefoni', f.telefoni.value);
  data.append('lloji_punimit', f.lloji.value);
  data.append('detaje', f.detaje.value);
  const csrf = f.querySelector('[name=csrfmiddlewaretoken]');
  if (csrf) data.append('csrfmiddlewaretoken', csrf.value);
  fetch(f.dataset.saveUrl, { method: 'POST', body: data, credentials: 'same-origin', keepalive: true })
    .catch(() => {});
  window.open('https://wa.me/355683980044?text=' + encodeURIComponent(msg), '_blank');
  f.reset();
  f.classList.add('hidden');
  document.getElementById('offerSuccess').classList.remove('hidden');
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeOfferModal(); });

/* ---------- Menuja për telefon ---------- */
const menuBtn = document.getElementById('menu-btn');
const mobileMenuEl = document.getElementById('mobile-menu');
if (menuBtn && mobileMenuEl) {
  menuBtn.addEventListener('click', () => {
    const closed = mobileMenuEl.classList.toggle('hidden');
    menuBtn.setAttribute('aria-expanded', closed ? 'false' : 'true');
  });
}

/* ---------- Google Translate: inicializimi (shqipja = gjuha origjinale) ---------- */
function googleTranslateElementInit() {
  new google.translate.TranslateElement({
    pageLanguage: 'sq',
    includedLanguages: 'sq,en,it,tr,el',
    autoDisplay: false
  }, 'google_translate_element');
}

/* Heq vetëm hapësirën lart që shton Google (nuk fshin asnjë element të tij) */
(function () {
  function fixBodyTop() {
    if (document.body.style.top && document.body.style.top !== '0px') {
      document.body.style.top = '0px';
    }
  }
  new MutationObserver(fixBodyTop).observe(document.body, { attributes: true, attributeFilter: ['style'] });
  fixBodyTop();
})();

/* ---------- Përkthimi i gjuhës ---------- */
function setTransCookie(value) {
  const host = location.hostname;
  const isIp = /^[\d.]+$/.test(host) || host === 'localhost';
  const past = 'expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
  if (!value) {
    document.cookie = 'googtrans=; ' + past;
    if (!isIp) {
      document.cookie = 'googtrans=; ' + past + '; domain=' + host;
      document.cookie = 'googtrans=; ' + past + '; domain=.' + host;
    }
    return;
  }
  const opts = '; max-age=2592000; path=/';
  document.cookie = 'googtrans=' + value + opts;
  if (!isIp) document.cookie = 'googtrans=' + value + opts + '; domain=' + host;
}

function changeLanguage(lang) {
  try { localStorage.setItem('site-lang', lang); } catch (e) {}

  // Shqip = gjuha origjinale: fshi përkthimin dhe ringarko
  if (lang === 'sq') {
    setTransCookie('');
    location.reload();
    return;
  }

  setTransCookie('/sq/' + lang);

  // Rruga e parë: përdor drejtpërdrejt widget-in e Google (pa reload)
  const combo = document.querySelector('select.goog-te-combo');
  if (combo) {
    combo.value = lang;
    combo.dispatchEvent(new Event('change'));
    return;
  }

  // Rruga e dytë: cookie + reload (widget-i ende nuk është ngarkuar)
  location.reload();
}

document.querySelectorAll('[data-open-offer]').forEach(btn =>
  btn.addEventListener('click', () => openOfferModal()));

document.querySelectorAll('[data-close-offer]').forEach(btn =>
  btn.addEventListener('click', () => closeOfferModal()));

const offerModalEl = document.getElementById('offerModal');
if (offerModalEl) {
  offerModalEl.addEventListener('click', e => {
    if (e.target === offerModalEl) closeOfferModal();
  });
}

const offerFormEl = document.getElementById('offerForm');
if (offerFormEl) offerFormEl.addEventListener('submit', sendOffer);

document.querySelectorAll('[data-lang]').forEach(link =>
  link.addEventListener('click', e => {
    e.preventDefault();
    changeLanguage(link.dataset.lang);
  }));

const homeFileInput = document.getElementById('home-file');
const homeFileName = document.getElementById('file-name');
if (homeFileInput && homeFileName) {
  homeFileInput.addEventListener('change', () => {
    homeFileName.textContent = homeFileInput.files[0] ? homeFileInput.files[0].name : 'Asnjë skedar i zgjedhur';
  });
}

if (nav && window.scrollY > 40) nav.classList.add('nav-scrolled');

/* ---------- Punimet: filtrat dhe lightbox ---------- */
(function initWorks(){
  const grid = document.getElementById('grid');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.work-card'));
  const buttons = Array.from(document.querySelectorAll('#filters .filter-btn'));
  const counter = document.getElementById('result-count');

  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbCat = document.getElementById('lb-cat');
  const lbTitle = document.getElementById('lb-title');
  const lbDesc = document.getElementById('lb-desc');
  const lbPrev = document.getElementById('lb-prev');
  const lbNext = document.getElementById('lb-next');
  const lbClose = document.getElementById('lb-close');
  const lbOffer = document.getElementById('lb-offer');

  let list = [];
  let current = -1;
  let opener = null;

  function visibleCards() {
    return cards.filter(c => !c.hidden);
  }

  function applyFilter(f, updateUrl) {
    const valid = buttons.some(b => b.dataset.f === f) ? f : 'all';
    cards.forEach(card => {
      const show = valid === 'all' || card.dataset.cat === valid;
      card.hidden = !show;
      card.classList.remove('is-in');
      if (show) {
        void card.offsetWidth;
        card.classList.add('is-in');
      }
    });
    buttons.forEach(b => {
      const on = b.dataset.f === valid;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (counter) {
      const n = visibleCards().length;
      counter.textContent = n + (n === 1 ? ' punim' : ' punime');
    }
    if (updateUrl && window.history && history.replaceState) {
      const url = new URL(window.location.href);
      if (valid === 'all') url.searchParams.delete('kat');
      else url.searchParams.set('kat', valid);
      history.replaceState(null, '', url);
    }
  }

  buttons.forEach(b => b.addEventListener('click', () => applyFilter(b.dataset.f, true)));

  function showWork(index) {
    const card = list[index];
    if (!card) return;
    const btn = card.querySelector('.work-open');
    if (!btn) return;
    const d = btn.dataset;
    current = index;
    lbImg.src = d.img || '';
    lbImg.alt = d.title || '';
    lbCat.textContent = d.catLabel || '';
    lbTitle.textContent = d.title || '';
    lbDesc.textContent = d.desc || '';
    lbOffer.dataset.type = d.type || '';
    const single = list.length < 2;
    lbPrev.hidden = single;
    lbNext.hidden = single;
  }

  function isLightboxOpen() {
    return lb && !lb.classList.contains('hidden');
  }

  function openLightbox(card, trigger) {
    if (!lb) return;
    list = visibleCards();
    opener = trigger || null;
    showWork(list.indexOf(card));
    lb.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    if (lbClose) lbClose.focus();
  }

  function closeLightbox() {
    if (!lb || !isLightboxOpen()) return;
    lb.classList.add('hidden');
    document.body.style.overflow = '';
    if (opener && typeof opener.focus === 'function') opener.focus();
  }

  function step(dir) {
    if (list.length < 2) return;
    showWork((current + dir + list.length) % list.length);
  }

  grid.addEventListener('click', e => {
    const btn = e.target.closest('.work-open');
    if (!btn) return;
    openLightbox(btn.closest('.work-card'), btn);
  });

  if (lb) {
    if (lbPrev) lbPrev.addEventListener('click', () => step(-1));
    if (lbNext) lbNext.addEventListener('click', () => step(1));
    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
    if (lbOffer) {
      lbOffer.addEventListener('click', () => {
        const type = lbOffer.dataset.type;
        closeLightbox();
        openOfferModal(type);
      });
    }
    document.addEventListener('keydown', e => {
      if (!isLightboxOpen()) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    });
  }

  applyFilter(new URLSearchParams(window.location.search).get('kat') || 'all', false);
})();

/* ---------- Procesi: vija që mbushet me scroll ---------- */
(function initProcess(){
  const steps = document.getElementById('proc-steps');
  const line = document.getElementById('proc-line');
  if (!steps || !line) return;

  let ticking = false;

  function update() {
    ticking = false;
    const r = steps.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (window.innerHeight * 0.6 - r.top) / r.height));
    line.style.transform = 'scaleY(' + p + ')';
  }

  function request() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  update();
})();

/* ---------- Kontakti: foto, vendndodhja, WhatsApp ---------- */
(function initContactPage(){
  const form = document.getElementById('kontakt-forma');
  if (!form) return;

  const MAX_FILES = 5;
  const MAX_SIZE = 8 * 1024 * 1024;

  const input = document.getElementById('f-foto');
  const dropzone = document.getElementById('dropzone');
  const list = document.getElementById('foto-list');
  const err = document.getElementById('foto-err');
  const submitBtn = document.getElementById('submit-btn');
  const waBtn = document.getElementById('wa-btn');
  const geoBtn = document.getElementById('geo-btn');
  const geoOut = document.getElementById('geo-out');
  const latEl = document.getElementById('f-lat');
  const lngEl = document.getElementById('f-lng');

  let files = [];

  function isAllowed(f) {
    return /^image\/(jpeg|png|webp)$/.test(f.type) || /\.(jpe?g|png|webp)$/i.test(f.name);
  }

  function syncInput() {
    if (!input) return;
    try {
      const dt = new DataTransfer();
      files.forEach(f => dt.items.add(f));
      input.files = dt.files;
    } catch (e) {}
  }

  function render() {
    if (!list) return;
    list.innerHTML = '';
    files.forEach((f, i) => {
      const li = document.createElement('li');
      li.className = 'photo-item';
      const img = document.createElement('img');
      img.alt = f.name;
      const url = URL.createObjectURL(f);
      img.src = url;
      img.addEventListener('load', () => URL.revokeObjectURL(url));
      const rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'photo-remove';
      rm.setAttribute('aria-label', 'Hiq foton');
      rm.textContent = '✕';
      rm.addEventListener('click', () => {
        files.splice(i, 1);
        syncInput();
        render();
      });
      li.appendChild(img);
      li.appendChild(rm);
      list.appendChild(li);
    });
  }

  function addFiles(incoming) {
    const msgs = [];
    Array.from(incoming).forEach(f => {
      if (!isAllowed(f)) { msgs.push(f.name + ': formati nuk lejohet (vetëm JPG, PNG ose WebP).'); return; }
      if (f.size > MAX_SIZE) { msgs.push(f.name + ': e kalon 8 MB.'); return; }
      if (files.some(x => x.name === f.name && x.size === f.size)) return;
      if (files.length >= MAX_FILES) { msgs.push('Mund të ngarkoni deri në 5 foto.'); return; }
      files.push(f);
    });
    if (err) err.textContent = Array.from(new Set(msgs)).join(' ');
    syncInput();
    render();
  }

  if (input) input.addEventListener('change', () => addFiles(input.files));

  if (dropzone) {
    ['dragenter', 'dragover'].forEach(ev =>
      dropzone.addEventListener(ev, e => {
        e.preventDefault();
        dropzone.classList.add('is-over');
      }));
    ['dragleave', 'dragend'].forEach(ev =>
      dropzone.addEventListener(ev, () => dropzone.classList.remove('is-over')));
    dropzone.addEventListener('drop', e => {
      e.preventDefault();
      dropzone.classList.remove('is-over');
      if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
    });
  }

  if (geoBtn && geoOut) {
    geoBtn.addEventListener('click', () => {
      if (!navigator.geolocation) {
        geoOut.textContent = 'Shfletuesi juaj nuk e mbështet vendndodhjen.';
        return;
      }
      geoOut.textContent = 'Duke marrë vendndodhjen...';
      navigator.geolocation.getCurrentPosition(
        pos => {
          if (latEl) latEl.value = pos.coords.latitude.toFixed(6);
          if (lngEl) lngEl.value = pos.coords.longitude.toFixed(6);
          geoOut.textContent = 'Vendndodhja u shtua.';
        },
        e => {
          if (latEl) latEl.value = '';
          if (lngEl) lngEl.value = '';
          geoOut.textContent = e.code === 1 ? 'Nuk u dha leje për vendndodhjen.' : 'Vendndodhja nuk u mor dot.';
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }

  if (waBtn) {
    waBtn.addEventListener('click', () => {
      if (!form.reportValidity()) return;
      const v = name => (form.elements[name] && form.elements[name].value.trim()) || '';
      let msg = 'Përshëndetje, dua një ofertë.\n' +
        'Emri: ' + v('emri') + '\n' +
        'Telefoni: ' + v('telefoni') + '\n' +
        'Lloji: ' + v('lloji') + '\n' +
        'Qyteti: ' + v('qyteti') + '\n' +
        'Adresa: ' + v('adresa');
      if (v('permasat')) msg += '\nPërmasat: ' + v('permasat');
      if (v('mesazhi')) msg += '\nDetaje: ' + v('mesazhi');
      if (latEl && latEl.value && lngEl && lngEl.value) {
        msg += '\nVendndodhja: https://www.google.com/maps?q=' + latEl.value + ',' + lngEl.value;
      }
      window.open('https://wa.me/355683980044?text=' + encodeURIComponent(msg), '_blank');
    });
  }

  form.addEventListener('submit', () => {
    if (!submitBtn) return;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Duke dërguar...';
  });

  window.addEventListener('pageshow', e => {
    if (e.persisted && submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Dërgo kërkesën';
    }
  });
})();

/* ---------- Videot: një luhet në çdo kohë ---------- */
(function initVideos(){
  const vids = Array.from(document.querySelectorAll('.video-player'));
  vids.forEach(v => {
    const card = v.closest('.video-card');
    v.addEventListener('play', () => {
      vids.forEach(o => { if (o !== v) o.pause(); });
      if (card) card.classList.add('is-playing');
    });
    v.addEventListener('pause', () => { if (card) card.classList.remove('is-playing'); });
    v.addEventListener('ended', () => { if (card) card.classList.remove('is-playing'); });
  });
})();