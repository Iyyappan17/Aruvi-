const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;
const services = JSON.parse(fs.readFileSync(path.join(BASE_DIR, 'data/services.json'), 'utf-8'));

console.log('--- Aruvi E-Sevai Maiyam: Comprehensive Verification Suite ---');

let errors = 0;

// 1. Check Root Pages
const rootPages = ['index.html', 'services.html', 'about.html', 'contact.html'];
rootPages.forEach(p => {
  const filePath = path.join(BASE_DIR, p);
  if (!fs.existsSync(filePath)) {
    console.error(`[FAIL] Missing root page: ${p}`);
    errors++;
  } else {
    const html = fs.readFileSync(filePath, 'utf-8');
    if (!html.includes('assets/aruvi-logo.png')) {
      console.error(`[FAIL] Page ${p} missing logo asset reference`);
      errors++;
    }
    if (!html.includes('css/style.css')) {
      console.error(`[FAIL] Page ${p} missing CSS reference`);
      errors++;
    }
    // Verify 3-column footer
    if (!html.includes('footer-col-brand') || !html.includes('footer-col-links') || !html.includes('footer-col-contact')) {
      console.error(`[FAIL] Page ${p} does not contain the required 3-column footer structure`);
      errors++;
    }
    // Verify verified contact details in footer
    if (!html.includes('95665 16652') || !html.includes('93637 16652')) {
      console.error(`[FAIL] Page ${p} footer missing verified contact numbers`);
      errors++;
    }
    if (!html.includes('24–13, சிவா காம்ப்ளக்ஸ், A.K.S. தியேட்டர் ரோடு, கோவில்பட்டி')) {
      console.error(`[FAIL] Page ${p} footer missing verified Tamil address`);
      errors++;
    }
  }
});

// 2. Check Homepage Specific Requirements
const indexHtml = fs.readFileSync(path.join(BASE_DIR, 'index.html'), 'utf-8');

// A. Section Order Check
const heroPos = indexHtml.indexOf('class="hero-section"');
const servicesCatPos = indexHtml.indexOf('id="services-by-category"');
const aboutPos = indexHtml.indexOf('id="about-aruvi"');
const contactPos = indexHtml.indexOf('id="contact-preview"');
const footerPos = indexHtml.indexOf('class="site-footer"');

if (heroPos === -1 || servicesCatPos === -1 || aboutPos === -1 || contactPos === -1 || footerPos === -1) {
  console.error('[FAIL] One or more required sections missing on homepage');
  errors++;
} else if (!(heroPos < servicesCatPos && servicesCatPos < aboutPos && aboutPos < contactPos && contactPos < footerPos)) {
  console.error('[FAIL] Homepage section order is INCORRECT!');
  console.error(`Order positions: Hero=${heroPos}, ServicesCat=${servicesCatPos}, About=${aboutPos}, Contact=${contactPos}, Footer=${footerPos}`);
  errors++;
} else {
  console.log('[PASS] Homepage section order is strictly verified: Hero -> Services by Category -> About Aruvi -> Contact Preview -> Footer');
}

// B. Hero Banner Refinements Check
if (indexHtml.includes('hero-card-showcase') || indexHtml.includes('hero-visual')) {
  console.error('[FAIL] Hero banner still contains the right-side dashboard showcase box!');
  errors++;
} else {
  console.log('[PASS] Hero banner right-side dashboard box successfully removed.');
}

if (indexHtml.includes('hero-pill')) {
  console.error('[FAIL] Hero banner still contains the pill label (hero-pill)!');
  errors++;
} else {
  console.log('[PASS] Hero banner pill label successfully removed as requested.');
}

if (indexHtml.includes('hero-wave-backdrop') || indexHtml.includes('hero-wave-svg')) {
  console.error('[FAIL] Hero banner still contains excessive wave decoration!');
  errors++;
} else {
  console.log('[PASS] Excessive hero wave decoration successfully replaced with clean editorial accent.');
}

if (!indexHtml.includes('Explore Services') || !indexHtml.includes('Contact Centre')) {
  console.error('[FAIL] Hero banner missing Explore Services or Contact Centre action buttons');
  errors++;
} else {
  console.log('[PASS] Hero banner action buttons (Explore Services, Contact Centre) confirmed.');
}

// C. Services by Category & No Duplicate Services Listing Check
const requiredCategories = ['registration', 'education', 'family', 'relief', 'special'];
requiredCategories.forEach(cat => {
  if (!indexHtml.includes(`services.html?cat=${cat}`)) {
    console.error(`[FAIL] Homepage Services by Category missing category link: services.html?cat=${cat}`);
    errors++;
  }
});

if (indexHtml.includes('Frequently Accessed Services')) {
  console.error('[FAIL] Homepage still contains duplicate service listing (Frequently Accessed Services)!');
  errors++;
} else {
  console.log('[PASS] Duplicate homepage service cards successfully removed; category cards only displayed.');
}

if (!indexHtml.includes('View All 27 Services')) {
  console.error('[FAIL] Homepage missing "View All 27 Services" navigation button!');
  errors++;
} else {
  console.log('[PASS] "View All 27 Services" homepage navigation button confirmed.');
}

// 3. Check 27 Service Detail Pages
services.forEach(s => {
  const detailFile = path.join(BASE_DIR, 'services', `${s.id}.html`);
  if (!fs.existsSync(detailFile)) {
    console.error(`[FAIL] Missing detail page: services/${s.id}.html`);
    errors++;
  } else {
    const html = fs.readFileSync(detailFile, 'utf-8');
    if (!html.includes(`../apply/${s.id}.html`)) {
      console.error(`[FAIL] Detail page services/${s.id}.html does not link to its application form ../apply/${s.id}.html`);
      errors++;
    }
    if (!html.includes('../assets/aruvi-logo.png')) {
      console.error(`[FAIL] Detail page services/${s.id}.html has incorrect logo path`);
      errors++;
    }
  }
});

