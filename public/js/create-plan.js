const planForm = document.querySelector('[data-plan-form]');
const queryCourse = new URLSearchParams(window.location.search).get('course');
if (queryCourse && planForm) planForm.elements.course.value = queryCourse;

document.querySelectorAll('[data-suggestion]').forEach((button) => {
  button.addEventListener('click', () => {
    planForm.elements.course.value = button.dataset.suggestion;
    planForm.elements.course.focus();
  });
});

planForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const message = planForm.querySelector('.form-message');
  const submitButton = planForm.querySelector('button[type="submit"]');
  const label = submitButton.querySelector('[data-submit-label]');
  const formData = Object.fromEntries(new FormData(planForm).entries());
  message.textContent = '';
  submitButton.disabled = true;
  submitButton.classList.add('is-loading');
  label.textContent = 'AI is creating your personalized study plan...';
  try {
    const response = await fetch('/api/study-plans/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await response.json();
    if (response.status === 401) {
      window.location.href = '/login.html';
      return;
    }
    if (!response.ok) throw new Error(data.message || 'Unable to generate your study plan right now. Please try again.');
    window.location.href = `/study-plan.html?id=${encodeURIComponent(data.planId)}`;
  } catch (error) {
    message.textContent = error.message || 'Unable to generate your study plan right now. Please try again.';
    submitButton.disabled = false;
    submitButton.classList.remove('is-loading');
    label.textContent = 'Generate My Study Plan';
  }
});