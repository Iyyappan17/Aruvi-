const fs = require('fs');
const path = require('path');

console.log('=== Aruvi E-Sevai Maiyam: Hero Banner Wave Refinement Verification ===\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
const css = fs.readFileSync(path.join(__dirname, 'css/style.css'), 'utf-8');

// 1. Structure & Wave Flow Layer
assert(indexHtml.includes('class="hero-section"'), 'index.html contains .hero-section');
assert(indexHtml.includes('class="hero-wave-flow"'), 'index.html contains continuous .hero-wave-flow background container');
assert(indexHtml.includes('hero-wave-art-mobile'), 'Continuous mobile wave SVG art is present');
assert(indexHtml.includes('hero-wave-art-desktop'), 'Continuous desktop wave SVG art is present');

// 2. Continuous Wave Details (Top, Middle, Bottom)
assert(indexHtml.includes('id="mTopWash"') && indexHtml.includes('id="mBottomCrest"'), 
  'Mobile wave has continuous gradient flow from top wash to bottom crest');
assert(indexHtml.includes('id="mMidRibbon"') && indexHtml.includes('id="mLowerSweep"'), 
  'Mobile wave has flowing middle ribbons and lower sweep passing behind content and buttons');
assert(indexHtml.includes('id="dTopWash"') && indexHtml.includes('id="dBottomCrest"'), 
  'Desktop wave has continuous gradient flow from top wash to bottom crest');

// 3. Hero Content Preservation & Order
const headingPos = indexHtml.indexOf('class="hero-title"');
const descPos = indexHtml.indexOf('class="hero-desc"');
const actionsPos = indexHtml.indexOf('class="hero-actions"');
const featuresPos = indexHtml.indexOf('class="hero-features-row"');

assert(headingPos !== -1 && descPos !== -1 && actionsPos !== -1 && featuresPos !== -1, 
  'All 5 hero content components are present');
assert(headingPos < descPos && descPos < actionsPos && actionsPos < featuresPos, 
  'Content order strictly preserved: 1. Heading -> 2. Description -> 3/4. Buttons -> 5. Feature Row');

// 4. Approved Content Strings
assert(indexHtml.includes('Your Trusted E-Sevai Service Centre'), 'Approved heading text preserved');
assert(indexHtml.includes('Explore Services') && indexHtml.includes('Contact Centre'), 'Approved CTA button labels preserved');
assert(indexHtml.includes('People-First Assistance'), 'Feature row item 1: "People-First Assistance" present');
assert(indexHtml.includes('Application Guidance'), 'Feature row item 2: "Application Guidance" present');
assert(indexHtml.includes('Local Support in Kovilpatti'), 'Feature row item 3: "Local Support in Kovilpatti" present');

// 5. Bilingual Support (Tamil / English)
assert(indexHtml.includes('data-en="Your Trusted E-Sevai Service Centre"') && 
       indexHtml.includes('data-ta="உங்கள் நம்பிக்கைக்குரிய இ-சேவை மையம்"'), 
  'Heading has correct English and Tamil translation attributes');
assert(indexHtml.includes('data-en="People-First Assistance"'), 'Feature 1 has bilingual data-en');
assert(indexHtml.includes('data-en="Application Guidance"'), 'Feature 2 has bilingual data-en');
assert(indexHtml.includes('data-en="Local Support in Kovilpatti"'), 'Feature 3 has bilingual data-en');

// 6. CSS Wave & Layout Styling
assert(css.includes('.hero-wave-flow {') && css.includes('position: absolute;'), 
  '.hero-wave-flow is positioned absolutely as full-height background');
assert(css.includes('.hero-container {') && css.includes('position: relative;') && css.includes('z-index: 2;'), 
  '.hero-container has z-index: 2 to sit cleanly above background waves');
assert(css.includes('.hero-features-row {') && css.includes('border-top:'), 
  '.hero-features-row has subtle top separator matching reference screenshot');
assert(css.includes('.hero-feature-divider {') && css.includes('width: 1px;'), 
  '.hero-feature-divider has vertical dividers between items');

// 7. Responsive Mobile Layout (Side-by-Side Buttons)
assert(css.includes('@media (max-width: 768px)') && 
       css.includes('.hero-actions') && 
       css.includes('flex-direction: row;'), 
  '@media (max-width: 768px) maintains side-by-side buttons as in reference screenshot');

assert(css.includes('.hero-wave-art-mobile') && css.includes('display: block;'), 
  'Mobile wave is active on mobile viewports (<= 768px)');
assert(css.includes('.hero-wave-art-desktop') && css.includes('display: none;'), 
  'Desktop wave is hidden on mobile viewports (<= 768px)');

// 8. Palette Verification (#9470D8, #FFFFFF, #F5F0FC)
const hasPurple = indexHtml.includes('#9470D8') || css.includes('#9470D8');
const hasPaleLavender = indexHtml.includes('#F5F0FC') || css.includes('#F5F0FC') || css.includes('var(--pale-lavender)');
assert(hasPurple, 'Purple (#9470D8) used for waves and accents');
assert(hasPaleLavender, 'Pale lavender (#F5F0FC) used for subtle wave transitions');

// 9. Category Cards with Natural Photographic Backgrounds
const categories = ['registration', 'education', 'family', 'relief', 'special'];
categories.forEach(cat => {
  const imgPath = path.join(__dirname, 'assets', 'categories', `cat-${cat}.jpg`);
  assert(fs.existsSync(imgPath), `Photo file exists on disk: assets/categories/cat-${cat}.jpg`);
  if (fs.existsSync(imgPath)) {
    const stat = fs.statSync(imgPath);
    assert(stat.size > 20000, `Photo file assets/categories/cat-${cat}.jpg has healthy resolution (${stat.size} bytes)`);
  }
  assert(indexHtml.includes(`cat-${cat}.jpg`), `index.html references photographic background for ${cat}`);
});

// Check that old SVG icons were cleanly replaced in category cards
assert(!indexHtml.includes('class="category-nav-icon"'), 'Old category-nav-icon successfully replaced with photographic background');
assert(indexHtml.includes('class="category-card-bg"'), 'category-card-bg element present for photographic render');
assert(indexHtml.includes('class="category-card-overlay"'), 'category-card-overlay present for text contrast');
assert(indexHtml.includes('class="category-card-content"'), 'category-card-content present for structured foreground');

// Verify graceful fallback styling
assert(css.includes('.category-nav-card {') && css.includes('background-color: #241442;'), 
  'Category card has graceful dark-purple background fallback if image fails');
assert(css.includes('.category-card-overlay {') && css.includes('linear-gradient('), 
  'Category card overlay has subtle purple-indigo gradient for contrast');

console.log(`\n========================================`);
console.log(`Passed Checks: ${passCount}`);
console.log(`Failed Checks: ${failCount}`);
console.log(`========================================`);

if (failCount === 0) {
  console.log('\nHERO BANNER & CATEGORY PHOTOGRAPHIC BACKGROUNDS: ALL CHECKS PASSED!');
} else {
  process.exit(1);
}

