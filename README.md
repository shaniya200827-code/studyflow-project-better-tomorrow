# StudyFlow ⚡

> **Plan → Prioritize → Focus → Track → Improve**  
> *A personalized study planning and focus-management web application.*  
> **Academic Project:** College Design Thinking Initiative — *Project Better Tomorrow*  
> **Prototype Stage:** Functional Usability Prototype (Pre-Deployment Peer Testing)

---

## 1. Project Overview

**StudyFlow** is a client-side productivity and study planning web application developed as part of **Project Better Tomorrow**, a college Design Thinking initiative. The application empowers students to transform scattered syllabi, competing assignments, and chaotic exam dates into a clear, structured, and manageable daily study schedule.

Rather than acting as a static todo-list or a passive calendar, StudyFlow operates as an **active study companion** that transparently calculates academic priorities, structures realistic daily study blocks, provides an integrated Pomodoro focus workspace, and continuously monitors completion metrics.

---

## 2. Problem Statement

Through student interviews and empathy mapping during the initial phase of Project Better Tomorrow, the core academic friction point was identified:

> *"Students often struggle to manage multiple subjects, assessments, assignments, deadlines, and limited study time. They may know what they need to study, but they struggle to decide what to study first, how much time to allocate to each subject, and how to track their progress."*

Key pain points:
1. **Decision Paralysis:** Staring at multiple syllabi and procrastinating because of uncertainty over where to begin.
2. **Urgency Misjudgment:** Over-focusing on easier subjects while neglecting difficult courses with approaching exams.
3. **Fragmented Tracking:** Lacking visibility into actual cumulative hours studied, leading to anxiety and cramming.

---

## 3. Proposed Solution

StudyFlow implements a 5-stage human-centered study framework:

$$\text{PLAN} \longrightarrow \text{PRIORITIZE} \longrightarrow \text{FOCUS} \longrightarrow \text{TRACK} \longrightarrow \text{IMPROVE}$$

1. **Plan:** Enter subjects, upcoming assessment dates, difficulty ratings, and realistic daily available hours.
2. **Prioritize:** A transparent, rule-based scheduler evaluates exam urgency, course difficulty, and workload to allocate prime study blocks.
3. **Focus:** Built-in distraction-free Pomodoro timer with 25m, 45m, and 60m deep work presets and Web Audio API synthesized completion alerts.
4. **Track:** Dynamic real-time dashboard displaying overall progress rings, subject completion percentages, daily agendas, and study streaks.
5. **Improve:** Flexible schedule editing and daily adjustments to prevent student burnout.

---

## 4. Key Features

- 📅 **Multi-Step Study Planner:**
  - Fast subject management (Add, Edit, Delete, and live priority preview).
  - Per-day available hours configuration (Monday through Sunday).
  - Preferred study window selection (Morning, Afternoon, Evening, Night).
  - Customizable academic goals (Exam prep, Assignments, General revision, Skill building).
- 🧠 **Transparent Rule-Based Priority Scheduler:**
  - 100% interpretable mathematical scoring based on exam urgency ($Days \le 3$, $Days \le 7$, etc.), difficulty weighting (Easy = 1, Medium = 2, Hard = 3), and topic density.
  - Automatically alternates subjects to prevent mental fatigue while maintaining high-priority focus.
- 🎯 **Distraction-Free Focus Mode:**
  - Dedicated countdown timer with switchable deep work and break intervals (25m, 45m, 60m, 5m, 15m).
  - One-click launch from any scheduled task in Planner or Dashboard.
  - Offline harmonic chime synthesized in pure JavaScript using the Web Audio API.
  - Session auto-logging directly to user study metrics.
- 📊 **Dynamic Analytics Dashboard:**
  - Time-aware dynamic student greeting and current date indicator.
  - 4 Key metric cards: Today's tasks, Completed count, Total study time, and Consecutive day streak.
  - Animated SVG circular progress ring for overall weekly completion.
  - Subject-by-subject dynamic progress bars based on actual user data.
  - Weekly activity completion bar chart (Monday through Sunday).
- 🌓 **Design System & Accessibility:**
  - Calm, student-friendly color palette (indigo/purple/cyan accents on neutral slate surfaces).
  - Working Dark and Light theme toggle persisted in `localStorage`.
  - Fully responsive mobile drawer navigation and fluid cards across desktop, tablet, and mobile.
- ⚡ **Rapid Demo Mode & Data Reset:**
  - One-click "Load Demo Data" button preloading realistic technical courses (`DSA`, `Java`, `Mathematics`, `Computer Networks`) with an active schedule.
  - Double-confirmation modal to reset all study data anytime.

---

## 5. Technologies Used

