// Elenco file multimediali: immagini e video
const mediaFiles = [
  { type: 'image', src: 'Panettone.jpg' },
  { type: 'image', src: 'The_Blues.jpg' },
  // Esempio video: aggiungi i tuoi video nella cartella immagini/
  // { type: 'video', src: 'esempio.mp4' }
{ type: 'video', src: 'Giuseppe_Oliveri_Olivetti.mp4' } 
];

const imageFolder = 'immagini/';
const carouselInner = document.querySelector('#fullscreenCarousel .carousel-inner');

mediaFiles.forEach((file, index) => {
  const div = document.createElement('div');
  div.classList.add('carousel-item');
  if (index === 0) div.classList.add('active');

  if (file.type === 'image') {
    const img = document.createElement('img');
    img.src = imageFolder + file.src;
    img.alt = `Project ${index + 1}`;
    img.classList.add('d-block', 'w-100');
    img.style.backgroundColor = '#000';
    div.appendChild(img);
  } else if (file.type === 'video') {
    const video = document.createElement('video');
    video.src = imageFolder + file.src;
    video.classList.add('d-block', 'w-100');
    video.style.backgroundColor = '#000';
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.loop = false;
    video.preload = 'auto';
    video.onloadedmetadata = function() {
      if (video.duration > 7) video.currentTime = 0;
    };
    video.onplay = function() {
      if (video.duration > 60) {
        setTimeout(() => video.pause(), 30000);
      }
    };
    div.appendChild(video);
  }
  carouselInner.appendChild(div);
});

const carouselElement = document.querySelector('#fullscreenCarousel');
const carousel = new bootstrap.Carousel(carouselElement, {
  interval: 4000,
  ride: 'carousel',
  wrap: true
});

// ...existing code...
