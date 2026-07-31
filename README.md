# 🔁 Loopdone — Modern Task Management Web App

**Loopdone** is a sleek, modern, and professional full-stack Todo List web application where every task seamlessly moves through a productivity loop: **Add → Process → Done**. 

Built with modern UI/UX design principles, Loopdone features a glassmorphic dark theme, smooth micro-interactions, real-time task progress tracking, priority management, and dual-mode data persistence (Offline `localStorage` mode or Full-stack Node.js/Express REST API mode).

---

## ✨ Key Features

- 🎨 **Modern Glassmorphic UI**: Premium visual aesthetics featuring a dark glassmorphism layout, ambient glow effects, responsive design, and modern typography using Google Fonts (`Plus Jakarta Sans`).
- 📊 **Real-time Progress Tracker**: Interactive progress bar dynamically displaying completed task percentages.
- 🏷️ **Priority Management**: Categorize tasks by priority levels (**High**, **Medium**, **Low**) with distinct, color-coded badges.
- 🔍 **Smart Filters & Search**:
  - Filter tasks by status: **All**, **Active**, and **Completed**.
  - Real-time instant search input to filter tasks by title.
- ⏱️ **Relative Timestamping**: Displays readable relative creation times (*"Just now"*, *"5 mins ago"*, *"2 hours ago"*).
- 🧹 **One-Click Cleanup**: Quick action to purge all completed tasks at once.
- 🔔 **Toast Notification System**: Instant feedback popups for user interactions (adding, completing, deleting tasks).
- 💾 **Dual Data Storage Modes**:
  - **Offline Mode**: Stores tasks directly in the browser's `localStorage`.
  - **Full-stack REST API Mode**: Communicates with a Node.js / Express RESTful backend.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5 (Semantic), Vanilla CSS3 (Custom Properties, Flexbox, Animations, Glassmorphism), JavaScript ES6+ |
| **Backend** | Node.js, Express.js (RESTful API) |
| **Storage** | `localStorage` (Offline mode) / In-memory Server Storage (REST API mode) |
| **UI Assets & Styling** | Google Fonts (`Plus Jakarta Sans`), Animated SVG Checkboxes, Iconography |

---

## 📁 Project Structure

```text
Loopdone/
├── index.html        # Main HTML5 application structure
├── style.css         # CSS Design System & Glassmorphic styling
├── app.js            # Frontend logic for Offline mode (localStorage)
├── app-api.js        # Frontend logic for Full-stack mode (REST API & Fetch)
├── server.js         # Backend Express.js Server (REST API endpoints)
├── package.json      # Dependencies and script definitions
└── README.md         # Project documentation (English)
```

---

## 🚀 Getting Started

### 1. Offline Mode (No Backend Required)

1. Open `index.html` and verify the script tag at the bottom is set to:
   ```html
   <script src="app.js"></script>
   ```
2. Simply open `index.html` in any web browser (Chrome, Edge, Firefox, Safari). Data will automatically persist in `localStorage`.

---

### 2. Full-stack Mode (Node.js & Express REST API)

1. Open `index.html` and set the script tag at the bottom to:
   ```html
   <script src="app-api.js"></script>
   ```
2. Install project dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   npm start
   ```
4. Access the application in your browser at: `http://localhost:3000`

---

## 📡 REST API Reference

| Method | Endpoint | Description | Sample Payload (JSON) |
|---|---|---|---|
| `GET` | `/api/todos` | Retrieve all tasks | N/A |
| `POST` | `/api/todos` | Add a new task | `{"text": "Master Express.js", "priority": "high"}` |
| `PATCH` | `/api/todos/:id` | Toggle task completion status | N/A |
| `DELETE` | `/api/todos/:id` | Delete a specific task by ID | N/A |
| `DELETE` | `/api/todos/completed` | Clear all completed tasks | N/A |

### Example cURL Commands

**Add a new high-priority task:**
```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"text": "Redesign Loopdone UI", "priority": "high"}'
```

**Toggle completion status of task #1:**
```bash
curl -X PATCH http://localhost:3000/api/todos/1
```

**Purge all completed tasks:**
```bash
curl -X DELETE http://localhost:3000/api/todos/completed
```

---

## 📄 License

This project was built for learning and skills-training purposes — feel free to use, modify, and distribute it!