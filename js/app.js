// Aruvi E-Sevai Maiyam - Master Application Script
(function() {
  'use strict';

  // Language Manager
  const DEFAULT_LANG = 'en';
  let currentLang = localStorage.getItem('aruvi_lang') || DEFAULT_LANG;

  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('aruvi_lang', lang);
    document.documentElement.lang = lang;
    document.body.setAttribute('data-lang', lang);

    // Update toggle button text and label
    const toggleBtns = document.querySelectorAll('.lang-toggle-btn');
    toggleBtns.forEach(btn => {
      const textSpan = btn.querySelector('.lang-text');
      if (textSpan) {
        textSpan.textContent = lang === 'en' ? 'தமிழ்' : 'English';
      }
      btn.setAttribute('aria-label', lang === 'en' ? 'Switch to Tamil' : 'Switch to English');
    });

    // Update all bilingual elements
    const elements = document.querySelectorAll('[data-en]');
    elements.forEach(el => {
      const translation = el.getAttribute(`data-${lang}`);
      if (translation !== null) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          if (el.hasAttribute('placeholder')) {
            el.placeholder = translation;
          }
        } else {
          el.textContent = translation;
        }
      }
    });

    // Update all elements with HTML content
    const htmlElements = document.querySelectorAll('[data-html-en]');
    htmlElements.forEach(el => {
      const htmlTranslation = el.getAttribute(`data-html-${lang}`);
      if (htmlTranslation !== null) {
        el.innerHTML = htmlTranslation;
      }
    });
  }

  function toggleLanguage() {
    const nextLang = currentLang === 'en' ? 'ta' : 'en';
    setLanguage(nextLang);
  }

  // Setup DOM events
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Apply saved or default language
    setLanguage(currentLang);

    // 2. Wire up language toggle buttons
    const langBtns = document.querySelectorAll('.lang-toggle-btn');
    langBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleLanguage();
      });
    });

    // 3. Mobile menu navigation toggle
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const headerNav = document.querySelector('.header-nav');
    if (menuToggle && headerNav) {
      menuToggle.addEventListener('click', () => {
        headerNav.classList.toggle('active');
        const isExpanded = headerNav.classList.contains('active');
        menuToggle.setAttribute('aria-expanded', isExpanded);
      });
    }

    // 4. Header scroll styling
    const header = document.querySelector('.site-header');
    if (header) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 15) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      });
    }

    // 5. Services Directory Filter & Search (if present on services.html)
    initServicesFilter();
  });

  // Services Directory Filtering Logic
  function initServicesFilter() {
    const searchInput = document.getElementById('serviceSearchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.service-card[data-category]');
    const countDisplay = document.getElementById('visibleServicesCount');
    const noResultsMsg = document.getElementById('noServicesFound');

    if (!cards.length) return;

    let activeCategory = 'all';
    let searchQuery = '';

    function applyFilter() {
      let visibleCount = 0;
      const q = searchQuery.toLowerCase().trim();

      cards.forEach(card => {
        const category = card.getAttribute('data-category');
        const titleEn = (card.getAttribute('data-title-en') || '').toLowerCase();
        const titleTa = (card.getAttribute('data-title-ta') || '').toLowerCase();
        const descEn = (card.getAttribute('data-desc-en') || '').toLowerCase();
        const descTa = (card.getAttribute('data-desc-ta') || '').toLowerCase();

        const matchesCat = (activeCategory === 'all' || category === activeCategory);
        const matchesQuery = !q || titleEn.includes(q) || titleTa.includes(q) || descEn.includes(q) || descTa.includes(q);

        if (matchesCat && matchesQuery) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      if (countDisplay) {
        countDisplay.textContent = visibleCount;
      }

      if (noResultsMsg) {
        noResultsMsg.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        applyFilter();
      });
    }

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.getAttribute('data-filter') || 'all';
        applyFilter();
      });
    });

    const resetBtn = document.getElementById('resetFilterBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        searchQuery = '';
        activeCategory = 'all';
        filterBtns.forEach(b => {
          if (b.getAttribute('data-filter') === 'all') b.classList.add('active');
          else b.classList.remove('active');
        });
        applyFilter();
      });
    }

    // Check URL parameters for category filter
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('cat');
    if (catParam) {
      const targetBtn = document.querySelector(`.filter-btn[data-filter="${catParam}"]`);
      if (targetBtn) {
        filterBtns.forEach(b => b.classList.remove('active'));
        targetBtn.classList.add('active');
        activeCategory = catParam;
      }
    }

    applyFilter();
  }

  // Export language getter/setter
  window.AruviLang = {
    get: () => currentLang,
    set: setLanguage,
    toggle: toggleLanguage
  };
})();
