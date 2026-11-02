const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;
const SITE_BASE_URL = process.env.SITE_BASE_URL || '{{BASE_URL}}';

// 1. Load Data
const services = JSON.parse(fs.readFileSync(path.join(BASE_DIR, 'data/services.json'), 'utf-8'));
const welfareBoards = JSON.parse(fs.readFileSync(path.join(BASE_DIR, 'data/welfareBoards.json'), 'utf-8'));
const translations = JSON.parse(fs.readFileSync(path.join(BASE_DIR, 'data/translations.json'), 'utf-8'));

// Ensure output folders exist
fs.mkdirSync(path.join(BASE_DIR, 'services'), { recursive: true });
fs.mkdirSync(path.join(BASE_DIR, 'apply'), { recursive: true });

// Common Contact Information
const CONTACT_INFO = {
  nameEn: "Aruvi E-Sevai Maiyam",
  nameTa: "அருவி இ-சேவை மையம்",
  taglineEn: "Your Trusted E-Sevai Service Centre in Kovilpatti",
  taglineTa: "கோவில்பட்டியில் உங்கள் நம்பிக்கைக்குரிய இ-சேவை மையம்",
  addressEn: "24–13, Siva Complex, A.K.S. Theatre Road, Kovilpatti, Tamil Nadu.",
  addressTa: "24–13, சிவா காம்ப்ளக்ஸ், A.K.S. தியேட்டர் ரோடு, கோவில்பட்டி.",
  phone1: "95665 16652",
  phone1Raw: "9566516652",
  phone2: "93637 16652",
  phone2Raw: "9363716652",
  whatsappRaw: "9566516652"
};

