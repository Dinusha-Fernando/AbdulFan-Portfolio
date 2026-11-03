/**
 * CONTACT FORM COMPONENT
 * Handles priority inquiry form submissions and responsive user feedback.
 */

export function initContactForm() {
  const contactForm = document.getElementById('portfolio-contact-form');
  const formFeedback = document.getElementById('form-feedback');

  if (!contactForm) return;

  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const submitBtn = document.getElementById('submit-inquiry-btn');
    const originalText = submitBtn ? submitBtn.innerHTML : '';

    if (submitBtn) {
      submitBtn.innerHTML = '<span>Processing Priority Inquiry...</span>';
      submitBtn.style.opacity = '0.75';
      submitBtn.disabled = true;
    }

    setTimeout(() => {
      if (formFeedback) {
        formFeedback.className = 'form-feedback-message success';
        formFeedback.style.display = 'block';
        formFeedback.textContent = 'Thank you. Your inquiry has been received. Abdul Umar Sahan Nethmina\'s management team will review your proposal and respond within 24 hours.';
      }
      contactForm.reset();

      if (submitBtn) {
        submitBtn.innerHTML = originalText;
        submitBtn.style.opacity = '1';
        submitBtn.disabled = false;
      }

      setTimeout(() => {
        if (formFeedback) formFeedback.style.display = 'none';
      }, 8000);
    }, 900);
  });
}

