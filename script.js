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

// --- DYNAMIC PROJECT LOADER & CMS INTEGRATION ---

let projects = [];

document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.getElementById('fullscreenCarousel');
    const fileDisplay = document.getElementById('fileDisplay');
    const gridContainer = document.getElementById('projectsGridContainer');
    const filterNav = document.getElementById('categoryFilterNav');

    if (!carousel || !fileDisplay) return;

    // Fetch projects.json
    fetch('projects.json')
        .then(response => {
            if (!response.ok) throw new Error("Could not load projects.json");
            return response.json();
        })
        .then(data => {
            projects = data.projects || [];
            if (projects.length === 0) {
                showEmptyState();
                return;
            }
            initPortfolio();
        })
        .catch(err => {
            console.error("Error loading projects:", err);
            if (gridContainer) {
                gridContainer.innerHTML = '<p class="text-center text-muted py-5">Caricamento del portfolio fallito. Verifica che il file projects.json sia presente.</p>';
            }
        });

    function showEmptyState() {
        const carouselInner = carousel.querySelector('.carousel-inner');
        if (carouselInner) {
            carouselInner.innerHTML = `
                <div class="carousel-item active w-100 h-100 d-flex justify-content-center align-items-center" style="background-color: #000;">
                    <p class="text-muted text-center m-0">Nessun progetto caricato nel portfolio.<br><small>Usa il pannello di controllo per aggiungere progetti.</small></p>
                </div>
            `;
        }
        if (fileDisplay) fileDisplay.textContent = "";
        if (gridContainer) {
            gridContainer.innerHTML = '<p class="text-center text-muted py-5">Nessun progetto trovato nel portfolio.</p>';
        }
    }

    function initPortfolio() {
        const carouselInner = carousel.querySelector('.carousel-inner');
        if (!carouselInner) return;

        // 1. Build Slideshow Carousel items
        carouselInner.innerHTML = '';
        projects.forEach((proj, idx) => {
            const isVideo = proj.main_media.toLowerCase().endsWith('.mp4') || 
                            proj.main_media.toLowerCase().endsWith('.webm') || 
                            proj.main_media.toLowerCase().endsWith('.mov');
            
            const carouselItem = document.createElement('div');
            carouselItem.className = 'carousel-item';
            carouselItem.dataset.id = proj.id;

            if (isVideo) {
                carouselItem.innerHTML = `
                    <video src="${proj.main_media}" class="d-block w-100" style="background-color: #000;" muted playsinline autoplay loop></video>
                `;
            } else {
                carouselItem.innerHTML = `
                    <img src="${proj.main_media}" class="d-block w-100" style="background-color: #000; object-fit: contain; max-height: 100%;" alt="${proj.title}">
                `;
            }
            carouselInner.appendChild(carouselItem);
        });

        // Randomize starting slide
        const items = carouselInner.querySelectorAll('.carousel-item');
        if (items.length > 0) {
            const randomIndex = Math.floor(Math.random() * items.length);
            items[randomIndex].classList.add('active');
        }

        // Initialize display and slideshow for first slide
        updateFileName();

        // Listen for bootstrap carousel slide transitions
        carousel.addEventListener('slid.bs.carousel', updateFileName);

        // 2. Build Category Filter Nav & Projects Grid
        initGridAndFilters();
    }

    function updateFileName() {
        const activeItem = carousel.querySelector('.carousel-item.active');
        if (!activeItem) return;

        const projId = activeItem.dataset.id;
        const project = projects.find(p => p.id === projId);
        if (!project) return;

        // Update text display
        fileDisplay.textContent = project.title;
        fileDisplay.classList.add('visible');
        
        // Add click integration to open modal
        fileDisplay.onclick = function(e) {
            e.preventDefault();
            openProjectDetails(project);
        };
        
        // Make media background clickable too
        const media = activeItem.querySelector('img, video');
        if (media) {
            media.style.cursor = 'pointer';
            media.onclick = function(e) {
                e.preventDefault();
                openProjectDetails(project);
            };
        }

        // --- SLIDESHOW LOGIC: idle cycle through extra images ---
        if (window.currentSlideshowInterval) {
            clearInterval(window.currentSlideshowInterval);
            window.currentSlideshowInterval = null;
        }

        if (media && media.tagName === 'IMG' && project.extra_media && project.extra_media.length > 0) {
            // Extract all image URLs including main media
            const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
            const galleryImages = [project.main_media];
            
            project.extra_media.forEach(m => {
                const url = typeof m === 'object' ? m.media : m;
                if (url) {
                    const ext = url.split('.').pop().toLowerCase();
                    if (imageExtensions.includes(ext)) {
                        galleryImages.push(url);
                    }
                }
            });

            if (galleryImages.length > 1) {
                media.style.transition = 'opacity 0.4s ease';
                media.style.opacity = '1';
                
                let showIndex = 0;
                window.currentSlideshowInterval = setInterval(() => {
                    showIndex = (showIndex + 1) % galleryImages.length;
                    media.style.opacity = '0.3'; 
                    setTimeout(() => {
                        media.src = galleryImages[showIndex];
                        media.style.opacity = '1';
                    }, 400); 
                }, 3000);
            }
        }
    }

    function initGridAndFilters() {
        if (!gridContainer) return;

        // Extract active categories
        const categories = new Set();
        projects.forEach(p => {
            if (p.category) categories.add(p.category);
        });

        // 1. Generate Filter Buttons
        if (filterNav) {
            filterNav.innerHTML = '<div class="nav-background"></div>';
            const navBg = filterNav.querySelector('.nav-background');
            if (navBg) navBg.style.display = 'none';

            const sortedCats = ["All", ...Array.from(categories).sort()];
            sortedCats.forEach((cat, index) => {
                const btn = document.createElement('a');
                btn.href = "#";
                btn.className = 'pill-nav-item';
                if (index === 0) btn.classList.add('active'); // default: ALL
                btn.textContent = cat;
                btn.dataset.category = cat;
                
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (cat === "All") {
                        filterNav.querySelectorAll('.pill-nav-item').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                    } else {
                        const allBtn = filterNav.querySelector('[data-category="All"]');
                        if (allBtn) allBtn.classList.remove('active');
                        btn.classList.toggle('active');
                        
                        const actives = filterNav.querySelectorAll('.pill-nav-item.active');
                        if (actives.length === 0 && allBtn) {
                            allBtn.classList.add('active');
                        }
                    }
                    filterProjects();
                });
                
                filterNav.appendChild(btn);
            });
        }

        // 2. Generate Grid Cards
        gridContainer.innerHTML = '';
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4';
        gridContainer.appendChild(rowDiv);

        projects.forEach(proj => {
            const colDiv = document.createElement('div');
            colDiv.className = 'col project-col';
            colDiv.dataset.category = proj.category;

            const isVideo = proj.main_media.toLowerCase().endsWith('.mp4') || 
                            proj.main_media.toLowerCase().endsWith('.webm') || 
                            proj.main_media.toLowerCase().endsWith('.mov');
            
            let thumbContent = isVideo 
                ? `<video src="${proj.main_media}" muted playsinline loop preload="metadata" style="object-fit:cover; width:100%; height:100%;"></video>` 
                : `<img src="${proj.main_media}" alt="${proj.title}" style="object-fit:cover; width:100%; height:100%;">`;
            
            colDiv.innerHTML = `
              <a href="#" class="project-card">
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
            
            // Add click listener to open popup
            const card = colDiv.querySelector('.project-card');
            card.addEventListener('click', (e) => {
                e.preventDefault();
                openProjectDetails(proj);
            });

            // Play video on hover
            if (isVideo) {
                const videoEl = card.querySelector('video');
                if (videoEl) {
                    card.addEventListener('mouseenter', () => {
                        videoEl.play().catch(e => console.log("Hover play prevented", e));
                    });
                    card.addEventListener('mouseleave', () => {
                        videoEl.pause();
                    });
                }
            }
        });

        // Filter projects function
        function filterProjects() {
            if (!filterNav) return;
            const activeFilters = Array.from(filterNav.querySelectorAll('.pill-nav-item.active')).map(b => b.dataset.category);
            
            rowDiv.querySelectorAll('.project-col').forEach(col => {
                if (activeFilters.includes("All") || activeFilters.includes(col.dataset.category)) {
                    col.style.display = 'block';
                } else {
                    col.style.display = 'none';
                }
            });
        }
    }
});

// Initialize Feather icons
document.addEventListener('DOMContentLoaded', () => {
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
});

// Modal Details Populator
function openProjectDetails(project) {
    const modalEl = document.getElementById('projectDetailsModal');
    if (!modalEl) return;
    
    const bsModal = new bootstrap.Modal(modalEl);
    const contentDiv = document.getElementById('projectDetailsContent');
    
    // Clean and build modal content with custom styling for Bio and Description
    contentDiv.innerHTML = `
      <div class="pe-4 text-start">
        <h2 style="font-family: var(--font); font-size: 1.5rem; font-weight: 500; letter-spacing: 0.01em; margin-bottom: 0.5rem; color: #fff;">${project.title}</h2>
        <span class="badge bg-secondary-subtle text-secondary-emphasis mb-4 px-3 py-2 rounded-pill" style="font-size: 0.8rem; letter-spacing: 0.05em; text-transform: uppercase;">${project.category}</span>
        
        <!-- Biography Section (New Premium Feature) -->
        ${project.bio ? `
        <div class="project-bio-box mb-4 p-4 rounded-4" style="background: rgba(255,255,255,0.04); border-left: 4px solid var(--text-color); backdrop-filter: blur(10px);">
          <p class="m-0" style="font-family: var(--font); font-size: 1.05rem; font-weight: 400; font-style: italic; line-height: 1.6; color: rgba(255,255,255,0.9); letter-spacing: 0.02em;">
            "${project.bio}"
          </p>
        </div>
        ` : ''}
        
        <!-- Description Section -->
        ${project.description ? `
        <div class="project-description-box mb-5">
          <p style="font-family: var(--font); font-size: 0.95rem; font-weight: 400; letter-spacing: 0.02em; line-height: 1.7; white-space: pre-wrap; color: rgba(255,255,255,0.7);">
            ${project.description}
          </p>
        </div>
        ` : ''}
        
        <!-- Media Gallery -->
        <div id="projectDetailsMedia" class="d-flex flex-column gap-4 align-items-center mt-3">
          <!-- Injected dynamically -->
        </div>
      </div>
    `;
    
    bsModal.show();
    
    // Populate Media Gallery dynamically from projects.json (No more 404s!)
    const mediaContainer = document.getElementById('projectDetailsMedia');
    if (!mediaContainer) return;

    const extras = project.extra_media ? project.extra_media.map(m => typeof m === 'object' ? m.media : m).filter(Boolean) : [];
    
    if (extras.length > 0) {
        extras.forEach(url => {
            const ext = url.split('.').pop().toLowerCase();
            if (['mp4', 'webm', 'mov'].includes(ext)) {
                mediaContainer.innerHTML += `
                    <video class="w-100 rounded-4 shadow-lg border border-dark-subtle" src="${url}" controls autoplay muted loop style="max-height: 60vh; background-color:#000;"></video>
                `;
            } else {
                mediaContainer.innerHTML += `
                    <img class="w-100 rounded-4 shadow-lg border border-dark-subtle" src="${url}" alt="${project.title}" style="max-height: 75vh; object-fit: contain; background-color:#000;">
                `;
            }
        });
    } else if (project.main_media) {
        // Fallback: Display main media in details popup if no extras exist
        const ext = project.main_media.split('.').pop().toLowerCase();
        if (['mp4', 'webm', 'mov'].includes(ext)) {
            mediaContainer.innerHTML += `
                <video class="w-100 rounded-4 shadow-lg border border-dark-subtle" src="${project.main_media}" controls autoplay muted loop style="max-height: 60vh; background-color:#000;"></video>
            `;
        } else {
            mediaContainer.innerHTML += `
                <img class="w-100 rounded-4 shadow-lg border border-dark-subtle" src="${project.main_media}" alt="${project.title}" style="max-height: 75vh; object-fit: contain; background-color:#000;">
            `;
        }
    }
}

// Theme Toggle Logic
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('themeToggleBtn');
    const lightbulbIcon = document.getElementById('lightbulbIcon');
    
    if (toggleBtn) {
        const currentTheme = localStorage.getItem('theme') || 'dark';
        if (currentTheme === 'light') {
            document.body.classList.add('light-mode');
            if (lightbulbIcon) lightbulbIcon.setAttribute('fill', 'currentColor');
        }

        toggleBtn.addEventListener('click', () => {
            const isLight = document.body.classList.toggle('light-mode');
            if (isLight) {
                if (lightbulbIcon) lightbulbIcon.setAttribute('fill', 'currentColor');
                localStorage.setItem('theme', 'light');
            } else {
                if (lightbulbIcon) lightbulbIcon.setAttribute('fill', 'none');
                localStorage.setItem('theme', 'dark');
            }
        });
    }
});
