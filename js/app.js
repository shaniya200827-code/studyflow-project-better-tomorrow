/**
 * StudyFlow — Core Engine & Shared Utilities
 * Part of Project Better Tomorrow (College Design Thinking Prototype)
 * Handles LocalStorage persistence, rule-based priority calculation,
 * theme switching, toast alerts, modal dialogs, and demo data.
 */

// ============================================================================
// 1. STORAGE KEYS & CONSTANTS
// ============================================================================
const STORAGE_KEYS = {
  THEME: 'studyflow_theme',
  SUBJECTS: 'studyflow_subjects',
  SCHEDULE: 'studyflow_schedule',
  HOURS: 'studyflow_daily_hours',
  PREFS: 'studyflow_preferences',
  FOCUS_HISTORY: 'studyflow_focus_history',
  STREAK: 'studyflow_streak',
  IS_DEMO: 'studyflow_is_demo'
};

const DEFAULT_HOURS = {
  Monday: 3,
  Tuesday: 2.5,
  Wednesday: 3,
  Thursday: 2.5,
  Friday: 3,
  Saturday: 4,
  Sunday: 4
};

const DEFAULT_PREFS = {
  studyTime: 'evening', // morning, afternoon, evening, night
  goal: 'exam', // exam, assignment, revision, skill
  goalDescription: 'Prepare thoroughly for end-semester assessments and assignments.'
};

// ============================================================================
// 2. STORAGE MANAGEMENT LAYER
// ============================================================================
const StudyFlowStorage = {
  // Theme
  getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  },
  setTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  // Subjects
  getSubjects() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading subjects:', e);
      return [];
    }
  },
  saveSubjects(subjects) {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  },

  // Schedule
  getSchedule() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading schedule:', e);
      return [];
    }
  },
  saveSchedule(schedule) {
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule));
  },

  // Daily Hours
  getDailyHours() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HOURS);
      return data ? JSON.parse(data) : { ...DEFAULT_HOURS };
    } catch (e) {
      return { ...DEFAULT_HOURS };
    }
  },
  saveDailyHours(hours) {
    localStorage.setItem(STORAGE_KEYS.HOURS, JSON.stringify(hours));
  },

  // Preferences
  getPreferences() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PREFS);
      return data ? JSON.parse(data) : { ...DEFAULT_PREFS };
    } catch (e) {
      return { ...DEFAULT_PREFS };
    }
  },
  savePreferences(prefs) {
    localStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(prefs));
  },

  // Focus History & Stats
  getFocusHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FOCUS_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },
  addFocusSession(session) {
    const history = this.getFocusHistory();
    history.push({
      id: 'focus_' + Date.now(),
      subject: session.subject || 'General Study',
      task: session.task || 'Study Session',
      durationMinutes: session.durationMinutes || 25,
      completedAt: new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEYS.FOCUS_HISTORY, JSON.stringify(history));
    this.updateStreak();
  },

  // Study Streak (consecutive days with at least 1 completed task or focus session)
  getStreak() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STREAK);
      if (!data) return { count: 0, lastDate: null };
      return JSON.parse(data);
    } catch (e) {
      return { count: 0, lastDate: null };
    }
  },
  updateStreak() {
    const today = new Date().toISOString().split('T')[0];
    const streak = this.getStreak();

    if (!streak.lastDate) {
      streak.count = 1;
      streak.lastDate = today;
    } else if (streak.lastDate === today) {
      // Already logged today
      return streak;
    } else {
      const last = new Date(streak.lastDate);
      const cur = new Date(today);
      const diffDays = Math.round((cur - last) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak.count += 1;
      } else if (diffDays > 1) {
        streak.count = 1;
      }
      streak.lastDate = today;
    }
    localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streak));
    return streak;
  },

  // Reset Everything
  resetAll() {
    Object.values(STORAGE_KEYS).forEach(key => {
      if (key !== STORAGE_KEYS.THEME) {
        localStorage.removeItem(key);
      }
    });
  },

  // Check if Demo Mode is Active
  isDemo() {
    return localStorage.getItem(STORAGE_KEYS.IS_DEMO) === 'true';
  },
  setDemo(isDemo) {
    localStorage.setItem(STORAGE_KEYS.IS_DEMO, isDemo ? 'true' : 'false');
  }
};