// Category Metadata
const CATEGORIES = {
  registration: {
    en: "Welfare Registration",
    ta: "நலவாரியப் பதிவு",
    image: "assets/categories/cat-registration.jpg",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
  },
  education: {
    en: "Educational Assistance",
    ta: "கல்வி உதவி",
    image: "assets/categories/cat-education.jpg",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`
  },
  family: {
    en: "Family & Social Welfare",
    ta: "குடும்ப நலன்",
    image: "assets/categories/cat-family.jpg",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`
  },
  relief: {
    en: "Death Relief & Compensation",
    ta: "மரண நிவாரணம்",
    image: "assets/categories/cat-relief.jpg",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
  },
  special: {
    en: "Special Schemes & Subsidies",
    ta: "சிறப்புத் திட்டங்கள்",
    image: "assets/categories/cat-special.jpg",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`
  }
};

// Helper: Common Header
function getHeader(activePage = 'home', depth = 0) {
  const prefix = depth === 1 ? '../' : '';
  const homeHref = `${prefix}index.html`;
  const servicesHref = `${prefix}services.html`;
  const aboutHref = `${prefix}about.html`;
  const contactHref = `${prefix}contact.html`;
  const logoSrc = `${prefix}assets/aruvi-logo.png`;

  return `
  <div class="loading-screen" id="loadingScreen" aria-busy="true">
    <img src="${logoSrc}" alt="" class="loading-logo">
    <div class="loading-brand" data-en="Aruvi E-Sevai Maiyam" data-ta="அருவி இ-சேவை மையம்">Aruvi E-Sevai Maiyam</div>
    <div class="loading-spinner" aria-hidden="true"></div>
    <div class="loading-status" id="loadingStatus" role="status" aria-live="polite" data-en="Loading..." data-ta="ஏற்றுகிறது...">Loading...</div>
  </div>
  <div class="network-status" id="networkStatus" role="status" aria-live="polite" hidden>
    <span id="networkStatusMessage"></span>
    <button type="button" id="networkRetry" data-en="Retry" data-ta="மீண்டும் முயற்சிக்கவும்" hidden>Retry</button>
  </div>
  <script>
    (function () {
      var screen = document.getElementById('loadingScreen');
      var networkStatus = document.getElementById('networkStatus');
      var networkMessage = document.getElementById('networkStatusMessage');
      var retryButton = document.getElementById('networkRetry');
      var initialLoad = true;
      var slowTimer;
      var slowMessageShown = false;
      var networkState = '';

      function hideScreen() {
        screen.classList.add('is-hidden');
        screen.setAttribute('aria-hidden', 'true');
        screen.setAttribute('aria-busy', 'false');
      }

      function currentLanguage() {
        return document.body.getAttribute('data-lang') === 'ta' ? 'ta' : 'en';
      }

      function renderNetworkStatus() {
        var language = currentLanguage();
        if (networkState === 'offline') {
          networkMessage.textContent = language === 'ta'
            ? 'இணைய இணைப்பு இல்லை. உங்கள் இணைப்பைச் சரிபார்க்கவும்.'
            : 'No internet connection. Please check your network.';
          retryButton.textContent = retryButton.getAttribute('data-' + language);
          retryButton.hidden = false;
          networkStatus.hidden = false;
        } else if (networkState === 'slow') {
          networkMessage.textContent = language === 'ta'
            ? 'இணைய இணைப்பு மெதுவாக உள்ளது. காத்திருக்கவும்...'
            : 'Slow network connection. Please wait...';
          retryButton.hidden = true;
          networkStatus.hidden = false;
        } else {
          networkStatus.hidden = true;
          retryButton.hidden = true;
        }
      }

      function showOffline() {
        hideScreen();
        window.clearTimeout(slowTimer);
        slowMessageShown = false;
        networkState = 'offline';
        renderNetworkStatus();
      }

      function hideNetworkStatus() {
        networkState = '';
        renderNetworkStatus();
      }

      try {
        initialLoad = sessionStorage.getItem('aruvi-site-initialized') !== 'true';
      } catch (error) {
        initialLoad = true;
      }

      if (!initialLoad) hideScreen();

      if (!navigator.onLine) {
        showOffline();
      } else if (initialLoad) {
        slowTimer = window.setTimeout(function () {
          if (document.readyState !== 'complete' && navigator.onLine) {
            slowMessageShown = true;
            networkState = 'slow';
            renderNetworkStatus();
          }
        }, 8000);
      }

      function markInitialized() {
        hideScreen();
        try {
          sessionStorage.setItem('aruvi-site-initialized', 'true');
        } catch (error) {
          initialLoad = false;
        }
      }

      document.addEventListener('DOMContentLoaded', markInitialized, { once: true });
      window.addEventListener('load', function () {
        markInitialized();
        window.clearTimeout(slowTimer);
        if (slowMessageShown) hideNetworkStatus();
      }, { once: true });
      window.addEventListener('offline', showOffline);
      window.addEventListener('online', hideNetworkStatus);
      new MutationObserver(renderNetworkStatus).observe(document.body, {
        attributes: true,
        attributeFilter: ['data-lang']
      });
      window.addEventListener('error', function (event) {
        var target = event.target;
        var resourceUrl = target && (target.src || target.href);
        var requiredLocalResource = target &&
          ((target.tagName === 'SCRIPT' && target.src) ||
           (target.tagName === 'LINK' && target.rel === 'stylesheet' && target.href)) &&
          resourceUrl && new URL(resourceUrl, window.location.href).origin === window.location.origin;
        if (requiredLocalResource && !navigator.onLine) showOffline();
      }, true);
      retryButton.addEventListener('click', function () {
        if (navigator.onLine) window.location.reload();
      });

      window.addEventListener('pageshow', function (event) {
        if (event.persisted || document.readyState === 'complete') {
          markInitialized();
          window.clearTimeout(slowTimer);
        }
      });
    })();
  </script>
  <header class="site-header">
    <div class="container header-container">
      <a href="${homeHref}" class="brand-link" aria-label="Aruvi E-Sevai Maiyam Home">
        <img src="${logoSrc}" alt="Aruvi E-Sevai Maiyam Logo" class="brand-logo-img">
        <div class="brand-text-block">
          <span class="brand-name" data-en="Aruvi E-Sevai" data-ta="அருவி இ-சேவை">Aruvi E-Sevai</span>
          <span class="brand-sub" data-en="Kovilpatti" data-ta="கோவில்பட்டி">Kovilpatti</span>
        </div>
      </a>

      <nav class="header-nav" id="mainNavigation" aria-label="Main Navigation">
        <a href="${homeHref}" class="nav-link ${activePage === 'home' ? 'active' : ''}" data-en="Home" data-ta="முகப்பு">Home</a>
        <a href="${servicesHref}" class="nav-link ${activePage === 'services' ? 'active' : ''}" data-en="Services" data-ta="சேவைகள்">Services</a>
        <a href="${aboutHref}" class="nav-link ${activePage === 'about' ? 'active' : ''}" data-en="About Us" data-ta="எங்களைப் பற்றி">About Us</a>
        <a href="${contactHref}" class="nav-link ${activePage === 'contact' ? 'active' : ''}" data-en="Contact" data-ta="தொடர்புக்கு">Contact</a>
      </nav>

      <div class="header-actions">
        <button type="button" class="lang-toggle-btn" aria-label="Switch Language">
          <svg class="lang-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          <span class="lang-text">தமிழ்</span>
        </button>

        <a href="${contactHref}" class="header-cta-btn">
          <span data-en="Contact Centre" data-ta="உதவி மையம்">Contact Centre</span>
        </a>

        <button type="button" class="mobile-menu-toggle" aria-label="Toggle navigation menu" aria-expanded="false">
          <svg class="menu-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  </header>`;
}

// Helper: Common Footer
function getFooter(depth = 0) {
  const prefix = depth === 1 ? '../' : '';
  const homeHref = `${prefix}index.html`;
  const servicesHref = `${prefix}services.html`;
  const aboutHref = `${prefix}about.html`;
  const contactHref = `${prefix}contact.html`;
  const logoSrc = `${prefix}assets/aruvi-logo.png`;

  return `
  <footer class="site-footer">
    <div class="container footer-grid">
      <!-- Column 1 – Brand -->
      <div class="footer-col footer-col-brand">
        <div class="footer-brand-header">
          <img src="${logoSrc}" alt="Aruvi E-Sevai Maiyam Logo" class="footer-logo-img">
          <div>
            <span class="footer-brand-title" data-en="Aruvi E-Sevai Maiyam" data-ta="அருவி இ-சேவை மையம்">Aruvi E-Sevai Maiyam</span>
            <div class="footer-brand-sub" data-en="Kovilpatti, Tamil Nadu" data-ta="கோவில்பட்டி, தமிழ்நாடு">Kovilpatti, Tamil Nadu</div>
          </div>
        </div>
        <p class="footer-desc" data-en="Dedicated assistance for Tamil Nadu Unorganized Workers Welfare Board schemes, online applications, and citizen e-Sevai services." data-ta="தமிழ்நாடு அமைப்பு சாரா தொழிலாளர் நலவாரிய நலத்திட்டங்கள், ஆன்லைன் விண்ணப்பங்கள் மற்றும் அரசு இ-சேவை வழிகாட்டல் மையம்.">
          Dedicated assistance for Tamil Nadu Unorganized Workers Welfare Board schemes, online applications, and citizen e-Sevai services.
        </p>
      </div>

      <!-- Column 2 – Quick Links -->
      <div class="footer-col footer-col-links">
        <h4 class="footer-heading" data-en="Quick Links" data-ta="விரைவு இணைப்புகள்">Quick Links</h4>
        <ul class="footer-links">
          <li><a href="${homeHref}" data-en="Home" data-ta="முகப்பு">Home</a></li>
          <li><a href="${servicesHref}" data-en="Services" data-ta="சேவைகள்">Services</a></li>
          <li><a href="${aboutHref}" data-en="About" data-ta="எங்களைப் பற்றி">About</a></li>
          <li><a href="${contactHref}" data-en="Contact" data-ta="தொடர்புக்கு">Contact</a></li>
        </ul>
      </div>

      <!-- Column 3 – Contact Details -->
      <div class="footer-col footer-col-contact">
        <h4 class="footer-heading" data-en="Contact Details" data-ta="மையத் தொடர்பு">Contact Details</h4>
        <div class="footer-contact-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          <span data-en="${CONTACT_INFO.addressEn}" data-ta="${CONTACT_INFO.addressTa}">${CONTACT_INFO.addressEn}</span>
        </div>
        <div class="footer-contact-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <div class="footer-phone-list">
            <a href="tel:${CONTACT_INFO.phone1Raw}" class="footer-phone-link">${CONTACT_INFO.phone1}</a>
            <span class="footer-phone-sep">/</span>
            <a href="tel:${CONTACT_INFO.phone2Raw}" class="footer-phone-link">${CONTACT_INFO.phone2}</a>
          </div>
        </div>
      </div>
    </div>

    <div class="container footer-bottom">
      <div class="footer-copyright" data-en="© ${new Date().getFullYear()} Aruvi E-Sevai Maiyam, Kovilpatti. All rights reserved." data-ta="© ${new Date().getFullYear()} அருவி இ-சேவை மையம், கோவில்பட்டி. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.">
        © ${new Date().getFullYear()} Aruvi E-Sevai Maiyam, Kovilpatti. All rights reserved.
      </div>
      <div class="footer-disclaimer" data-en="Frontend demonstration interface. Backend integration required for live submission." data-ta="முன்முகப்பு மாதிரி இடைமுகம். நேரடி சமர்ப்பிப்பிற்கு Backend இணைப்பு தேவை.">
        Frontend demonstration interface. Backend integration required for live submission.
      </div>
    </div>
  </footer>`;
}

// Helper: Common Submission Modal
function getSubmissionModal() {
  return `
  <div class="modal-overlay" id="submissionModal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
    <div class="modal-box">
      <div class="modal-status-badge">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <span data-en="Backend Integration Required" data-ta="Backend இணைப்பு தேவை">Backend Integration Required</span>
      </div>
      
      <h3 class="modal-title" id="modalTitle" data-en="Backend connection required to submit your application." data-ta="உங்கள் விண்ணப்பத்தைச் சமர்ப்பிக்க Backend இணைப்பு தேவை.">
        Backend connection required to submit your application.
      </h3>

      <p class="modal-body" data-en="This website is currently a frontend-only demonstration. Your application has not been submitted or stored online. Online submission is not available yet, and backend integration is required for live processing." data-ta="இந்த இணையதளம் தற்போது ஒரு முன்முகப்பு (Frontend) மாதிரி மட்டுமே. உங்கள் விவரங்கள் ஆன்லைனில் சமர்ப்பிக்கப்படவில்லை அல்லது சேமிக்கப்படவில்லை. நேரடி செயலாக்கத்திற்கு Backend இணைப்பு தேவை.">
        This website is currently a frontend-only demonstration. Your application has not been submitted or stored online. Online submission is not available yet, and backend integration is required for live processing.
      </p>

      <div class="modal-notice-box">
        <div class="modal-notice-title" data-en="Next Step to Submit Officially:" data-ta="அதிகாரப்பூர்வமாக விண்ணப்பிக்க அடுத்த படி:">
          Next Step to Submit Officially:
        </div>
        <p style="font-size: 0.9rem; color: var(--text-secondary);" data-en="Please bring your original required documents to Aruvi E-Sevai Maiyam, Kovilpatti for instant processing, or call our desk." data-ta="உங்கள் அசல் ஆவணங்களுடன் கோவில்பட்டியில் உள்ள அருவி இ-சேவை மையத்திற்கு நேரடியாக வரவும் அல்லது எங்கள் தொலைபேசி எண்ணில் அழைக்கவும்.">
          Please bring your original required documents to Aruvi E-Sevai Maiyam, Kovilpatti for instant processing, or call our desk.
        </p>
        <div style="margin-top: 0.6rem; font-weight: 700; color: var(--primary); font-size: 0.95rem; line-height: 1.6;">
          📞 95665 16652 / 93637 16652<br>
          <span data-en="📍 24–13, Siva Complex, A.K.S. Theatre Road, Kovilpatti" data-ta="📍 24–13, சிவா காம்ப்ளக்ஸ், A.K.S. தியேட்டர் ரோடு, கோவில்பட்டி">📍 24–13, Siva Complex, A.K.S. Theatre Road, Kovilpatti</span>
        </div>
      </div>

      <div class="modal-actions">
        <button type="button" class="btn btn-primary" id="closeModalBtn" data-en="Understood" data-ta="புரிந்தது">
          Understood
        </button>
      </div>
    </div>
  </div>`;
}

// 2. Generate Index Page (index.html)
function generateHomePage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aruvi E-Sevai Maiyam | Your Trusted Service Centre in Kovilpatti</title>
  <meta name="description" content="Access essential online services and get assistance with your application needs at Aruvi E-Sevai Maiyam, Kovilpatti. Welfare boards, education grants, pensions, and death relief.">
  <link rel="icon" type="image/png" href="assets/aruvi-logo.png">
  <link rel="stylesheet" href="css/style.css">
</head>
<body data-lang="en">
  ${getHeader('home', 0)}

  <main class="main-content">
    <!-- 1. Hero Banner (Continuous lavender-purple wave background flow with clear editorial content) -->
    <section class="hero-section">
      <!-- Continuous Wave Background Layer -->
      <div class="hero-wave-flow" aria-hidden="true">
        <!-- Mobile Continuous Wave (viewBox: 0 0 300 455 - exactly matching mobile hero reference screenshot) -->
        <svg class="hero-wave-art hero-wave-art-mobile" viewBox="0 0 300 455" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mTopWash" x1="300" y1="0" x2="100" y2="160" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#9470D8" stop-opacity="0.28"/>
              <stop offset="50%" stop-color="#BBA2EB" stop-opacity="0.16"/>
              <stop offset="100%" stop-color="#F5F0FC" stop-opacity="0.02"/>
            </linearGradient>
            <linearGradient id="mMidRibbon" x1="300" y1="70" x2="160" y2="300" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#9470D8" stop-opacity="0.30"/>
              <stop offset="40%" stop-color="#B797E8" stop-opacity="0.20"/>
              <stop offset="80%" stop-color="#ECE0F8" stop-opacity="0.08"/>
              <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
            </linearGradient>
            <linearGradient id="mLowerSweep" x1="300" y1="260" x2="0" y2="430" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#9470D8" stop-opacity="0.30"/>
              <stop offset="45%" stop-color="#B797E8" stop-opacity="0.18"/>
              <stop offset="85%" stop-color="#ECE0F8" stop-opacity="0.06"/>
              <stop offset="100%" stop-color="#F5F0FC" stop-opacity="0.02"/>
            </linearGradient>
            <linearGradient id="mBottomCrest" x1="150" y1="390" x2="150" y2="455" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#B495E6" stop-opacity="0.20"/>
              <stop offset="60%" stop-color="#EBE0F8" stop-opacity="0.35"/>
              <stop offset="100%" stop-color="#F5F0FC" stop-opacity="0.60"/>
            </linearGradient>
          </defs>

          <!-- Top-right ambient wave wash -->
          <path d="M 100,0 C 150,15 220,32 300,70 L 300,0 Z" fill="url(#mTopWash)"/>

          <!-- Top subtle contour lines matching reference screenshot curves -->
          <path d="M 75,0 C 110,25 150,55 300,98" stroke="#9470D8" stroke-opacity="0.32" stroke-width="1.1" stroke-linecap="round" fill="none"/>
          <path d="M 120,0 C 155,20 205,42 300,68" stroke="#9470D8" stroke-opacity="0.36" stroke-width="1.2" stroke-linecap="round" fill="none"/>
          <path d="M 180,0 C 215,35 250,75 300,135" stroke="#9470D8" stroke-opacity="0.24" stroke-width="1.1" stroke-linecap="round" fill="none"/>

          <!-- Middle continuous wave band (flowing behind heading, description, Contact button) -->
          <path d="M 300,70 C 230,105 185,185 210,255 C 228,295 260,312 300,320 L 300,70 Z" fill="url(#mMidRibbon)"/>
          <path d="M 300,85 C 225,120 180,195 205,262 C 222,300 255,316 300,324" stroke="#9470D8" stroke-opacity="0.34" stroke-width="1.2" stroke-linecap="round" fill="none"/>
          <path d="M 300,145 C 240,180 200,240 215,285 C 226,315 260,332 300,342" stroke="#9470D8" stroke-opacity="0.22" stroke-width="1.1" stroke-linecap="round" fill="none"/>

          <!-- Lower continuous wave sweep (behind buttons & feature row down to bottom edge) -->
          <path d="M 300,255 C 220,310 150,355 97,380 C 58,400 25,410 0,415 L 0,455 L 300,455 Z" fill="url(#mLowerSweep)"/>
          <path d="M 300,265 C 210,320 142,362 97,382 C 60,398 25,408 0,416" stroke="#9470D8" stroke-opacity="0.34" stroke-width="1.2" stroke-linecap="round" fill="none"/>
          <path d="M 300,320 C 225,365 158,405 100,422 C 55,435 20,442 0,446" stroke="#9470D8" stroke-opacity="0.22" stroke-width="1.1" stroke-linecap="round" fill="none"/>

          <!-- Bottom wave finishing smoothly into next section -->
          <path d="M 0,395 C 70,418 160,398 230,415 C 268,424 290,432 300,438 L 300,455 L 0,455 Z" fill="url(#mBottomCrest)"/>
          <path d="M 0,405 C 72,424 162,404 232,420 C 268,428 290,435 300,440" stroke="#9470D8" stroke-opacity="0.28" stroke-width="1.2" stroke-linecap="round" fill="none"/>
        </svg>

        <!-- Desktop Continuous Wave (viewBox: 0 0 1440 720) -->
        <svg class="hero-wave-art hero-wave-art-desktop" viewBox="0 0 1440 720" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="dTopWash" x1="1440" y1="0" x2="650" y2="350" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#9470D8" stop-opacity="0.18"/>
              <stop offset="60%" stop-color="#BBA2EB" stop-opacity="0.08"/>
              <stop offset="100%" stop-color="#F5F0FC" stop-opacity="0.01"/>
            </linearGradient>
            <linearGradient id="dMidRibbon" x1="1440" y1="150" x2="600" y2="550" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#9470D8" stop-opacity="0.20"/>
              <stop offset="50%" stop-color="#B797E8" stop-opacity="0.12"/>
              <stop offset="85%" stop-color="#ECE0F8" stop-opacity="0.05"/>
              <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
            </linearGradient>
            <linearGradient id="dLowerSweep" x1="1440" y1="360" x2="0" y2="720" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#9470D8" stop-opacity="0.18"/>
              <stop offset="55%" stop-color="#C2ACEF" stop-opacity="0.10"/>
              <stop offset="100%" stop-color="#F5F0FC" stop-opacity="0.02"/>
            </linearGradient>
            <linearGradient id="dBottomCrest" x1="720" y1="580" x2="720" y2="720" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#B495E6" stop-opacity="0.14"/>
              <stop offset="65%" stop-color="#EBE0F8" stop-opacity="0.25"/>
              <stop offset="100%" stop-color="#F5F0FC" stop-opacity="0.40"/>
            </linearGradient>
          </defs>

          <!-- Top ambient wash -->
          <path d="M 550,0 C 750,25 1050,70 1440,160 L 1440,0 Z" fill="url(#dTopWash)"/>

          <!-- Top subtle contour lines -->
          <path d="M 320,60 C 600,25 950,65 1440,150" stroke="#9470D8" stroke-opacity="0.22" stroke-width="1.3" stroke-linecap="round" fill="none"/>
          <path d="M 680,0 C 850,75 1100,140 1440,215" stroke="#9470D8" stroke-opacity="0.30" stroke-width="1.4" stroke-linecap="round" fill="none"/>
          <path d="M 880,0 C 1020,80 1220,165 1440,270" stroke="#9470D8" stroke-opacity="0.20" stroke-width="1.2" stroke-linecap="round" fill="none"/>

          <!-- Middle continuous wave band -->
          <path d="M 1440,140 C 1150,190 850,290 880,410 C 900,480 1100,530 1440,560 L 1440,140 Z" fill="url(#dMidRibbon)"/>
          <path d="M 1440,165 C 1120,215 820,310 850,425 C 875,495 1080,545 1440,570" stroke="#9470D8" stroke-opacity="0.30" stroke-width="1.4" stroke-linecap="round" fill="none"/>
          <path d="M 1440,280 C 1180,330 940,430 960,510 C 980,570 1150,610 1440,630" stroke="#9470D8" stroke-opacity="0.18" stroke-width="1.2" stroke-linecap="round" fill="none"/>

          <!-- Lower continuous wave sweep (across to left bottom) -->
          <path d="M 1440,360 C 1150,410 820,490 600,560 C 380,630 180,670 0,685 L 0,720 L 1440,720 Z" fill="url(#dLowerSweep)"/>
          <path d="M 1440,380 C 1120,430 780,510 560,580 C 340,650 150,685 0,700" stroke="#9470D8" stroke-opacity="0.30" stroke-width="1.4" stroke-linecap="round" fill="none"/>
          <path d="M 1440,470 C 1160,520 840,590 620,645 C 400,700 200,710 0,715" stroke="#9470D8" stroke-opacity="0.20" stroke-width="1.2" stroke-linecap="round" fill="none"/>

          <!-- Bottom wave finishing smoothly -->
          <path d="M 0,635 C 360,670 750,635 1100,665 C 1240,677 1360,695 1440,705 L 1440,720 L 0,720 Z" fill="url(#dBottomCrest)"/>
          <path d="M 0,648 C 380,680 770,648 1120,676 C 1260,688 1370,702 1440,712" stroke="#9470D8" stroke-opacity="0.25" stroke-width="1.3" stroke-linecap="round" fill="none"/>
        </svg>
      </div>

      <div class="container hero-container">
        <div class="hero-content">
          <h1 class="hero-title" data-en="Your Trusted E-Sevai Service Centre" data-ta="உங்கள் நம்பிக்கைக்குரிய இ-சேவை மையம்">
            Your Trusted E-Sevai Service Centre
          </h1>
          <p class="hero-desc" data-en="Access essential online services and get assistance with your application needs at Aruvi E-Sevai Maiyam, Kovilpatti." data-ta="அருவி இ-சேவை மையம், கோவில்பட்டி மூலம் அத்தியாவசிய அரசு நலத்திட்டங்கள் மற்றும் இணையதள சேவைகளுக்கான நேரடி வழிகாட்டுதலையும் உதவி சேவைகளையும் எளிதாகப் பெறுங்கள்.">
            Access essential online services and get assistance with your application needs at Aruvi E-Sevai Maiyam, Kovilpatti.
          </p>
          <div class="hero-actions">
            <a href="services.html" class="btn btn-primary btn-lg">
              <span data-en="Explore Services" data-ta="சேவைகளைக் காண்க">Explore Services</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
            <a href="contact.html" class="btn btn-secondary btn-lg">
              <span data-en="Contact Centre" data-ta="மையத்தைத் தொடர்பு கொள்ள">Contact Centre</span>
            </a>
          </div>
          <div class="hero-features-row">
            <div class="hero-feature-item">
              <span class="hero-feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </span>
              <span class="hero-feature-text" data-en="People-First Assistance" data-ta="மக்களுக்கான உதவி">People-First Assistance</span>
            </div>
            <div class="hero-feature-divider" aria-hidden="true"></div>
            <div class="hero-feature-item">
              <span class="hero-feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
              </span>
              <span class="hero-feature-text" data-en="Application Guidance" data-ta="விண்ணப்ப வழிகாட்டுதல்">Application Guidance</span>
            </div>
            <div class="hero-feature-divider" aria-hidden="true"></div>
            <div class="hero-feature-item">
              <span class="hero-feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </span>
              <span class="hero-feature-text" data-en="Local Support in Kovilpatti" data-ta="கோவில்பட்டியில் உதவி">Local Support in Kovilpatti</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. Service Guidance Slider -->
    <section class="home-slider-section" aria-label="Service guidance" data-aria-en="Service guidance" data-aria-ta="சேவை வழிகாட்டுதல்">
      <div class="container">
        <div class="home-slider" id="home-assistance-slider" aria-roledescription="carousel" aria-label="Helpful service guidance" data-aria-en="Helpful service guidance" data-aria-ta="பயனுள்ள சேவை வழிகாட்டுதல்">
          <div class="home-slider-track" aria-live="off">
            <article class="home-slider-slide" role="group" aria-roledescription="slide" aria-label="1 of 3" aria-hidden="false">
              <div class="home-slider-content">
                <span class="home-slider-kicker" data-en="Clear, practical guidance" data-ta="தெளிவான நடைமுறை வழிகாட்டுதல்">Clear, practical guidance</span>
                <h2 class="home-slider-title" data-en="Understand the steps before you apply" data-ta="விண்ணப்பிக்கும் முன் படிகளைப் புரிந்துகொள்ளுங்கள்">Understand the steps before you apply</h2>
                <p class="home-slider-description" data-en="Forms and document guidance." data-ta="படிவம், ஆவண உதவி.">Forms and document guidance.</p>
              </div>
              <div class="home-slider-image-wrap">
                <img src="assets/slider/aadhaar-registration-camp.jpg" alt="Women receiving Aadhaar registration assistance at a public information camp" data-alt-en="Women receiving Aadhaar registration assistance at a public information camp" data-alt-ta="பொது தகவல் முகாமில் ஆதார் பதிவுக்கு உதவி பெறும் பெண்கள்" width="960" height="643" decoding="async" fetchpriority="high" draggable="false">
              </div>
            </article>

            <article class="home-slider-slide" role="group" aria-roledescription="slide" aria-label="2 of 3" aria-hidden="true">
              <div class="home-slider-content">
                <span class="home-slider-kicker" data-en="Support with online services" data-ta="இணையவழிச் சேவைகளுக்கான உதவி">Support with online services</span>
                <h2 class="home-slider-title" data-en="Guidance with online applications" data-ta="இணைய விண்ணப்பங்களுக்கு வழிகாட்டுதல்">Guidance with online applications</h2>
                <p class="home-slider-description" data-en="Support with forms and required documents." data-ta="படிவங்கள் மற்றும் தேவையான ஆவணங்களுக்கான உதவி.">Support with forms and required documents.</p>
              </div>
              <div class="home-slider-image-wrap">
                <img src="assets/slider/aadhaar-registration-counter.jpg" alt="A man completing Aadhaar registration with help at a counter" data-alt-en="A man completing Aadhaar registration with help at a counter" data-alt-ta="ஆதார் பதிவு மையத்தில் உதவியுடன் விண்ணப்பிக்கும் ஒருவர்" width="960" height="720" decoding="async" draggable="false">
              </div>
            </article>

            <article class="home-slider-slide" role="group" aria-roledescription="slide" aria-label="3 of 3" aria-hidden="true">
              <div class="home-slider-content">
                <span class="home-slider-kicker" data-en="Honest information" data-ta="நேர்மையான தகவல்">Honest information</span>
                <h2 class="home-slider-title" data-en="Honest guidance on schemes" data-ta="திட்டங்கள் குறித்து நேர்மையான வழிகாட்டுதல்">Honest guidance on schemes</h2>
                <p class="home-slider-description" data-en="Authorities decide eligibility." data-ta="தகுதியைத் துறை தீர்மானிக்கும்.">Authorities decide eligibility.</p>
              </div>
              <div class="home-slider-image-wrap">
                <img src="assets/slider/aruvi-storefront.jpg" class="home-slider-img-storefront" alt="Aruvi E-Sevai Maiyam storefront and official Tamil signboard in Kovilpatti" data-alt-en="Aruvi E-Sevai Maiyam storefront and official Tamil signboard in Kovilpatti" data-alt-ta="கோவில்பட்டி அருவி இ-சேவை மையத்தின் முகப்பு மற்றும் அதிகாரப்பூர்வ தமிழ்ப் பலகை" width="1024" height="559" loading="lazy" decoding="async" draggable="false">
              </div>
            </article>
          </div>

        </div>
      </div>
    </section>

    <!-- 3. Services by Category -->
    <section class="section section-pale" id="services-by-category">
      <div class="container">
        <div class="section-header text-center">
          <span class="section-tag" data-en="Services by Category" data-ta="பிரிவு வாரியான சேவைகள்">Services by Category</span>
          <h2 class="section-title" data-en="Explore Services by Welfare Category" data-ta="நலவாரியப் பிரிவு வாரியாக சேவைகள்">
            Explore Services by Welfare Category
          </h2>
          <p class="section-desc" data-en="All 27 verified unorganized worker welfare schemes and public assistance services structured across 5 primary categories." data-ta="அனைத்து 27 சரிபார்க்கப்பட்ட அமைப்பு சாரா நலவாரிய திட்டங்கள் மற்றும் அரசு இ-சேவைகளை 5 முதன்மைப் பிரிவுகளின் கீழ் எளிதாகக் கண்டறியலாம்.">
            All 27 verified unorganized worker welfare schemes and public assistance services structured across 5 primary categories.
          </p>
        </div>

        <!-- 5 Category Navigation Cards with Natural Photographic Backgrounds -->
        <div class="categories-nav-grid">
          <a href="services.html?cat=registration" class="category-nav-card" data-category="registration">
            <div class="category-card-bg" style="background-image: url('assets/categories/cat-registration.jpg');" role="img" aria-label="Welfare Registration"></div>
            <div class="category-card-overlay" aria-hidden="true"></div>
            <div class="category-card-content">
              <div class="category-nav-card-top">
                <span class="category-nav-count" data-en="2 Schemes" data-ta="2 சேவைகள்">2 Schemes</span>
              </div>
              <h3 class="category-nav-title" data-en="Welfare Registration" data-ta="நலவாரியப் பதிவு">Welfare Registration</h3>
              <div class="category-nav-action">
                <span data-en="Explore Services" data-ta="சேவைகளை அணுக">Explore Services</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </div>
          </a>

          <a href="services.html?cat=education" class="category-nav-card" data-category="education">
            <div class="category-card-bg" style="background-image: url('assets/categories/cat-education.jpg');" role="img" aria-label="Educational Assistance"></div>
            <div class="category-card-overlay" aria-hidden="true"></div>
            <div class="category-card-content">
              <div class="category-nav-card-top">
                <span class="category-nav-count" data-en="11 Schemes" data-ta="11 சேவைகள்">11 Schemes</span>
              </div>
              <h3 class="category-nav-title" data-en="Educational Assistance" data-ta="கல்வி உதவி">Educational Assistance</h3>
              <div class="category-nav-action">
                <span data-en="Explore Services" data-ta="சேவைகளை அணுக">Explore Services</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </div>
          </a>

          <a href="services.html?cat=family" class="category-nav-card" data-category="family">
            <div class="category-card-bg" style="background-image: url('assets/categories/cat-family.jpg');" role="img" aria-label="Family & Social Welfare"></div>
            <div class="category-card-overlay" aria-hidden="true"></div>
            <div class="category-card-content">
              <div class="category-nav-card-top">
                <span class="category-nav-count" data-en="6 Schemes" data-ta="6 சேவைகள்">6 Schemes</span>
              </div>
              <h3 class="category-nav-title" data-en="Family & Social Welfare" data-ta="குடும்ப நலன்">Family & Social Welfare</h3>
              <div class="category-nav-action">
                <span data-en="Explore Services" data-ta="சேவைகளை அணுக">Explore Services</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </div>
          </a>

          <a href="services.html?cat=relief" class="category-nav-card" data-category="relief">
            <div class="category-card-bg" style="background-image: url('assets/categories/cat-relief.jpg');" role="img" aria-label="Death Relief & Compensation"></div>
            <div class="category-card-overlay" aria-hidden="true"></div>
            <div class="category-card-content">
              <div class="category-nav-card-top">
                <span class="category-nav-count" data-en="3 Schemes" data-ta="3 சேவைகள்">3 Schemes</span>
              </div>
              <h3 class="category-nav-title" data-en="Death Relief & Compensation" data-ta="மரண நிவாரணம்">Death Relief & Compensation</h3>
              <div class="category-nav-action">
                <span data-en="Explore Services" data-ta="சேவைகளை அணுக">Explore Services</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </div>
          </a>

          <a href="services.html?cat=special" class="category-nav-card" data-category="special">
            <div class="category-card-bg" style="background-image: url('assets/categories/cat-special.jpg');" role="img" aria-label="Special Schemes & Subsidies"></div>
            <div class="category-card-overlay" aria-hidden="true"></div>
            <div class="category-card-content">
              <div class="category-nav-card-top">
                <span class="category-nav-count" data-en="5 Schemes" data-ta="5 சேவைகள்">5 Schemes</span>
              </div>
              <h3 class="category-nav-title" data-en="Special Schemes & Subsidies" data-ta="சிறப்புத் திட்டங்கள்">Special Schemes & Subsidies</h3>
              <div class="category-nav-action">
                <span data-en="Explore Services" data-ta="சேவைகளை அணுக">Explore Services</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </div>
          </a>
        </div>

        <!-- Single Clean Callout to View All 27 Services (No duplicate service cards on Homepage) -->
        <div class="categories-view-all">
          <a href="services.html" class="btn btn-primary btn-lg">
            <span data-en="View All 27 Services" data-ta="அனைத்து 27 சேவைகளையும் காண்க">View All 27 Services</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
        </div>
      </div>
    </section>

    <!-- 4. About Aruvi -->
    <section class="section" id="about-aruvi">
      <div class="container">
        <div class="section-header text-center">
          <span class="section-tag" data-en="About Aruvi" data-ta="அருவி பற்றி">About Aruvi</span>
          <h2 class="section-title" data-en="About Aruvi E-Sevai Maiyam" data-ta="அருவி இ-சேவை மையம் பற்றி">
            About Aruvi E-Sevai Maiyam
          </h2>
          <p class="section-desc" data-en="Aruvi E-Sevai Maiyam is a community-focused public service centre based in Kovilpatti. We assist workers, students, senior citizens, and families in accessing authentic government welfare schemes." data-ta="அருவி இ-சேவை மையம் என்பது கோவில்பட்டியில் செயல்படும் மக்கள் சேவை மையமாகும். தொழிலாளர்கள், மாணவ-மாணவியர், முதியோர் மற்றும் குடும்பங்கள் தங்களுக்குரிய அரசு நலத்திட்டங்களை முறையாகப் பெற வழிகாட்டுகிறோம்.">
            Aruvi E-Sevai Maiyam is a community-focused public service centre based in Kovilpatti. We assist workers, students, senior citizens, and families in accessing authentic government welfare schemes.
          </p>
        </div>

        <div class="about-preview-grid">
          <div style="background: var(--pale-lavender); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1.75rem;">
            <div style="width: 44px; height: 44px; background: var(--white); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; color: var(--primary); margin-bottom: 1rem;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            </div>
            <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.5rem;" data-en="Accurate Eligibility Check" data-ta="சரியான தகுதி சரிபார்ப்பு">Accurate Eligibility Check</h3>
            <p style="font-size: 0.9rem; color: var(--text-secondary);" data-en="We verify your age, trade, and document criteria before you apply, eliminating unnecessary rejections." data-ta="விண்ணப்பிப்பதற்கு முன் உங்கள் வயது, தொழில் மற்றும் ஆவணங்களைச் சரிபார்த்து நிராகரிப்புகள் ஏற்படுவதைத் தவிர்க்கிறோம்.">We verify your age, trade, and document criteria before you apply, eliminating unnecessary rejections.</p>
          </div>

          <div style="background: var(--pale-lavender); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1.75rem;">
            <div style="width: 44px; height: 44px; background: var(--white); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; color: var(--primary); margin-bottom: 1rem;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
            <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.5rem;" data-en="Clear Document Checklists" data-ta="முழுமையான ஆவண வழிகாட்டல்">Clear Document Checklists</h3>
            <p style="font-size: 0.9rem; color: var(--text-secondary);" data-en="Every service is accompanied by a transparent checklist so you know exactly which original documents are required." data-ta="ஒவ்வொரு திட்டத்திற்கும் தேவையான அசல் ஆவணங்களின் தெளிவான பட்டியல் முன்கூட்டியே வழங்கப்படுகிறது.">Every service is accompanied by a transparent checklist so you know exactly which original documents are required.</p>
          </div>

          <div style="background: var(--pale-lavender); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1.75rem;">
            <div style="width: 44px; height: 44px; background: var(--white); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; color: var(--primary); margin-bottom: 1rem;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.5rem;" data-en="Senior Citizen Friendly" data-ta="முதியோருக்கான தனி வழிகாட்டல்">Senior Citizen Friendly</h3>
            <p style="font-size: 0.9rem; color: var(--text-secondary);" data-en="Courteous, respectful in-person guidance for unorganized laborers and elders with Tamil communication." data-ta="அமைப்பு சாரா தொழிலாளர்கள் மற்றும் முதியோர்களுக்குத் தெளிவான தமிழில் பொறுமையான நேரடி உதவி சேவை.">Courteous, respectful in-person guidance for unorganized laborers and elders with Tamil communication.</p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 2.25rem;">
          <a href="about.html" class="btn btn-secondary">
            <span data-en="Learn More About Our Centre" data-ta="எங்கள் மையத்தைப் பற்றி மேலும் அறிய">Learn More About Our Centre</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </a>
        </div>
      </div>
    </section>

    <!-- 5. Contact Preview -->
    <section class="section section-pale" id="contact-preview">
      <div class="container">
        <div class="contact-preview-card">
          <div class="contact-preview-grid">
            <div class="contact-preview-info">
              <span class="section-tag" data-en="Need Assistance?" data-ta="உதவி தேவையா?">Need Assistance?</span>
              <h2 class="contact-preview-title" data-en="Visit Our Centre in Kovilpatti or Call Us" data-ta="கோவில்பட்டி மையத்திற்கு நேரில் வரவும் அல்லது அழைக்கவும்">
                Visit Our Centre in Kovilpatti or Call Us
              </h2>
              <p class="contact-preview-desc" data-en="Our team is available to assist you with document verification, welfare board applications, and e-Sevai submissions." data-ta="நலவாரிய விண்ணப்பங்கள், ஆவண சரிபார்ப்பு மற்றும் ஆன்லைன் சேவை உதவிகளுக்கு எங்கள் மையத்தின் நேரடி வழிகாட்டலைப் பெறுங்கள்.">
                Our team is available to assist you with document verification, welfare board applications, and e-Sevai submissions.
              </p>
              
              <div class="contact-preview-details">
                <div class="contact-preview-item">
                  <div class="contact-preview-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <div class="contact-preview-text">
                    <strong class="contact-preview-address" data-en="${CONTACT_INFO.addressEn}" data-ta="${CONTACT_INFO.addressTa}">${CONTACT_INFO.addressEn}</strong>
                  </div>
                </div>

                <div class="contact-preview-item">
                  <div class="contact-preview-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </div>
                  <div class="contact-preview-text">
                    <div class="contact-preview-phones">
                      <a href="tel:${CONTACT_INFO.phone1Raw}" class="contact-preview-phone-link">${CONTACT_INFO.phone1}</a>
                      <span class="contact-preview-phone-sep">/</span>
                      <a href="tel:${CONTACT_INFO.phone2Raw}" class="contact-preview-phone-link">${CONTACT_INFO.phone2}</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="contact-preview-actions">
              <a href="tel:${CONTACT_INFO.phone1Raw}" class="btn btn-primary btn-lg contact-preview-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span data-en="Call Now (${CONTACT_INFO.phone1})" data-ta="அழைக்க (${CONTACT_INFO.phone1})">Call Now (${CONTACT_INFO.phone1})</span>
              </a>
              <a href="contact.html" class="btn btn-secondary btn-lg contact-preview-btn">
                <span data-en="View Full Contact & Address" data-ta="முழு முகவரி விவரங்கள்">View Full Contact & Address</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  ${getFooter(0)}

  <script src="js/data.js"></script>
  <script src="js/home-slider.js"></script>
  <script src="js/app.js"></script>
</body>
</html>`;
}

// 3. Generate Services Directory Page (services.html)
function generateServicesPage() {
  const allCardsHtml = services.map(s => {
    const cat = CATEGORIES[s.category] || CATEGORIES.registration;
    return `
    <article class="service-card" data-category="${s.category}" data-title-en="${s.titleEn}" data-title-ta="${s.titleTa}" data-desc-en="${s.shortDescEn}" data-desc-ta="${s.shortDescTa}">
      <div class="service-card-top">
        <div class="service-icon-box">
          ${cat.icon}
        </div>
        <span class="category-tag" data-en="${cat.en}" data-ta="${cat.ta}">${cat.en}</span>
      </div>
      <h3 class="service-title" data-en="${s.titleEn}" data-ta="${s.titleTa}">${s.titleEn}</h3>
      <p class="service-desc" data-en="${s.shortDescEn}" data-ta="${s.shortDescTa}">${s.shortDescEn}</p>
      <div class="service-card-footer">
        <a href="services/${s.id}.html" class="service-link">
          <span data-en="View Details" data-ta="விவரங்களைக் காண்க">View Details</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </a>
      </div>
    </article>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>All 27 Services | Aruvi E-Sevai Maiyam, Kovilpatti</title>
  <meta name="description" content="Explore all 27 verified welfare board and e-Sevai services in Kovilpatti. Search by name, view required documents, and apply online.">
  <link rel="icon" type="image/png" href="assets/aruvi-logo.png">
  <link rel="stylesheet" href="css/style.css">
</head>
<body data-lang="en">
  ${getHeader('services', 0)}

  <main class="main-content">
    <div class="page-banner">
      <div class="container">
        <div class="breadcrumbs">
          <a href="index.html" data-en="Home" data-ta="முகப்பு">Home</a>
          <span class="breadcrumbs-sep">/</span>
          <span class="breadcrumbs-current" data-en="Services" data-ta="சேவைகள்">Services</span>
        </div>
        <h1 class="page-title" data-en="Government Schemes & Welfare Services" data-ta="அரசு நலத்திட்டங்கள் & சேவைகள்">Government Schemes & Welfare Services</h1>
        <p class="page-subtitle" data-en="Explore all 27 verified unorganized worker welfare schemes and public assistance services. Search by name or filter by category." data-ta="அனைத்து 27 சரிபார்க்கப்பட்ட அமைப்பு சாரா நலவாரிய திட்டங்கள் மற்றும் சேவைகளை இங்கு காணலாம். பெயர் அல்லது பிரிவு வாரியாகத் தேடலாம்.">
          Explore all 27 verified unorganized worker welfare schemes and public assistance services. Search by name or filter by category.
        </p>
      </div>
    </div>

    <section class="section">
      <div class="container">
        <!-- Search and Filter Toolbar -->
        <div class="toolbar-wrap">
          <div class="search-box-wrap">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" id="serviceSearchInput" class="search-input" placeholder="Search services by name in English or Tamil..." data-en="Search services by name in English or Tamil..." data-ta="சேவையின் பெயரைத் தமிழ் அல்லது ஆங்கிலத்தில் தட்டச்சு செய்யவும்...">
          </div>

          <div class="filter-pills" role="tablist">
            <button type="button" class="filter-btn active" data-filter="all" data-en="All Services (27)" data-ta="அனைத்து சேவைகள் (27)">All Services (27)</button>
            <button type="button" class="filter-btn" data-filter="registration" data-en="Welfare Registration (2)" data-ta="நலவாரியப் பதிவு (2)">Welfare Registration (2)</button>
            <button type="button" class="filter-btn" data-filter="education" data-en="Educational Assistance (11)" data-ta="கல்வி உதவி (11)">Educational Assistance (11)</button>
            <button type="button" class="filter-btn" data-filter="family" data-en="Family Welfare & Pensions (6)" data-ta="குடும்ப நலன் & ஓய்வூதியம் (6)">Family Welfare & Pensions (6)</button>
            <button type="button" class="filter-btn" data-filter="relief" data-en="Death Relief & Compensation (3)" data-ta="மரண நிவாரணம் (3)">Death Relief & Compensation (3)</button>
            <button type="button" class="filter-btn" data-filter="special" data-en="Special Schemes & Subsidies (5)" data-ta="சிறப்பு திட்டங்கள் (5)">Special Schemes & Subsidies (5)</button>
          </div>

          <div class="results-meta">
            <span data-en="Showing" data-ta="காட்டப்படும் சேவைகள்:">Showing</span> 
            <span id="visibleServicesCount">27</span> 
            <span data-en="services" data-ta="">services</span>
          </div>
        </div>

        <!-- No results message -->
        <div id="noServicesFound" style="display: none; padding: 3rem; text-align: center; background: var(--pale-lavender); border-radius: var(--radius-md); border: 1px solid var(--border-light); margin-bottom: 2rem;">
          <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;" data-en="No matching services found" data-ta="பொருந்தும் சேவைகள் ஏதும் கிடைக்கவில்லை">No matching services found</h3>
          <p style="font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 1.25rem;" data-en="Try searching with different keywords or clear your active filter." data-ta="வேறு வார்த்தைகளைப் பயன்படுத்தி தேடவும் அல்லது வடிகட்டியை மீட்டமைக்கவும்.">Try searching with different keywords or clear your active filter.</p>
          <button type="button" class="btn btn-secondary" id="resetFilterBtn" data-en="Reset Search & Filters" data-ta="மீட்டமைக்க">Reset Search & Filters</button>
        </div>

        <!-- Services Grid -->
        <div class="services-grid" id="servicesGridContainer">
          ${allCardsHtml}
        </div>
      </div>
    </section>
  </main>

  ${getFooter(0)}

  <script src="js/data.js"></script>
  <script src="js/app.js"></script>
</body>
</html>`;
}

// 4. Generate About Page (about.html)
function generateAboutPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>About Us | Aruvi E-Sevai Maiyam, Kovilpatti</title>
  <meta name="description" content="Learn about Aruvi E-Sevai Maiyam in Kovilpatti. Our purpose, citizen support values, and assistance for unorganized workers.">
  <link rel="icon" type="image/png" href="assets/aruvi-logo.png">
  <link rel="stylesheet" href="css/style.css">
</head>
<body data-lang="en">
  ${getHeader('about', 0)}

  <main class="main-content">
    <div class="page-banner">
      <div class="container">
        <div class="breadcrumbs">
          <a href="index.html" data-en="Home" data-ta="முகப்பு">Home</a>
          <span class="breadcrumbs-sep">/</span>
          <span class="breadcrumbs-current" data-en="About Us" data-ta="எங்களைப் பற்றி">About Us</span>
        </div>
        <h1 class="page-title" data-en="About Aruvi E-Sevai Maiyam" data-ta="அருவி இ-சேவை மையம் பற்றி">About Aruvi E-Sevai Maiyam</h1>
        <p class="page-subtitle" data-en="Dedicated public service assistance in Kovilpatti, helping citizens navigate government schemes with transparency and ease." data-ta="கோவில்பட்டியில் செயல்படும் மக்கள் சேவை மையம். அரசு நலத்திட்டங்களை வெளிப்படைத்தன்மையுடன் அணுக பொதுமக்களுக்கு வழிகாட்டுகிறோம்.">
          Dedicated public service assistance in Kovilpatti, helping citizens navigate government schemes with transparency and ease.
        </p>
      </div>
    </div>

    <section class="section">
      <div class="container" style="max-width: 900px;">
        <article class="detail-card" style="margin-bottom: 2rem;">
          <h2 class="detail-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <span data-en="About Aruvi E-Sevai Maiyam" data-ta="அருவி இ-சேவை மையம் பற்றி">About Aruvi E-Sevai Maiyam</span>
          </h2>
          <p style="font-size: 1.05rem; line-height: 1.7; color: var(--text-secondary); margin-bottom: 1rem;" data-en="Aruvi E-Sevai Maiyam is a community-oriented e-Sevai and welfare facilitation centre located at 24–13, Siva Complex, A.K.S. Theatre Road, Kovilpatti, Tamil Nadu. We specialize in helping members of the general public, unorganized daily-wage workers, students, and senior citizens access legitimate welfare schemes and online government applications." data-ta="அருவி இ-சேவை மையம் என்பது தமிழ்நாட்டின் கோவில்பட்டியில் (24–13, சிவா காம்ப்ளக்ஸ், A.K.S. தியேட்டர் ரோடு) இயங்கும் மக்கள் நல சேவை மையமாகும். அமைப்பு சாரா தொழிலாளர்கள், ஏழை எளிய மக்கள், மாணவ-மாணவியர் மற்றும் முதியோர்கள் அரசின் நலத்திட்டங்களை தடையின்றி பெற ஆவண உதவி மற்றும் ஆன்லைன் சேவை வழிகாட்டல்களை வழங்குகிறோம்.">
            Aruvi E-Sevai Maiyam is a community-oriented e-Sevai and welfare facilitation centre located at 24–13, Siva Complex, A.K.S. Theatre Road, Kovilpatti, Tamil Nadu. We specialize in helping members of the general public, unorganized daily-wage workers, students, and senior citizens access legitimate welfare schemes and online government applications.
          </p>
          <p style="font-size: 1.05rem; line-height: 1.7; color: var(--text-secondary);" data-en="Understanding governmental portal procedures, uploading document scans, and adhering to strict guidelines can be daunting. Our centre bridges this gap through patient, personal assistance." data-ta="அரசு இணையதளங்கள் மூலம் விண்ணப்பிப்பது, ஆவணங்களைச் சரியாகப் பதிவேற்றுவது மற்றும் விதிமுறைகளைப் பின்பற்றுவது பலருக்கும் சவாலாக உள்ளது. எங்கள் மையம் நேரடி வழிகாட்டல் மூலம் இந்த இடைவெளியைக் குறைக்கிறது.">
            Understanding governmental portal procedures, uploading document scans, and adhering to strict guidelines can be daunting. Our centre bridges this gap through patient, personal assistance.
          </p>
        </article>

        <article class="detail-card" style="margin-bottom: 2rem;">
          <h2 class="detail-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
            <span data-en="Our Purpose" data-ta="எங்கள் நோக்கம்">Our Purpose</span>
          </h2>
          <p style="font-size: 1.05rem; line-height: 1.7; color: var(--text-secondary);" data-en="Our core mission is to ensure that eligible unorganized workers and local families in Kovilpatti do not miss out on educational aid, pensions, maternity benefits, or marriage grants due to lack of digital access or document awareness. We aim to provide honest, transparent, and respectful service to every visitor." data-ta="கோவில்பட்டி மற்றும் சுற்றுவட்டாரப் பகுதிகளில் உள்ள தகுதியான அமைப்பு சாரா தொழிலாளர்கள் மற்றும் குடும்பங்களுக்கு கல்வி உதவித்தொகை, மாதாந்திர ஓய்வூதியம், மகப்பேறு உதவி, திருமண உதவி போன்ற பலன்கள் தகவல் பற்றாக்குறையால் விடுபட்டுவிடக் கூடாது என்பதே எங்கள் முதன்மை நோக்கமாகும். ஒவ்வொருவருக்கும் உண்மையான, மரியாதையான சேவையை வழங்குவதே எங்கள் குறிக்கோள்.">
            Our core mission is to ensure that eligible unorganized workers and local families in Kovilpatti do not miss out on educational aid, pensions, maternity benefits, or marriage grants due to lack of digital access or document awareness. We aim to provide honest, transparent, and respectful service to every visitor.
          </p>
        </article>

        <article class="detail-card" style="margin-bottom: 2rem;">
          <h2 class="detail-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span data-en="What You Can Expect" data-ta="நீங்கள் எதிர்பார்ப்பவை">What You Can Expect</span>
          </h2>
          <ul class="docs-list">
            <li class="docs-item">
              <svg class="docs-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              <div>
                <strong data-en="Transparent Document Guidance: " data-ta="தெளிவான ஆவண வழிகாட்டல்: ">Transparent Document Guidance: </strong>
                <span data-en="We provide upfront checklists of original certificates needed so you do not make multiple visits." data-ta="தேவையான அசல் சான்றிதழ்களின் பட்டியலை முன்கூட்டியே தெளிவாகக் கூறுவோம்.">We provide upfront checklists of original certificates needed so you do not make multiple visits.</span>
              </div>
            </li>
            <li class="docs-item">
              <svg class="docs-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              <div>
                <strong data-en="Direct Personal Verification: " data-ta="நேரடி சரிபார்ப்பு: ">Direct Personal Verification: </strong>
                <span data-en="Each application is carefully checked against official scheme norms to minimize processing issues." data-ta="ஒவ்வொரு விண்ணப்பமும் அதிகாரப்பூர்வ விதிகளின்படி கவனமாக சரிபார்க்கப்படுகிறது.">Each application is carefully checked against official scheme norms to minimize processing issues.</span>
              </div>
            </li>
            <li class="docs-item">
              <svg class="docs-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              <div>
                <strong data-en="No Unsupported Claims: " data-ta="உண்மையான வழிகாட்டல்: ">No Unsupported Claims: </strong>
                <span data-en="We do not make unrealistic promises about processing speeds; we follow genuine departmental timelines." data-ta="போலியான வாக்குறுதிகள் இன்றி அரசின் உண்மையான நடைமுறைகளைப் பின்பற்றி உதவுகிறோம்.">We do not make unrealistic promises about processing speeds; we follow genuine departmental timelines.</span>
              </div>
            </li>
          </ul>
        </article>

        <!-- Need Assistance Section -->
        <article class="detail-card" style="background: var(--pale-lavender); border-color: var(--primary);">
          <h2 class="detail-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <span data-en="Need Assistance? Contact Our Centre" data-ta="உதவி தேவையா? எங்கள் மையத்தை அணுகவும்">Need Assistance? Contact Our Centre</span>
          </h2>
          <p style="font-size: 1rem; color: var(--text-secondary); margin-bottom: 1.25rem;" data-en="Have questions regarding eligibility, documents, or ongoing schemes? Feel free to call us or visit our centre." data-ta="தகுதிகள், ஆவணங்கள் அல்லது நலத்திட்டங்கள் குறித்து சந்தேகங்கள் இருந்தால் எங்களை நேரடியாக அழைக்கலாம் அல்லது மையத்திற்கு வரலாம்.">
            Have questions regarding eligibility, documents, or ongoing schemes? Feel free to call us or visit our centre.
          </p>
          <div class="about-assistance-actions">
            <a href="tel:${CONTACT_INFO.phone1Raw}" class="btn btn-primary">
              <span data-en="Call 95665 16652" data-ta="அழைக்க 95665 16652">Call 95665 16652</span>
            </a>
            <a href="tel:${CONTACT_INFO.phone2Raw}" class="btn btn-primary">
              <span data-en="Call 93637 16652" data-ta="அழைக்க 93637 16652">Call 93637 16652</span>
            </a>
            <a href="contact.html" class="btn btn-secondary">
              <span data-en="Contact Page" data-ta="தொடர்பு பக்கம்">Contact Page</span>
            </a>
          </div>
        </article>
      </div>
    </section>
  </main>

  ${getFooter(0)}

  <script src="js/data.js"></script>
  <script src="js/app.js"></script>
</body>
</html>`;
}

