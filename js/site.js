/* =========================================================
   Shared behaviour for every public page:
   - phone bottom action bar (Call / WhatsApp / Share / Enquire)
   - WhatsApp sharing for packages, hotels, flights, cars, visa, passport, destinations, contact
   - guided enquiry form (scrolls to the form, highlights it and points to each field)
   - header service strip: hides when scrolling down, shows when scrolling up
   ========================================================= */
(function () {
  const WA_NUMBER = '919824044070';
  const PAGE = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '') || 'index';
  document.body.classList.add('page-' + PAGE);
  const abs = u => { try { return new URL(u, location.href).href; } catch (e) { return u; } };
  const SITE = 'Dharti Holidays, Ahmedabad';

  /* ---------- WhatsApp share ---------- */
  const PAGE_SHARE = {
    index: { text: '*' + SITE + '*\nHoliday packages, flights, hotels, car transfers, visa & passport help — planned personally.\n📞 +91 93746 15071 · +91 98797 52230\n💬 WhatsApp +91 98240 44070\n📸 Instagram @dhartiholidays_amd · Facebook @dhartiholidays', url: location.origin + '/' },
    flights: { text: '✈️ *Flight booking enquiry — ' + SITE + '*\nShare your route and dates and get a personal fare quote.' },
    hotels: { text: '🏨 *Hotels in Goa, Kerala, Dubai & more — ' + SITE + '*\nShortlist hotels and send one enquiry.' },
    packages: { text: '🧳 *Holiday packages from Ahmedabad — ' + SITE + '*\nDomestic, international, honeymoon & group trips.' },
    destinations: { text: '📍 *Travel destination guides — ' + SITE + '*\nPlaces to visit, food, activities and the best time to go.' },
    'car-transfer': { text: '🚗 *Car transfer & outstation cabs — ' + SITE + '*\nSedan, SUV, MPV and Tempo Traveller with clear per-km rates.' },
    visa: { text: '🛂 *Visa help — ' + SITE + '*\nDocuments, filing and appointments for popular countries.' },
    passport: { text: '📘 *Passport services — ' + SITE + '*\nNew, renewal, Tatkal and more.' },
    blog: { text: '📰 *Travel blog — ' + SITE + '*\nTips, destination ideas and visa guides.' }
  };
  function shareWhatsApp(text, url) {
    const msg = [text, url].filter(Boolean).join('\n');
    window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  }
  window.dhartiShare = shareWhatsApp;
  function handleShare(el) {
    const d = PAGE_SHARE[PAGE] || {};
    const text = el.getAttribute('data-share-text') || d.text || document.title;
    const url = el.getAttribute('data-share-url') || d.url || location.href;
    shareWhatsApp(text, abs(url));
  }
  document.addEventListener('click', function (e) {
    const el = e.target.closest('[data-wa-share]');
    if (!el) return;
    e.preventDefault(); e.stopPropagation();
    handleShare(el);
  }, true);
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const el = e.target.closest && e.target.closest('span[data-wa-share]');
    if (el) { e.preventDefault(); handleShare(el); }
  });

  /* ---------- guided enquiry form ---------- */
  const GUIDE_IDS = { pkEnquiry: 1, vdEnquiry: 1, ddEnquiry: 1, contact: 1 };
  function firstGuideId() { return Object.keys(GUIDE_IDS).find(id => document.getElementById(id) && document.getElementById(id).querySelector('form')); }
  let guideCleanup = null;

  function tipText(field) {
    const label = ((field.closest('.field') || {}).textContent || '').toLowerCase();
    if (field.type === 'tel' || /phone|mobile/.test(label)) return '📱 Now type your phone number';
    if (/name/.test(label)) return '✍️ Type your name here';
    if (field.type === 'email') return '✉️ Type your email here';
    return '👉 Fill this in';
  }

  function runGuide(box, form) {
    if (guideCleanup) guideCleanup();
    box.classList.add('form-spotlight');
    const banner = document.createElement('div');
    banner.className = 'form-guide-banner'; banner.setAttribute('role', 'status');
    banner.textContent = "👇 Fill in your details below — we'll send your personal quote on WhatsApp";
    box.insertBefore(banner, box.firstChild);
    const fields = Array.from(form.querySelectorAll('input[required], textarea[required], select[required]')).filter(f => f.offsetParent !== null);
    const submit = form.querySelector('button[type="submit"]');
    const tip = document.createElement('div'); tip.className = 'form-guide-tip'; tip.setAttribute('aria-hidden', 'true');
    let typing = null;
    function clearTargets() { form.querySelectorAll('.guide-target').forEach(n => n.classList.remove('guide-target')); }
    function next() {
      clearTargets();
      const todo = fields.find(f => !String(f.value || '').trim());
      if (todo) {
        const holder = todo.closest('.field') || todo.parentElement;
        holder.classList.add('guide-target'); tip.className = 'form-guide-tip'; tip.textContent = tipText(todo); holder.appendChild(tip);
      } else if (submit) {
        tip.className = 'form-guide-tip inline'; tip.textContent = '👆 Tap here to send your enquiry'; submit.parentNode.insertBefore(tip, submit);
      }
    }
    function typePlaceholder(input) {
      const orig = input.placeholder; const phrase = tipText(input).replace(/^\S+\s/, '') + '…'; let i = 0;
      typing = setInterval(function () {
        input.placeholder = phrase.slice(0, ++i) + '▏';
        if (i >= phrase.length) { clearInterval(typing); typing = null; setTimeout(function () { input.placeholder = orig; }, 1400); }
      }, 55);
      return orig;
    }
    const first = fields.find(f => !String(f.value || '').trim());
    const origPh = first ? typePlaceholder(first) : '';
    setTimeout(function () { if (first) first.focus({ preventScroll: true }); }, 700);
    next();
    const onInput = function () { next(); };
    form.addEventListener('input', onInput);
    const timers = [setTimeout(function () { box.classList.remove('form-spotlight'); }, 4000)];
    function cleanup() {
      form.removeEventListener('input', onInput); form.removeEventListener('submit', cleanup);
      if (typing) clearInterval(typing);
      if (first && origPh !== undefined && first.placeholder.indexOf('▏') !== -1) first.placeholder = origPh;
      clearTargets(); tip.remove(); banner.remove(); box.classList.remove('form-spotlight'); timers.forEach(clearTimeout); guideCleanup = null;
    }
    form.addEventListener('submit', cleanup);
    timers.push(setTimeout(cleanup, 45000));
    guideCleanup = cleanup;
  }

  function guideTo(id) {
    const box = document.getElementById(id); if (!box) return false;
    const form = box.querySelector('form'); if (!form) return false;
    const header = document.getElementById('siteHeader');
    const y = box.getBoundingClientRect().top + window.scrollY - ((header ? header.offsetHeight : 0) + 14);
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    runGuide(box, form);
    return true;
  }
  window.dhartiGuideToForm = guideTo;

  document.addEventListener('click', function (e) {
    const a = e.target.closest('a[href*="#"]'); if (!a) return;
    const href = a.getAttribute('href'); const hash = href.slice(href.indexOf('#') + 1);
    if (!GUIDE_IDS[hash]) return;
    const clean = p => p.replace(/index\.html$/, '').replace(/\/$/, '');
    const same = href.charAt(0) === '#' || clean(a.pathname) === clean(location.pathname);
    if (!same) return;
    if (guideTo(hash)) e.preventDefault();
  });
  if (location.hash && GUIDE_IDS[location.hash.slice(1)]) {
    const id = location.hash.slice(1); let tries = 0;
    const t = setInterval(function () { if (guideTo(id) || ++tries > 30) clearInterval(t); }, 300);
  }

  /* ---------- phone bottom bar ---------- */
  const IC = {
    call: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    wa: '<svg viewBox="0 0 32 32" fill="currentColor"><path d="M16.003 3C9.376 3 4 8.373 4 15c0 2.394.63 4.61 1.83 6.556L4 29l7.66-1.8A11.95 11.95 0 0 0 16.003 27C22.63 27 28 21.627 28 15S22.63 3 16.003 3zm0 21.7a9.66 9.66 0 0 1-4.93-1.35l-.354-.21-4.545 1.07 1.08-4.43-.23-.36A9.63 9.63 0 0 1 6.3 15c0-5.352 4.352-9.7 9.703-9.7 5.352 0 9.7 4.348 9.7 9.7 0 5.353-4.348 9.7-9.7 9.7zm5.32-7.264c-.29-.146-1.716-.847-1.982-.943-.266-.097-.46-.146-.653.146-.194.293-.75.943-.92 1.137-.17.194-.34.218-.63.073-.29-.146-1.224-.451-2.332-1.437-.862-.768-1.444-1.716-1.613-2.008-.17-.293-.018-.451.128-.596.132-.13.29-.34.435-.51.145-.17.194-.293.29-.487.097-.194.049-.365-.024-.51-.073-.146-.653-1.574-.895-2.156-.236-.567-.475-.49-.653-.5-.17-.008-.363-.01-.556-.01-.194 0-.51.073-.777.365-.266.293-1.016.994-1.016 2.423 0 1.43 1.04 2.812 1.185 3.006.146.194 2.048 3.128 4.964 4.387.694.3 1.235.48 1.657.614.696.222 1.33.19 1.83.115.558-.083 1.716-.702 1.958-1.38.242-.68.242-1.26.17-1.38-.073-.122-.266-.194-.556-.34z"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v13"/></svg>',
    enquire: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>'
  };
  function buildBar() {
    if (document.getElementById('mbar')) return;
    const bar = document.createElement('nav');
    bar.id = 'mbar'; bar.className = 'mbar'; bar.setAttribute('aria-label', 'Quick actions');
    const waMsg = encodeURIComponent('Hi Dharti Holidays, I need help planning a trip.');
    bar.innerHTML =
      '<button type="button" data-mbar="call">' + IC.call + '<span>Call</span></button>' +
      '<a class="mbar-wa" href="https://wa.me/' + WA_NUMBER + '?text=' + waMsg + '" target="_blank" rel="noopener noreferrer">' + IC.wa + '<span>WhatsApp</span></a>' +
      '<button type="button" data-wa-share>' + IC.share + '<span>Share</span></button>' +
      '<button type="button" class="mbar-primary" data-mbar="enquire" hidden>' + IC.enquire + '<span>Enquire</span></button>' +
      '<div class="mbar-callmenu" hidden><a href="tel:+919374615071">📞 +91 93746 15071</a><a href="tel:+919879752230">📞 +91 98797 52230</a></div>';
    document.body.appendChild(bar);
    const menu = bar.querySelector('.mbar-callmenu'), enq = bar.querySelector('[data-mbar="enquire"]');
    bar.querySelector('[data-mbar="call"]').addEventListener('click', function (e) { e.stopPropagation(); menu.hidden = !menu.hidden; });
    document.addEventListener('click', function (e) { if (!bar.contains(e.target)) menu.hidden = true; });
    enq.addEventListener('click', function () { const id = firstGuideId(); if (id) guideTo(id); });
    function refresh() { enq.hidden = !firstGuideId(); }
    refresh();
    new MutationObserver(refresh).observe(document.body, { childList: true, subtree: true });
  }
  buildBar();

  /* ---------- keyboard open: hide the bottom bar so it never covers the field being typed in ---------- */
  document.addEventListener('focusin', function (e) { if (e.target.matches && e.target.matches('input, textarea, select')) document.body.classList.add('is-typing'); });
  document.addEventListener('focusout', function () { setTimeout(function () { const a = document.activeElement; if (!(a && a.matches && a.matches('input, textarea, select'))) document.body.classList.remove('is-typing'); }, 120); });

  /* ---------- header: strip follows scroll direction; active service scrolled into view ---------- */
  const header = document.getElementById('siteHeader');
  const strip = header && header.querySelector('.nav-links');
  const active = strip && strip.querySelector('.nav-pill-highlight');
  if (active) strip.scrollLeft = Math.max(0, active.offsetLeft - (strip.clientWidth - active.offsetWidth) / 2);
  let lastY = window.scrollY;
  window.addEventListener('scroll', function () {
    const y = window.scrollY;
    if (header) header.classList.toggle('nav-hidden', y > lastY + 4 && y > 160 ? true : (y < lastY - 4 ? false : header.classList.contains('nav-hidden')));
    lastY = y;
  }, { passive: true });
})();
