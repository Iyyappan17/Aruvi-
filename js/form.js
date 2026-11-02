// Aruvi E-Sevai Maiyam - Application Form & Modal Handling Script
(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('serviceApplicationForm');
    const modalOverlay = document.getElementById('submissionModal');
    const modalCloseBtn = document.getElementById('closeModalBtn');

    if (!form) return;

    // 1. Work Type Dropdown & Conditional "Specify Your Work" Handling
    const workTypeSelect = document.getElementById('work_type');
    const specifyWorkGroup = document.getElementById('specify_work_group');
    const specifyWorkInput = document.getElementById('specify_work');
    const specifyWorkError = document.getElementById('specify_work-error');

    function handleWorkTypeChange() {
      if (!workTypeSelect || !specifyWorkGroup) return;

      if (workTypeSelect.value === 'Other') {
        specifyWorkGroup.style.display = 'flex';
        if (specifyWorkInput) {
          specifyWorkInput.required = true;
        }
      } else {
        specifyWorkGroup.style.display = 'none';
        if (specifyWorkInput) {
          specifyWorkInput.required = false;
          specifyWorkInput.value = '';
          specifyWorkInput.classList.remove('is-invalid');
          if (specifyWorkError) {
            specifyWorkError.classList.remove('visible');
          }
        }
      }
    }

    if (workTypeSelect) {
      workTypeSelect.addEventListener('change', handleWorkTypeChange);
      // Run once on initial render
      handleWorkTypeChange();
    }

    // 2. Mobile Number Auto-Format (Only digits, max 10)
    const mobileInputs = form.querySelectorAll('input[type="tel"], #mobile, #contact_phone');
    mobileInputs.forEach(input => {
      input.addEventListener('input', () => {
        input.value = input.value.replace(/\D/g, '').slice(0, 10);
      });
    });

    // 3. Live Clear of Validation Errors
    form.addEventListener('input', (e) => {
      const target = e.target;
      if (target && target.id) {
        target.classList.remove('is-invalid');
        const err = document.getElementById(`${target.id}-error`);
        if (err) err.classList.remove('visible');
      }
    });

    form.addEventListener('change', (e) => {
      const target = e.target;
      if (target && target.id) {
        target.classList.remove('is-invalid');
        const err = document.getElementById(`${target.id}-error`);
        if (err) err.classList.remove('visible');
      }
    });

    // 5. Form Submit Validation & Transparent Modal Display
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;
      const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');

      inputs.forEach(input => {
        // Skip hidden inputs if any
        if (input.offsetParent === null && input.type !== 'file' && input.type !== 'checkbox') {
          return;
        }

        const errorEl = document.getElementById(`${input.id}-error`);
        let fieldValid = true;

        if (input.type === 'checkbox') {
          fieldValid = input.checked;
        } else if (input.id === 'mobile' || input.name === 'mobile' || input.id === 'contact_phone') {
          // Indian mobile validation: exactly 10 digits starting with 6, 7, 8, or 9
          const cleanMobile = input.value.replace(/\D/g, '');
          fieldValid = /^[6-9]\d{9}$/.test(cleanMobile);
        } else if (input.id === 'work_type') {
          fieldValid = input.value.trim().length > 0;
        } else if (input.id === 'specify_work') {
          if (workTypeSelect && workTypeSelect.value === 'Other') {
            fieldValid = input.value.trim().length > 0;
          }
        } else {
          fieldValid = input.value.trim().length > 0;
        }

        if (!fieldValid) {
          isValid = false;
          input.classList.add('is-invalid');
          if (errorEl) {
            errorEl.classList.add('visible');
          }
        } else {
          input.classList.remove('is-invalid');
          if (errorEl) {
            errorEl.classList.remove('visible');
          }
        }
      });

      if (isValid) {
        // Pure frontend project:
        // Do NOT store personal application data in localStorage
        // Do NOT display fake success or fake reference numbers
        // Clearly explain backend integration is required
        if (modalOverlay) {
          modalOverlay.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      } else {
        // Scroll smoothly to first invalid field and focus
        const firstInvalid = form.querySelector('.is-invalid');
        if (firstInvalid) {
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstInvalid.focus();
        }
      }
    });

    // 6. Modal Close Handling
    function closeModal() {
      if (modalOverlay) {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    }

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', closeModal);
    }

    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          closeModal();
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
        closeModal();
      }
    });
  });
})();
