document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile burger drawer menu toggle
  const burgerMenuBtn = document.getElementById('burger-menu-btn');
  const navMenu = document.getElementById('nav-menu');
  if (burgerMenuBtn && navMenu) {
    burgerMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      burgerMenuBtn.classList.toggle('Navigation-module__l8qRma__active');
      navMenu.classList.toggle('Navigation-module__l8qRma__active');
      
      const isActive = burgerMenuBtn.classList.contains('Navigation-module__l8qRma__active');
      if (isActive) {
        // Change to close icon (cross)
        burgerMenuBtn.innerHTML = `
          <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 384 512" aria-hidden="true" height="35" width="35" xmlns="http://www.w3.org/2000/svg">
            <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"></path>
          </svg>
        `;
        // Prevent body scrolling
        document.body.style.overflow = 'hidden';
      } else {
        // Change back to burger icon (three bars)
        burgerMenuBtn.innerHTML = `
          <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 20 20" aria-hidden="true" height="40" width="40" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM9 15a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1z" clip-rule="evenodd"></path>
          </svg>
        `;
        // Restore body scrolling
        document.body.style.overflow = '';
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !burgerMenuBtn.contains(e.target)) {
        if (navMenu.classList.contains('Navigation-module__l8qRma__active')) {
          burgerMenuBtn.click();
        }
      }
    });
  }

  // 2. Equipment Category Dropdown toggle (Mobile)
  const dropdownToggle = document.getElementById('dropdown-toggle-btn');
  if (dropdownToggle) {
    const navItem = dropdownToggle.closest('.Navigation-module__l8qRma__navItem');
    dropdownToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navItem.classList.toggle('Navigation-module__l8qRma__dropdownOpen');
    });

    // Close dropdown on click outside
    document.addEventListener('click', (e) => {
      if (navItem && !navItem.contains(e.target)) {
        navItem.classList.remove('Navigation-module__l8qRma__dropdownOpen');
      }
    });
  }

  // 3. Scroll effects (Header transparency and Scroll-to-top button)
  const header = document.querySelector('header');
  const logoImg = document.querySelector('.Logo-module__FeqWJG__logo');
  const isHome = window.location.pathname === '/' || window.location.pathname === '/index.html';
  const scrollToTopBtn = document.getElementById('scroll-to-top');

  function handleScroll() {
    const isScrolled = window.scrollY > 50;
    
    if (header) {
      if (isScrolled) {
        header.classList.add('Header-module__ldgnoG__scrolled');
        if (isHome) {
          header.classList.add('Header-module__ldgnoG__light');
          if (logoImg) logoImg.src = '/assets/forstore_lite_new.svg';
        }
      } else {
        header.classList.remove('Header-module__ldgnoG__scrolled');
        if (isHome) {
          header.classList.remove('Header-module__ldgnoG__light');
          if (logoImg) logoImg.src = '/assets/forstore_dark_new.svg';
        }
      }
    }
    
    if (scrollToTopBtn) {
      if (window.scrollY > 300) {
        scrollToTopBtn.classList.add('ScrollToTopButton-module__VF2H_G__visible');
      } else {
        scrollToTopBtn.classList.remove('ScrollToTopButton-module__VF2H_G__visible');
      }
    }
  }

  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Run initially

  if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 4. Endless linear scrolling marquee for Partners Section
  const partnerSwiper = document.querySelector('.PartnersSlider-module__IbjHEq__sliderWrapper .swiper');
  if (partnerSwiper) {
    const wrapper = partnerSwiper.querySelector('.swiper-wrapper');
    if (wrapper) {
      // Clone all slide elements to create seamless infinite scrolling
      const slides = Array.from(wrapper.children);
      slides.forEach(slide => {
        const clone = slide.cloneNode(true);
        wrapper.appendChild(clone);
      });
      
      // Setup styles dynamically
      partnerSwiper.style.overflow = 'hidden';
      wrapper.style.display = 'flex';
      wrapper.style.width = 'max-content';
      wrapper.style.gap = '40px';
      
      // Ensure children have fixed width and won't shrink
      Array.from(wrapper.children).forEach(child => {
        child.style.flexShrink = '0';
        child.style.width = '160px';
      });

      // Inject @keyframes animation into document head
      if (!document.getElementById('marquee-keyframes')) {
        const style = document.createElement('style');
        style.id = 'marquee-keyframes';
        style.innerHTML = `
          @keyframes forstore-marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(calc(-50% - 20px)); }
          }
        `;
        document.head.appendChild(style);
      }
      
      wrapper.style.animation = 'forstore-marquee 30s linear infinite';
      
      // Pause marquee on hover
      wrapper.addEventListener('mouseenter', () => {
        wrapper.style.animationPlayState = 'paused';
      });
      wrapper.addEventListener('mouseleave', () => {
        wrapper.style.animationPlayState = 'running';
      });
    }
  }

  // 5. Scroll-based slider for Projects section
  const projectSwiper = document.querySelector('.ProjectsSection-module__W4DBBa__swiper');
  const prevBtn = document.querySelector('.customPrev');
  const nextBtn = document.querySelector('.customNext');
  if (projectSwiper) {
    projectSwiper.style.overflowX = 'auto';
    projectSwiper.style.scrollBehavior = 'smooth';
    projectSwiper.style.scrollbarWidth = 'none'; // Firefox
    projectSwiper.style.msOverflowStyle = 'none'; // IE/Edge
    
    // Hide scrollbar for Webkit browsers
    if (!document.getElementById('hide-scrollbar-style')) {
      const style = document.createElement('style');
      style.id = 'hide-scrollbar-style';
      style.innerHTML = `
        .ProjectsSection-module__W4DBBa__swiper::-webkit-scrollbar {
          display: none;
        }
      `;
      document.head.appendChild(style);
    }

    if (prevBtn && nextBtn) {
      prevBtn.addEventListener('click', () => {
        projectSwiper.scrollLeft -= projectSwiper.clientWidth * 0.75;
      });
      nextBtn.addEventListener('click', () => {
        projectSwiper.scrollLeft += projectSwiper.clientWidth * 0.75;
      });
    }
  }
});
