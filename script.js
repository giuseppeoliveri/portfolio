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
        let cleanName = filename.substring(0, filename.lastIndexOf('.')) || filename;
        if (cleanName.toLowerCase().endsWith(' desktop')) {
            cleanName = cleanName.substring(0, cleanName.length - 8);
        }

        // Update text
        fileDisplay.textContent = cleanName;
        fileDisplay.classList.add('visible');
        
        // Add click integration to open modal
        fileDisplay.onclick = function(e) {
            e.preventDefault();
            const originalSrc = media.getAttribute('data-original-src') || src;
            if (typeof openProjectDetails === 'function') {
                openProjectDetails(cleanName, originalSrc);
            }
        };
        
        // Make media background clickable too
        media.style.cursor = 'pointer';
        media.onclick = function(e) {
            e.preventDefault();
            const originalSrc = media.getAttribute('data-original-src') || src;
            if (typeof openProjectDetails === 'function') {
                openProjectDetails(cleanName, originalSrc);
            }
        };

        // --- SLIDESHOW LOGIC per sole immagini ---
        if (window.currentSlideshowInterval) {
            clearInterval(window.currentSlideshowInterval);
            window.currentSlideshowInterval = null;
        }
        
        media.style.transition = 'opacity 0.4s ease';
        media.style.opacity = '1';

        if (media.tagName === 'IMG') {
            if (!media.getAttribute('data-original-src')) {
                media.setAttribute('data-original-src', src);
            }
            const originalSrc = media.getAttribute('data-original-src');
            
            let galleryImages = [originalSrc];
            let searchIndex = 1;
            let extTry = ['.jpg', '.jpeg', '.png'];
            
            let extStep = 0;
            let stopSearch = false;
            
            function pushExtraImage() {
                if (stopSearch || searchIndex > 15) return;
                const tempImg = new Image();
                const testUrl = () => {
                    tempImg.src = `progetti/${encodeURIComponent(cleanName)}/${searchIndex}${extTry[extStep]}`;
                };
                
                tempImg.onload = () => {
                    galleryImages.push(tempImg.src);
                    searchIndex++;
                    extStep = 0;
                    pushExtraImage();
                };
                tempImg.onerror = () => {
                    extStep++;
                    if (extStep >= extTry.length) {
                        stopSearch = true; 
                    } else {
                        testUrl();
                    }
                };
                testUrl();
            }
            
            pushExtraImage(); 
            
            let showIndex = 0;
            window.currentSlideshowInterval = setInterval(() => {
                if (galleryImages.length > 1) {
                    showIndex = (showIndex + 1) % galleryImages.length;
                    media.style.opacity = '0.3'; 
                    setTimeout(() => {
                        media.src = galleryImages[showIndex];
                        media.style.opacity = '1';
                    }, 400); 
                }
            }, 3000);
        }
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
    const filterNav = document.getElementById('categoryFilterNav');
    if (!gridContainer) return;

    fetch('Info%20Immagini.txt')
        .then(response => {
            if (!response.ok) throw new Error("Could not load Info Immagini.txt");
            return response.text();
        })
        .then(text => {
            const lines = text.split('\n').map(line => line.trim()).filter(line => line);
            const categoryMap = {}; 
            const allCategories = new Set();
            lines.forEach(line => {
                const parts = line.split('->');
                if (parts.length === 2) {
                    const cat = parts[1].trim();
                    categoryMap[parts[0].trim()] = cat;
                    allCategories.add(cat);
                }
            });

            // Generate Filter Buttons if nav exists
            if (filterNav) {
                // Clear existing nav-background since we want individual backgrounds for multi-select
                const navBg = filterNav.querySelector('.nav-background');
                if(navBg) navBg.style.display = 'none';

                ["All", ...Array.from(allCategories)].forEach((cat, index) => {
                    const btn = document.createElement('a');
                    btn.href = "#";
                    btn.className = 'pill-nav-item';
                    if (index === 0) btn.classList.add('active'); // default ALL
                    btn.textContent = cat;
                    btn.dataset.category = cat;
                    
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        if (cat === "All") {
                            filterNav.querySelectorAll('.pill-nav-item').forEach(b => b.classList.remove('active'));
                            btn.classList.add('active');
                        } else {
                            filterNav.querySelector('[data-category="All"]').classList.remove('active');
                            btn.classList.toggle('active');
                            if (filterNav.querySelectorAll('.pill-nav-item.active').length === 0) {
                                filterNav.querySelector('[data-category="All"]').classList.add('active');
                            }
                        }
                        filterProjects();
                    });
                    
                    filterNav.appendChild(btn);
                });
            }

            // Group projects by category and structure data
            const carouselItems = document.querySelectorAll('#fullscreenCarousel .carousel-item');
            const projectsData = [];

            carouselItems.forEach((item, index) => {
                const media = item.querySelector('img, video');
                if (!media) return;

                let src = media.getAttribute('src');
                if (!src && media.tagName === 'VIDEO') {
                    // Check for nested source tags
                    const source = media.querySelector('source');
                    if (source) src = source.getAttribute('src');
                }
                if (!src) return;
                
                // For the title, if it's the desktop version, we might want to strip " Desktop" so it matches Info Immagini.txt
                let filename = src.split('/').pop();
                let title = filename.substring(0, filename.lastIndexOf('.')) || filename;
                if (title.toLowerCase().endsWith(' desktop')) {
                    title = title.substring(0, title.length - 8);
                }
                
                const isVideo = media.tagName === 'VIDEO';
                const category = categoryMap[title] || 'Uncategorized';
                
                projectsData.push({ title, category, src, isVideo, index });
            });

            // Make a single grid layout
            gridContainer.innerHTML = '';
            const rowDiv = document.createElement('div');
            rowDiv.className = 'row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4';
            gridContainer.appendChild(rowDiv);

            projectsData.forEach(proj => {
                const colDiv = document.createElement('div');
                colDiv.className = 'col project-col';
                colDiv.dataset.category = proj.category;
                
                let thumbContent = proj.isVideo 
                    ? `<video src="${proj.src}" muted playsinline loop preload="metadata" style="object-fit:cover; width:100%; height:100%;"></video>` 
                    : `<img src="${proj.src}" alt="${proj.title}" style="object-fit:cover; width:100%; height:100%;">`;
                
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
                
                // Add click listener to open popup instead of sliding main carousel
                const card = colDiv.querySelector('.project-card');
                card.addEventListener('click', (e) => {
                    e.preventDefault();
                    openProjectDetails(proj.title, proj.src);
                });

                // Play video only on hover
                if (proj.isVideo) {
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

            // Filter function
            function filterProjects() {
                if(!filterNav) return;
                const activeFilters = Array.from(filterNav.querySelectorAll('.pill-nav-item.active')).map(b => b.dataset.category);
                
                rowDiv.querySelectorAll('.project-col').forEach(col => {
                    if (activeFilters.includes("All") || activeFilters.includes(col.dataset.category)) {
                        col.style.display = 'block';
                    } else {
                        col.style.display = 'none';
                    }
                });
            }
        })
        .catch(err => {
            console.error("Error loading projects: ", err);
            gridContainer.innerHTML = '<p class="text-center">Could not load projects. Make sure viewing on a server, not locally via file://</p>';
        });
});

