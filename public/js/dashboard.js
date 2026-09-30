function planProgress(plan) {
  const completed = plan.days.filter((day) => day.completed).length;
  return { completed, percent: plan.totalDays ? Math.round(completed / plan.totalDays * 100) : 0 };
}

async function loadDashboard() {
  const list = document.querySelector('[data-plan-list]');
  try {
    const [userResponse, plansResponse] = await Promise.all([fetch('/api/auth/me'), fetch('/api/study-plans')]);
    const userData = await userResponse.json();
    if (plansResponse.status === 401) return window.location.replace('/login.html');
    const plansData = await plansResponse.json();
    if (!plansResponse.ok) throw new Error(plansData.message || 'Unable to load your plans.');
    const plans = plansData.plans || [];
    const completedDays = plans.reduce((total, plan) => total + planProgress(plan).completed, 0);
    const totalDays = plans.reduce((total, plan) => total + plan.totalDays, 0);
    const completedHours = plans.reduce((total, plan) => total + plan.days.filter((day) => day.completed).reduce((hours, day) => hours + day.estimatedHours, 0), 0);
    const stats = { plans: plans.filter((plan) => planProgress(plan).percent < 100).length, completed: completedDays, progress: totalDays ? `${Math.round(completedDays / totalDays * 100)}%` : '0%', hours: completedHours };
    Object.entries(stats).forEach(([key, value]) => document.querySelectorAll(`[data-stat="${key}"]`).forEach((element) => { element.textContent = value; }));
    document.querySelectorAll('[data-profile-name]').forEach((element) => { element.textContent = userData.user?.name || 'Learner'; });
    document.querySelectorAll('[data-profile-email]').forEach((element) => { element.textContent = userData.user?.email || ''; });
    document.querySelectorAll('[data-avatar]').forEach((element) => { element.textContent = (userData.user?.name || 'S').charAt(0).toUpperCase(); });
    const count = document.querySelector('[data-plan-count]');
    if (count) count.textContent = `${plans.length} ${plans.length === 1 ? 'plan' : 'plans'}`;
    if (!list) return;
    if (!plans.length) {
      list.innerHTML = '<div class="empty-state"><span class="empty-mark">01</span><div><h3>Your first plan starts here.</h3><p>Choose a skill and turn your goal into a day-by-day learning path.</p><a class="text-link" href="/create-plan.html">Create your first plan <span>↗</span></a></div></div>';
      return;
    }
    list.innerHTML = plans.map((plan) => {
      const progress = planProgress(plan);
      const nextDay = plan.days.find((day) => !day.completed)?.day || plan.totalDays;
      return `<article class="plan-row"><div class="plan-letter">${escapeHtml(plan.title.charAt(0).toUpperCase())}</div><div class="plan-row-main"><div class="plan-title-line"><h3>${escapeHtml(plan.title)}</h3><span>${plan.totalDays} days</span></div><p>Day ${nextDay} of ${plan.totalDays} <span class="dot-separator">·</span> ${progress.completed} completed</p><div class="progress-track"><i style="width:${progress.percent}%"></i></div></div><div class="plan-row-progress"><strong>${progress.percent}%</strong><span>complete</span></div><a class="button button-small button-secondary" href="/study-plan.html?id=${encodeURIComponent(plan._id)}">Continue Learning <span>↗</span></a></article>`;
    }).join('');
  } catch (error) {
    list.innerHTML = `<div class="inline-error">${escapeHtml(error.message || 'Unable to load your plans right now.')}</div>`;
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

loadDashboard();