// ============================================================================
// 3. TRANSPARENT RULE-BASED PRIORITY CALCULATION ENGINE
// ============================================================================
/**
 * Note: This is an interpretable rule-based scheduler prototype for Design Thinking.
 * It scores subjects based on:
 * 1. Exam Urgency (Days until exam date)
 * 2. Difficulty Multiplier (Easy = 1, Medium = 2, Hard = 3)
 * 3. Workload Density (Estimated study hours relative to topic count)
 */
const PriorityEngine = {
  calculateScore(subject) {
    const now = new Date();
    const examDate = subject.examDate ? new Date(subject.examDate) : new Date(now.getTime() + 14 * 86400000);
    const diffTime = examDate.getTime() - now.getTime();
    const daysUntil = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // 1. Urgency Component (Max 40 points)
    let urgencyScore = 10;
    if (daysUntil <= 3) urgencyScore = 40;
    else if (daysUntil <= 7) urgencyScore = 32;
    else if (daysUntil <= 14) urgencyScore = 24;
    else if (daysUntil <= 30) urgencyScore = 16;
    else urgencyScore = 8;

    // 2. Difficulty Component (Max 35 points)
    let difficultyScore = 10;
    const diff = (subject.difficulty || 'medium').toLowerCase();
    if (diff === 'hard') difficultyScore = 35;
    else if (diff === 'medium') difficultyScore = 22;
    else difficultyScore = 10;

    // 3. Workload Component (Max 25 points)
    const hours = parseFloat(subject.estimatedHours) || 8;
    const topics = parseInt(subject.topicsCount) || 5;
    const workloadScore = Math.min(25, Math.round((hours * 1.2) + (topics * 1.1)));

    // Total normalized priority (0 - 100)
    const totalScore = Math.min(100, Math.round(urgencyScore + difficultyScore + workloadScore));

    let level = 'low';
    if (totalScore >= 70) level = 'high';
    else if (totalScore >= 45) level = 'medium';

    return {
      score: totalScore,
      level,
      breakdown: {
        urgency: urgencyScore,
        difficulty: difficultyScore,
        workload: workloadScore,
        daysUntil
      }
    };
  },

  /**
   * Generates a 7-day schedule (Monday to Sunday) based on subjects and available hours.
   */
  generateWeeklyPlan(subjects, dailyHours, preferences) {
    if (!subjects || subjects.length === 0) return [];

    // Calculate priority for each subject and sort by score descending
    const prioritized = subjects.map(sub => {
      const p = this.calculateScore(sub);
      return {
        ...sub,
        priorityScore: p.score,
        priorityLevel: p.level,
        priorityBreakdown: p.breakdown
      };
    }).sort((a, b) => b.priorityScore - a.priorityScore);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const preferredTime = preferences.studyTime || 'evening';

    // Base start times depending on preferred study window
    const timeSlots = {
      morning: [
        { start: '08:00 AM', end: '09:00 AM', mins: 60 },
        { start: '09:15 AM', end: '10:15 AM', mins: 60 },
        { start: '10:30 AM', end: '11:45 AM', mins: 75 },
        { start: '12:00 PM', end: '01:00 PM', mins: 60 }
      ],
      afternoon: [
        { start: '01:30 PM', end: '02:30 PM', mins: 60 },
        { start: '02:45 PM', end: '03:45 PM', mins: 60 },
        { start: '04:00 PM', end: '05:15 PM', mins: 75 },
        { start: '05:30 PM', end: '06:30 PM', mins: 60 }
      ],
      evening: [
        { start: '06:00 PM', end: '07:15 PM', mins: 75 },
        { start: '07:30 PM', end: '08:15 PM', mins: 45 },
        { start: '08:30 PM', end: '09:30 PM', mins: 60 },
        { start: '09:45 PM', end: '10:30 PM', mins: 45 }
      ],
      night: [
        { start: '09:00 PM', end: '10:00 PM', mins: 60 },
        { start: '10:15 PM', end: '11:15 PM', mins: 60 },
        { start: '11:30 PM', end: '12:30 AM', mins: 60 },
        { start: '12:45 AM', end: '01:30 AM', mins: 45 }
      ]
    };

    const slots = timeSlots[preferredTime] || timeSlots.evening;
    let subjectIndex = 0;
    const weeklySchedule = [];

    // Helper topic catalog generator for realistic session topics
    const getTopicName = (subject, sessionNum) => {
      const sName = subject.name.toLowerCase();
      if (sName.includes('dsa') || sName.includes('data structure')) {
        const dsaTopics = ['Arrays & Two Pointers', 'Linked Lists & Pointers', 'Binary Search Trees', 'Stack & Queue Implementation', 'Graph Traversal (BFS/DFS)', 'Dynamic Programming Fundamentals', 'Sorting Algorithms'];
        return dsaTopics[sessionNum % dsaTopics.length];
      } else if (sName.includes('java') || sName.includes('oop')) {
        const javaTopics = ['OOP & Inheritance Review', 'Abstract Classes & Interfaces', 'Exception Handling Practice', 'Collections Framework (Lists & Maps)', 'Multithreading & Concurrency', 'Streams & Lambda Expressions'];
        return javaTopics[sessionNum % javaTopics.length];
      } else if (sName.includes('math') || sName.includes('calculus')) {
        const mathTopics = ['Matrix Operations & Inverses', 'Eigenvalues & Vectors', 'Differentiation & Chain Rule', 'Definite Integrals', 'Probability Distributions', 'Numerical Methods'];
        return mathTopics[sessionNum % mathTopics.length];
      } else if (sName.includes('network') || sName.includes('cn')) {
        const netTopics = ['OSI & TCP/IP Model Layers', 'Subnetting & IP Addressing', 'Routing Protocols (OSPF/RIP)', 'Transport Layer & TCP Handshake', 'DNS & HTTP Protocol Analysis'];
        return netTopics[sessionNum % netTopics.length];
      } else {
        return `Chapter ${((sessionNum % (parseInt(subject.topicsCount) || 5)) + 1)}: Core Principles`;
      }
    };

    let sessionCounter = 0;

    days.forEach(day => {
      const availHours = parseFloat(dailyHours[day]) || 2;
      // Determine number of sessions today (each approx 1 hour)
      const numSessions = Math.min(slots.length, Math.max(1, Math.round(availHours)));
      const daySessions = [];

      for (let s = 0; s < numSessions; s++) {
        // Higher priority subjects get more frequent slot rotations
        // Weight: High priority subjects appear more frequently
        let chosenSubject;
        if (prioritized.length === 1) {
          chosenSubject = prioritized[0];
        } else {
          // If high priority subjects exist, pick them more often
          const roll = (subjectIndex + s) % (prioritized.length * 2);
          if (roll < prioritized.length) {
            chosenSubject = prioritized[roll % prioritized.length];
          } else {
            // Pick highest priority on repeat
            chosenSubject = prioritized[0];
          }
        }

        const slot = slots[s] || { start: `${6 + s}:00 PM`, end: `${7 + s}:00 PM`, mins: 60 };
        sessionCounter++;

        daySessions.push({
          id: `task_${day.toLowerCase()}_${s}_${Date.now().toString(36)}`,
          day,
          subjectId: chosenSubject.id,
          subjectName: chosenSubject.name,
          topicName: getTopicName(chosenSubject, sessionCounter),
          durationMins: slot.mins,
          startTime: slot.start,
          endTime: slot.end,
          priorityScore: chosenSubject.priorityScore,
          priorityLevel: chosenSubject.priorityLevel,
          status: 'pending' // 'pending' | 'in-progress' | 'completed'
        });
      }

      subjectIndex++;
      weeklySchedule.push({
        day,
        totalHours: availHours,
        sessions: daySessions
      });
    });

    return weeklySchedule;
  }
};