// 5. Generate Contact Page (contact.html)
function generateContactPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact Us | Aruvi E-Sevai Maiyam, Kovilpatti</title>
  <meta name="description" content="Contact Aruvi E-Sevai Maiyam in Kovilpatti. Address: 24–13, Siva Complex, A.K.S. Theatre Road. Phone: 95665 16652, 93637 16652.">
  <link rel="icon" type="image/png" href="assets/aruvi-logo.png">
  <link rel="stylesheet" href="css/style.css">
</head>
<body data-lang="en">
  ${getHeader('contact', 0)}

  <main class="main-content">
    <div class="page-banner">
      <div class="container">
        <div class="breadcrumbs">
          <a href="index.html" data-en="Home" data-ta="முகப்பு">Home</a>
          <span class="breadcrumbs-sep">/</span>
          <span class="breadcrumbs-current" data-en="Contact" data-ta="தொடர்புக்கு">Contact</span>
        </div>
        <h1 class="page-title" data-en="Contact Aruvi E-Sevai Maiyam" data-ta="அருவி இ-சேவை மையத்தைத் தொடர்பு கொள்ள">Contact Aruvi E-Sevai Maiyam</h1>
        <p class="page-subtitle" data-en="Get in touch with our Kovilpatti office for questions on eligibility, required documents, or application support." data-ta="தகுதி, தேவையான ஆவணங்கள் அல்லது விண்ணப்ப உதவிகள் குறித்து எங்கள் கோவில்பட்டி அலுவலகத்தைத் தொடர்பு கொள்ளவும்.">
          Get in touch with our Kovilpatti office for questions on eligibility, required documents, or application support.
        </p>
      </div>
    </div>

    <section class="section">
      <div class="container contact-grid">
        <!-- Verified Information Card -->
        <div class="contact-card">
          <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.5rem;" data-en="Official Centre Details" data-ta="அதிகாரப்பூர்வ மைய விவரங்கள்">
            Official Centre Details
          </h2>
          <p style="font-size: 0.95rem; color: var(--text-secondary);" data-en="Visit our centre in person or reach out to our phone desk." data-ta="மையத்திற்கு நேரில் வரவும் அல்லது தொலைபேசியில் தொடர்பு கொள்ளவும்.">
            Visit our centre in person or reach out to our phone desk.
          </p>

          <div class="contact-methods">
            <div class="contact-method-item">
              <div class="contact-method-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div>
                <div class="contact-method-title" data-en="Address" data-ta="முகவரி">Address</div>
                <div class="contact-method-val" data-en="${CONTACT_INFO.addressEn}" data-ta="${CONTACT_INFO.addressTa}">
                  ${CONTACT_INFO.addressEn}
                </div>
              </div>
            </div>

            <div class="contact-method-item">
              <div class="contact-method-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <div>
                <div class="contact-method-title" data-en="Phone Numbers" data-ta="தொலைபேசி எண்கள்">Phone Numbers</div>
                <div class="contact-method-val contact-phones-wrap">
                  <a href="tel:${CONTACT_INFO.phone1Raw}" class="contact-phone-link">${CONTACT_INFO.phone1}</a>
                  <a href="tel:${CONTACT_INFO.phone2Raw}" class="contact-phone-link">${CONTACT_INFO.phone2}</a>
                </div>
              </div>
            </div>
          </div>

          <div style="margin-top: 1.75rem; display: flex; flex-direction: column; gap: 0.75rem;">
            <a href="tel:${CONTACT_INFO.phone1Raw}" class="btn btn-primary btn-lg btn-full">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span data-en="Call Centre Directly" data-ta="மையத்தை உடனடியாக அழைக்கவும்">Call Centre Directly</span>
            </a>
          </div>
        </div>

        <!-- Quick Inquiry Form (with honest frontend validation & notice) -->
        <div class="contact-card">
          <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.5rem;" data-en="Send an Inquiry" data-ta="தகவல் கேட்க">
            Send an Inquiry
          </h2>
          <p style="font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 1.5rem;" data-en="Have a question about a specific welfare scheme? Fill in your details below." data-ta="குறிப்பிட்ட நலத்திட்டம் குறித்து கேள்வி உள்ளதா? உங்கள் விவரங்களை உள்ளிடவும்.">
            Have a question about a specific welfare scheme? Fill in your details below.
          </p>

          <form id="serviceApplicationForm" novalidate>
            <div class="form-group" style="margin-bottom: 1rem;">
              <label class="form-label" for="contact_name">
                <span data-en="Your Full Name" data-ta="உங்கள் முழு பெயர்">Your Full Name</span> <span class="required-star">*</span>
              </label>
              <input type="text" id="contact_name" name="name" class="form-control" required placeholder="Enter your full name" data-en="Enter your full name" data-ta="முழு பெயரை உள்ளிடவும்">
              <span class="form-error" id="contact_name-error" data-en="Please enter your name" data-ta="தயவுசெய்து உங்கள் பெயரை உள்ளிடவும்">Please enter your name</span>
            </div>

            <div class="form-group" style="margin-bottom: 1rem;">
              <label class="form-label" for="contact_phone">
                <span data-en="Mobile Number" data-ta="கைபேசி எண்">Mobile Number</span> <span class="required-star">*</span>
              </label>
              <input type="tel" id="contact_phone" name="mobile" class="form-control" required placeholder="10-digit mobile number" data-en="10-digit mobile number" data-ta="10 இலக்க கைபேசி எண்">
              <span class="form-error" id="contact_phone-error" data-en="Please enter a valid 10-digit mobile number" data-ta="சரியான 10 இலக்க கைபேசி எண்ணை உள்ளிடவும்">Please enter a valid 10-digit mobile number</span>
            </div>

            <div class="form-group" style="margin-bottom: 1.5rem;">
              <label class="form-label" for="contact_message">
                <span data-en="Your Question or Scheme of Interest" data-ta="உங்கள் கேள்வி அல்லது தேவைப்படும் திட்டம்">Your Question or Scheme of Interest</span> <span class="required-star">*</span>
              </label>
              <textarea id="contact_message" name="message" rows="4" class="form-control" required placeholder="How can we assist you?" data-en="How can we assist you?" data-ta="நாங்கள் உங்களுக்கு எவ்வாறு உதவலாம்?"></textarea>
              <span class="form-error" id="contact_message-error" data-en="Please enter your message" data-ta="தயவுசெய்து உங்கள் செய்தியை உள்ளிடவும்">Please enter your message</span>
            </div>

            <div style="margin-bottom: 1.5rem;">
              <label class="checkbox-label">
                <input type="checkbox" id="contact_consent" required class="checkbox-input">
                <span data-en="I understand this is an informational inquiry form." data-ta="இது ஒரு தகவல் கேட்கும் படிவம் என்பதைப் புரிந்து கொண்டுள்ளேன்.">
                  I understand this is an informational inquiry form.
                </span>
              </label>
              <span class="form-error" id="contact_consent-error" data-en="Please check this box" data-ta="தயவுசெய்து இந்த தேர்வுப்பெட்டியைத் தேர்ந்தெடுக்கவும்">Please check this box</span>
            </div>

            <button type="submit" class="btn btn-primary btn-lg btn-full">
              <span data-en="Submit Inquiry" data-ta="விசாரணையை அனுப்பவும்">Submit Inquiry</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  </main>

  ${getSubmissionModal()}
  ${getFooter(0)}

  <script src="js/data.js"></script>
  <script src="js/app.js"></script>
  <script src="js/form.js"></script>
