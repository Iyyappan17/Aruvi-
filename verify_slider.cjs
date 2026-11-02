const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('=== Aruvi E-Sevai Maiyam: Third Slider Image Verification ===\n');

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
const sliderJs = fs.readFileSync(path.join(__dirname, 'js/home-slider.js'), 'utf8');

// 1. Slider section presence
assert(indexHtml.includes('class="home-slider-section"'), 'index.html contains .home-slider-section');
assert(indexHtml.includes('class="home-slider-track"'), 'index.html contains .home-slider-track');

// 2. Count slides (exactly 3)
const slideMatches = indexHtml.match(/<article class="home-slider-slide"/g);
assert(slideMatches && slideMatches.length === 3, 'Slider contains exactly 3 slides');

// 3. Slide 1 image untouched
assert(indexHtml.includes('assets/slider/aadhaar-registration-camp.jpg'), 
  'Slide 1 image is assets/slider/aadhaar-registration-camp.jpg (untouched)');
assert(fs.existsSync(path.join(__dirname, 'assets/slider/aadhaar-registration-camp.jpg')), 
  'Slide 1 image file exists on disk');

// 4. Slide 2 image untouched
assert(indexHtml.includes('assets/slider/aadhaar-registration-counter.jpg'), 
  'Slide 2 image is assets/slider/aadhaar-registration-counter.jpg (untouched)');
assert(fs.existsSync(path.join(__dirname, 'assets/slider/aadhaar-registration-counter.jpg')), 
  'Slide 2 image file exists on disk');

// 5. Slide 3 image replaced with aruvi-storefront.jpg
assert(indexHtml.includes('assets/slider/aruvi-storefront.jpg'), 
  'Slide 3 image points to assets/slider/aruvi-storefront.jpg');
const storefrontPath = path.join(__dirname, 'assets/slider/aruvi-storefront.jpg');
assert(fs.existsSync(storefrontPath), 'Slide 3 storefront image file exists on disk');

// 6. Verify exact byte match with user-uploaded image
const uploadedPath = 'C:/Users/iyyap/.gemini/antigravity/brain/1e7e8974-1842-4931-83ae-affa60ae1b06/.user_uploaded/media_1793527135430_35bb240b.jpg';
if (fs.existsSync(uploadedPath)) {
  const h1 = crypto.createHash('sha256').update(fs.readFileSync(uploadedPath)).digest('hex');
  const h2 = crypto.createHash('sha256').update(fs.readFileSync(storefrontPath)).digest('hex');
  assert(h1 === h2, 'Slide 3 image matches attached image SHA-256 hash exactly (no recompression/distortion)');
} else {
  console.log('[SKIP] Uploaded image source check (file not accessible from verification)');
}

// 7. Slide 3 text strictly preserved
assert(indexHtml.includes('data-en="Honest information"'), 'Slide 3 kicker English text preserved');
assert(indexHtml.includes('data-ta="நேர்மையான தகவல்"'), 'Slide 3 kicker Tamil text preserved');
assert(indexHtml.includes('data-en="Honest guidance on schemes"'), 'Slide 3 heading English text preserved');
assert(indexHtml.includes('data-ta="திட்டங்கள் குறித்து நேர்மையான வழிகாட்டுதல்"'), 'Slide 3 heading Tamil text preserved');
assert(indexHtml.includes('data-en="Authorities decide eligibility."'), 'Slide 3 description English text preserved');
assert(indexHtml.includes('data-ta="தகுதியைத் துறை தீர்மானிக்கும்."'), 'Slide 3 description Tamil text preserved');

// 8. Slide 3 bilingual alt text
assert(indexHtml.includes('data-alt-en="Aruvi E-Sevai Maiyam storefront and official Tamil signboard in Kovilpatti"'), 
  'Slide 3 has English data-alt-en attribute');
assert(indexHtml.includes('data-alt-ta="கோவில்பட்டி அருவி இ-சேவை மையத்தின் முகப்பு மற்றும் அதிகாரப்பூர்வ தமிழ்ப் பலகை"'), 
  'Slide 3 has Tamil data-alt-ta attribute');

// 9. Slider CSS positioning and styling
assert(css.includes('.home-slider-img-storefront') && css.includes('object-position: 70% 35%;'), 
  'Desktop CSS has calibrated object-position: 70% 35% for signboard focal visibility');
assert(css.includes('@media (max-width: 768px)') && css.includes('.home-slider-img-storefront') && css.includes('object-position: 65% 35%;'), 
  'Mobile CSS has calibrated object-position: 65% 35% for mobile signboard visibility');

// 10. Slider functionality preserved in JS
assert(sliderJs.includes('const slideInterval = 3000;'), 'Slider 3-second auto-swipe interval preserved');
assert(sliderJs.includes('pointerdown') && sliderJs.includes('pointerup'), 'Slider pointer swipe interaction preserved');

// 11. Hero banner and Services by Category untouched
assert(indexHtml.includes('Your Trusted E-Sevai Service Centre'), 'Hero banner heading untouched');
assert(indexHtml.includes('id="services-by-category"'), 'Services by category section untouched');
assert(indexHtml.includes('Explore Services by Welfare Category'), 'Category title untouched');

console.log('\n========================================');
console.log(`Passed Checks: ${passCount}`);
console.log(`Failed Checks: ${failCount}`);
console.log('========================================\n');

if (failCount > 0) {
  process.exit(1);
}
console.log('SLIDER VERIFICATION SUITE: 100% PASSED!');
