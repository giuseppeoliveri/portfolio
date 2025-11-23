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
    const aboutToggle = document.getElementById('aboutToggle');
    const aboutToggleModal = document.getElementById('aboutToggleModal');
    const aboutPopup = document.getElementById('aboutPopup');

    function togglePopup(e) {
        e.preventDefault();
        aboutPopup.classList.toggle('active');
    }

    function closePopup(e) {
        if (e.target === aboutPopup) {
            aboutPopup.classList.remove('active');
        }
    }

    if (aboutToggle) {
        aboutToggle.addEventListener('click', togglePopup);
    }

    if (aboutToggleModal) {
        aboutToggleModal.addEventListener('click', togglePopup);
    }

    // Close popup when clicking outside
    aboutPopup.addEventListener('click', closePopup);
});
