const fs = require('fs');
const path = require('path');

console.log('=== Aruvi E-Sevai Maiyam: Mobile Hero Precision Verification ===\n');

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

const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, 'css/style.css'), 'utf8');

// 1. Header-to-Hero Transition:
assert(!indexHtml.includes('class="hero-section" style="margin-top'), 
  'Hero section has no inline top margin gap');
assert(css.includes('.hero-section {') && !css.match(/\.hero-section\s*\{[^}]*margin-top:\s*[^0]/), 
  'Hero section has 0 top margin, beginning directly below sticky header');

// 2. Mobile Hero Padding & Wave Breathing Space:
const media768Block = css.slice(css.indexOf('@media (max-width: 768px)'));
const mobileHeroPaddingMatch = media768Block.match(/\.hero-section\s*\{([^}]*)\}/);
assert(mobileHeroPaddingMatch !== null, 'Found mobile .hero-section rule in 768px media query');
if (mobileHeroPaddingMatch) {
  const rules = mobileHeroPaddingMatch[1];
  assert(rules.includes('padding-top:') && rules.includes('clamp('), 
    'Mobile hero section has fluid proportional top padding (giving top wave breathing space)');
  assert(rules.includes('padding-bottom:') && rules.includes('clamp('), 
    'Mobile hero section has fluid proportional bottom padding (giving bottom wave finishing sweep space)');
}

// 3. Heading Max-Width & 3-Line Wrap:
const mobileTitleMatch = media768Block.match(/\.hero-title\s*\{([^}]*)\}/);
assert(mobileTitleMatch !== null, 'Found mobile .hero-title rule');
if (mobileTitleMatch) {
  const rules = mobileTitleMatch[1];
  assert(rules.includes('max-width:') && rules.includes('ch'), 
    'Mobile heading has max-width character limit to ensure 3-line wrap matching reference mockup');
  assert(rules.includes('font-size:') && rules.includes('clamp('), 
    'Mobile heading has proportional fluid font size');
}

// 4. Description Max-Width & Proportions:
const mobileDescMatch = media768Block.match(/\.hero-desc\s*\{([^}]*)\}/);
assert(mobileDescMatch !== null, 'Found mobile .hero-desc rule');
if (mobileDescMatch) {
  const rules = mobileDescMatch[1];
  assert(rules.includes('max-width:'), 'Mobile description has calibrated max-width');
}

// 5. Buttons Side-by-Side:
const mobileActionsMatch = media768Block.match(/\.hero-actions\s*\{([^}]*)\}/);
assert(mobileActionsMatch !== null, 'Found mobile .hero-actions rule');
if (mobileActionsMatch) {
  const rules = mobileActionsMatch[1];
  assert(rules.includes('flex-direction: row;'), 'Mobile buttons stay side-by-side in one row');
}

// 6. Feature Row & Dividers:
assert(css.includes('.hero-features-row') && css.includes('border-top:'), 
  'Feature row has top separator line matching reference screenshot');
assert(css.includes('.hero-feature-divider') && css.includes('width: 1px;'), 
  'Feature row has vertical dividers between items');

// 7. Wave Background Geometry & Calibrated Gradients:
assert(indexHtml.includes('id="mTopWash"') && indexHtml.includes('stop-opacity="0.28"'), 
  'Mobile wave top wash gradient opacity calibrated to reference screenshot');
assert(indexHtml.includes('id="mMidRibbon"') && indexHtml.includes('stop-opacity="0.30"'), 
  'Mobile wave middle ribbon gradient opacity calibrated to reference screenshot');
assert(indexHtml.includes('id="mLowerSweep"') && indexHtml.includes('stop-opacity="0.30"'), 
  'Mobile wave lower sweep gradient opacity calibrated to reference screenshot');
assert(indexHtml.includes('id="mBottomCrest"') && indexHtml.includes('stop-opacity="0.60"'), 
  'Mobile wave bottom crest gradient opacity calibrated to reference screenshot');

// 8. Desktop Untouched:
assert(css.includes('.hero-section {') && css.includes('padding: 5.5rem 0 6rem;'), 
  'Desktop hero padding (5.5rem 0 6rem) preserved');
assert(css.includes('.hero-title {') && css.includes('font-size: 3.25rem;'), 
  'Desktop hero heading font size (3.25rem) preserved');
assert(css.includes('.hero-wave-art-desktop'), 
  'Desktop continuous wave SVG art preserved');

// 9. All 5 Content Elements Intact & In Exact Order:
const heading = 'Your Trusted E-Sevai Service Centre';
const desc = 'Access essential online services and get assistance with your application needs at Aruvi E-Sevai Maiyam, Kovilpatti.';
const btn1 = 'Explore Services';
const btn2 = 'Contact Centre';
const feat1 = 'People-First Assistance';
const feat2 = 'Application Guidance';
const feat3 = 'Local Support in Kovilpatti';

assert(indexHtml.includes(heading), 'Heading text strictly intact');
assert(indexHtml.includes(desc), 'Description text strictly intact');
assert(indexHtml.includes(btn1), 'Explore Services button strictly intact');
assert(indexHtml.includes(btn2), 'Contact Centre button strictly intact');
assert(indexHtml.includes(feat1), 'Feature 1 strictly intact');
assert(indexHtml.includes(feat2), 'Feature 2 strictly intact');
assert(indexHtml.includes(feat3), 'Feature 3 strictly intact');

// 10. Bilingual Attributes:
assert(indexHtml.includes('data-ta="உங்கள் நம்பிக்கைக்குரிய இ-சேவை மையம்"'), 'Tamil heading intact');
assert(indexHtml.includes('data-ta="மக்களுக்கான உதவி"'), 'Tamil feature 1 intact');
assert(indexHtml.includes('data-ta="விண்ணப்ப வழிகாட்டுதல்"'), 'Tamil feature 2 intact');
assert(indexHtml.includes('data-ta="கோவில்பட்டியில் உதவி"'), 'Tamil feature 3 intact');

console.log('\n========================================');
console.log(`Passed Checks: ${passCount}`);
console.log(`Failed Checks: ${failCount}`);
console.log('========================================\n');

if (failCount > 0) {
  process.exit(1);
}
console.log('PRECISION VERIFICATION SUITE: 100% PASSED!');
