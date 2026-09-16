/**
 * StudyFlow — Focus Mode Logic (focus.js)
 * Part of Project Better Tomorrow (College Design Thinking Prototype)
 * Implements a distraction-free Pomodoro study timer, interval switching,
 * Web Audio API completion chime, and automatic progress tracking.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Timer State
  let currentDurationSeconds = 25 * 60;
  let remainingSeconds = currentDurationSeconds;
  let timerInterval = null;
  let isRunning = false;
  let selectedSubject = 'General Study';
  let selectedTask = 'Deep Focus Session';
  let attachedTaskId = null;

  // DOM Elements
  const timerDigits = document.getElementById('timer-digits');
  const startBtn = document.getElementById('timer-start-btn');
  const pauseBtn = document.getElementById('timer-pause-btn');
  const resetBtn = document.getElementById('timer-reset-btn');
  const finishBtn = document.getElementById('timer-finish-btn');
  const presetButtons = document.querySelectorAll('.timer-preset-btn');
  const subjectDisplay = document.getElementById('focus-subject-name');
  const taskDisplay = document.getElementById('focus-task-name');
  const subjectSelect = document.getElementById('focus-subject-select');
  const taskInput = document.getElementById('focus-task-input');
  const sessionStatusBadge = document.getElementById('focus-session-status');

  // ============================================================================
  // 1. URL QUERY PARAMETERS & SUBJECT/TASK INITIALIZATION
  // ============================================================================
  const urlParams = new URLSearchParams(window.location.search);
  const paramSubject = urlParams.get('subject');
  const paramTask = urlParams.get('task');
  const paramDuration = parseInt(urlParams.get('duration'));
  const paramTaskId = urlParams.get('taskId');

  const subjects = StudyFlowStorage.getSubjects();

  // Populate subject select options
  if (subjectSelect) {
    subjectSelect.innerHTML = `
      <option value="General Study">General Study / Revision</option>
      ${subjects.map(s => `<option value="${escapeHtml(s.name)}">${escapeHtml(s.name)}</option>`).join('')}
    `;

    if (paramSubject) {
      selectedSubject = paramSubject;
      subjectSelect.value = paramSubject;
    }
  }

  if (paramSubject) {
    selectedSubject = paramSubject;
    if (subjectDisplay) subjectDisplay.textContent = paramSubject;
  }

  if (paramTask) {
    selectedTask = paramTask;
    if (taskDisplay) taskDisplay.textContent = paramTask;
    if (taskInput) taskInput.value = paramTask;
  }

  if (paramTaskId) {
    attachedTaskId = paramTaskId;
  }

  if (paramDuration && !isNaN(paramDuration) && paramDuration > 0) {
    setTimerDuration(paramDuration * 60);
  }

  // Handle subject dropdown change
  if (subjectSelect) {
    subjectSelect.addEventListener('change', () => {
      selectedSubject = subjectSelect.value;
      if (subjectDisplay) subjectDisplay.textContent = selectedSubject;
    });
  }

  // Handle task text edit
  if (taskInput) {
    taskInput.addEventListener('input', () => {
      selectedTask = taskInput.value.trim() || 'Deep Focus Session';
      if (taskDisplay) taskDisplay.textContent = selectedTask;
    });
  }

  // ============================================================================
  // 2. WEB AUDIO API SOUND SYNTHESIZER
  // ============================================================================
  const playChime = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const playTone = (freq, startTime, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = ctx.currentTime;
      playTone(523.25, now, 0.4);       // C5
      playTone(659.25, now + 0.15, 0.4); // E5
      playTone(783.99, now + 0.3, 0.7);  // G5
    } catch (e) {
      console.log('Web Audio chime not supported or muted:', e);
    }
  };

  // ============================================================================
  // 3. TIMER DISPLAY & PRESETS
  // ============================================================================
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function updateDisplay() {
    if (timerDigits) {
      timerDigits.textContent = formatTime(remainingSeconds);
    }
    // Update document title with remaining countdown
    if (isRunning) {
      document.title = `(${formatTime(remainingSeconds)}) Focus — StudyFlow`;
    } else {
      document.title = `Focus Mode — StudyFlow`;
    }
  }

  function setTimerDuration(seconds) {
    pauseTimer();
    currentDurationSeconds = seconds;
    remainingSeconds = seconds;
    updateDisplay();
  }

  // Preset Buttons
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mins = parseInt(btn.dataset.minutes);
      setTimerDuration(mins * 60);
    });
  });

  // ============================================================================
  // 4. TIMER CONTROLS: START, PAUSE, RESET, FINISH
  // ============================================================================
  const startTimer = () => {
    if (isRunning) return;

    isRunning = true;
    startBtn.style.display = 'none';
    pauseBtn.style.display = 'inline-flex';
    if (sessionStatusBadge) {
      sessionStatusBadge.className = 'status-pill in-progress';
      sessionStatusBadge.textContent = 'FOCUSING...';
    }

    timerInterval = setInterval(() => {
      if (remainingSeconds > 0) {
        remainingSeconds--;
        updateDisplay();
      } else {
        // Timer completed!
        handleTimerComplete();
      }
    }, 1000);
  };

  const pauseTimer = () => {
    if (!isRunning) return;

    isRunning = false;
    clearInterval(timerInterval);
    startBtn.style.display = 'inline-flex';
    pauseBtn.style.display = 'none';
    if (sessionStatusBadge) {
      sessionStatusBadge.className = 'status-pill pending';
      sessionStatusBadge.textContent = 'PAUSED';
    }
    updateDisplay();
  };

  const resetTimer = () => {
    pauseTimer();
    remainingSeconds = currentDurationSeconds;
    if (sessionStatusBadge) {
      sessionStatusBadge.className = 'status-pill pending';
      sessionStatusBadge.textContent = 'READY';
    }
    updateDisplay();
  };

  const handleTimerComplete = () => {
    pauseTimer();
    playChime();

    const minutesSpent = Math.max(1, Math.round(currentDurationSeconds / 60));

    // Log focus session to storage
    StudyFlowStorage.addFocusSession({
      subject: selectedSubject,
      task: selectedTask,
      durationMinutes: minutesSpent
    });

    // Mark task completed if attached
    if (attachedTaskId) {
      markScheduleTaskCompleted(attachedTaskId);
    }

    if (sessionStatusBadge) {
      sessionStatusBadge.className = 'status-pill completed';
      sessionStatusBadge.textContent = 'SESSION COMPLETED 🎉';
    }

    StudyFlowUI.toast(`🎉 Excellent session! Logged ${minutesSpent} mins for ${selectedSubject}.`, 'success', 6000);
  };

  const finishSessionEarly = async () => {
    const elapsedSeconds = currentDurationSeconds - remainingSeconds;
    const elapsedMins = Math.max(1, Math.round(elapsedSeconds / 60));

    const confirmed = await StudyFlowUI.confirm({
      title: 'Finish Focus Session?',
      message: `You have spent <strong>${elapsedMins} minute(s)</strong> studying <strong>${escapeHtml(selectedSubject)}</strong>. Would you like to log this progress to your dashboard?`,
      confirmText: 'Log & Finish',
      confirmStyle: 'btn-primary'
    });

    if (confirmed) {
      pauseTimer();
      playChime();

      StudyFlowStorage.addFocusSession({
        subject: selectedSubject,
        task: selectedTask,
        durationMinutes: elapsedMins
      });

      if (attachedTaskId) {
        markScheduleTaskCompleted(attachedTaskId);
      }

      StudyFlowUI.toast(`Logged ${elapsedMins} mins of study time! Great focus!`, 'success');
      resetTimer();
    }
  };

  // Helper to mark task completed in schedule
  const markScheduleTaskCompleted = (taskId) => {
    const schedule = StudyFlowStorage.getSchedule();
    let updated = false;
    schedule.forEach(day => {
      if (day.sessions) {
        day.sessions.forEach(s => {
          if (s.id === taskId) {
            s.status = 'completed';
            updated = true;
          }
        });
      }
    });
    if (updated) {
      StudyFlowStorage.saveSchedule(schedule);
    }
  };

  // Button Listeners
  if (startBtn) startBtn.addEventListener('click', startTimer);
  if (pauseBtn) pauseBtn.addEventListener('click', pauseTimer);
  if (resetBtn) resetBtn.addEventListener('click', resetTimer);
  if (finishBtn) finishBtn.addEventListener('click', finishSessionEarly);

  // Initialize display
  updateDisplay();
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
