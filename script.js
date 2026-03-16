document.addEventListener('DOMContentLoaded', () => {
    const navs = document.querySelectorAll('.pill-nav');

    navs.forEach(nav => {
        const background = nav.querySelector('.nav-background');
        const items = nav.querySelectorAll('.pill-nav-item');
        const activeItem = nav.querySelector('.pill-nav-item.active');

        function setBackgroundPosition(element) {
            if (!element) return;

            const left = element.offsetLeft;
            const top = element.offsetTop;
            const width = element.offsetWidth;
            const height = element.offsetHeight;

            background.style.width = `${width}px`;
            background.style.height = `${height}px`;
            background.style.transform = `translate(${left}px, ${top}px)`;
            background.style.opacity = '1';
        }

        // Initialize position
        if (activeItem) {
            // Wait a tick to ensure layout is settled
            requestAnimationFrame(() => {
                setBackgroundPosition(activeItem);
            });

            // Also update on window resize
            window.addEventListener('resize', () => setBackgroundPosition(nav.querySelector('.pill-nav-item.active')));
        }

        items.forEach(item => {
            item.addEventListener('mouseenter', () => {
                setBackgroundPosition(item);
            });
        });

        nav.addEventListener('mouseleave', () => {
            const currentActive = nav.querySelector('.pill-nav-item.active');
            setBackgroundPosition(currentActive);
        });
    });
});

// About Popup Toggle
// About Popup Toggle
document.addEventListener('DOMContentLoaded', function () {
    const aboutPopup = document.getElementById('aboutPopup');

    function togglePopup(e) {
        e.preventDefault();
        if (aboutPopup) {
            aboutPopup.classList.toggle('active');
        }
    }

    // Use event delegation for buttons
    document.addEventListener('click', function (e) {
        const toggleBtn = e.target.closest('#aboutToggle') || e.target.closest('#aboutToggleModal');
        if (toggleBtn) {
            togglePopup(e);
        }
    });

    // Close popup when clicking outside (on the backdrop)
    if (aboutPopup) {
        aboutPopup.addEventListener('click', function (e) {
            // If clicking on the backdrop itself (not the card inside)
            if (e.target === aboutPopup) {
                aboutPopup.classList.remove('active');
            }
        });
    }
});

// File Name Display Logic
document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.getElementById('fullscreenCarousel');
    const fileDisplay = document.getElementById('fileDisplay');

    if (!carousel || !fileDisplay) return;

    function updateFileName() {
        // Find the active item
        const activeItem = carousel.querySelector('.carousel-item.active');
        if (!activeItem) return;

        // Find img or video inside
        const media = activeItem.querySelector('img, video');
        if (!media) return;

        // Get src and extract filename
        const src = media.getAttribute('src');
        if (!src) return;

        // Extract filename from path (e.g. "immagini/Foto.jpg" -> "Foto.jpg")
        const filename = src.split('/').pop();

        // Remove extension
        const cleanName = filename.substring(0, filename.lastIndexOf('.')) || filename;

        // Update text
        fileDisplay.textContent = cleanName;
        fileDisplay.classList.add('visible');
    }

    // Initial update
    updateFileName();

    // Update on slide
    carousel.addEventListener('slid.bs.carousel', updateFileName);
});
