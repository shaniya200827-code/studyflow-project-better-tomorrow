/**
 * StudyFlow — Dashboard Analytics & Tracking Logic (dashboard.js)
 * Part of Project Better Tomorrow (College Design Thinking Prototype)
 * Calculates dynamic metrics, progress rings, subject completion bars,
 * weekly activity charts, and today's scheduled agenda from localStorage.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const greetingEl = document.getElementById('greeting-heading');
  const greetingDateEl = document.getElementById('greeting-date');
  const todayTasksCountEl = document.getElementById('stat-today-tasks');
  const completedCountEl = document.getElementById('stat-completed-tasks');
  const studyTimeEl = document.getElementById('stat-study-time');
  const streakEl = document.getElementById('stat-streak');
  const overallProgressText = document.getElementById('overall-progress-text');
  const progressRingCircle = document.getElementById('progress-ring-circle');
  const subjectProgressContainer = document.getElementById('subject-progress-container');
  const todayPlanContainer = document.getElementById('today-plan-container');
  const weeklyChartContainer = document.getElementById('weekly-chart-container');
  const dashboardEmptyState = document.getElementById('dashboard-empty-state');
  const dashboardMainContent = document.getElementById('dashboard-main-content');
  const demoBanner = document.getElementById('demo-mode-banner');
  const loadDemoBtn = document.getElementById('dash-load-demo-btn');
  const resetDataBtn = document.getElementById('dash-reset-data-btn');

  // ============================================================================
  // 1. DYNAMIC GREETING & DATE
  // ============================================================================
  const updateGreeting = () => {
    const now = new Date();
    const hour = now.getHours();
    let greeting = 'Good morning! 👋';

    if (hour >= 12 && hour < 17) {
      greeting = 'Good afternoon! 👋';
    } else if (hour >= 17 && hour < 21) {
      greeting = 'Good evening! 👋';
    } else if (hour >= 21 || hour < 5) {
      greeting = 'Good night! 🌙';
    }

    if (greetingEl) greetingEl.textContent = greeting;

    if (greetingDateEl) {
      const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
      greetingDateEl.textContent = now.toLocaleDateString('en-US', options);
    }
  };

  // ============================================================================
  // 2. COMPUTE METRICS & PROGRESS FROM STORED DATA
  // ============================================================================
  const updateDashboard = () => {
    const subjects = StudyFlowStorage.getSubjects();
    const schedule = StudyFlowStorage.getSchedule();
    const focusHistory = StudyFlowStorage.getFocusHistory();
    const streak = StudyFlowStorage.getStreak();
    const isDemo = StudyFlowStorage.isDemo();

    // Check if demo banner should display
    if (demoBanner) {
      demoBanner.style.display = isDemo ? 'flex' : 'none';
    }

    // Check if user has generated any schedule or added subjects
    const totalSessionsAllWeek = schedule.reduce((sum, d) => sum + (d.sessions ? d.sessions.length : 0), 0);

    if (subjects.length === 0 && totalSessionsAllWeek === 0) {
      if (dashboardEmptyState) dashboardEmptyState.style.display = 'block';
      if (dashboardMainContent) dashboardMainContent.style.display = 'none';
      return;
    }

    if (dashboardEmptyState) dashboardEmptyState.style.display = 'none';
    if (dashboardMainContent) dashboardMainContent.style.display = 'block';

    // Day of the week for today
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = daysOfWeek[new Date().getDay()];

    // Find today's plan
    const todayPlan = schedule.find(d => d.day.toLowerCase() === currentDayName.toLowerCase()) || { sessions: [] };
    const todaySessions = todayPlan.sessions || [];

    // Stat 1: Today's Tasks
    const todayTasksCount = todaySessions.length;
    if (todayTasksCountEl) todayTasksCountEl.textContent = todayTasksCount;

    // Stat 2: Completed Tasks (Today & Overall)
    const todayCompletedCount = todaySessions.filter(s => s.status === 'completed').length;
    let allCompletedCount = 0;
    let totalAllTasks = 0;
    schedule.forEach(d => {
      if (d.sessions) {
        d.sessions.forEach(s => {
          totalAllTasks++;
          if (s.status === 'completed') allCompletedCount++;
        });
      }
    });

    if (completedCountEl) {
      completedCountEl.textContent = `${todayCompletedCount} / ${todayTasksCount}`;
    }

    // Stat 3: Total Study Time (Focus Sessions + Completed Tasks Duration)
    let totalFocusMins = focusHistory.reduce((sum, f) => sum + (parseInt(f.durationMinutes) || 0), 0);
    // Add completed sessions duration if not already counted in focus
    let completedSessionsMins = 0;
    schedule.forEach(d => {
      if (d.sessions) {
        d.sessions.forEach(s => {
          if (s.status === 'completed') {
            completedSessionsMins += (parseInt(s.durationMins) || 45);
          }
        });
      }
    });

    const totalMinutesStudied = Math.max(totalFocusMins, completedSessionsMins);
    const hours = Math.floor(totalMinutesStudied / 60);
    const mins = totalMinutesStudied % 60;
    let studyTimeStr = `${hours}h ${mins}m`;
    if (hours === 0) studyTimeStr = `${mins}m`;
    if (studyTimeEl) studyTimeEl.textContent = studyTimeStr;

    // Stat 4: Current Streak
    if (streakEl) {
      const count = streak.count || 0;
      streakEl.textContent = `${count} ${count === 1 ? 'day' : 'days'}`;
    }

    // Overall Progress Calculation
    const overallPercentage = totalAllTasks > 0 ? Math.round((allCompletedCount / totalAllTasks) * 100) : 0;
    if (overallProgressText) {
      overallProgressText.textContent = `${overallPercentage}%`;
    }

    // Animate Circular Progress Ring
    if (progressRingCircle) {
      const radius = progressRingCircle.r.baseVal.value;
      const circumference = 2 * Math.PI * radius;
      progressRingCircle.style.strokeDasharray = `${circumference} ${circumference}`;
      const offset = circumference - (overallPercentage / 100) * circumference;
      progressRingCircle.style.strokeDashoffset = offset;
    }

    // ============================================================================
    // 3. SUBJECT-BY-SUBJECT PROGRESS BARS
    // ============================================================================
    if (subjectProgressContainer) {
      const subjectStats = {};

      // Initialize all subjects with 0
      subjects.forEach(sub => {
        subjectStats[sub.name] = { total: 0, completed: 0, difficulty: sub.difficulty };
      });

      // Count tasks per subject
      schedule.forEach(d => {
        if (d.sessions) {
          d.sessions.forEach(s => {
            if (!subjectStats[s.subjectName]) {
              subjectStats[s.subjectName] = { total: 0, completed: 0, difficulty: 'medium' };
            }
            subjectStats[s.subjectName].total++;
            if (s.status === 'completed') {
              subjectStats[s.subjectName].completed++;
            }
          });
        }
      });

      const subjectEntries = Object.entries(subjectStats);

      if (subjectEntries.length === 0) {
        subjectProgressContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem;">No subject progress data available yet.</p>`;
      } else {
        subjectProgressContainer.innerHTML = subjectEntries.map(([name, stat]) => {
          const pct = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;
          return `
            <div class="progress-bar-group">
              <div class="progress-bar-labels">
                <span style="font-weight: 700; color: var(--text-primary);">${escapeHtml(name)}</span>
                <span style="color: var(--primary); font-weight: 800;">${pct}% <small style="color: var(--text-muted); font-weight: 500;">(${stat.completed}/${stat.total})</small></span>
              </div>
              <div class="progress-bar-track">
                <div class="progress-bar-fill" style="width: ${pct}%;"></div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // ============================================================================
    // 4. TODAY'S PLAN AGENDA
    // ============================================================================
    if (todayPlanContainer) {
      if (todaySessions.length === 0) {
        todayPlanContainer.innerHTML = `
          <div class="empty-state" style="padding: 2rem 1rem;">
            <div class="empty-state-icon" style="font-size: 2.2rem;">🌴</div>
            <div class="empty-state-title" style="font-size: 1.1rem;">No sessions scheduled for ${currentDayName}</div>
            <p class="empty-state-text">Take a well-deserved break, review previous notes, or adjust your study hours in the planner.</p>
            <a href="planner.html" class="btn btn-secondary btn-sm">Edit Schedule</a>
          </div>
        `;
      } else {
        todayPlanContainer.innerHTML = todaySessions.map(sess => {
          let priorityBadge = 'badge-medium';
          if (sess.priorityLevel === 'high') priorityBadge = 'badge-high';
          else if (sess.priorityLevel === 'low') priorityBadge = 'badge-low';

          const isCompleted = sess.status === 'completed';

          return `
            <div class="session-item ${isCompleted ? 'completed' : ''}" data-task-id="${sess.id}">
              <div class="session-left">
                <input type="checkbox" class="session-checkbox" data-task-id="${sess.id}" ${isCompleted ? 'checked' : ''} aria-label="Mark task completed">
                <div class="session-time-badge">${sess.startTime} – ${sess.endTime}</div>
                <div class="session-info">
                  <span class="session-subject">${escapeHtml(sess.subjectName)}</span>
                  <span class="session-topic">${escapeHtml(sess.topicName)}</span>
                </div>
              </div>
              <div class="session-right">
                <span class="badge ${priorityBadge}">${sess.priorityLevel}</span>
                <select class="form-select session-status-select btn-sm" data-task-id="${sess.id}" style="width: auto; padding: 0.25rem 0.5rem; font-size: 0.8rem;">
                  <option value="pending" ${sess.status === 'pending' ? 'selected' : ''}>Pending</option>
                  <option value="in-progress" ${sess.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                  <option value="completed" ${sess.status === 'completed' ? 'selected' : ''}>Completed</option>
                </select>
                <a href="focus.html?subject=${encodeURIComponent(sess.subjectName)}&task=${encodeURIComponent(sess.topicName)}&duration=${sess.durationMins}&taskId=${sess.id}" class="btn btn-primary btn-sm">
                  🎯 Focus
                </a>
              </div>
            </div>
          `;
        }).join('');

        // Attach listeners for interactive checkboxes on dashboard
        todayPlanContainer.querySelectorAll('.session-checkbox').forEach(cb => {
          cb.addEventListener('change', (e) => {
            const taskId = e.target.dataset.taskId;
            toggleTask(taskId, e.target.checked ? 'completed' : 'pending');
          });
        });

        todayPlanContainer.querySelectorAll('.session-status-select').forEach(sel => {
          sel.addEventListener('change', (e) => {
            const taskId = e.target.dataset.taskId;
            toggleTask(taskId, e.target.value);
          });
        });
      }
    }

    // ============================================================================
    // 5. WEEKLY COMPLETION CHART (MONDAY - SUNDAY)
    // ============================================================================
    if (weeklyChartContainer) {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const chartData = days.map(dayName => {
        const dayObj = schedule.find(d => d.day.toLowerCase() === dayName.toLowerCase());
        if (!dayObj || !dayObj.sessions || dayObj.sessions.length === 0) {
          return { day: dayName.slice(0, 3), total: 0, completed: 0, pct: 0 };
        }
        const total = dayObj.sessions.length;
        const completed = dayObj.sessions.filter(s => s.status === 'completed').length;
        const pct = Math.round((completed / total) * 100);
        return { day: dayName.slice(0, 3), total, completed, pct };
      });

      weeklyChartContainer.innerHTML = chartData.map(d => {
        const barHeight = d.total > 0 ? Math.max(8, d.pct) : 4;
        const tooltip = `${d.day}: ${d.completed}/${d.total} completed (${d.pct}%)`;
        return `
          <div class="chart-column" title="${tooltip}">
            <div style="font-size: 0.72rem; font-weight: 700; color: var(--primary);">${d.total > 0 ? `${d.pct}%` : '-'}</div>
            <div class="chart-bar-wrap">
              <div class="chart-bar-fill" style="height: ${barHeight}%;"></div>
            </div>
            <span class="chart-day-label">${d.day}</span>
          </div>
        `;
      }).join('');
    }
  };

  const toggleTask = (taskId, newStatus) => {
    const schedule = StudyFlowStorage.getSchedule();
    let updated = false;

    schedule.forEach(day => {
      if (day.sessions) {
        day.sessions.forEach(s => {
          if (s.id === taskId) {
            s.status = newStatus;
            updated = true;
          }
        });
      }
    });

    if (updated) {
      StudyFlowStorage.saveSchedule(schedule);
      if (newStatus === 'completed') {
        StudyFlowStorage.updateStreak();
        StudyFlowUI.toast('Task completed! Dashboard updated.', 'success');
      }
      updateDashboard();
    }
  };

  // ============================================================================
  // 6. DEMO DATA & RESET CONTROLS
  // ============================================================================
  if (loadDemoBtn) {
    loadDemoBtn.addEventListener('click', () => {
      DemoDataLoader.load();
      updateDashboard();
      StudyFlowUI.toast('✨ Sample data loaded for college demonstration!', 'info');
    });
  }

  if (resetDataBtn) {
    resetDataBtn.addEventListener('click', async () => {
      const confirmed = await StudyFlowUI.confirm({
        title: 'Reset All Study Data?',
        message: 'This will erase all your subjects, weekly schedules, and focus tracking metrics. This action cannot be undone.',
        confirmText: 'Reset Everything',
        confirmStyle: 'btn-danger'
      });

      if (confirmed) {
        StudyFlowStorage.resetAll();
        updateDashboard();
        StudyFlowUI.toast('All study data reset to initial state.', 'info');
      }
    });
  }

  // Initial Load
  updateGreeting();
  updateDashboard();
});

// HTML escaping helper
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
