// === CONFIGURAZIONE ===
const imageFolder = 'immagini/';
const imageFiles = ['Panettone.jpg', 'The_Blues.jpg'];
// Glow dinamico: imposta il colore glow del bottone in base all'immagine sottostante
// Richiede Color Thief: <script src="https://cdnjs.cloudflare.com/ajax/libs/color-thief/2.3.2/color-thief.umd.js"></script>
// ...existing code...
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


// === CENTRATURA ROBUSTA DELLA TENDINA ===
// Alcuni browser/Bootstrap/Popper possono applicare stili inline. Per sicurezza, ricalcoliamo la posizione
// quando la tendina è stata mostrata (shown.bs.dropdown) e quando la finestra cambia dimensione o scrolla.

function positionDropdownCentered(dropdown) {
  const btn = dropdown.querySelector('[data-bs-toggle="dropdown"]');
  const menu = dropdown.querySelector('.dropdown-menu');
  if (!btn || !menu) return;

  // assicuriamoci che la menu sia visibile per poter calcolare le dimensioni
  // Bootstrap aggiunge la classe .show; usiamo shown.bs.dropdown event per questo
  const rect = btn.getBoundingClientRect();
  const menuWidth = menu.offsetWidth;
  // posizione in pagina (considera scroll)
  const left = rect.left + (rect.width / 2) - (menuWidth / 2) + window.scrollX;
  const top = rect.bottom + 8 + window.scrollY; // 8px gap

  // Applica le coordinate in pixel (queste sovrascrivono gli inline di Popper)
  menu.style.position = 'absolute';
  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
  menu.style.transform = 'none';
  menu.style.right = 'auto';
  // z-index già nel CSS
}

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