</body>
</html>`;
}

// 6. Generate 27 Service Detail Pages (services/[id].html)
function generateServiceDetailPage(service) {
  const cat = CATEGORIES[service.category] || CATEGORIES.registration;

  // Documents Checklist Items HTML
  const docsEn = service.documentsEn || [];
  const docsTa = service.documentsTa || [];
  const docsHtml = docsEn.map((doc, idx) => {
    const docTa = docsTa[idx] || doc;
    return `
    <li class="docs-item">
      <svg class="docs-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      <div>
        <span data-en="${doc}" data-ta="${docTa}">${doc}</span>
      </div>
    </li>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${service.titleEn} | Aruvi E-Sevai Maiyam, Kovilpatti</title>
  <meta name="description" content="${service.shortDescEn} Check required documents and apply at Aruvi E-Sevai Maiyam, Kovilpatti.">
  <link rel="icon" type="image/png" href="../assets/aruvi-logo.png">
  <link rel="stylesheet" href="../css/style.css">
</head>
<body data-lang="en">
  ${getHeader('services', 1)}

  <main class="main-content">
    <div class="page-banner">
      <div class="container">
        <div class="breadcrumbs">
          <a href="../index.html" data-en="Home" data-ta="முகப்பு">Home</a>
          <span class="breadcrumbs-sep">/</span>
          <a href="../services.html" data-en="Services" data-ta="சேவைகள்">Services</a>
          <span class="breadcrumbs-sep">/</span>
          <span class="breadcrumbs-current" data-en="${service.titleEn}" data-ta="${service.titleTa}">${service.titleEn}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
          <span class="category-tag" data-en="${cat.en}" data-ta="${cat.ta}">${cat.en}</span>
        </div>
        <h1 class="page-title" data-en="${service.titleEn}" data-ta="${service.titleTa}">${service.titleEn}</h1>
        <p class="page-subtitle" data-en="${service.shortDescEn}" data-ta="${service.shortDescTa}">${service.shortDescEn}</p>
      </div>
    </div>

    <section class="container detail-layout">
      <!-- Main Content Column -->
      <div class="detail-main">
        <!-- Overview & Benefits -->
        <article class="detail-card">
          <h2 class="detail-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <span data-en="Service Overview & Benefits" data-ta="சேவை விவரம் & நன்மைகள்">Service Overview & Benefits</span>
          </h2>
          <p style="font-size: 1.05rem; line-height: 1.7; color: var(--text-secondary); margin-bottom: 1.25rem;" data-en="${service.benefitsEn}" data-ta="${service.benefitsTa}">
            ${service.benefitsEn}
          </p>
          <div style="background: var(--pale-lavender); border-left: 4px solid var(--primary); padding: 1rem 1.25rem; border-radius: var(--radius-xs); font-size: 0.95rem; color: var(--text-secondary);">
            <strong data-en="Scheme Purpose: " data-ta="திட்டத்தின் நோக்கம்: ">Scheme Purpose: </strong>
            <span data-en="${service.shortDescEn}" data-ta="${service.shortDescTa}">${service.shortDescEn}</span>
          </div>
        </article>

        <!-- Eligibility Criteria -->
        <article class="detail-card">
          <h2 class="detail-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
            <span data-en="Who May Need This Service (Eligibility)" data-ta="யாரெல்லாம் விண்ணப்பிக்கலாம் (தகுதி வரம்பு)">Who May Need This Service (Eligibility)</span>
          </h2>
          <p style="font-size: 1.05rem; line-height: 1.7; color: var(--text-secondary);" data-en="${service.eligibilityEn}" data-ta="${service.eligibilityTa}">
            ${service.eligibilityEn}
          </p>
        </article>

        <!-- Required Documents Checklist -->
        <article class="detail-card">
          <h2 class="detail-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            <span data-en="Verified Required Documents (${docsEn.length})" data-ta="தேவையான அசல் ஆவணங்கள் (${docsEn.length})">Verified Required Documents (${docsEn.length})</span>
          </h2>
          <p style="font-size: 0.92rem; color: var(--text-muted); margin-bottom: 1.25rem;" data-en="Please ensure you carry the original copies of the following documents when applying." data-ta="விண்ணப்பிக்கும் போது பின்வரும் ஆவணங்களின் அசல் பிரதிகளை வைத்திருக்க வேண்டும்.">
            Please ensure you carry the original copies of the following documents when applying.
          </p>
          <ul class="docs-list">
            ${docsHtml}
          </ul>
        </article>

        <!-- Step-by-Step Guidance -->
        <article class="detail-card">
          <h2 class="detail-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            <span data-en="Application Steps & Guidance" data-ta="விண்ணப்பிக்கும் படிநிலைகள்">Application Steps & Guidance</span>
          </h2>
          <div class="steps-list">
            <div class="step-item">
              <div class="step-num">1</div>
              <div class="step-content">
                <h4 data-en="Gather Original Documents" data-ta="ஆவணங்களைத் தயார் செய்தல்">Gather Original Documents</h4>
                <p data-en="Collect the required certificates from the checklist above, ensuring Aadhaar details match your bank records." data-ta="மேற்கண்ட ஆவணங்களின் அசல் பிரதிகளைத் தயார் செய்து, ஆதார் மற்றும் வங்கி கணக்கு பெயர்கள் சரியாக உள்ளதா என உறுதிப்படுத்தவும்.">Collect the required certificates from the checklist above, ensuring Aadhaar details match your bank records.</p>
              </div>
            </div>
            <div class="step-item">
              <div class="step-num">2</div>
              <div class="step-content">
                <h4 data-en="Complete Online Request Form" data-ta="விண்ணப்ப விவரங்களை உள்ளிடுதல்">Complete Online Request Form</h4>
                <p data-en="Click 'Apply Now' below to fill out the service-specific application form with your details." data-ta="கீழே உள்ள 'Apply Now' பொத்தானைக் கிளிக் செய்து இந்த சேவைக்கான குறிப்பிட்ட விண்ணப்ப விவரங்களை உள்ளிடவும்.">Click 'Apply Now' below to fill out the service-specific application form with your details.</p>
              </div>
            </div>
            <div class="step-item">
              <div class="step-num">3</div>
              <div class="step-content">
                <h4 data-en="Verification at Aruvi E-Sevai Maiyam" data-ta="அருவி மையத்தில் நேரடி சரிபார்ப்பு">Verification at Aruvi E-Sevai Maiyam</h4>
                <p data-en="Visit our centre in Kovilpatti or call our desk to finalize official processing and obtain your submission acknowledgment." data-ta="எங்கள் கோவில்பட்டி மையத்திற்கு நேரில் வந்து ஆவணங்களைச் சரிபார்த்து அதிகாரப்பூர்வ அரசு சமர்ப்பிப்பை நிறைவு செய்யவும்.">Visit our centre in Kovilpatti or call our desk to finalize official processing and obtain your submission acknowledgment.</p>
              </div>
            </div>
          </div>
        </article>
      </div>

      <!-- Sidebar Column -->
      <aside class="detail-sidebar">
        <!-- Apply Now Action Box -->
        <div class="sidebar-action-card">
          <h3 class="sidebar-title" data-en="Apply for This Service" data-ta="இச்சேவைக்கு விண்ணப்பிக்க">Apply for This Service</h3>
          <p class="sidebar-desc" data-en="Open the dedicated application form for ${service.titleEn}." data-ta="${service.titleTa} திட்டத்திற்கான தனி விண்ணப்பப் படிவத்தைத் திறக்கவும்.">
            Open the dedicated application form for ${service.titleEn}.
          </p>
          <a href="../apply/${service.id}.html" class="btn btn-primary btn-lg btn-full">
            <span data-en="Apply Now" data-ta="விண்ணப்பிக்கவும்">Apply Now</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
          <a href="../services.html" class="btn btn-secondary btn-full">
            <span data-en="← Back to All Services" data-ta="← அனைத்து சேவைகளுக்கும்">← Back to All Services</span>
          </a>
        </div>

        <!-- Contact Support Card -->
        <div class="sidebar-action-card" style="background: var(--white);">
          <h3 class="sidebar-title" data-en="Need Assistance?" data-ta="உதவி தேவையா?">Need Assistance?</h3>
          <p class="sidebar-desc" data-en="Have doubts about required documents or eligibility? Call our service desk in Kovilpatti." data-ta="தேவையான ஆவணங்கள் அல்லது தகுதிகள் குறித்து சந்தேகம் உள்ளதா? கோவில்பட்டி மையத்தை அழைக்கவும்.">
            Have doubts about required documents or eligibility? Call our service desk in Kovilpatti.
          </p>
          
          <div class="contact-quick-box">
            <span style="font-size: 0.78rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted);" data-en="Call Directly" data-ta="நேரடியாக அழைக்க">Call Directly</span>
            <a href="tel:${CONTACT_INFO.phone1Raw}" class="quick-phone-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span>${CONTACT_INFO.phone1}</span>
            </a>
            <a href="tel:${CONTACT_INFO.phone2Raw}" class="quick-phone-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span>${CONTACT_INFO.phone2}</span>
            </a>
          </div>

          <div class="contact-quick-box">
            <span style="font-size: 0.78rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted);" data-en="Centre Location" data-ta="மைய முகவரி">Centre Location</span>
            <div style="font-size: 0.88rem; font-weight: 600; color: var(--text-primary);" data-en="${CONTACT_INFO.addressEn}" data-ta="${CONTACT_INFO.addressTa}">
              ${CONTACT_INFO.addressEn}
            </div>
          </div>
        </div>
      </aside>
    </section>
  </main>

  ${getFooter(1)}

  <script src="../js/data.js"></script>
  <script src="../js/app.js"></script>