// ============================================================================
// 4. UI HELPERS: THEME, TOASTS, MODALS & NAVIGATION
// ============================================================================
const StudyFlowUI = {
  // Initialize Theme
  initTheme() {
    const savedTheme = StudyFlowStorage.getTheme();
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeIcons(savedTheme);

    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        StudyFlowStorage.setTheme(next);
        this.updateThemeIcons(next);
      });
    });
  },

  updateThemeIcons(theme) {
    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
    toggleBtns.forEach(btn => {
      btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('title', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  },

  // Initialize Mobile Drawer Navigation
  initMobileNav() {
    const hamburger = document.querySelector('.hamburger-btn');
    const drawer = document.querySelector('.mobile-nav-drawer');
    const backdrop = document.querySelector('.mobile-nav-backdrop');
    const closeBtn = document.querySelector('.mobile-nav-close');

    if (!hamburger || !drawer) return;

    const openDrawer = () => {
      drawer.classList.add('open');
      if (backdrop) backdrop.classList.add('show');
      document.body.style.overflow = 'hidden';
    };

    const closeDrawer = () => {
      drawer.classList.remove('open');
      if (backdrop) backdrop.classList.remove('show');
      document.body.style.overflow = '';
    };

    hamburger.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDrawer);
  },

  // Toast System
  toast(message, type = 'info', duration = 3500) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    else if (type === 'error') icon = '⚠️';
    else if (type === 'warning') icon = '🔔';

    toast.innerHTML = `
      <span style="font-size: 1.15rem;">${icon}</span>
      <div style="flex: 1;">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      setTimeout(() => toast.remove(), 250);
    }, duration);
  },

  // Confirmation Modal
  confirm({ title, message, confirmText = 'Confirm', confirmStyle = 'btn-danger' }) {
    return new Promise(resolve => {
      let overlay = document.querySelector('.modal-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
          <div class="modal-box" role="dialog" aria-modal="true">
            <div class="modal-header">
              <h3 class="modal-title" id="modal-title"></h3>
              <button class="btn-icon modal-close-btn" style="border:none; background:transparent;">✕</button>
            </div>
            <div class="modal-body" id="modal-body"></div>
            <div class="modal-footer">
              <button class="btn btn-secondary modal-cancel-btn">Cancel</button>
              <button class="btn modal-confirm-btn" id="modal-confirm-btn"></button>
            </div>
          </div>
        `;
        document.body.appendChild(overlay);
      }

      const titleEl = overlay.querySelector('#modal-title');
      const bodyEl = overlay.querySelector('#modal-body');
      const confirmBtn = overlay.querySelector('#modal-confirm-btn');
      const cancelBtn = overlay.querySelector('.modal-cancel-btn');
      const closeBtn = overlay.querySelector('.modal-close-btn');

      titleEl.textContent = title;
      bodyEl.innerHTML = message;
      confirmBtn.textContent = confirmText;
      confirmBtn.className = `btn ${confirmStyle}`;

      const close = result => {
        overlay.classList.remove('open');
        setTimeout(() => {
          resolve(result);
        }, 150);
      };

      confirmBtn.onclick = () => close(true);
      cancelBtn.onclick = () => close(false);
      closeBtn.onclick = () => close(false);
      overlay.onclick = e => {
        if (e.target === overlay) close(false);
      };

      overlay.classList.add('open');
    });
  }
};

