document.querySelector('[data-auth-form]')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const message = form.querySelector('.form-message');
  const button = form.querySelector('button[type="submit"]');
  const fields = Object.fromEntries(new FormData(form).entries());
  const mode = form.dataset.authForm;
  message.textContent = '';
  button.disabled = true;
  button.classList.add('is-loading');
  try {
    const response = await fetch(`/api/auth/${mode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Unable to continue right now. Please try again.');
    window.location.href = '/dashboard.html';
  } catch (error) {
    message.textContent = error.message || 'Unable to connect. Please try again.';
  } finally {
    button.disabled = false;
    button.classList.remove('is-loading');
  }
});