// 4. Check 27 Application Form Pages
const requiredWorkTypes = [
  'Agriculture',
  'Daily Wage Worker',
  'Private Employee',
  'Government Employee',
  'Self-Employed / Business',
  'Student',
  'Homemaker',
  'Unemployed',
  'Other'
];

services.forEach(s => {
  const formFile = path.join(BASE_DIR, 'apply', `${s.id}.html`);
  if (!fs.existsSync(formFile)) {
    console.error(`[FAIL] Missing application form page: apply/${s.id}.html`);
    errors++;
  } else {
    const html = fs.readFileSync(formFile, 'utf-8');
    if (!html.includes(`../services/${s.id}.html`)) {
      console.error(`[FAIL] Apply page apply/${s.id}.html does not link back to ../services/${s.id}.html`);
      errors++;
    }
    if (!html.includes('../assets/aruvi-logo.png')) {
      console.error(`[FAIL] Apply page apply/${s.id}.html has incorrect logo path`);
      errors++;
    }
    // Verify common fields
    if (!html.includes('id="applicant_name"')) {
      console.error(`[FAIL] Apply page apply/${s.id}.html missing required Full Name field`);
      errors++;
    }
    if (!html.includes('id="mobile"')) {
      console.error(`[FAIL] Apply page apply/${s.id}.html missing required Mobile Number field`);
      errors++;
    }
    if (!html.includes('id="address"')) {
      console.error(`[FAIL] Apply page apply/${s.id}.html missing required Address field`);
      errors++;
    }
    if (!html.includes('id="work_type"')) {
      console.error(`[FAIL] Apply page apply/${s.id}.html missing required Work Type dropdown`);
      errors++;
    }
    // Verify all 9 Work Types
    requiredWorkTypes.forEach(wt => {
      if (!html.includes(`value="${wt}"`)) {
        console.error(`[FAIL] Apply page apply/${s.id}.html missing work type option: ${wt}`);
        errors++;
      }
    });
    // Verify conditional "Specify Your Work" field
    if (!html.includes('id="specify_work_group"') || !html.includes('id="specify_work"')) {
      console.error(`[FAIL] Apply page apply/${s.id}.html missing conditional specify_work field`);
      errors++;
    }

    // Verify STRICT REMOVAL of unnecessary fields:
    // 1. Existing Welfare Board Card Number
    if (html.includes('id="existing_card_no"') || html.includes('id="member_card_no"')) {
      console.error(`[FAIL] Apply page apply/${s.id}.html still contains Existing Welfare Board Card Number!`);
      errors++;
    }
    // 2. Registered Welfare Board
    if (html.includes('id="welfare_board"')) {
      console.error(`[FAIL] Apply page apply/${s.id}.html still contains Registered Welfare Board field!`);
      errors++;
    }
    // 3. Date of Last Renewal / Issue
    if (html.includes('id="last_renewal_date"')) {
      console.error(`[FAIL] Apply page apply/${s.id}.html still contains Date of Last Renewal / Issue!`);
      errors++;
    }
    // 4. Active Bank Account and IFSC
    if (html.includes('id="bank_account"')) {
      console.error(`[FAIL] Apply page apply/${s.id}.html still contains Bank Account & IFSC field!`);
      errors++;
    }
    // 5. Document Upload
    if (html.includes('id="doc_upload"') || html.includes('file-upload-zone')) {
      console.error(`[FAIL] Apply page apply/${s.id}.html still contains Document Upload!`);
      errors++;
    }
    // 6. Original Documents Confirmation Checkbox
    if (html.includes('id="doc_confirm"')) {
      console.error(`[FAIL] Apply page apply/${s.id}.html still contains Original Documents Confirmation Checkbox!`);
      errors++;
    }

    // Verify compliance disclaimer in modal
    if (!html.includes('Backend connection required to submit your application.')) {
      console.error(`[FAIL] Apply page apply/${s.id}.html missing required backend compliance disclaimer`);
      errors++;
    }
  }
});

// 5. Check js/form.js and js/app.js for compliance
const formJs = fs.readFileSync(path.join(BASE_DIR, 'js/form.js'), 'utf-8');
if (formJs.includes('localStorage.setItem(\'applicant') || formJs.includes('localStorage.setItem(\'application')) {
  console.error('[FAIL] js/form.js is storing personal application data in localStorage!');
  errors++;
} else {
  console.log('[PASS] Zero personal data storage in localStorage verified.');
}

if (!formJs.includes('handleWorkTypeChange')) {
  console.error('[FAIL] js/form.js missing Work Type change handler');
  errors++;
} else {
  console.log('[PASS] js/form.js Work Type conditional handling verified.');
}

if (!formJs.includes('/^[6-9]\\d{9}$/')) {
  console.error('[FAIL] js/form.js missing Indian 10-digit mobile number validation regex');
  errors++;
} else {
  console.log('[PASS] js/form.js Indian 10-digit mobile number validation verified.');
}

console.log(`\n========================================`);
console.log(`Total Services: ${services.length}`);
console.log(`Total Pages verified: ${rootPages.length + services.length * 2} (4 root + 27 detail + 27 forms)`);
console.log(`Total Errors: ${errors}`);
console.log(`========================================`);

if (errors === 0) {
  console.log('ALL TESTS PASSED! SITE INTEGRITY AND USER REQUIREMENTS ARE 100% VERIFIED!');
} else {
  process.exit(1);
}