</body>
</html>`;
}

// 7. Generate 27 Dedicated Application Form Pages (apply/[id].html)
function generateApplicationFormPage(service) {
  const cat = CATEGORIES[service.category] || CATEGORIES.registration;

  // Required documents reference list for applicant clarity
  const docsEn = service.documentsEn || [];
  const docsTa = service.documentsTa || [];
  const docsTagsHtml = docsEn.map((d, i) => `<li style="font-size: 0.88rem; color: var(--text-secondary);"><span data-en="• ${d}" data-ta="• ${docsTa[i] || d}">• ${d}</span></li>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Apply: ${service.titleEn} | Aruvi E-Sevai Maiyam</title>
  <meta name="description" content="Application form for ${service.titleEn} at Aruvi E-Sevai Maiyam, Kovilpatti.">
  <link rel="icon" type="image/png" href="../assets/aruvi-logo.png">
  <link rel="stylesheet" href="../css/style.css">
</head>
<body data-lang="en">
  ${getHeader('services', 1)}

  <main class="main-content">
    <div class="page-banner">
      <div class="container">
        <div class="breadcrumbs">
          <a href="../index.html" data-en="Home" data-ta="முகப்பு">Home</a>
          <span class="breadcrumbs-sep">/</span>
          <a href="../services.html" data-en="Services" data-ta="சேவைகள்">Services</a>
          <span class="breadcrumbs-sep">/</span>
          <a href="../services/${service.id}.html" data-en="${service.titleEn}" data-ta="${service.titleTa}">${service.titleEn}</a>
          <span class="breadcrumbs-sep">/</span>
          <span class="breadcrumbs-current" data-en="Application Form" data-ta="விண்ணப்பப் படிவம்">Application Form</span>
        </div>
        <div class="form-header-badge">
          <span data-en="Service Application: ${service.titleEn}" data-ta="சேவை விண்ணப்பம்: ${service.titleTa}">Service Application: ${service.titleEn}</span>
        </div>
        <h1 class="page-title" data-en="Apply: ${service.titleEn}" data-ta="விண்ணப்பிக்க: ${service.titleTa}">Apply: ${service.titleEn}</h1>
        <p class="page-subtitle" data-en="Please enter verified applicant details matching your government certificates." data-ta="உங்கள் அரசு சான்றிதழ்களில் உள்ளவாறு சரியான தகவல்களை உள்ளிடவும்.">
          Please enter verified applicant details matching your government certificates.
        </p>
      </div>
    </div>

    <section class="section">
      <div class="container">
        <div class="form-card">
          <!-- Documents Reference Callout -->
          <div class="form-doc-notice" style="background-color: var(--pale-lavender); border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 1.25rem; margin-bottom: 2rem;">
            <div style="font-weight: 700; color: var(--primary-dark); font-size: 0.95rem; margin-bottom: 0.5rem;" data-en="Original Documents to Present at Centre (${docsEn.length}):" data-ta="மையத்தில் சமர்ப்பிக்க வேண்டிய அசல் ஆவணங்கள் (${docsEn.length}):">
              Original Documents to Present at Centre (${docsEn.length}):
            </div>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.35rem;">
              ${docsTagsHtml}
            </ul>
          </div>

          <form id="serviceApplicationForm" novalidate>
            <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--text-primary); border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.75rem; margin-bottom: 1.5rem;" data-en="Applicant Information" data-ta="விண்ணப்பதாரர் தகவல்">
              Applicant Information
            </h3>

            <div class="form-grid">
              <!-- 1. Full Name -->
              <div class="form-group col-span-2">
                <label class="form-label" for="applicant_name">
                  <span data-en="Full Name" data-ta="முழு பெயர்">Full Name</span> <span class="required-star">*</span>
                </label>
                <input type="text" id="applicant_name" name="applicant_name" class="form-control" required placeholder="Name as per Aadhaar / Smart Card" data-en="Name as per Aadhaar / Smart Card" data-ta="ஆதார் / குடும்ப அட்டையில் உள்ளவாறு பெயர்">
                <span class="form-error" id="applicant_name-error" data-en="Please enter your full name" data-ta="தயவுசெய்து உங்கள் முழு பெயரை உள்ளிடவும்">Please enter your full name</span>
              </div>

              <!-- 2. Mobile Number (10 digits Indian mobile) -->
              <div class="form-group col-span-2">
                <label class="form-label" for="mobile">
                  <span data-en="Mobile Number" data-ta="கைபேசி எண்">Mobile Number</span> <span class="required-star">*</span>
                </label>
                <input type="tel" id="mobile" name="mobile" class="form-control" required maxlength="10" placeholder="10-digit mobile number" data-en="10-digit mobile number" data-ta="10 இலக்க கைபேசி எண்">
                <span class="form-error" id="mobile-error" data-en="Please enter a valid 10-digit Indian mobile number" data-ta="சரியான 10 இலக்க கைபேசி எண்ணை உள்ளிடவும்">Please enter a valid 10-digit Indian mobile number</span>
              </div>

              <!-- 3. Address -->
              <div class="form-group col-span-2">
                <label class="form-label" for="address">
                  <span data-en="Address" data-ta="முகவரி">Address</span> <span class="required-star">*</span>
                </label>
                <textarea id="address" name="address" rows="3" class="form-control" required placeholder="Door number, street name, town/village, Kovilpatti, pincode" data-en="Door number, street name, town/village, Kovilpatti, pincode" data-ta="கதவு எண், தெரு பெயர், கோவில்பட்டி, அஞ்சல் குறியீடு"></textarea>
                <span class="form-error" id="address-error" data-en="Please enter your address" data-ta="தயவுசெய்து முகவரியை உள்ளிடவும்">Please enter your address</span>
              </div>

              <!-- 4. Work Type Dropdown -->
              <div class="form-group col-span-2" id="work_type_group">
                <label class="form-label" for="work_type">
                  <span data-en="Work Type" data-ta="தொழில் வகை">Work Type</span> <span class="required-star">*</span>
                </label>
                <select id="work_type" name="work_type" class="form-control" required>
                  <option value="" data-en="-- Select Work Type --" data-ta="-- தொழில் வகையைத் தேர்ந்தெடுக்கவும் --">-- Select Work Type --</option>
                  <option value="Agriculture" data-en="Agriculture" data-ta="விவசாயம்">Agriculture</option>
                  <option value="Daily Wage Worker" data-en="Daily Wage Worker" data-ta="தினக்கூலி தொழிலாளி">Daily Wage Worker</option>
                  <option value="Private Employee" data-en="Private Employee" data-ta="தனியார் ஊழியர்">Private Employee</option>
                  <option value="Government Employee" data-en="Government Employee" data-ta="அரசு ஊழியர்">Government Employee</option>
                  <option value="Self-Employed / Business" data-en="Self-Employed / Business" data-ta="சுயதொழில் / வணிகம்">Self-Employed / Business</option>
                  <option value="Student" data-en="Student" data-ta="மாணவர் / மாணவி">Student</option>
                  <option value="Homemaker" data-en="Homemaker" data-ta="இல்லத்தரசி">Homemaker</option>
                  <option value="Unemployed" data-en="Unemployed" data-ta="வேலையில்லாதவர்">Unemployed</option>
                  <option value="Other" data-en="Other" data-ta="மற்றவை (இதர)">Other</option>
                </select>
                <span class="form-error" id="work_type-error" data-en="Please select your work type" data-ta="தயவுசெய்து தொழில் வகையைத் தேர்ந்தெடுக்கவும்">Please select your work type</span>
              </div>

              <!-- 5. Specify Your Work (conditional - revealed only when Other is chosen) -->
              <div class="form-group col-span-2" id="specify_work_group" style="display: none;">
                <label class="form-label" for="specify_work">
                  <span data-en="Specify Your Work" data-ta="உங்கள் தொழிலைக் குறிப்பிடவும்">Specify Your Work</span> <span class="required-star">*</span>
                </label>
                <input type="text" id="specify_work" name="specify_work" class="form-control" placeholder="Specify your work" data-en="Specify your work" data-ta="உங்கள் தொழிலைக் குறிப்பிடவும்">
                <span class="form-error" id="specify_work-error" data-en="Please specify your work" data-ta="தயவுசெய்து உங்கள் தொழிலைக் குறிப்பிடவும்">Please specify your work</span>
              </div>
            </div>

            <div class="form-actions" style="margin-top: 2rem;">
              <a href="../services/${service.id}.html" class="btn btn-secondary">
                <span data-en="Cancel & Return" data-ta="ரத்து செய்க">Cancel & Return</span>
              </a>
              <button type="submit" class="btn btn-primary btn-lg">
                <span data-en="Submit Application Form" data-ta="விண்ணப்பத்தைச் சமர்ப்பிக்கவும்">Submit Application Form</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  </main>

  ${getSubmissionModal()}
  ${getFooter(1)}

  <script src="../js/data.js"></script>
  <script src="../js/app.js"></script>
  <script src="../js/form.js"></script>
