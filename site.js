(() => {
  'use strict';

  const GW = window.GW || {};
  const gallery = Array.isArray(window.GW_GALLERY) ? window.GW_GALLERY : [];
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const pad = n => String(n).padStart(3, '0');
  const photo = n => gallery[n - 1];
  const page = document.body.dataset.page || '';

  document.documentElement.classList.add('js');

  // Header / mobile navigation
  const header = $('.site-header');
  const menuButton = $('.menu-btn');
  const nav = $('.nav');
  const syncHeader = () => header && header.classList.toggle('scrolled', window.scrollY > 18);
  if (header) {
    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });
  }
  if (menuButton && nav) {
    const closeMenu = () => {
      nav.classList.remove('open');
      menuButton.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    };
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuButton.classList.toggle('open', open);
      menuButton.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('nav-open', open);
    });
    $$('a', nav).forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  }

  // Current navigation item
  $$('[data-nav]').forEach(link => {
    if (link.dataset.nav === page) link.setAttribute('aria-current', 'page');
  });

  // Home hero slideshow — Bridal Harmony-style image-first rotation
  const heroSlider = $('[data-hero-slider]');
  if (heroSlider) {
    const slides = $$('.hero-slide', heroSlider);
    const currentLabel = $('[data-hero-current]', heroSlider);
    const progress = $('[data-hero-progress]', heroSlider);
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let heroIndex = 0;
    let heroTimer = null;

    const restartHeroProgress = () => {
      if (!progress || reduceMotion) return;
      progress.style.animation = 'none';
      void progress.offsetWidth;
      progress.style.animation = 'gwHeroProgress 10s linear infinite';
    };

    const showHeroSlide = index => {
      if (!slides.length) return;
      heroIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === heroIndex));
      if (currentLabel) currentLabel.textContent = String(heroIndex + 1).padStart(2, '0');
      restartHeroProgress();
    };

    if (!reduceMotion && slides.length > 1) {
      heroTimer = window.setInterval(() => showHeroSlide(heroIndex + 1), 10000);
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          clearInterval(heroTimer);
          heroTimer = null;
        } else if (!heroTimer) {
          heroTimer = window.setInterval(() => showHeroSlide(heroIndex + 1), 10000);
          restartHeroProgress();
        }
      });
    }
  }

  // Reveal animation, progressive-enhancement safe
  const revealAll = () => $$('.reveal').forEach(el => el.classList.add('in'));
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .08, rootMargin: '0px 0px -32px' });
    $$('.reveal').forEach(el => observer.observe(el));
  } else revealAll();

  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  // Shared media modal
  const modal = document.createElement('div');
  modal.className = 'media-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Media viewer');
  modal.innerHTML = `
    <div class="media-modal-inner">
      <button class="modal-close" type="button" aria-label="Close media viewer">×</button>
      <button class="modal-prev" type="button" aria-label="Previous photograph">‹</button>
      <div class="modal-content"></div>
      <button class="modal-next" type="button" aria-label="Next photograph">›</button>
      <div class="modal-counter" aria-live="polite"></div>
    </div>`;
  document.body.appendChild(modal);

  const modalContent = $('.modal-content', modal);
  const modalPrev = $('.modal-prev', modal);
  const modalNext = $('.modal-next', modal);
  const modalCounter = $('.modal-counter', modal);
  const modalClose = $('.modal-close', modal);
  let modalSet = [];
  let modalIndex = 0;
  let modalMode = 'image';
  let previousFocus = null;

  function showImageAt(index) {
    if (!modalSet.length) return;
    modalIndex = (index + modalSet.length) % modalSet.length;
    const image = modalSet[modalIndex];
    modalMode = 'image';
    modalContent.innerHTML = `<img src="${image.full || image.thumb}" alt="${image.alt || 'Wedding photograph'}">`;
    modalPrev.hidden = modalSet.length < 2;
    modalNext.hidden = modalSet.length < 2;
    modalCounter.hidden = false;
    modalCounter.textContent = `${modalIndex + 1} / ${modalSet.length}`;
  }
  function openImages(set, index = 0) {
    previousFocus = document.activeElement;
    modalSet = set;
    showImageAt(index);
    modal.classList.add('open');
    document.body.classList.add('modal-open');
    modalClose.focus({ preventScroll: true });
  }
  function openVideo(src) {
    previousFocus = document.activeElement;
    modalMode = 'video';
    modalContent.innerHTML = `<video src="${src}" controls autoplay playsinline preload="metadata"></video>`;
    modalPrev.hidden = true;
    modalNext.hidden = true;
    modalCounter.hidden = true;
    modal.classList.add('open');
    document.body.classList.add('modal-open');
    modalClose.focus({ preventScroll: true });
  }
  function closeModal() {
    const vid = $('video', modalContent);
    if (vid) vid.pause();
    modal.classList.remove('open');
    document.body.classList.remove('modal-open');
    modalContent.innerHTML = '';
    if (previousFocus && previousFocus.focus) previousFocus.focus({ preventScroll: true });
  }
  modalClose.addEventListener('click', closeModal);
  modalPrev.addEventListener('click', () => showImageAt(modalIndex - 1));
  modalNext.addEventListener('click', () => showImageAt(modalIndex + 1));
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') closeModal();
    if (modalMode === 'image' && e.key === 'ArrowLeft') showImageAt(modalIndex - 1);
    if (modalMode === 'image' && e.key === 'ArrowRight') showImageAt(modalIndex + 1);
  });

  // Film buttons on any page
  $$('[data-video]').forEach(button => button.addEventListener('click', () => openVideo(button.dataset.video)));

  // Shared story-card renderer
  function storyCard(story, compact = false) {
    const cover = photo(story.cover);
    if (!cover) return '';
    return `<a class="story-card ${compact ? 'compact' : ''} reveal" href="story.html?id=${encodeURIComponent(story.id)}" data-category="${story.category}">
      <img src="${cover.thumb}" alt="${cover.alt}" loading="lazy" decoding="async">
      <div class="story-card-content">
        <div><small>${story.number} · ${story.category}</small><h3>${story.title}</h3></div>
        <span class="arrow" aria-hidden="true">↗</span>
      </div>
    </a>`;
  }

  // Homepage
  if (page === 'home') {
    const homeStories = $('#homeStories');
    if (homeStories) { homeStories.innerHTML = GW.stories.slice(0, 6).map(s => storyCard(s)).join(''); $$('.reveal', homeStories).forEach(el => el.classList.add('in')); }

    const collectionRail = $('#collectionRail');
    if (collectionRail) {
      collectionRail.innerHTML = GW.packages.map(group => {
        const min = Math.min(...group.items.map(item => item.price));
        return `<a class="collection-panel" href="packages.html#${group.key}" data-num="${group.number}">
          <small>Collection ${group.number}</small>
          <h3>${group.title}</h3>
          <p>${group.short}</p>
          <div class="collection-price"><span>Starting from</span><b>${GW.money(min)}</b></div>
        </a>`;
      }).join('');
      $$('.reveal', collectionRail).forEach(el => el.classList.add('in'));
    }
    // Observe elements injected after initial observer pass
    requestAnimationFrame(() => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) revealAll();
      else $$('.reveal:not(.in)').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < innerHeight * .95) el.classList.add('in');
      });
    });
  }

  // Packages page
  if (page === 'packages') {
    const root = $('#packageGroups');
    if (root) {
      root.innerHTML = GW.packages.map(group => `
        <section class="package-group" id="${group.key}">
          <div class="package-group-head reveal">
            <div class="package-group-number">${group.number}</div>
            <div><p class="eyebrow dark">Wedding Collection</p><h2>${group.title}</h2><p>${group.short}</p></div>
          </div>
          <div class="package-list">
            ${group.items.map(item => `
              <article class="package-card reveal">
                <div class="package-card-title">
                  <small>${group.title}</small>
                  <h3>${item.name}</h3>
                  <p>${item.kicker}</p>
                </div>
                <ul class="package-features">${item.features.map(feature => `<li>${feature}</li>`).join('')}</ul>
                <div class="package-action">
                  <span>Package price</span>
                  <strong>${GW.money(item.price)}</strong>
                  <small>50% booking advance · ${GW.money(item.price / 2)}</small>
                  <a class="btn btn-dark" href="book.html?package=${encodeURIComponent(item.slug)}">Select Package</a>
                </div>
              </article>`).join('')}
          </div>
        </section>`).join('');
      $$('.reveal', root).forEach(el => el.classList.add('in'));
    }
  }

  // Photography page: story filters + complete supplied archive
  if (page === 'photography') {
    const storiesRoot = $('#portfolioStories');
    const archive = $('#archiveGrid');
    const count = $('#archiveCount');
    const categories = ['All', ...new Set(GW.stories.map(story => story.category))];
    const filterRoot = $('#storyFilters');

    const renderStories = category => {
      const set = category === 'All' ? GW.stories : GW.stories.filter(s => s.category === category);
      storiesRoot.innerHTML = set.map(story => storyCard(story, true)).join('');
      $$('.reveal', storiesRoot).forEach(el => el.classList.add('in'));
    };
    if (filterRoot) {
      filterRoot.innerHTML = categories.map((category, i) => `<button class="filter-btn ${i === 0 ? 'active' : ''}" type="button" data-filter="${category}">${category}</button>`).join('');
      filterRoot.addEventListener('click', e => {
        const button = e.target.closest('[data-filter]');
        if (!button) return;
        $$('.filter-btn', filterRoot).forEach(b => b.classList.toggle('active', b === button));
        renderStories(button.dataset.filter);
      });
    }
    if (storiesRoot) renderStories('All');

    if (archive) {
      archive.innerHTML = gallery.map((image, index) => `<button class="gallery-item" type="button" data-archive-index="${index}" aria-label="Open wedding photograph ${index + 1}"><img src="${image.thumb}" alt="${image.alt}" loading="lazy" decoding="async" width="${image.w}" height="${image.h}"></button>`).join('');
      archive.addEventListener('click', e => {
        const item = e.target.closest('[data-archive-index]');
        if (item) openImages(gallery, Number(item.dataset.archiveIndex));
      });
    }
    if (count) count.textContent = gallery.length;
  }

  // Story detail page
  if (page === 'story') {
    const params = new URLSearchParams(location.search);
    const storyId = params.get('id') || GW.stories[0]?.id;
    const story = GW.stories.find(s => s.id === storyId);
    const root = $('#storyPage');
    if (!story || !root) {
      root.innerHTML = '<div class="empty-state container"><h1>Story not found.</h1><p>This gallery may have moved.</p><a class="btn btn-dark" href="photography.html">Back to Photography</a></div>';
    } else {
      const storyImages = gallery.slice(story.start - 1, story.end);
      const cover = photo(story.cover) || storyImages[0];
      document.title = `${story.title} | Grand Wedding Photography`;
      root.innerHTML = `
        <section class="story-detail-hero">
          <img src="${cover.full || cover.thumb}" alt="${cover.alt}" fetchpriority="high">
          <div class="story-detail-copy">
            <p class="eyebrow">Wedding Story ${story.number}</p>
            <h1>${story.title}</h1>
            <div class="story-meta"><span>${story.category}</span><span>•</span><span>${storyImages.length} photographs</span><span>•</span><span>Grand Wedding Photography</span></div>
          </div>
        </section>
        <section class="section">
          <div class="container">
            <div class="story-detail-intro reveal"><h2>One celebration,<br>told in sequence.</h2><p>${story.blurb} This story is part of the supplied Grand Wedding portfolio and is presented as a complete visual sequence rather than a handful of disconnected highlights.</p></div>
            <div class="story-gallery" id="storyGallery">
              ${storyImages.map((image, index) => `<button class="gallery-item ${index % 7 === 0 || index % 7 === 1 ? 'wide' : ''}" type="button" data-story-index="${index}" aria-label="Open ${image.alt}"><img src="${image.thumb}" alt="${image.alt}" loading="lazy" decoding="async" width="${image.w}" height="${image.h}"></button>`).join('')}
            </div>
          </div>
        </section>`;
      $('#storyGallery').addEventListener('click', e => {
        const item = e.target.closest('[data-story-index]');
        if (item) openImages(storyImages, Number(item.dataset.storyIndex));
      });
      $$('.reveal', root).forEach(el => el.classList.add('in'));
    }
  }

  // Book page
  if (page === 'book') {
    const select = $('#packageSelect');
    const selectedName = $('#selectedPackageName');
    const total = $('#packageTotal');
    const advance = $('#packageAdvance');
    const balance = $('#packageBalance');
    const eventRoot = $('#eventsRoot');
    const eventCountOutput = $('#eventCount');
    const form = $('#bookingForm');
    let eventCount = 1;

    if (select) {
      select.innerHTML = `<option value="">Choose a package</option>` + GW.packages.map(group => `<optgroup label="${group.title}">${group.items.map(item => `<option value="${item.slug}" data-price="${item.price}" data-name="${item.name}" data-group="${group.title}">${item.name} — ${GW.money(item.price)}</option>`).join('')}</optgroup>`).join('');
      const wanted = new URLSearchParams(location.search).get('package');
      if (wanted && GW.allPackages.some(item => item.slug === wanted)) select.value = wanted;
    }

    const renderPackageSummary = () => {
      const option = select.selectedOptions[0];
      const price = Number(option?.dataset.price || 0);
      const name = option?.dataset.name || 'Choose a collection';
      selectedName.textContent = price ? `${option.dataset.group} · ${name}` : name;
      total.textContent = price ? GW.money(price) : '—';
      advance.textContent = price ? GW.money(price / 2) : '—';
      balance.textContent = price ? GW.money(price / 2) : '—';
    };
    select?.addEventListener('change', renderPackageSummary);
    renderPackageSummary();

    const eventTypes = ['Wedding / Reception', 'Holud / Mehendi', 'Engagement / Akdh', 'Pre-Wedding / Outdoor', 'Bridal Portrait Session', 'Other'];
    const renderEvents = () => {
      eventCountOutput.textContent = String(eventCount);
      eventRoot.innerHTML = Array.from({ length: eventCount }, (_, i) => `
        <div class="event-card">
          <div class="event-card-title"><strong>Event ${String(i + 1).padStart(2, '0')}</strong><span>Date · Shift · Venue</span></div>
          <div class="form-grid">
            <label class="field"><span>Event type</span><select name="eventType${i + 1}" required><option value="">Select</option>${eventTypes.map(t => `<option>${t}</option>`).join('')}</select></label>
            <label class="field"><span>Event date</span><input type="date" name="eventDate${i + 1}" required></label>
            <label class="field"><span>Shift</span><select name="eventShift${i + 1}"><option value="">Select</option><option>Day</option><option>Evening</option><option>Night</option><option>Full day / To discuss</option></select></label>
            <label class="field"><span>Venue / location</span><input name="eventVenue${i + 1}" placeholder="Venue or area"></label>
          </div>
        </div>`).join('');
      const today = new Date();
      const min = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
      $$('input[type="date"]', eventRoot).forEach(input => input.min = min);
    };
    $('#eventMinus')?.addEventListener('click', () => { if (eventCount > 1) { eventCount--; renderEvents(); } });
    $('#eventPlus')?.addEventListener('click', () => { if (eventCount < 4) { eventCount++; renderEvents(); } });
    renderEvents();

    form?.addEventListener('submit', e => {
      e.preventDefault();
      if (!select.value) { select.focus(); return; }
      const data = new FormData(form);
      const option = select.selectedOptions[0];
      const price = Number(option.dataset.price);
      const lines = [
        'Hello Grand Wedding Photography,',
        '',
        'I would like to check availability for a wedding booking.',
        '',
        `Package: ${option.dataset.name}`,
        `Collection: ${option.dataset.group}`,
        `Package price: ${GW.money(price)}`,
        `50% booking advance: ${GW.money(price / 2)}`,
        `Remaining balance: ${GW.money(price / 2)}`,
        '',
        `Client name: ${data.get('name')}`,
        `Phone: ${data.get('phone')}`,
        `Alternate / WhatsApp: ${data.get('alternatePhone') || 'Same as phone'}`,
        `Email: ${data.get('email') || 'Not provided'}`,
        `Bride name: ${data.get('bride') || 'Not provided'}`,
        `Groom name: ${data.get('groom') || 'Not provided'}`,
        '',
        `Total events: ${eventCount}`
      ];
      for (let i = 1; i <= eventCount; i++) {
        lines.push('', `Event ${i}: ${data.get(`eventType${i}`) || 'Not specified'}`, `Date: ${data.get(`eventDate${i}`) || 'Not specified'}`, `Shift: ${data.get(`eventShift${i}`) || 'Not specified'}`, `Venue: ${data.get(`eventVenue${i}`) || 'Not specified'}`);
      }
      lines.push('', `Additional notes: ${data.get('notes') || 'None'}`, '', 'Please confirm availability and the final booking details.');
      window.open(`https://wa.me/${GW.brand.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
    });
  }

  // Contact form -> WhatsApp message
  if (page === 'contact') {
    const form = $('#contactForm');
    form?.addEventListener('submit', e => {
      e.preventDefault();
      const data = new FormData(form);
      const message = `Hello Grand Wedding Photography,\n\nName: ${data.get('name')}\nPhone: ${data.get('phone')}\nEmail: ${data.get('email') || 'Not provided'}\n\nMessage: ${data.get('message')}`;
      window.open(`https://wa.me/${GW.brand.whatsapp}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
    });
  }
})();
