/**
 * William Leshoro - Portfolio JavaScript
 * Features: Sticky Navigation, Mobile Menu, Filterable Gallery with Lightbox,
 * Contact Form Validation, Intersection Observer Animating On Scroll, Active nav highlight.
 */

document.addEventListener('DOMContentLoaded', () => {
  initStickyNav();
  initMobileNav();
  initScrollAnimations();
  initNavRouting();
  initGalleryFilterAndLightbox();
  initContactFormValidation();
  initScrollToTop();
});

/* ==========================================================================
   Sticky Navigation Effect
   ========================================================================== */
function initStickyNav() {
  const header = document.querySelector('.sticky-nav');
  
  if (!header) return;

  const toggleScrollClass = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', toggleScrollClass);
  toggleScrollClass(); // Run on initial load in case user refreshed part-way down
}

/* ==========================================================================
   Mobile Navigation Menu
   ========================================================================== */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!toggleBtn || !navMenu) return;

  const toggleMenu = () => {
    navMenu.classList.toggle('active');
    const isExpanded = navMenu.classList.contains('active');
    toggleBtn.setAttribute('aria-expanded', isExpanded);
    
    // Toggle icon class between hamburger and X
    const icon = toggleBtn.querySelector('i');
    if (icon) {
      if (isExpanded) {
        icon.className = 'fa-solid fa-xmark';
      } else {
        icon.className = 'fa-solid fa-bars';
      }
    }
  };

  toggleBtn.addEventListener('click', toggleMenu);

  // Close mobile nav when clicking on a link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('active')) {
        toggleMenu();
      }
    });
  });

  // Close mobile nav when clicking outside of it
  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('active') && 
        !navMenu.contains(e.target) && 
        !toggleBtn.contains(e.target)) {
      toggleMenu();
    }
  });
}

/* ==========================================================================
   Intersection Observer for Fade-In Scroll Animations
   ========================================================================== */
function initScrollAnimations() {
  const fadeSections = document.querySelectorAll('.fade-in-section');

  if (fadeSections.length === 0) return;

  const sectionObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Animates once and stays
      }
    });
  }, {
    root: null,
    threshold: 0.15, // Triggers when 15% is visible
    rootMargin: '0px 0px -50px 0px' // Margins around root
  });

  fadeSections.forEach(section => {
    sectionObserver.observe(section);
  });
}

/* ==========================================================================
   Active Navigation Highlighting Based on Scroll Bound
   ========================================================================== */