</body>
</html>`;
}

// 8. Execute Generator
console.log('Generating Home Page (index.html)...');
fs.writeFileSync(path.join(BASE_DIR, 'index.html'), generateHomePage(), 'utf-8');

console.log('Generating Services Directory Page (services.html)...');
fs.writeFileSync(path.join(BASE_DIR, 'services.html'), generateServicesPage(), 'utf-8');

console.log('Generating About Page (about.html)...');
fs.writeFileSync(path.join(BASE_DIR, 'about.html'), generateAboutPage(), 'utf-8');

console.log('Generating Contact Page (contact.html)...');
fs.writeFileSync(path.join(BASE_DIR, 'contact.html'), generateContactPage(), 'utf-8');

console.log('Generating 27 Service Detail Pages & 27 Application Form Pages...');
services.forEach((s, idx) => {
  const detailPath = path.join(BASE_DIR, 'services', `${s.id}.html`);
  const formPath = path.join(BASE_DIR, 'apply', `${s.id}.html`);

  fs.writeFileSync(detailPath, generateServiceDetailPage(s), 'utf-8');
  fs.writeFileSync(formPath, generateApplicationFormPage(s), 'utf-8');
  console.log(`[${idx + 1}/27] Generated: services/${s.id}.html & apply/${s.id}.html`);
});


// 7. Static Bilingual Generation & SEO Helpers
function getAllHtmlPaths(currentDirectory = BASE_DIR, relativeDirectory = '') {
  const excludedDirectories = new Set(['.git', 'dist', 'edge_profile', 'node_modules', 'ta']);
  return fs.readdirSync(currentDirectory, { withFileTypes: true }).flatMap(entry => {
    const relativePath = path.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) {
      if (excludedDirectories.has(entry.name)) return [];
      return getAllHtmlPaths(path.join(currentDirectory, entry.name), relativePath);
    }
    if (!entry.isFile() || !entry.name.endsWith('.html')) return [];
    return [relativePath.split(path.sep).join('/')];
  }).sort();
}

function getPublicHtmlPaths() {
  const englishPaths = getAllHtmlPaths();
  const allRoutes = [];
  englishPaths.forEach(p => {
    if (!p.split('/').includes('apply')) {
      allRoutes.push(p);
      allRoutes.push('ta/' + p);
    }
  });
  return allRoutes;
}

function routeForHtmlPath(relativePath) {
  if (relativePath === 'ta/index.html') return '/ta/';
  return relativePath === 'index.html' ? '/' : `/${relativePath}`;
}

function getEnglishSourcePath(relativePath) {
  return relativePath.startsWith('ta/') ? relativePath.slice(3) : relativePath;
}

function escapeHtmlAttribute(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function localizeStaticContent(html, language) {
  let localized = html;
  if (language === 'ta') {
    // 1. Text content with data-ta (only elements whose inner content has no nested tags)
    localized = localized.replace(/<([a-z][\w:-]*)([^>]*\bdata-ta="([^"]*)"[^>]*)>([^<]*)<\/\1>/gi, (whole, tag, attributes, taValue, content) => {
      const leadingWhitespace = content.match(/^\s*/)[0];
      const trailingWhitespace = content.match(/\s*$/)[0];
      return `<${tag}${attributes}>${leadingWhitespace}${escapeHtmlAttribute(taValue)}${trailingWhitespace}</${tag}>`;
    });

    // 2. Image alt attributes with data-alt-ta
    localized = localized.replace(/<([a-z][\w:-]*)([^>]*)>/gi, (whole, tag, attributes) => {
      let updated = attributes;
      const altTa = attributes.match(/\bdata-alt-ta="([^"]*)"/);
      if (altTa) {
        if (/\balt="[^"]*"/.test(updated)) {
          updated = updated.replace(/\balt="[^"]*"/, `alt="${escapeHtmlAttribute(altTa[1])}"`);
        } else {
          updated += ` alt="${escapeHtmlAttribute(altTa[1])}"`;
        }
      }

      // 3. Input / textarea placeholder with data-ta
      const taValue = updated.match(/\bdata-ta="([^"]*)"/);
      if (taValue && /\b(?:input|textarea)\b/i.test(tag)) {
        if (/\bplaceholder="[^"]*"/.test(updated)) {
          updated = updated.replace(/\bplaceholder="[^"]*"/, `placeholder="${escapeHtmlAttribute(taValue[1])}"`);
        }
      }
      return `<${tag}${updated}>`;
    });
  }
  return localized;
}

function getPageMetadata(sourcePath, language, html) {
  const serviceFile = sourcePath.match(/^services\/([^/]+)\.html$/);
  const applicationFile = sourcePath.match(/^apply\/([^/]+)\.html$/);
  const serviceId = serviceFile?.[1] || applicationFile?.[1];
  const service = serviceId ? services.find(item => item.id === serviceId) : null;
  const brand = translations[language].brand;
  const existingTitle = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || brand.name;
  const existingDescription = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1] || brand.tagline;

  if (service && language === 'ta') {
    const action = applicationFile ? 'விண்ணப்பம்: ' : '';
    return {
      title: `${action}${service.titleTa} | ${brand.name}`,
      description: service.shortDescTa
    };
  }
  if (language === 'ta') {
    if (sourcePath === 'index.html') {
      return { title: `${brand.name} | ${brand.tagline}`, description: brand.tagline };
    }
    if (sourcePath === 'services.html') {
      return {
        title: `${translations.ta.services.pageTitle} | ${brand.name}`,
        description: translations.ta.services.pageSubtitle
      };
    }
    if (sourcePath === 'about.html') {
      return { title: `${brand.name} | ${translations.ta.nav.about}`, description: brand.tagline };
    }
    if (sourcePath === 'contact.html') {
      return { title: `${brand.name} | ${translations.ta.nav.contact}`, description: `${brand.location} — ${brand.tagline}` };
    }
  }
  return { title: existingTitle, description: existingDescription };
}

function renderStaticPage(html, sourcePath, language) {
  const isSubpage = sourcePath.includes('/');
  let output = localizeStaticContent(html, language);

  // Clean relative switch links:
  // On English page -> links to Tamil page
  // On Tamil page -> links to English page
  let switchUrl, switchLabel, switchAria;
  if (language === 'en') {
    switchUrl = isSubpage ? `../ta/${sourcePath}` : `ta/${sourcePath}`;
    switchLabel = 'தமிழ்';
    switchAria = 'Read this page in Tamil';
  } else {
    switchUrl = isSubpage ? `../../${sourcePath}` : `../${sourcePath}`;
    switchLabel = 'English';
    switchAria = 'Read this page in English';
  }

  const langToggleHtml = `<a class="lang-toggle-btn" href="${switchUrl}" aria-label="${switchAria}">
            <svg class="lang-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <span class="lang-text">${switchLabel}</span>
          </a>`;

  // Replace button or existing link with our clean link
  output = output.replace(/<(?:button|a)[^>]*class="lang-toggle-btn"[^>]*>[\s\S]*?<\/(?:button|a)>/i, langToggleHtml);

  // Update language attributes
  output = output.replace(/<html lang="[^"]*">/i, `<html lang="${language}">`);
  output = output.replace(/<body([^>]*)data-lang="[^"]*"/i, `<body$1data-lang="${language}"`);

  // Adjust asset paths for Tamil pages (since ta/ is one directory level deeper)
  if (language === 'ta') {
    if (!isSubpage) {
      // Root pages in ta/:
      // assets/ -> ../assets/, css/ -> ../css/, js/ -> ../js/
      output = output.replace(/\b(href|src)="(assets\/|css\/|js\/)/g, '$1="../$2');
      output = output.replace(/url\((['"]?)(assets\/|css\/|js\/)/g, 'url($1../$2');
    } else {
      // Subpages in ta/services/ or ta/apply/:
      // ../assets/ -> ../../assets/, ../css/ -> ../../css/, ../js/ -> ../../js/
      output = output.replace(/\b(href|src)="(\.\.\/(?:assets|css|js)\/)/g, '$1="../$2');
      output = output.replace(/url\((['"]?)(\.\.\/(?:assets|css|js)\/)/g, 'url($1../$2');
    }
  }

  // Canonical and Alternate SEO Links
  const englishRoute = sourcePath === 'index.html' ? '/' : `/${sourcePath}`;
  const tamilRoute = sourcePath === 'index.html' ? '/ta/' : `/ta/${sourcePath}`;
  const localeRoute = language === 'ta' ? tamilRoute : englishRoute;
  const metadata = getPageMetadata(sourcePath, language, output);

  const canonicalUrl = `${SITE_BASE_URL}${localeRoute}`;
  const englishUrl = `${SITE_BASE_URL}${englishRoute}`;
  const tamilUrl = `${SITE_BASE_URL}${tamilRoute}`;
  const headMetadata = [
    `<title>${escapeHtmlAttribute(metadata.title)}</title>`,
    `<meta name="description" content="${escapeHtmlAttribute(metadata.description)}">`,
    `<link rel="canonical" href="${canonicalUrl}">`,
    `<link rel="alternate" hreflang="en-IN" href="${englishUrl}">`,
    `<link rel="alternate" hreflang="ta-IN" href="${tamilUrl}">`,
    `<link rel="alternate" hreflang="x-default" href="${englishUrl}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${escapeHtmlAttribute(translations[language].brand.name)}">`,
    `<meta property="og:title" content="${escapeHtmlAttribute(metadata.title)}">`,
    `<meta property="og:description" content="${escapeHtmlAttribute(metadata.description)}">`,
    `<meta property="og:url" content="${canonicalUrl}">`,
    `<meta property="og:image" content="${SITE_BASE_URL}/assets/slider/aruvi-storefront.jpg">`,
    `<meta property="og:locale" content="${language === 'ta' ? 'ta_IN' : 'en_IN'}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${escapeHtmlAttribute(metadata.title)}">`,
    `<meta name="twitter:description" content="${escapeHtmlAttribute(metadata.description)}">`
  ].join('\n  ');

  output = output.replace(/<head>([\s\S]*?)<\/head>/i, (whole, headContent) => {
    const cleanHead = headContent
      .replace(/<title>[\s\S]*?<\/title>/i, '')
      .replace(/<meta\s+name="description"[^>]*>/i, '')
      .replace(/<link\s+rel="canonical"[^>]*>/gi, '')
      .replace(/<link\s+rel="alternate"[^>]*>/gi, '')
      .replace(/<meta\s+(?:property|name)="(?:og:[^"]+|twitter:[^"]+)"[^>]*>/gi, '');
    return `<head>${cleanHead}\n  ${headMetadata}\n</head>`;
  });

  return output;
}

function writeBilingualPages() {
  console.log('Rendering 58 English and 58 Tamil static pages...');
  const englishPaths = getAllHtmlPaths();
  englishPaths.forEach(relativePath => {
    const sourceFile = path.join(BASE_DIR, relativePath);
    const sourceHtml = fs.readFileSync(sourceFile, 'utf-8');

    // 1. Render and overwrite English static page
    fs.writeFileSync(sourceFile, renderStaticPage(sourceHtml, relativePath, 'en'), 'utf-8');

    // 2. Render and write Tamil static page in ta/
    const tamilRelativePath = path.join('ta', relativePath);
    const tamilFile = path.join(BASE_DIR, tamilRelativePath);
    fs.mkdirSync(path.dirname(tamilFile), { recursive: true });
    fs.writeFileSync(tamilFile, renderStaticPage(sourceHtml, relativePath, 'ta'), 'utf-8');
  });
  console.log(`Successfully rendered ${englishPaths.length * 2} bilingual pages (${englishPaths.length} English + ${englishPaths.length} Tamil)!`);
}

function writeRootSeoFiles() {
  const routes = getPublicHtmlPaths();
  const sitemapEntries = routes.map(relativePath => {
    const route = routeForHtmlPath(relativePath);
    const escapedRoute = route.replace(/&/g, '&amp;');
    return `  <url>\n    <loc>${SITE_BASE_URL}${escapedRoute}</loc>\n  </url>`;
  }).join('\n');

  fs.writeFileSync(path.join(BASE_DIR, 'robots.txt'),
    `User-agent: *\nAllow: /\nSitemap: ${SITE_BASE_URL}/sitemap.xml\n`, 'utf-8');
  fs.writeFileSync(path.join(BASE_DIR, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>\n`, 'utf-8');

  const pageList = routes.map(relativePath => `- ${SITE_BASE_URL}${routeForHtmlPath(relativePath)}`).join('\n');
  fs.writeFileSync(path.join(BASE_DIR, 'llms.txt'),
    `# Aruvi E-Sevai Maiyam\n\n> Private service centre in Kovilpatti, Tamil Nadu; not a government office. Information is for assistance and should be confirmed with the relevant authority.\n\n## Public pages\n${pageList}\n`, 'utf-8');
}

writeBilingualPages();
writeRootSeoFiles();
console.log('Site generation complete!');