StudyFlow deliberately adopts a **minimal, ultra-maintainable, and dependency-free frontend stack**:

- **HTML5:** Semantic document structure (`<main>`, `<section>`, `<nav>`, `<aside>`, `<header>`, `<footer>`, ARIA attributes).
- **CSS3:** Modern CSS Custom Properties (Light/Dark theming), Flexbox, CSS Grid, smooth cubic-bezier transitions, and media queries.
- **Vanilla JavaScript (ES6+):** Pure client-side logic with zero runtime frameworks (no React, Angular, or Vue needed).
- **HTML5 LocalStorage API:** Fully client-side state persistence for subjects, schedules, preferences, focus logs, and streaks.
- **Web Audio API:** Oscillator-synthesized pleasant audio chimes without external MP3 dependencies.

---

## 6. How It Works: Rule-Based Scheduling Algorithm

StudyFlow explicitly presents itself as an **interpretable rule-based intelligent scheduling prototype**, rather than an opaque black-box machine learning system.

### Priority Formulation

For each subject $S$, the priority score $P(S) \in [0, 100]$ is calculated as:

$$P(S) = \min(100, U(S) + D(S) + W(S))$$

Where:
1. **Urgency Score $U(S) \in [8, 40]$:**
   - $Days \le 3 \implies 40\text{ pts}$
   - $Days \le 7 \implies 32\text{ pts}$
   - $Days \le 14 \implies 24\text{ pts}$
   - $Days \le 30 \implies 16\text{ pts}$
   - $Days > 30 \implies 8\text{ pts}$
2. **Difficulty Score $D(S) \in [10, 35]$:**
   - $\text{Hard} \implies 35\text{ pts}$
   - $\text{Medium} \implies 22\text{ pts}$
   - $\text{Easy} \implies 10\text{ pts}$
3. **Workload Score $W(S) \in [0, 25]$:**
   - $W(S) = \min(25, \text{round}(1.2 \times \text{Hours} + 1.1 \times \text{Topics}))$

### Priority Classification
- **High Priority ($P \ge 70$):** Highlighted with red badge; receives prime time slots and repeated allocation.
- **Medium Priority ($45 \le P < 70$):** Highlighted with yellow badge; balanced mid-week allocation.
- **Low Priority ($P < 45$):** Highlighted with green badge; assigned to supplementary review sessions.

---

## 7. Project Structure

```
studyflow/
├── index.html            # Landing / Home page with Problem, Solution, Features & DT Context
├── planner.html          # Interactive Multi-Step Planner & Timetable Manager
├── dashboard.html        # Analytics Dashboard with Progress Rings, Bars, & Agenda
├── focus.html            # Distraction-Free Pomodoro Focus Timer
│
├── css/
│   ├── style.css         # Complete design system: CSS variables, components, & dark mode
│   └── responsive.css    # Responsive breakpoints (Mobile, Tablet, Desktop)
│
├── js/
│   ├── app.js            # Core storage, priority algorithm, theme, toasts, & demo loader
│   ├── planner.js        # Planner logic: Subject CRUD & schedule generation
│   ├── dashboard.js      # Dashboard metrics: streak, progress ring, & charts
│   └── focus.js          # Distraction-free Pomodoro countdown & Web Audio chime
│
└── README.md             # Complete academic documentation & testing guide
```

---

## 8. Local Setup Instructions

StudyFlow requires **zero installation**, no `npm install`, and no local build steps.

### Option A: Open Directly in Browser
1. Clone or download this project repository to your computer.
2. Double-click `index.html` (or right-click → *Open with Google Chrome / Mozilla Firefox / Microsoft Edge / Safari*).
3. The application runs immediately!

### Option B: Run via a Simple Local HTTP Server (Optional)
If you prefer running through a local web server:

**Using Python:**
```bash
# Python 3
python -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

**Using Node.js / npx:**
```bash
npx serve .
```

### Option C: Instant Deployment
StudyFlow is 100% static and can be deployed in seconds to:
- **GitHub Pages:** Push to `main` and enable Pages in repository settings.
- **Vercel / Netlify:** Drag-and-drop the project folder or link your repository.

---

## 9. Design Thinking Connection

This project was built following Stanford d.school's Design Thinking methodology:

| Phase | Activity in Project Better Tomorrow |
|---|---|
| **1. Empathize** | Observed fellow students juggling 5+ courses, lab submissions, and semester tests. Discovered widespread anxiety stemming from lack of a structured daily plan. |
| **2. Define** | Formulated the actionable problem statement: *How might we help students decide what to study first, how much time to dedicate, and verify their daily progress?* |
| **3. Ideate** | Brainstormed dynamic schedule generation based on multi-factor scoring (urgency + difficulty + workload) rather than static calendars. |
| **4. Prototype** | Built StudyFlow as a responsive client-side web prototype with interactive schedule generation and Pomodoro focus tracking. |
| **5. Test** | Structured usability testing with 3 real student testers to validate ease of use, schedule clarity, and focus utility (see Section 13 below). |

---

## 10. AI-Assisted Development

In alignment with modern academic prototyping practices, AI assistance was utilized to:
- Rapidly scaffold semantic HTML structures and accessible ARIA attributes.
- Formulate the initial mathematical weighting for the priority scoring equation.
- Synthesize offline Web Audio API harmonic frequencies to avoid external media dependencies.
- Ensure strict compliance with mobile-first CSS architecture and clean code separation.

*All algorithm logic, storage persistence, and interface flows were engineered specifically to fulfill the college Design Thinking criteria.*

---

## 11. Limitations

As a functional prototype, StudyFlow acknowledges the following trade-offs:
1. **Local Storage Scoping:** Data is stored locally in the specific browser used. Clearing browser cookies or cache resets the stored data (though a manual reset button is also provided).
2. **Single Device:** Without a cloud database, study sessions completed on a mobile phone do not automatically sync to a laptop browser.
3. **Calendar Export:** Direct `.ics` export or Google Calendar two-way synchronization is not implemented in this prototype stage.
4. **Notification Permission:** Timer chimes require user interaction on the page to unlock browser audio autoplay policies.

---

## 12. Future Scope

Subsequent iterations planned after user testing:
1. **Cloud Sync & Multi-Device Login:** Lightweight optional authentication (e.g. Supabase or Firebase) to access schedules anywhere.
2. **Calendar Export (.ics):** Exporting generated study slots directly to Google Calendar, Apple Calendar, or Outlook.
3. **Spaced Repetition Scheduling:** Incorporating Ebbinghaus forgetting curve intervals to re-schedule difficult topics automatically.
4. **Study Group Collaboration:** Ability for peers in the same course to share a common revision timetable.

---

## 13. Validation & Usability Testing

> [!NOTE]  
> StudyFlow is an active prototype built for real usability evaluation. In compliance with academic integrity guidelines, **no fake user research or fabricated test metrics are included**.  
> The section below is designated for recording real tester feedback during peer evaluations.

### Usability Evaluation Protocol
Each participant is asked to complete the following 6 core tasks:
1. Add a subject with upcoming exam date, difficulty, and estimated hours.
2. Set their available daily study hours and preferred study window.
3. Click `Generate My Study Flow` and examine the prioritized schedule.
4. Launch a task in `Focus Mode` and run a 5-minute study test.
5. Mark the task as completed and observe dashboard metric updates.
6. Test Dark/Light mode toggle and mobile responsive drawer.

### Tester Feedback Log

#### Tester 1:
- **Participant Profile:** Engineering Student (4th Semester)
- **Task Completion Rate:** [ Pending testing session ]
- **Observed Friction Points:** [ To be recorded during live test ]
- **Qualitative Feedback:** [ To be recorded during live test ]
- **Suggested Improvement:** [ To be recorded during live test ]

#### Tester 2:
- **Participant Profile:** Computer Science Undergraduate
- **Task Completion Rate:** [ Pending testing session ]
- **Observed Friction Points:** [ To be recorded during live test ]
- **Qualitative Feedback:** [ To be recorded during live test ]
- **Suggested Improvement:** [ To be recorded during live test ]

#### Tester 3:
- **Participant Profile:** Management / Information Systems Student
- **Task Completion Rate:** [ Pending testing session ]
- **Observed Friction Points:** [ To be recorded during live test ]
- **Qualitative Feedback:** [ To be recorded during live test ]
- **Suggested Improvement:** [ To be recorded during live test ]

---

## 14. Quality Checklist

- [x] All navigation links work seamlessly across every page.
- [x] Subjects can be added, edited, and deleted with instant UI updates.
- [x] Transparent rule-based priority calculation works accurately.
- [x] Study plan generation respects daily hours and study window preferences.
- [x] Tasks can be marked pending, in-progress, or completed.
- [x] Dashboard updates dynamically from actual `localStorage` data.
- [x] Distraction-free Pomodoro focus timer with Web Audio API chime.
- [x] Dark and light mode toggle with smooth transitions.
- [x] Demo mode loads realistic test data (DSA, Java, Mathematics, Computer Networks).
- [x] Reset All Study Data with custom confirmation modal.
- [x] Fully responsive across mobile, tablet, and desktop viewports.
- [x] Zero console errors, zero broken buttons, zero external API dependencies.
- [x] Zero "Lorem ipsum" or fabricated testimonials.

---
*Created for Project Better Tomorrow • College Design Thinking Assignment • 2026*
