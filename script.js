const packageData = [
  {
    key: 'senior',
    number: '01',
    title: 'Senior Package',
    intro: 'Straightforward photo and film coverage for couples who want a focused team and clean deliverables.',
    items: [
      { name: 'Only Photography', price: 4999, subtitle: 'Photography only', features: ['1 Senior Photographer', 'Unlimited Photoshoot', '50 Edited Photos', '4.5–5 Hours Shoot'] },
      { name: 'Only Cinematography', price: 5999, subtitle: 'Cinematography only', features: ['1 Senior Cinematographer', 'Unlimited Video Shoot', 'Cinematic Video Edit + Raw', '4.5–5 Hours Shoot'] },
      { name: 'Combo Package 01', price: 9999, subtitle: 'Photo + cinematic film', features: ['1 Senior Photographer', '1 Senior Cinematographer', 'Unlimited Photo & Video Shoot', '60 Edited Photos', 'Cinematic Trailer + Cinematic Video Edit + Raw', '4.5–5 Hours Shoot'] },
      { name: 'Combo Package 02', price: 14999, subtitle: 'Expanded photo team + film', features: ['2 Senior Photographers', '1 Senior Cinematographer', 'Unlimited Photo & Video Shoot', '100 Edited Photos', 'Cinematic Trailer + Cinematic Video Edit + Raw', '4.5–5 Hours Shoot'] },
      { name: 'Combo Package 03', price: 18499, subtitle: 'Fuller photo + film crew', features: ['2 Senior Photographers', '2 Senior Cinematographers', 'Unlimited Photo & Video Shoot', '100 Edited Photos', 'Cinematic Trailer + Cinematic Video Edit + Raw', '4.5–5 Hours Shoot'] }
    ]
  },
  {
    key: 'elegant',
    number: '02',
    title: 'Elegant Series',
    intro: 'A richer collection with printed photographs, albums, and more complete wedding keepsakes.',
    items: [
      { name: 'Elegant Photography', price: 6999, subtitle: 'Photography + printed keepsakes', features: ['1 Core Photographer', '4.5 Hours of Venue Coverage', '100 Edited Pictures', '100 Printed Pictures', 'Photo Album', 'All Raw Photo and Video'] },
      { name: 'Elegant Combo 1', price: 12999, subtitle: 'Core photo + film coverage', features: ['1 Core Photographer', '1 Core Cinematographer', '4.5 Hours of Venue Coverage', '100 Edited Pictures', '100 Printed Pictures', 'Promo and Main Movie', 'Photo Album', 'All Raw Photo and Video'] },
      { name: 'Elegant Combo 2', price: 16999, subtitle: 'Expanded photography support', features: ['1 Core Photographer', '1 Senior Photographer', '1 Senior Cinematographer', '4.5 Hours of Venue Coverage', '100 Edited Pictures', '100 Printed Pictures', 'Promo and Main Movie', 'Photo Album', 'All Raw Photo and Video'] },
      { name: 'Elegant Combo 3', price: 21999, subtitle: 'Larger cinema team + more photographs', features: ['1 Core Photographer', '1 Senior Photographer', '2 Senior Cinematographers', '4.5 Hours of Venue Coverage', '150 Edited Pictures', '150 Printed Pictures', 'Promo and Main Movie', 'Photo Album', 'All Raw Photo and Video'] }
    ]
  },
  {
    key: 'signature',
    number: '03',
    title: 'Signature Package',
    intro: 'The premium collection for couples who want a larger creative team and a dedicated portrait-led experience.',
    items: [
      { name: 'Signature Series Combo 1', price: 34999, subtitle: 'Premium portrait-led coverage', features: ['1 Chief Photographer', '3 Hours Exclusive Portrait Session', '2 Senior Photographers', '2 Senior Cinematographers', '5 Hours Shifting Time', '200 Edited and Printed Photos', 'Exclusive Trailer and Cinematography'] },
      { name: 'Signature Series Combo 2', price: 44999, subtitle: 'Longer portrait session + album', features: ['1 Chief Photographer', '5 Hours Exclusive Portrait Session', '3 Senior Photographers', '2 Senior Cinematographers', '5 Hours Shifting Time', '200 Edited and Printed Photos', 'Exclusive Photo Album', 'Exclusive Trailer and Cinematography'] },
      { name: 'Signature Series Combo 3', price: 49999, subtitle: 'The fullest Signature crew', features: ['1 Chief Photographer', '5 Hours Exclusive Portrait Session', '3 Senior Photographers', '3 Senior Cinematographers', '5 Hours Shifting Time', '200 Edited and Printed Photos', 'Exclusive Photo Album', 'Exclusive Trailer and Cinematography'] }
    ]
  }
];

