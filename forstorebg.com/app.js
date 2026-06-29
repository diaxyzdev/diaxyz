document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile burger drawer menu toggle
  const burgerMenuBtn = document.getElementById('burger-menu-btn');
  const navMenu = document.getElementById('nav-menu');
  const burgerIcon = document.getElementById('burger-icon');
  
  if (burgerMenuBtn && navMenu) {
    burgerMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      burgerMenuBtn.classList.toggle('active');
      navMenu.classList.toggle('active');
      
      const isActive = burgerMenuBtn.classList.contains('active');
      if (isActive) {
        if (burgerIcon) {
          burgerIcon.src = '/assets/icons/close.svg';
          burgerIcon.alt = 'Close Menu';
          burgerIcon.style.width = '35px';
          burgerIcon.style.height = '35px';
        }
        document.body.style.overflow = 'hidden';
      } else {
        if (burgerIcon) {
          burgerIcon.src = '/assets/icons/menu.svg';
          burgerIcon.alt = 'Menu';
          burgerIcon.style.width = '40px';
          burgerIcon.style.height = '40px';
        }
        document.body.style.overflow = '';
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !burgerMenuBtn.contains(e.target)) {
        if (navMenu.classList.contains('active')) {
          burgerMenuBtn.click();
        }
      }
    });
  }

  // 2. Equipment Category Dropdown toggle (Mobile accordion)
  const dropdownToggle = document.getElementById('dropdown-toggle-btn');
  if (dropdownToggle) {
    const navItem = dropdownToggle.closest('.nav-item');
    dropdownToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navItem.classList.toggle('dropdown-open');
    });

    // Close dropdown on click outside
    document.addEventListener('click', (e) => {
      if (navItem && !navItem.contains(e.target)) {
        navItem.classList.remove('dropdown-open');
      }
    });
  }

  // 3. Scroll effects (Header transparency and Scroll-to-top button visibility)
  const header = document.querySelector('header');
  const logoImg = header ? header.querySelector('img') : null;
  const isHome = window.location.pathname === '/' || window.location.pathname === '/index.html';
  const scrollToTopBtn = document.getElementById('scroll-to-top');

  function handleScroll() {
    const isScrolled = window.scrollY > 50;
    
    if (header) {
      if (isScrolled) {
        header.classList.add('scrolled');
        if (isHome) {
          header.classList.add('light');
          if (logoImg) logoImg.src = '/assets/forstore_lite_new.svg';
        }
      } else {
        header.classList.remove('scrolled');
        if (isHome) {
          header.classList.remove('light');
          if (logoImg) logoImg.src = '/assets/forstore_dark_new.svg';
        }
      }
    }
    
    if (scrollToTopBtn) {
      if (window.scrollY > 300) {
        scrollToTopBtn.classList.add('visible');
      } else {
        scrollToTopBtn.classList.remove('visible');
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
  const partnerSlider = document.querySelector('main > section > ul.gallery');
  if (partnerSlider) {
    const wrapper = partnerSlider;
    // Clone all slide elements to create seamless infinite scrolling
    const slides = Array.from(wrapper.children);
    slides.forEach(slide => {
      const clone = slide.cloneNode(true);
      wrapper.appendChild(clone);
    });
    
    // Setup styles dynamically
    wrapper.parentElement.style.overflow = 'hidden';
    wrapper.style.display = 'flex';
    wrapper.style.width = 'max-content';
    wrapper.style.gap = '40px';
    
    // Ensure children have fixed width and won't shrink
    Array.from(wrapper.children).forEach(child => {
      child.style.flexShrink = '0';
      child.style.width = '160px';
    });

    // Inject @keyframes animation into document head if not already there
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

  // 5. Scroll-based slider for Projects section
  const projectSwiper = document.querySelector('#our-projects ul');
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
        #our-projects ul::-webkit-scrollbar {
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