function openProjectDetails(title, originalSrc) {
    const modalEl = document.getElementById('projectDetailsModal');
    if (!modalEl) return;
    
    // We don't hide the background modal (if user is in the grid), we just open this on top 
    // Wait, the grid IS inside projectsModal. So we are opening a modal over a modal. Usually allowed.
    const bsModal = new bootstrap.Modal(modalEl);
    
    const contentDiv = document.getElementById('projectDetailsContent');
    contentDiv.innerHTML = `
      <h2 style="font-family: var(--font); font-size: 1rem; font-weight: 400; letter-spacing: 0.03em; margin-bottom: 1.5rem;">${title}</h2>
      <div id="projectDetailsText" class="mb-4 text-start"></div>
      <div id="projectDetailsMedia" class="d-flex flex-column gap-3 align-items-center">
        <!-- Display original image/video as fallback or cover -->
      </div>
    `;
    
    bsModal.show();
    
    // Load testo.txt
    fetch(`progetti/${encodeURIComponent(title)}/testo.txt`)
        .then(res => {
            if (!res.ok) throw new Error("No txt found");
            return res.text();
        })
        .then(text => {
            document.getElementById('projectDetailsText').innerHTML = `<p style="font-family: var(--font); font-size: 1rem; font-weight: 400; letter-spacing: 0.03em; line-height: 1.6; white-space: pre-wrap;">${text}</p>`;
        })
        .catch(() => {
            document.getElementById('projectDetailsText').innerHTML = `<p class="text-muted" style="font-family: var(--font); font-size: 1rem; font-weight: 400; letter-spacing: 0.03em; white-space: pre-wrap;">Nessuna informazione aggiuntiva trovata qui, crea un file testo.txt nella cartella "progetti/${title}/" per aggiungere testo.</p>`;
        });
        
    // Sequential fallback media loader for 1.jpg to X.jpg / .mp4
    const mediaContainer = document.getElementById('projectDetailsMedia');
    let index = 1;
    let anyLoaded = false;
    
    function loadNextMedia() {
        if (index > 15) {
            if (!anyLoaded && originalSrc) {
               // Load fallback original if nothing else exists
               const ext = originalSrc.split('.').pop().toLowerCase();
               if(ext === 'mp4' || ext === 'webm') {
                   mediaContainer.innerHTML = `<video class="w-100 rounded shadow-sm" src="${originalSrc}" muted playsinline autoplay loop></video>`;
               } else {
                   mediaContainer.innerHTML = `<img class="w-100 rounded shadow-sm" src="${originalSrc}">`;
               }
            }
            return;
        }
        
        const extensions = ['.jpg', '.png', '.mp4'];
        let extIdx = 0;
        
        function tryExtension() {
            if (extIdx >= extensions.length) {
                // Done trying all extensions for this index, 
                // we assume no MORE images exist and we stop completely to prevent network 404 flooding.
                if (!anyLoaded && originalSrc) {
                   // Load fallback original if nothing else exists
                   const ext = originalSrc.split('.').pop().toLowerCase();
                   if(ext === 'mp4' || ext === 'webm') {
                       mediaContainer.innerHTML = `<video class="w-100 rounded shadow-sm" src="${originalSrc}" muted playsinline autoplay loop></video>`;
                   } else {
                       mediaContainer.innerHTML = `<img class="w-100 rounded shadow-sm" src="${originalSrc}">`;
                   }
                }
                return; 
            }
            
            const ext = extensions[extIdx];
            const url = `progetti/${encodeURIComponent(title)}/${index}${ext}`;
            
            if (ext === '.jpg' || ext === '.png') {
                const img = new Image();
                img.onload = () => {
                    const el = document.createElement('img');
                    el.src = url;
                    el.className = 'w-100 rounded shadow-sm';
                    mediaContainer.appendChild(el);
                    anyLoaded = true;
                    index++;
                    loadNextMedia(); // Find next number
                };
                img.onerror = () => { extIdx++; tryExtension(); };
                img.src = url;
            } else if (ext === '.mp4') {
                const video = document.createElement('video');
                video.onloadedmetadata = () => {
                    video.className = 'w-100 rounded shadow-sm';
                    video.controls = true;
                    video.autoplay = true;
                    video.muted = true;
                    video.loop = true;
                    mediaContainer.appendChild(video);
                    anyLoaded = true;
                    index++;
                    loadNextMedia();
                };
                video.onerror = () => { extIdx++; tryExtension(); };
                video.src = url;
            }
        }
        tryExtension();
    }
    loadNextMedia();
}

// Theme Toggle Logic
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('themeToggleBtn');
    const lightbulbIcon = document.getElementById('lightbulbIcon');
    
    if (toggleBtn) {
        // Load preference from localStorage or default to dark
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

