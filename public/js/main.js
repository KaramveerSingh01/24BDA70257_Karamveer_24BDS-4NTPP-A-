const pageName = window.location.pathname.split('/').pop() || 'index.html';

async function currentUser() {
  try {
    const response = await fetch('/api/auth/me');
    const data = await response.json();
    return data.user || null;
  } catch (_error) {
    return null;
  }
}

function renderNav(user) {
  const nav = document.querySelector('[data-nav]');
  if (!nav) return;
  const links = user
    ? [['Home', '/'], ['Dashboard', '/dashboard.html'], ['Courses', '/courses.html'], ['Create Plan', '/create-plan.html'], ['Profile', '/profile.html']]
    : [['Home', '/'], ['Courses', '/courses.html'], ['Create Study Plan', '/create-plan.html'], ['Login', '/login.html'], ['Register', '/register.html']];
  nav.innerHTML = `${links.map(([label, href]) => `<a href="${href}"${href === `/${pageName}` || (pageName === 'index.html' && href === '/') ? ' aria-current="page"' : ''}>${label}</a>`).join('')}${user ? '<button class="nav-logout" data-logout>Logout</button>' : ''}`;
  nav.querySelector('[data-logout]')?.addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  });
  const menuButton = document.querySelector('.menu-toggle');
  menuButton?.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('nav-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });
}

currentUser().then((user) => {
  renderNav(user);
  document.querySelectorAll('[data-user-name]').forEach((element) => {
    element.textContent = user?.name?.split(' ')[0] || 'learner';
  });
  if (['dashboard.html', 'profile.html', 'study-plan.html'].includes(pageName) && !user) {
    window.location.replace('/login.html');
  }
});