const allPackages = packageData.flatMap(group => group.items.map(item => ({ ...item, group: group.title })));
const money = value => {
  const whole = Number.isInteger(value);
  return `৳${value.toLocaleString('en-US', { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 })}`;
};

const packageGroups = document.querySelector('#packageGroups');
packageGroups.innerHTML = packageData.map(group => `
  <section class="package-group package-group-${group.key}" aria-labelledby="package-${group.key}">
    <div class="package-group-head reveal">
      <div class="package-group-number">${group.number}</div>
      <div>
        <p class="eyebrow dark">Collection</p>
        <h3 id="package-${group.key}">${group.title}</h3>
        <p>${group.intro}</p>
      </div>
    </div>
    <div class="package-list">
      ${group.items.map((item, index) => `
        <article class="package-card reveal">
          <div class="package-card-title">
            <span class="package-index">${String(index + 1).padStart(2, '0')}</span>
            <div>
              <small>${group.title}</small>
              <h4>${item.name}</h4>
              <p>${item.subtitle}</p>
            </div>
          </div>
          <div class="package-features-wrap">
            <ul class="package-features">
              ${item.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
          </div>
          <div class="package-card-action">
            <span>Package price</span>
            <strong>${money(item.price)}</strong>
            <button class="select-package" type="button" data-package="${item.name}">Select This Package <span>↓</span></button>
          </div>
        </article>
      `).join('')}
    </div>
  </section>
`).join('');

const packageSelect = document.querySelector('#packageSelect');
packageSelect.innerHTML += allPackages.map(item => `<option value="${item.name}" data-price="${item.price}" data-group="${item.group}">${item.group} — ${item.name} (${money(item.price)})</option>`).join('');

const totalPrice = document.querySelector('#totalPrice');
const advancePrice = document.querySelector('#advancePrice');
const balancePrice = document.querySelector('#balancePrice');
const selectedPackageSummary = document.querySelector('#selectedPackageSummary');

function updatePriceSummary() {
  const option = packageSelect.selectedOptions[0];
  const price = Number(option?.dataset.price || 0);
  const group = option?.dataset.group || '';
  if (!price) {
    totalPrice.textContent = '—';
    advancePrice.textContent = '—';
    balancePrice.textContent = '—';
    selectedPackageSummary.innerHTML = '<span>Selected package</span><strong>Choose a package below</strong>';
    return;
  }
  const advance = price / 2;
  totalPrice.textContent = money(price);
  advancePrice.textContent = money(advance);
  balancePrice.textContent = money(price - advance);
  selectedPackageSummary.innerHTML = `<span>${group}</span><strong>${packageSelect.value} · ${money(price)}</strong>`;
}
packageSelect.addEventListener('change', updatePriceSummary);

packageGroups.addEventListener('click', event => {
  const button = event.target.closest('.select-package');
  if (!button) return;
  packageSelect.value = button.dataset.package;
  updatePriceSummary();
  document.querySelector('#booking').scrollIntoView({ behavior: 'smooth', block: 'start' });
  window.setTimeout(() => packageSelect.focus({ preventScroll: true }), 700);
});

const dateInput = document.querySelector('input[name="date"]');
const today = new Date();
const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];
dateInput.min = localDate;

