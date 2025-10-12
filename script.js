// === CONFIGURAZIONE ===
const imageFolder = 'immagini/';
const imageFiles = ['Panettone.jpg', 'The_Blues.jpg'];
// Glow dinamico: imposta il colore glow del bottone in base all'immagine sottostante
// Richiede Color Thief: <script src="https://cdnjs.cloudflare.com/ajax/libs/color-thief/2.3.2/color-thief.umd.js"></script>
// ...existing code...

// Animazione fluida dropdown custom
document.addEventListener('DOMContentLoaded', function () {
  const btn = document.getElementById('mainDropdownBtn');
  const menu = btn?.parentElement?.querySelector('.dropdown-menu');
  if (!btn || !menu) return;

  // Disabilita Bootstrap toggle
  btn.removeAttribute('data-bs-toggle');

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    menu.classList.toggle('show');
    btn.setAttribute('aria-expanded', menu.classList.contains('show'));
  });

  // Chiudi dropdown cliccando fuori
  document.addEventListener('click', function (e) {
    if (menu.classList.contains('show')) {
      menu.classList.remove('show');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
});
// Colori del glow per ogni immagine (corrispondenti agli index)
const glowColors = ['#00ff66', '#3399ff'];

// Velocità del carosello (ms)
const carouselSpeed = 4000;


// === GENERAZIONE DELLE SLIDE ===
const carouselInner = document.querySelector('#fullscreenCarousel .carousel-inner');
imageFiles.forEach((file, index) => {
  const div = document.createElement('div');
  div.classList.add('carousel-item');
  if (index === 0) div.classList.add('active');

  const img = document.createElement('img');
  img.src = imageFolder + file;
  img.alt = `Project ${index + 1}`;
  img.classList.add('d-block', 'w-100');

  // sfondo sempre nero sotto l'immagine
  img.style.backgroundColor = '#000';

  div.appendChild(img);
  carouselInner.appendChild(div);
});


// === INIZIALIZZA IL CAROSELLO ===
const carouselElement = document.querySelector('#fullscreenCarousel');
const carousel = new bootstrap.Carousel(carouselElement, {
  interval: carouselSpeed,
  ride: 'carousel',
  wrap: true
});

// Imposta glow sempre verde acceso
document.documentElement.style.setProperty('--glow', '#00ff00');
document.documentElement.style.setProperty('--bg', '#000'); // sfondo pagina iniziale


// Aggiorna glow durante il change (slide)
// Il glow resta sempre verde, non viene mai cambiato


// ...existing code...

// Applichiamo a tutti i dropdown nella pagina (ora ne abbiamo uno, ma è robusto)
document.querySelectorAll('.dropdown').forEach(dropdown => {
  const btn = dropdown.querySelector('[data-bs-toggle="dropdown"]');
  if (!btn) return;

  // quando la tendina è fully visible -> posiziona esattamente
  btn.addEventListener('shown.bs.dropdown', () => {
    positionDropdownCentered(dropdown);
  });

  // riconfigura posizione su resize/scroll se menu è aperto
  window.addEventListener('resize', () => {
    if (dropdown.querySelector('.dropdown-menu.show')) {
      positionDropdownCentered(dropdown);
    }
  });
  window.addEventListener('scroll', () => {
    if (dropdown.querySelector('.dropdown-menu.show')) {
      positionDropdownCentered(dropdown);
    }
  });
});
