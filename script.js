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

    // Randomize starting slide
    const items = carousel.querySelectorAll('.carousel-item');
    if (items.length > 0) {
        items.forEach(item => item.classList.remove('active'));
        const randomIndex = Math.floor(Math.random() * items.length);
        items[randomIndex].classList.add('active');
    }

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

// Initialize Feather icons
document.addEventListener('DOMContentLoaded', () => {
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
});

// Build Projects Grid Dynamically
document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('projectsGridContainer');
    if (!gridContainer) return;

    // Fetch the text file to map filenames to categories
    fetch('Info%20Immagini.txt')
        .then(response => {
            if (!response.ok) throw new Error("Could not load Info Immagini.txt");
            return response.text();
        })
        .then(text => {
            // Parse text file
            const lines = text.split('\n').map(line => line.trim()).filter(line => line);
            const categoryMap = {}; // { "Project Name": "Category" }
            lines.forEach(line => {
                const parts = line.split('->');
                if (parts.length === 2) {
                    categoryMap[parts[0].trim()] = parts[1].trim();
                }
            });

            // Get projects from the carousel
            const carouselLinks = document.querySelectorAll('#fullscreenCarousel .carousel-item img, #fullscreenCarousel .carousel-item video');
            
            // Group projects by category
            const categories = {};

            carouselLinks.forEach((media, index) => {
                const src = media.getAttribute('src');
                if (!src) return;
                
                const filename = src.split('/').pop();
                const title = filename.substring(0, filename.lastIndexOf('.')) || filename;
                const isVideo = media.tagName === 'VIDEO';
                
                const category = categoryMap[title] || 'Uncategorized';
                
                if (!categories[category]) {
                    categories[category] = [];
                }
                
                categories[category].push({
                    title: title,
                    category: category,
                    src: src,
                    isVideo: isVideo,
                    index: index
                });
            });

            // Render categories and tiles
            gridContainer.innerHTML = '';
            
            for (const [catName, projects] of Object.entries(categories)) {
                // Category wrapper
                const catDiv = document.createElement('div');
                catDiv.className = 'project-category mb-5';
                
                const catTitle = document.createElement('h3');
                catTitle.className = 'display-6 mb-4 fw-bold text-center';
                catTitle.textContent = catName;
                catDiv.appendChild(catTitle);
                
                const rowDiv = document.createElement('div');
                rowDiv.className = 'row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4';
                
                projects.forEach(proj => {
                    const colDiv = document.createElement('div');
                    colDiv.className = 'col';
                    
                    let thumbContent = '';
                    if (proj.isVideo) {
                        thumbContent = `<video src="${proj.src}" muted playsinline autoplay loop></video>`;
                    } else {
                        thumbContent = `<img src="${proj.src}" alt="${proj.title}">`;
                    }
                    
                    colDiv.innerHTML = `
                      <a href="#" class="project-card" data-carousel-index="${proj.index}">
                        <div class="project-thumb">
                          ${thumbContent}
                        </div>
                        <div class="project-info">
                          <h4 class="project-title">${proj.title}</h4>
                          <p class="project-cat">${proj.category}</p>
                        </div>
                      </a>
                    `;
                    rowDiv.appendChild(colDiv);
                });
                
                catDiv.appendChild(rowDiv);
                gridContainer.appendChild(catDiv);
            }

            // Add click listeners to project cards
            const cards = gridContainer.querySelectorAll('.project-card');
            cards.forEach(card => {
                card.addEventListener('click', (e) => {
                    e.preventDefault();
                    const index = parseInt(card.getAttribute('data-carousel-index'));
                    
                    // Hide the modal
                    const modalEl = document.getElementById('projectsModal');
                    const modalInstance = bootstrap.Modal.getInstance(modalEl);
                    if (modalInstance) {
                        modalInstance.hide();
                    }
                    
                    // Go to the slide
                    const carousel = document.getElementById('fullscreenCarousel');
                    const bsCarousel = bootstrap.Carousel.getInstance(carousel) || new bootstrap.Carousel(carousel);
                    bsCarousel.to(index);
                });
            });
        })
        .catch(err => {
            console.error("Error loading projects: ", err);
            gridContainer.innerHTML = '<p class="text-center">Could not load projects. Make sure viewing on a server, not locally via file://</p>';
        });
});
