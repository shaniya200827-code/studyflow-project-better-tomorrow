/**
 * StudyFlow — Planner Page Logic (planner.js)
 * Part of Project Better Tomorrow (College Design Thinking Prototype)
 * Handles Subject CRUD, Daily Available Hours, Study Goals,
 * Rule-Based Plan Generation, and Interactive Timetable Management.
 */

document.addEventListener('DOMContentLoaded', () => {
  // State
  let subjects = StudyFlowStorage.getSubjects();
  let dailyHours = StudyFlowStorage.getDailyHours();
  let preferences = StudyFlowStorage.getPreferences();
  let schedule = StudyFlowStorage.getSchedule();
  let editingSubjectId = null;

  // DOM Elements
  const subjectForm = document.getElementById('subject-form');
  const subjectNameInput = document.getElementById('subject-name');
  const examDateInput = document.getElementById('exam-date');
  const topicsCountInput = document.getElementById('topics-count');
  const estimatedHoursInput = document.getElementById('estimated-hours');
  const subjectsList = document.getElementById('subjects-list');
  const subjectsEmptyState = document.getElementById('subjects-empty-state');
  const formSubmitBtn = document.getElementById('form-submit-btn');
  const formCancelBtn = document.getElementById('form-cancel-btn');
  const generatePlanBtn = document.getElementById('generate-plan-btn');
  const scheduleContainer = document.getElementById('schedule-container');
  const scheduleEmptyState = document.getElementById('schedule-empty-state');
  const loadDemoBtn = document.getElementById('load-demo-btn');
  const resetDataBtn = document.getElementById('reset-data-btn');

  // Set minimum date for exam date input to today
  if (examDateInput) {
    const today = new Date().toISOString().split('T')[0];
    examDateInput.setAttribute('min', today);
  }

  // ============================================================================
  // 1. DIFFICULTY & PREFERENCES PILL PICKERS
  // ============================================================================
  let selectedDifficulty = 'medium';
  const difficultyOptions = document.querySelectorAll('#difficulty-pills .pill-option');
  difficultyOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      difficultyOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      selectedDifficulty = opt.dataset.value;
    });
  });

  const setDifficultyPill = (val) => {
    selectedDifficulty = val || 'medium';
    difficultyOptions.forEach(opt => {
      opt.classList.toggle('active', opt.dataset.value === selectedDifficulty);
    });
  };

  // Study Time Preference Pills
  const timePrefOptions = document.querySelectorAll('#time-pref-pills .pill-option');
  timePrefOptions.forEach(opt => {
    if (opt.dataset.value === preferences.studyTime) opt.classList.add('active');
    opt.addEventListener('click', () => {
      timePrefOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      preferences.studyTime = opt.dataset.value;
      StudyFlowStorage.savePreferences(preferences);
    });
  });

  // Goal Selector
  const goalSelect = document.getElementById('study-goal-select');
  const goalDescInput = document.getElementById('study-goal-desc');
  if (goalSelect) {
    goalSelect.value = preferences.goal || 'exam';
    goalSelect.addEventListener('change', () => {
      preferences.goal = goalSelect.value;
      StudyFlowStorage.savePreferences(preferences);
    });
  }
  if (goalDescInput) {
    goalDescInput.value = preferences.goalDescription || '';
    goalDescInput.addEventListener('input', () => {
      preferences.goalDescription = goalDescInput.value;
      StudyFlowStorage.savePreferences(preferences);
    });
  }

  // Daily Hours Inputs
  const dayInputs = document.querySelectorAll('.day-input');
  dayInputs.forEach(input => {
    const day = input.dataset.day;
    if (dailyHours[day] !== undefined) {
      input.value = dailyHours[day];
    }
    input.addEventListener('change', () => {
      let val = parseFloat(input.value);
      if (isNaN(val) || val < 0) val = 0;
      if (val > 16) val = 16;
      input.value = val;
      dailyHours[day] = val;
      StudyFlowStorage.saveDailyHours(dailyHours);
    });
  });

  // ============================================================================
  // 2. RENDER SUBJECTS LIST
  // ============================================================================
  const renderSubjects = () => {
    subjects = StudyFlowStorage.getSubjects();
    if (!subjectsList) return;

    if (subjects.length === 0) {
      subjectsList.innerHTML = '';
      if (subjectsEmptyState) subjectsEmptyState.style.display = 'flex';
      return;
    }

    if (subjectsEmptyState) subjectsEmptyState.style.display = 'none';

    subjectsList.innerHTML = subjects.map(sub => {
      const priority = PriorityEngine.calculateScore(sub);
      let badgeClass = 'badge-medium';
      if (priority.level === 'high') badgeClass = 'badge-high';
      else if (priority.level === 'low') badgeClass = 'badge-low';

      const examText = sub.examDate ? new Date(sub.examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Flexible';
      const daysText = priority.breakdown.daysUntil <= 1 ? 'Exam today / tomorrow!' : `${priority.breakdown.daysUntil} days left`;

      return `
        <div class="subject-item-card" data-id="${sub.id}">
          <div class="subject-item-info">
            <div class="subject-item-title">
              <span>${escapeHtml(sub.name)}</span>
              <span class="badge ${badgeClass}">${priority.level} Priority (${priority.score})</span>
            </div>
            <div class="subject-item-meta">
              <span>📚 Difficulty: <strong>${sub.difficulty.toUpperCase()}</strong></span>
              <span>📅 Exam: <strong>${examText}</strong> (${daysText})</span>
              <span>📑 Topics: <strong>${sub.topicsCount}</strong></span>
              <span>⏱️ Workload: <strong>${sub.estimatedHours}h</strong></span>
            </div>
          </div>
          <div class="subject-item-actions">
            <button class="btn btn-secondary btn-sm edit-subject-btn" data-id="${sub.id}" title="Edit Subject">
              ✏️ Edit
            </button>
            <button class="btn btn-danger btn-sm delete-subject-btn" data-id="${sub.id}" title="Delete Subject">
              🗑️
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach Edit and Delete listeners
    document.querySelectorAll('.edit-subject-btn').forEach(btn => {
      btn.addEventListener('click', () => editSubject(btn.dataset.id));
    });
    document.querySelectorAll('.delete-subject-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteSubject(btn.dataset.id));
    });
  };

  // ============================================================================
  // 3. SUBJECT CRUD ACTIONS & FORM VALIDATION
  // ============================================================================
  if (subjectForm) {
    subjectForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = subjectNameInput.value.trim();
      const examDate = examDateInput.value;
      const topicsCount = parseInt(topicsCountInput.value);
      const estimatedHours = parseFloat(estimatedHoursInput.value);

      // Friendly Validation
      if (!name) {
        StudyFlowUI.toast('Please enter a valid subject name.', 'warning');
        subjectNameInput.focus();
        return;
      }
      if (!examDate) {
        StudyFlowUI.toast('Please select an upcoming assessment or exam date.', 'warning');
        examDateInput.focus();
        return;
      }
      if (isNaN(topicsCount) || topicsCount <= 0) {
        StudyFlowUI.toast('Please specify at least 1 topic or chapter.', 'warning');
        topicsCountInput.focus();
        return;
      }
      if (isNaN(estimatedHours) || estimatedHours <= 0) {
        StudyFlowUI.toast('Please enter realistic estimated study hours (e.g. 8).', 'warning');
        estimatedHoursInput.focus();
        return;
      }

      if (editingSubjectId) {
        // Update existing subject
        subjects = subjects.map(s => {
          if (s.id === editingSubjectId) {
            return {
              ...s,
              name,
              difficulty: selectedDifficulty,
              examDate,
              topicsCount,
              estimatedHours
            };
          }
          return s;
        });
        StudyFlowStorage.saveSubjects(subjects);
        StudyFlowUI.toast(`Updated "${name}" successfully.`, 'success');
        resetSubjectForm();
      } else {
        // Create new subject
        const newSubject = {
          id: 'sub_' + Date.now().toString(36),
          name,
          difficulty: selectedDifficulty,
          examDate,
          topicsCount,
          estimatedHours,
          createdAt: new Date().toISOString()
        };
        subjects.push(newSubject);
        StudyFlowStorage.saveSubjects(subjects);
        StudyFlowUI.toast(`Added "${name}" to your subject list!`, 'success');
        resetSubjectForm();
      }

      renderSubjects();
    });
  }

  const editSubject = (id) => {
    const sub = subjects.find(s => s.id === id);
    if (!sub) return;

    editingSubjectId = id;
    subjectNameInput.value = sub.name;
    examDateInput.value = sub.examDate || '';
    topicsCountInput.value = sub.topicsCount;
    estimatedHoursInput.value = sub.estimatedHours;
    setDifficultyPill(sub.difficulty);

    formSubmitBtn.innerHTML = '💾 Update Subject';
    if (formCancelBtn) formCancelBtn.style.display = 'inline-flex';
    subjectNameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    subjectNameInput.focus();
  };

  const resetSubjectForm = () => {
    editingSubjectId = null;
    subjectForm.reset();
    setDifficultyPill('medium');
    formSubmitBtn.innerHTML = '+ Add Subject';
    if (formCancelBtn) formCancelBtn.style.display = 'none';
  };

  if (formCancelBtn) {
    formCancelBtn.addEventListener('click', resetSubjectForm);
  }

  const deleteSubject = async (id) => {
    const sub = subjects.find(s => s.id === id);
    if (!sub) return;

    const confirmed = await StudyFlowUI.confirm({
      title: 'Delete Subject',
      message: `Are you sure you want to remove <strong>${escapeHtml(sub.name)}</strong>? Any sessions generated for this subject will be removed.`,
      confirmText: 'Delete',
      confirmStyle: 'btn-danger'
    });

    if (confirmed) {
      subjects = subjects.filter(s => s.id !== id);
      StudyFlowStorage.saveSubjects(subjects);

      // Clean up schedule if needed
      schedule = schedule.map(dayPlan => ({
        ...dayPlan,
        sessions: dayPlan.sessions.filter(sess => sess.subjectId !== id)
      }));
      StudyFlowStorage.saveSchedule(schedule);

      renderSubjects();
      renderSchedule();
      StudyFlowUI.toast(`Removed "${sub.name}".`, 'info');
    }
  };

  // ============================================================================
  // 4. RULE-BASED PLAN GENERATION
  // ============================================================================
  if (generatePlanBtn) {
    generatePlanBtn.addEventListener('click', () => {
      subjects = StudyFlowStorage.getSubjects();

      if (subjects.length === 0) {
        StudyFlowUI.toast('Please add at least one subject before generating your study flow!', 'warning');
        subjectNameInput.focus();
        return;
      }

      // Check total available study hours across the week
      const totalHours = Object.values(dailyHours).reduce((acc, h) => acc + (parseFloat(h) || 0), 0);
      if (totalHours <= 0) {
        StudyFlowUI.toast('Please allocate study hours for at least one day of the week.', 'warning');
        return;
      }

      // Generate schedule using transparent rule-based priority engine
      schedule = PriorityEngine.generateWeeklyPlan(subjects, dailyHours, preferences);
      StudyFlowStorage.saveSchedule(schedule);
      StudyFlowStorage.setDemo(false); // User personalized plan

      renderSchedule();
      StudyFlowUI.toast('✨ Personalized Study Flow generated successfully!', 'success');

      // Smooth scroll down to schedule
      const scheduleHeader = document.getElementById('schedule-section');
      if (scheduleHeader) {
        scheduleHeader.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // ============================================================================
  // 5. RENDER GENERATED SCHEDULE & TASK INTERACTION
  // ============================================================================
  const renderSchedule = () => {
    schedule = StudyFlowStorage.getSchedule();
    if (!scheduleContainer) return;

    const totalSessions = schedule.reduce((sum, d) => sum + (d.sessions ? d.sessions.length : 0), 0);

    if (totalSessions === 0) {
      scheduleContainer.innerHTML = '';
      if (scheduleEmptyState) scheduleEmptyState.style.display = 'flex';
      return;
    }

    if (scheduleEmptyState) scheduleEmptyState.style.display = 'none';

    scheduleContainer.innerHTML = schedule.map(dayPlan => {
      if (!dayPlan.sessions || dayPlan.sessions.length === 0) {
        return `
          <div class="schedule-day-group">
            <div class="schedule-day-header">
              <span>${dayPlan.day}</span>
              <span class="badge badge-neutral">Rest / Catch-up Day (0h)</span>
            </div>
            <p style="color: var(--text-muted); font-size: 0.9rem; padding: 0.5rem 0;">No sessions scheduled for this day.</p>
          </div>
        `;
      }

      const sessionsHtml = dayPlan.sessions.map(sess => {
        let priorityBadge = 'badge-medium';
        if (sess.priorityLevel === 'high') priorityBadge = 'badge-high';
        else if (sess.priorityLevel === 'low') priorityBadge = 'badge-low';

        const isCompleted = sess.status === 'completed';

        return `
          <div class="session-item ${isCompleted ? 'completed' : ''}" data-task-id="${sess.id}">
            <div class="session-left">
              <input type="checkbox" class="session-checkbox" data-task-id="${sess.id}" ${isCompleted ? 'checked' : ''} aria-label="Mark task complete">
              <div class="session-time-badge">${sess.startTime} – ${sess.endTime} (${sess.durationMins}m)</div>
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
              <a href="focus.html?subject=${encodeURIComponent(sess.subjectName)}&task=${encodeURIComponent(sess.topicName)}&duration=${sess.durationMins}&taskId=${sess.id}" class="btn btn-outline btn-sm">
                🎯 Focus
              </a>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="schedule-day-group">
          <div class="schedule-day-header">
            <span>📅 ${dayPlan.day}</span>
            <span class="badge badge-primary">${dayPlan.totalHours} Hours Allocated</span>
          </div>
          <div class="day-sessions-list">
            ${sessionsHtml}
          </div>
        </div>
      `;
    }).join('');

    // Attach Status Select & Checkbox listeners
    document.querySelectorAll('.session-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const taskId = e.target.dataset.taskId;
        const newStatus = e.target.checked ? 'completed' : 'pending';
        updateTaskStatus(taskId, newStatus);
      });
    });

    document.querySelectorAll('.session-status-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const taskId = e.target.dataset.taskId;
        updateTaskStatus(taskId, e.target.value);
      });
    });
  };

  const updateTaskStatus = (taskId, newStatus) => {
    schedule = StudyFlowStorage.getSchedule();
    let updated = false;

    schedule.forEach(day => {
      if (day.sessions) {
        day.sessions.forEach(sess => {
          if (sess.id === taskId) {
            sess.status = newStatus;
            updated = true;
          }
        });
      }
    });

    if (updated) {
      StudyFlowStorage.saveSchedule(schedule);
      if (newStatus === 'completed') {
        StudyFlowStorage.updateStreak();
        StudyFlowUI.toast('🎉 Great job! Session marked as completed.', 'success');
      }
      renderSchedule();
    }
  };

  // ============================================================================
  // 6. DEMO DATA & RESET CONTROLS
  // ============================================================================
  if (loadDemoBtn) {
    loadDemoBtn.addEventListener('click', () => {
      DemoDataLoader.load();
      subjects = StudyFlowStorage.getSubjects();
      dailyHours = StudyFlowStorage.getDailyHours();
      preferences = StudyFlowStorage.getPreferences();
      schedule = StudyFlowStorage.getSchedule();

      // Update input fields
      dayInputs.forEach(input => {
        const day = input.dataset.day;
        if (dailyHours[day] !== undefined) input.value = dailyHours[day];
      });
      if (goalSelect) goalSelect.value = preferences.goal;
      if (goalDescInput) goalDescInput.value = preferences.goalDescription;

      renderSubjects();
      renderSchedule();
      StudyFlowUI.toast('✨ Demo data loaded! Realistic schedule ready for review.', 'info');
    });
  }

  if (resetDataBtn) {
    resetDataBtn.addEventListener('click', async () => {
      const confirmed = await StudyFlowUI.confirm({
        title: 'Reset All Study Data?',
        message: 'This will erase all subjects, generated study plans, preferences, and focus tracking data. This action cannot be undone.',
        confirmText: 'Reset Everything',
        confirmStyle: 'btn-danger'
      });

      if (confirmed) {
        StudyFlowStorage.resetAll();
        subjects = [];
        schedule = [];
        dailyHours = { ...DEFAULT_HOURS };
        preferences = { ...DEFAULT_PREFS };

        dayInputs.forEach(input => {
          const day = input.dataset.day;
          if (dailyHours[day] !== undefined) input.value = dailyHours[day];
        });
        resetSubjectForm();
        renderSubjects();
        renderSchedule();
        StudyFlowUI.toast('All study data has been reset.', 'info');
      }
    });
  }

  // Initial Render
  renderSubjects();
  renderSchedule();
});

// Utility
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
