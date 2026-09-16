# Prototype & Validation Report — StudyFlow

**Project Name:** StudyFlow  
**Academic Context:** Project Better Tomorrow — College Design Thinking Initiative  
**Prototype Stage:** Functional Low-to-Mid Fidelity Web Prototype  
**Validation Status:** External Validation Pending

---

## 1. Project Overview

StudyFlow is a student-focused study planning and focus management web application developed as part of Project Better Tomorrow.

The prototype addresses a common academic friction: students often have multiple subjects, assessments, deadlines, and limited study time, but may struggle to decide what to study first, how much time to allocate, and how to monitor their progress.

StudyFlow follows a simple workflow:

**PLAN → PRIORITIZE → FOCUS → TRACK → IMPROVE**

The prototype is designed to help students convert their academic workload into an organized and actionable study plan.

---

## 2. Problem Statement

Students often struggle to manage multiple subjects, assessments, assignments, deadlines, and limited study time.

Although students may know what they need to study, they can find it difficult to:

- Decide which subject or topic should receive priority.
- Allocate realistic study time.
- Organize revision across multiple days.
- Maintain focused study sessions.
- Track completed work and overall progress.

StudyFlow was designed to address these everyday planning and prioritization difficulties through a simple browser-based application.

---

## 3. Design Thinking Connection

The project follows the Design Thinking approach used in Project Better Tomorrow.

### Empathize

Common academic difficulties faced by college students were examined, particularly problems involving workload management, competing deadlines, limited study time, and difficulty deciding what to study first.

AI-assisted brainstorming was used to organize and articulate potential pain points. The final problem focus was selected based on the student's academic context and project requirements.

No fabricated interviews, surveys, or user research were used.

### Define

The problem was refined into the following focus:

> Students need a simple way to organize their academic workload, determine study priorities, allocate available time, and track progress without creating additional complexity.

### Ideate

Multiple solution concepts were explored, including study planners, habit trackers, flashcard systems, collaborative study tools, and automated scheduling systems.

The selected concept combined planning, transparent prioritization, focused study sessions, and progress tracking in one lightweight web application.

### Prototype

A functional web prototype was developed using HTML, CSS, and JavaScript.

### Test

Developer testing has been completed. External validation with student testers is planned and currently pending.

---

## 4. Proposed Solution

StudyFlow provides a centralized study-planning workflow.

A student can:

1. Add subjects and academic workload information.
2. Enter difficulty, examination dates, topics, and estimated study hours.
3. Specify available study time and preferred study windows.
4. Generate a structured weekly schedule.
5. View priority levels for subjects.
6. Complete scheduled tasks.
7. Use Focus Mode for dedicated study sessions.
8. Monitor progress through the dashboard.
9. Adjust the plan as academic requirements change.

---

## 5. Prototype Features

### 5.1 Study Planner

The Planner allows students to create and manage subjects by entering:

- Subject name
- Difficulty level
- Examination date
- Number of topics
- Estimated study hours
- Available daily study hours
- Preferred study window

Subjects can be added, edited, and deleted.

---

### 5.2 Rule-Based Priority System

StudyFlow uses a transparent rule-based prioritization system.

The priority score considers:

- Examination urgency
- Subject difficulty
- Workload density

The score is converted into High, Medium, or Low priority.

The prototype does not use machine learning or an AI model internally.

This makes the prioritization process explainable to the student.

---

### 5.3 Weekly Schedule Generator

The scheduling system converts the student's available study time and subject information into structured study sessions.

The generated schedule distributes study tasks across the available days and identifies higher-priority subjects.

---

### 5.4 Dashboard

The Dashboard provides an overview of study activity, including:

- Today's scheduled tasks
- Completed tasks
- Total study time
- Study streak
- Overall progress
- Subject-wise progress
- Weekly activity

---

### 5.5 Focus Mode

Focus Mode provides a distraction-free study timer.

Available focus durations include:

- 25 minutes
- 45 minutes
- 60 minutes

Break durations include:

- 5 minutes
- 15 minutes

The timer supports:

- Start
- Pause
- Reset
- Early finish
- Session logging
- Completion notification

---

### 5.6 Local Data Persistence

StudyFlow uses browser `localStorage` to retain:

- Subjects
- Generated schedules
- Completed tasks
- Focus sessions
- Theme preferences

No backend database is required.

---

### 5.7 Dark and Light Mode

Users can switch between light and dark themes.

The selected theme is preserved using browser storage.

---

### 5.8 Demo Mode

Demo Mode allows the application to be populated with sample academic data for quick demonstration.

This is particularly useful when presenting the prototype without manually entering multiple subjects.

---

## 6. Technology Used

| Technology | Purpose |
|---|---|
| HTML5 | Page structure and semantic elements |
| CSS3 | Layout, responsive design, themes, and visual styling |
| Vanilla JavaScript | Application logic and interactivity |
| LocalStorage | Client-side data persistence |
| SVG | Dashboard progress and visual elements |
| Web Audio API | Offline timer completion notification |
| GitHub | Version control and project repository |
| GitHub Pages | Prototype deployment |

The application does not require a backend server or external API.

---

## 7. Prototype User Flow

The intended user flow is:

**Add Subjects → Enter Workload → Set Available Time → Generate Schedule → View Priorities → Start Focus Session → Complete Tasks → Track Progress**

This workflow connects the major StudyFlow features into a single continuous experience.

---

## 8. Developer Testing

The student developer manually tested the major functionality of the prototype.

### Functional Testing

The following areas were checked:

- Global navigation
- Subject creation
- Subject editing
- Subject deletion
- Form validation
- Priority calculation
- Schedule generation
- Task completion
- Dashboard calculations
- Focus timer
- Timer controls
- Focus session logging
- LocalStorage persistence
- Dark/light mode
- Demo Mode
- Data reset
- Responsive layouts

### Responsive Testing

The interface was checked at desktop and mobile viewport sizes to verify:

- Layout adaptation
- Navigation behavior
- Card stacking
- Button accessibility
- Text readability
- Mobile navigation drawer

### Testing Result

The major application flows were successfully verified during developer testing.

---

## 9. External User Validation

### Current Status: PENDING

The Project Better Tomorrow validation stage requires feedback from real users.

External testing with at least three student testers has not yet been completed.

The live prototype has been prepared for genuine peer evaluation.

The planned validation process is:

1. Provide the live StudyFlow prototype to a student tester.
2. Ask the tester to perform several basic tasks.
3. Observe difficulties or confusion during usage.
4. Ask for feedback about usefulness, clarity, and ease of use.
5. Record the feedback without modifying or fabricating responses.
6. Repeat the process with at least three testers.
7. Identify recurring issues and possible improvements.
8. Implement relevant improvements.
9. Document the resulting changes and validation findings.

No fictional tester identities, ratings, quotations, or satisfaction scores are included in this report.

---

## 10. Planned Validation Tasks

Testers will be asked to perform tasks such as:

### Task 1 — Create a Subject

Add a subject with:

- Subject name
- Difficulty
- Exam date
- Number of topics
- Estimated study hours

### Task 2 — Generate a Schedule

Enter available study time and generate the weekly schedule.

### Task 3 — Understand Priorities

Identify which subject has the highest priority and explain whether the reason for that priority is understandable.

### Task 4 — Complete a Study Task

Mark a scheduled task as completed and observe the dashboard progress.

### Task 5 — Use Focus Mode

Start a focus session and explore the timer controls.

### Task 6 — Explore the Dashboard

Check whether the tester can understand their study progress without additional explanation.

---

## 11. Planned Feedback Questions

After completing the tasks, testers will be asked questions such as:

1. Was the purpose of StudyFlow clear when you first opened it?
2. Was adding a subject easy?
3. Was the generated schedule understandable?
4. Was the priority level easy to understand?
5. Did the application help you decide what to study first?
6. Was Focus Mode easy to use?
7. Was the dashboard information easy to understand?
8. Did any feature feel confusing or unnecessary?
9. What would you improve?
10. Would you consider using a tool like this during exam preparation? Why or why not?

The responses will be recorded as actual tester feedback rather than generated or assumed results.

---

## 12. Validation Results

**External validation status: Pending**

This section will be updated after genuine testing with at least three student testers.

The completed version will document:

- Tester count
- Tasks completed
- Observed usability issues
- Positive feedback
- Suggestions
- Common patterns
- Changes made as a result of feedback

No results are being reported before the testing has taken place.

---

## 13. Prototype Limitations

The current prototype has several limitations:

- Data is stored only in the user's browser.
- There is no user account or cloud synchronization.
- The schedule is generated using predefined rules rather than adaptive machine learning.
- External user validation is still pending.
- The current prototype does not integrate with college calendars or learning management systems.
- Notifications are limited compared with a full mobile or cloud application.

These limitations are appropriate for the current prototype scope but provide opportunities for future development.

---

## 14. Future Scope

Potential future improvements include:

- Cloud synchronization
- Optional user accounts
- Calendar integration
- Mobile application support
- Smarter adaptive scheduling
- Reminder notifications
- Advanced progress analytics
- Integration with academic platforms
- Accessibility improvements based on user testing
- Personalized scheduling based on historical study behavior

Any future AI-based functionality would need to be clearly identified and evaluated separately from the current rule-based prototype.

---

## 15. Prototype Links

### GitHub Repository

https://github.com/shaniya200827-code/studyflow-project-better-tomorrow

### Live Prototype

https://shaniya200827-code.github.io/studyflow-project-better-tomorrow/

---

## 16. AI Assistance

AI was used throughout the project as a brainstorming, planning, coding, debugging, documentation, and deployment assistant.

The AI Interaction Audit provides the detailed record of these interactions.

The final application uses a transparent rule-based scheduling and prioritization system and does not claim to contain an internal AI model.

**Detailed AI documentation:** `AI_Interaction_Audit.md`

---

## 17. Academic Integrity Statement

This report distinguishes between:

- Developer testing that has actually been completed.
- External validation that is still pending.
- AI-assisted development.
- Human decision-making and project ownership.

No fictional user research, fabricated tester feedback, invented statistics, or unsupported validation claims have been included.

The prototype, documentation, and validation process are intended to represent the actual development status of StudyFlow at the time of submission.

---

## 18. Current Project Status

| Component | Status |
|---|---|
| Problem definition | Completed |
| Ideation | Completed |
| Solution definition | Completed |
| Functional prototype | Completed |
| Developer testing | Completed |
| GitHub repository | Completed |
| GitHub Pages deployment | Completed |
| AI Interaction Audit | Completed |
| External validation | Pending |
| Validation-based refinement | Pending |
| Final presentation | Pending |

---

## 19. Conclusion

StudyFlow is a functional Design Thinking prototype designed to address the everyday difficulty of organizing academic workload and study time.

The current prototype demonstrates the complete workflow from planning and prioritization to focused study and progress tracking.

Developer testing has been completed, while external validation remains the next important stage. The prototype has therefore been prepared for genuine student testing so that future improvements can be based on real user feedback rather than assumptions.

The project maintains a clear distinction between AI-assisted development and AI functionality within the product, while keeping human decision-making and academic integrity central to the development process.