// ============================================================================
// 5. DEMO DATA GENERATOR (College Project Rapid Demo)
// ============================================================================
const DemoDataLoader = {
  load() {
    // Current date offset for upcoming exams
    const today = new Date();
    const addDays = (d) => {
      const dt = new Date(today);
      dt.setDate(dt.getDate() + d);
      return dt.toISOString().split('T')[0];
    };

    const demoSubjects = [
      {
        id: 'sub_dsa',
        name: 'DSA (Data Structures & Algorithms)',
        difficulty: 'hard',
        examDate: addDays(6), // 6 days away -> High urgency
        topicsCount: 8,
        estimatedHours: 16,
        createdAt: new Date().toISOString()
      },
      {
        id: 'sub_java',
        name: 'Java & Object-Oriented Programming',
        difficulty: 'medium',
        examDate: addDays(12), // 12 days away -> Moderate urgency
        topicsCount: 6,
        estimatedHours: 12,
        createdAt: new Date().toISOString()
      },
      {
        id: 'sub_math',
        name: 'Engineering Mathematics',
        difficulty: 'hard',
        examDate: addDays(18), // 18 days away
        topicsCount: 7,
        estimatedHours: 14,
        createdAt: new Date().toISOString()
      },
      {
        id: 'sub_cn',
        name: 'Computer Networks',
        difficulty: 'medium',
        examDate: addDays(24), // 24 days away
        topicsCount: 5,
        estimatedHours: 10,
        createdAt: new Date().toISOString()
      }
    ];

    const demoHours = {
      Monday: 3,
      Tuesday: 3,
      Wednesday: 3,
      Thursday: 2.5,
      Friday: 3,
      Saturday: 4.5,
      Sunday: 4
    };

    const demoPrefs = {
      studyTime: 'evening',
      goal: 'exam',
      goalDescription: 'Score distinction in midterm assessments across technical subjects.'
    };

    // Generate schedule
    const schedule = PriorityEngine.generateWeeklyPlan(demoSubjects, demoHours, demoPrefs);

    // Pre-mark some realistic tasks as completed so dashboard metrics are active & informative
    let completedCount = 0;
    schedule.forEach((dayPlan, dayIdx) => {
      if (dayIdx === 0) { // Monday
        dayPlan.sessions.forEach(sess => {
          sess.status = 'completed';
          completedCount++;
        });
      } else if (dayIdx === 1 && dayPlan.sessions.length > 0) { // Tuesday
        dayPlan.sessions[0].status = 'completed';
        completedCount++;
        if (dayPlan.sessions[1]) {
          dayPlan.sessions[1].status = 'in-progress';
        }
      }
    });

    // Prepopulate focus history
    const focusHistory = [
      {
        id: 'focus_demo_1',
        subject: 'DSA (Data Structures & Algorithms)',
        task: 'Linked Lists & Pointers',
        durationMinutes: 45,
        completedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'focus_demo_2',
        subject: 'Java & Object-Oriented Programming',
        task: 'OOP & Inheritance Review',
        durationMinutes: 25,
        completedAt: new Date(Date.now() - 43200000).toISOString()
      },
      {
        id: 'focus_demo_3',
        subject: 'DSA (Data Structures & Algorithms)',
        task: 'Binary Search Trees',
        durationMinutes: 45,
        completedAt: new Date().toISOString()
      }
    ];

    // Save everything
    StudyFlowStorage.saveSubjects(demoSubjects);
    StudyFlowStorage.saveDailyHours(demoHours);
    StudyFlowStorage.savePreferences(demoPrefs);
    StudyFlowStorage.saveSchedule(schedule);
    localStorage.setItem(STORAGE_KEYS.FOCUS_HISTORY, JSON.stringify(focusHistory));
    localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify({
      count: 3,
      lastDate: new Date().toISOString().split('T')[0]
    }));
    StudyFlowStorage.setDemo(true);
  }
};

// Global Init on DOM Content Loaded (when in browser)
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    StudyFlowUI.initTheme();
    StudyFlowUI.initMobileNav();
  });
}