document.querySelector('#bookingForm').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const option = packageSelect.selectedOptions[0];
  const price = Number(option?.dataset.price || 0);
  if (!price) {
    packageSelect.focus();
    return;
  }
  const advance = price / 2;
  const lines = [
    'Hello Grand Wedding Photography,',
    '',
    'I would like to check availability for my event.',
    '',
    `Name: ${data.get('name')}`,
    `Phone: ${data.get('phone')}`,
    `Email: ${data.get('email') || 'Not provided'}`,
    `Event date: ${data.get('date')}`,
    `Event type: ${data.get('eventType')}`,
    `Preferred shift: ${data.get('shift') || 'Not specified'}`,
    `Venue / location: ${data.get('venue') || 'Not specified'}`,
    `Package: ${data.get('package')}`,
    `Package price: ${money(price)}`,
    `50% booking advance: ${money(advance)}`,
    `Remaining balance: ${money(price - advance)}`,
    `Notes: ${data.get('notes') || 'None'}`
  ];
  const url = `https://wa.me/8801798060902?text=${encodeURIComponent(lines.join('\n'))}`;
  window.open(url, '_blank', 'noopener');
});

// Full supplied image set
const galleryImages = Array.isArray(window.GW_GALLERY) ? window.GW_GALLERY : [];
const galleryGrid = document.querySelector('#galleryGrid');
document.querySelector('#galleryCount').textContent = galleryImages.length;
galleryGrid.innerHTML = galleryImages.map((image, index) => `
  <button class="gallery-item" type="button" data-index="${index}" aria-label="Open wedding photograph ${index + 1}">
    <img src="${image.thumb}" alt="${image.alt}" loading="lazy" decoding="async" width="${image.w}" height="${image.h}" />
  </button>
`).join('');

const modal = document.querySelector('#mediaModal');
const modalBody = modal.querySelector('.modal-body');
const modalPrev = modal.querySelector('.modal-prev');
const modalNext = modal.querySelector('.modal-next');
const modalCounter = modal.querySelector('.modal-counter');
let currentImage = 0;
let modalMode = 'gallery';

function openGallery(index) {
  if (!galleryImages.length) return;
  currentImage = (index + galleryImages.length) % galleryImages.length;
  const image = galleryImages[currentImage];
  modalMode = 'gallery';
  modalBody.innerHTML = `<img src="${image.full}" alt="${image.alt}" />`;
  modalPrev.hidden = false;
  modalNext.hidden = false;
  modalCounter.hidden = false;
  modalCounter.textContent = `${currentImage + 1} / ${galleryImages.length}`;
  if (!modal.open) modal.showModal();
}

galleryGrid.addEventListener('click', event => {
  const item = event.target.closest('.gallery-item');
  if (item) openGallery(Number(item.dataset.index));
});

function openVideo(src) {
  modalMode = 'video';
  modalBody.innerHTML = `<video src="${src}" controls autoplay playsinline></video>`;
  modalPrev.hidden = true;
  modalNext.hidden = true;
  modalCounter.hidden = true;
  modal.showModal();
}

document.querySelectorAll('.film-card').forEach(button => button.addEventListener('click', () => openVideo(button.dataset.video)));
modal.querySelector('.modal-close').addEventListener('click', () => modal.close());
modalPrev.addEventListener('click', () => openGallery(currentImage - 1));
modalNext.addEventListener('click', () => openGallery(currentImage + 1));
modal.addEventListener('click', event => { if (event.target === modal) modal.close(); });
modal.addEventListener('keydown', event => {
  if (modalMode !== 'gallery') return;
  if (event.key === 'ArrowRight') openGallery(currentImage + 1);
  if (event.key === 'ArrowLeft') openGallery(currentImage - 1);
});
modal.addEventListener('close', () => { modalBody.innerHTML = ''; });

const menuButton = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');
menuButton.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuButton.classList.toggle('open', isOpen);
  menuButton.setAttribute('aria-expanded', String(isOpen));
  document.body.classList.toggle('nav-open', isOpen);
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('nav-open');
}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('open')) {
    nav.classList.remove('open');
    menuButton.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  }
});

const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 24), { passive: true });

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px' });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
} else {
  document.querySelectorAll('.reveal').forEach(element => element.classList.add('in'));
}

document.querySelector('#year').textContent = new Date().getFullYear();