function initNavRouting() {
  const sections = document.querySelectorAll('main > section');
  const navLinks = document.querySelectorAll('.nav-link');

  if (sections.length === 0 || navLinks.length === 0) return;

  const handleRouting = () => {
    const hash = window.location.hash || '#home';
    const validHashes = ['#home', '#about', '#services', '#gallery', '#contact'];
    // Default to '#home' if the hash belongs to another section or is empty
    const targetHash = validHashes.includes(hash) ? hash : '#home';

    sections.forEach(section => {
      const id = section.getAttribute('id');
      if (`#${id}` === targetHash) {
        section.classList.add('page-active');
        
        // Immediately trigger fade-in visible animations for elements inside the current view
        const fadeSections = section.querySelectorAll('.fade-in-section');
        fadeSections.forEach(fs => {
          fs.classList.add('visible');
        });
      } else {
        section.classList.remove('page-active');
      }
    });

    // Update active state in nav menu
    navLinks.forEach(link => {
      if (link.getAttribute('href') === targetHash) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Automatically scroll to the top of the viewport when changing pages for a true "new page" feel
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  };

  // Bind key events and browser back/forward buttons (hash navigation support)
  window.addEventListener('hashchange', handleRouting);
  
  // Set initial route based on existing path hash
  handleRouting();
}

/* ==========================================================================
   Filterable Gallery & Rich Lightbox Modal
   ========================================================================== */
function initGalleryFilterAndLightbox() {
  const container = document.querySelector('.carousel-3d-container');
  const slides = document.querySelectorAll('.carousel-3d-slide');
  const prevBtn = document.querySelector('.carousel-3d-prev-btn');
  const nextBtn = document.querySelector('.carousel-3d-next-btn');

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox ? lightbox.querySelector('.lightbox-img') : null;
  const lightboxCategory = lightbox ? lightbox.querySelector('.lightbox-meta') : null;
  const lightboxTitle = lightbox ? lightbox.querySelector('.lightbox-title') : null;
  const lightboxDesc = lightbox ? lightbox.querySelector('.lightbox-desc') : null;
  const lightboxClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;
  const lightboxPrev = lightbox ? lightbox.querySelector('.lightbox-prev') : null;
  const lightboxNext = lightbox ? lightbox.querySelector('.lightbox-next') : null;

  if (slides.length === 0) return;

  const N = slides.length;
  let currentIndex = 0;
  let autoplayTimer = null;

  // Render carousel positions in 3D Space
  const updateCarousel = () => {
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    
    // Spacing between slides depending on screen width
    const spacing = isMobile ? 100 : (isTablet ? 150 : 200);   // Horizontal translation step
    const zStep = isMobile ? -140 : (isTablet ? -180 : -220);    // Push back step
    const rotateYStep = isMobile ? -30 : -35;                  // Rotation angle step

    slides.forEach((slide, i) => {
      // Calculate circular distance (wrap-around)
      let offset = i - currentIndex;
      if (offset < -N / 2) {
        offset += N;
      } else if (offset > N / 2) {
        offset -= N;
      }

      const absOffset = Math.abs(offset);

      // We show up to 2 items on the left and 2 on the right
      if (absOffset <= 2) {
        slide.style.opacity = absOffset === 0 ? '1' : (absOffset === 1 ? '0.75' : '0.4');
        slide.style.zIndex = (15 - absOffset).toString();
        slide.style.visibility = 'visible';
        slide.style.pointerEvents = 'auto';

        const translateX = offset * spacing;
        const translateZ = -absOffset * Math.abs(zStep);
        const rotateY = offset * rotateYStep;

        slide.style.transform = `translate(-50%, -50%) translate3d(${translateX}px, 0, ${translateZ}px) rotateY(${rotateY}deg)`;

        if (offset === 0) {
          slide.classList.add('carousel-3d-active');
        } else {
          slide.classList.remove('carousel-3d-active');
        }
      } else {
        // Hide slides that are out of bounds
        slide.style.opacity = '0';
        slide.style.zIndex = '0';
        slide.style.visibility = 'hidden';
        slide.style.pointerEvents = 'none';
        slide.style.transform = `translate(-50%, -50%) translate3d(0, 0, -500px) rotateY(0deg)`;
        slide.classList.remove('carousel-3d-active');
      }
    });
  };

  // Autoplay control with pause on hover/interaction
  const startAutoplay = () => {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      currentIndex = (currentIndex + 1) % N;
      updateCarousel();
    }, 4000);
  };

  const stopAutoplay = () => {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  };

  const resetAutoplay = () => {
    stopAutoplay();
    startAutoplay();
  };

  // Nav actions (infinite)
  const handlePrev = () => {
    currentIndex = (currentIndex - 1 + N) % N;
    updateCarousel();
    resetAutoplay();
  };

  const handleNext = () => {
    currentIndex = (currentIndex + 1) % N;
    updateCarousel();
    resetAutoplay();
  };

  if (prevBtn) prevBtn.addEventListener('click', handlePrev);
  if (nextBtn) nextBtn.addEventListener('click', handleNext);

  // Touch and Drag swipe support for mobile/desk
  let startX = 0;
  let isDragging = false;
  
  const handleDragStart = (e) => {
    startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    isDragging = true;
    stopAutoplay();
  };

  const handleDragEnd = (e) => {
    if (!isDragging) return;
    const endX = e.type.includes('touch') ? e.changedTouches[0].clientX : e.clientX;
    const diff = endX - startX;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handlePrev();
      } else {
        handleNext();
      }
    } else {
      startAutoplay();
    }
    isDragging = false;
  };

  if (container) {
    container.addEventListener('mousedown', handleDragStart);
    container.addEventListener('mouseup', handleDragEnd);
    container.addEventListener('touchstart', handleDragStart, { passive: true });
    container.addEventListener('touchend', handleDragEnd, { passive: true });
    
    // Resume autoplay when leaving carousel
    container.addEventListener('mouseenter', stopAutoplay);
    container.addEventListener('mouseleave', startAutoplay);
  }

  // Click handler on individual slides
  slides.forEach((slide, i) => {
    slide.addEventListener('click', (e) => {
      e.stopPropagation();
      if (i === currentIndex) {
        // Active clicked: Open Lightbox!
        openLightbox(i);
      } else {
        // Secondary clicked: Slide it into active perspective focus
        currentIndex = i;
        updateCarousel();
        resetAutoplay();
      }
    });
  });

  // Lightbox Implementation
  if (!lightbox || !lightboxImg) {
    // Initial draw
    updateCarousel();
    startAutoplay();
    return;
  }

  let activeLightboxIndex = 0;

  const openLightbox = (index) => {
    activeLightboxIndex = index;
    const slide = slides[index];
    if (!slide) return;

    const img = slide.querySelector('.carousel-3d-img');
    const category = slide.getAttribute('data-category') || '';
    const title = slide.getAttribute('data-title') || '';
    const description = slide.getAttribute('data-description') || '';

    if (img && lightboxImg) {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || 'Gallery Large View';
    }
    
    if (lightboxTitle) lightboxTitle.textContent = title;
    if (lightboxCategory) lightboxCategory.textContent = category;
    if (lightboxDesc) lightboxDesc.textContent = description;

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Stop secondary scroll on page
    stopAutoplay();
  };

  const closeLightboxModal = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
    startAutoplay();
  };

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightboxModal);
  }

  lightbox.addEventListener('click', (e) => {
    const wrapper = lightbox.querySelector('.lightbox-content-wrapper');
    if (wrapper && !wrapper.contains(e.target) && !e.target.classList.contains('lightbox-arrow')) {
      closeLightboxModal();
    }
  });

  const prevLightboxSlide = () => {
    let nextIdx = activeLightboxIndex - 1;
    if (nextIdx < 0) nextIdx = N - 1;
    openLightbox(nextIdx);
  };

  const nextLightboxSlide = () => {
    let nextIdx = activeLightboxIndex + 1;
    if (nextIdx >= N) nextIdx = 0;
    openLightbox(nextIdx);
  };

  if (lightboxPrev) lightboxPrev.addEventListener('click', prevLightboxSlide);
  if (lightboxNext) lightboxNext.addEventListener('click', nextLightboxSlide);

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightboxModal();
    if (e.key === 'ArrowLeft') prevLightboxSlide();
    if (e.key === 'ArrowRight') nextLightboxSlide();
  });

  // Responsive redraw on dynamic window resizing
  window.addEventListener('resize', updateCarousel);

  // Initial draw
  updateCarousel();
  startAutoplay();
}

