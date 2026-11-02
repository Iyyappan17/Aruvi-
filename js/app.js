// Aruvi E-Sevai Maiyam - Master Application Script
(function() {
  'use strict';

  // Setup DOM events
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Language toggle link preference tracking
    const langBtns = document.querySelectorAll('.lang-toggle-btn');
    langBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const currentLang = document.documentElement.lang || document.body.getAttribute('data-lang') || 'en';
        const targetLang = currentLang === 'ta' ? 'en' : 'ta';
        try {
          localStorage.setItem('aruvi_lang', targetLang);
        } catch (e) {}
        // Allow standard link navigation to the static pre-rendered language page.
      });
    });

    // 2. Mobile menu navigation toggle
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const headerNav = document.querySelector('.header-nav');
    if (menuToggle && headerNav) {
      menuToggle.addEventListener('click', () => {
        headerNav.classList.toggle('active');
        const isExpanded = headerNav.classList.contains('active');
        menuToggle.setAttribute('aria-expanded', isExpanded);
      });
    }

    // 3. Header scroll styling
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

    // 4. Services directory filtering and search.
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

  // Export language helper for programmatic access
  window.AruviLang = {
    get: () => document.documentElement.lang || document.body.getAttribute('data-lang') || 'en',
    toggle: () => {
      const toggleBtn = document.querySelector('.lang-toggle-btn');
      if (toggleBtn && toggleBtn.href) {
        window.location.href = toggleBtn.href;
      }
    }
  };
})();
