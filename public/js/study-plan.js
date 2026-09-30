const planId = new URLSearchParams(window.location.search).get('id');
const planHeader = document.querySelector('[data-plan-header]');
const dayList = document.querySelector('[data-day-list]');
let activePlan;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

function youtubeSearch(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

function renderPlan(plan) {
  activePlan = plan;
  const completed = plan.days.filter((day) => day.completed).length;
  const percent = plan.totalDays ? Math.round(completed / plan.totalDays * 100) : 0;
  planHeader.innerHTML = `<p class="eyebrow">YOUR PERSONAL ROADMAP</p><div class="plan-title-wrap"><div><h1>${escapeHtml(plan.title)}</h1><p class="muted">${plan.totalDays} Day Study Plan <span class="dot-separator">·</span> ${completed} / ${plan.totalDays} days completed</p></div><span class="progress-number">${percent}%</span></div><p class="plan-description">${escapeHtml(plan.description)}</p><div class="progress-track progress-large"><i style="width:${percent}%"></i></div><span class="progress-caption">PLAN PROGRESS</span>`;
  dayList.innerHTML = plan.days.map((day) => `<article class="day-card${day.completed ? ' day-completed' : ''}"><div class="day-marker"><span>DAY</span><strong>${String(day.day).padStart(2, '0')}</strong></div><div class="day-content"><div class="day-title-row"><div><h2>${escapeHtml(day.topic)}</h2><p class="day-description">${escapeHtml(day.description)}</p></div><span class="time-estimate">◷ &nbsp;${escapeHtml(day.estimatedHours)} ${Number(day.estimatedHours) === 1 ? 'hour' : 'hours'}</span></div><div class="objectives"><h3>Learning Objectives</h3><ul>${day.objectives.map((objective) => `<li>${escapeHtml(objective)}</li>`).join('')}</ul></div><div class="practice-note"><span>TRY IT</span><p>${escapeHtml(day.practice)}</p></div><div class="day-actions"><a class="button button-secondary button-small" href="${youtubeSearch(day.searchQuery || `${day.topic} tutorial`)}" target="_blank" rel="noopener noreferrer">▶ &nbsp; Watch Related Videos</a><button class="button ${day.completed ? 'button-complete' : 'button-primary'} button-small" data-complete-day="${day.day}" aria-pressed="${day.completed}">${day.completed ? '✓ Completed' : 'Mark Complete'}</button></div></div></article>`).join('');
}

async function loadPlan() {
  if (!planId) {
    planHeader.innerHTML = '<div class="inline-error">Study plan not found. Return to your dashboard to choose a plan.</div>';
    return;
  }
  try {
    const response = await fetch(`/api/study-plans/${encodeURIComponent(planId)}`);
    const data = await response.json();
    if (response.status === 401) return window.location.replace('/login.html');
    if (!response.ok) throw new Error(data.message || 'Study plan not found.');
    renderPlan(data.plan);
  } catch (error) {
    planHeader.innerHTML = `<div class="inline-error">${escapeHtml(error.message)}</div>`;
  }
}

dayList?.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-complete-day]');
  if (!button || !activePlan) return;
  const dayNumber = Number(button.dataset.completeDay);
  const day = activePlan.days.find((item) => item.day === dayNumber);
  button.disabled = true;
  try {
    const response = await fetch(`/api/study-plans/${encodeURIComponent(planId)}/day/${dayNumber}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !day.completed })
    });
    const data = await response.json();
    if (response.status === 401) return window.location.replace('/login.html');
    if (!response.ok) throw new Error(data.message || 'Unable to update this day.');
    renderPlan(data.plan);
  } catch (error) {
    button.disabled = false;
    button.textContent = error.message || 'Try again';
  }
});

loadPlan();