/* ==========================================================================
   Contact Form Validation & Sending Animation
   ========================================================================== */
function initContactFormValidation() {
  const form = document.getElementById('portfolioContactForm');
  const statusContainer = document.getElementById('formStatus');

  if (!form) return;

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const clearErrors = () => {
    const inputs = form.querySelectorAll('.form-input');
    const errors = form.querySelectorAll('.error-message');
    
    inputs.forEach(input => input.classList.remove('invalid'));
    errors.forEach(err => err.style.display = 'none');
  };

  const showError = (fieldId, errorMessage) => {
    const field = document.getElementById(fieldId);
    if (!field) return;

    field.classList.add('invalid');
    const errSpan = field.nextElementSibling;
    if (errSpan && errSpan.classList.contains('error-message')) {
      errSpan.textContent = errorMessage;
      errSpan.style.display = 'block';
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();

    const nameField = document.getElementById('contactName');
    const emailField = document.getElementById('contactEmail');
    const subjectField = document.getElementById('contactSubject');
    const messageField = document.getElementById('contactMessage');
    const submitBtn = form.querySelector('button[type="submit"]');

    let isValid = true;

    // Name Validation
    if (!nameField || nameField.value.trim() === '') {
      showError('contactName', 'Please enter your name.');
      isValid = false;
    }

    // Email Validation
    if (!emailField || emailField.value.trim() === '') {
      showError('contactEmail', 'Please enter your email address.');
      isValid = false;
    } else if (!validateEmail(emailField.value.trim())) {
      showError('contactEmail', 'Please enter a valid email address.');
      isValid = false;
    }

    // Subject Validation
    if (!subjectField || subjectField.value.trim() === '') {
      showError('contactSubject', 'Please enter a subject.');
      isValid = false;
    }

    // Message Validation
    if (!messageField || messageField.value.trim() === '') {
      showError('contactMessage', 'Please write a message.');
      isValid = false;
    }

    if (!isValid) return;

    // Simulated successful submission
    if (submitBtn) {
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending Message...';

      setTimeout(() => {
        // Reset button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;

        // Display Success Alert
        if (statusContainer) {
          statusContainer.className = 'form-status success';
          statusContainer.innerHTML = '<i class="fa-solid fa-circle-check"></i> Thank you, William Leshoro has received your message! I will get back to you shortly.';
          statusContainer.style.display = 'flex';
          
          // Scroll status container into view smoothly
          statusContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // Reset form inputs
        form.reset();

        // Safe fade-out status message after 10 seconds
        setTimeout(() => {
          if (statusContainer) {
            statusContainer.style.display = 'none';
          }
        }, 10000);

      }, 1800); // realistic delays
    }
  });

  // Client-side quick correction on input focus/type
  const inputs = form.querySelectorAll('.form-input');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      if (input.classList.contains('invalid')) {
        input.classList.remove('invalid');
        const errSpan = input.nextElementSibling;
        if (errSpan && errSpan.classList.contains('error-message')) {
          errSpan.style.display = 'none';
        }
      }
    });
  });
}

/* ==========================================================================
   Scroll To Top Floating Mechanism
   ========================================================================== */
function initScrollToTop() {
  const scrollTopBtn = document.querySelector('.scroll-top');

  if (!scrollTopBtn) return;

  const toggleScrollTopVisibility = () => {
    if (window.scrollY > 400) {
      scrollTopBtn.classList.add('show');
    } else {
      scrollTopBtn.classList.remove('show');
    }
  };

  window.addEventListener('scroll', toggleScrollTopVisibility);
  toggleScrollTopVisibility();

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}
