const API_URL = "/api/todos";

let todos = [];
let currentFilter = "all";
let currentSearch = "";
let selectedPriority = "medium";
let currentLang = localStorage.getItem("loopdone_lang") || "en";

const I18N = {
  en: {
    flag: "🇺🇸",
    langText: "EN",
    appSubtitle: "Optimize your daily workflow",
    progressTitle: "Completion Progress",
    taskPlaceholder: "Enter new task to do...",
    priorityLabel: "Priority:",
    pHigh: "High",
    pMed: "Medium",
    pLow: "Low",
    addBtnText: "Add Task",
    tabAll: "All",
    tabActive: "Active",
    tabCompleted: "Completed",
    searchPlaceholder: "Search tasks...",
    itemsLeft: (count) => `${count} task${count === 1 ? '' : 's'} pending`,
    clearCompletedBtn: "Clear completed tasks",
    emptySearchTitle: "No matching tasks found",
    emptyCompletedTitle: "No completed tasks yet",
    emptyDefaultTitle: "No tasks yet!",
    emptyDesc: "Add a new task or change filters above.",
    toastInputEmpty: "Please enter task content!",
    toastTaskAdded: "New task added!",
    toastTaskDeleted: "Task deleted",
    toastTasksCleared: "Cleared completed tasks!",
    toastNoCompleted: "No completed tasks to clear",
    toastConnectError: "Failed to connect to Backend Server!",
    justNow: "Just now",
    minsAgo: (m) => `${m} min${m === 1 ? '' : 's'} ago`,
    hoursAgo: (h) => `${h} hour${h === 1 ? '' : 's'} ago`,
    highPriority: "High",
    medPriority: "Medium",
    lowPriority: "Low"
  },
  vi: {
    flag: "🇻🇳",
    langText: "VI",
    appSubtitle: "Tối ưu hiệu suất công việc mỗi ngày",
    progressTitle: "Tiến độ hoàn thành",
    taskPlaceholder: "Nhập công việc mới cần thực hiện...",
    priorityLabel: "Độ ưu tiên:",
    pHigh: "Cao",
    pMed: "Trung bình",
    pLow: "Thấp",
    addBtnText: "Thêm task",
    tabAll: "Tất cả",
    tabActive: "Đang làm",
    tabCompleted: "Đã xong",
    searchPlaceholder: "Tìm kiếm công việc...",
    itemsLeft: (count) => `${count} công việc đang chờ`,
    clearCompletedBtn: "Dọn dẹp công việc đã xong",
    emptySearchTitle: "Không tìm thấy công việc phù hợp",
    emptyCompletedTitle: "Chưa có công việc nào hoàn thành",
    emptyDefaultTitle: "Chưa có công việc nào!",
    emptyDesc: "Hãy thêm công việc mới hoặc thay đổi bộ lọc bên trên.",
    toastInputEmpty: "Vui lòng nhập nội dung công việc!",
    toastTaskAdded: "Đã thêm công việc mới!",
    toastTaskDeleted: "Đã xóa công việc",
    toastTasksCleared: "Đã dọn dẹp các công việc đã xong!",
    toastNoCompleted: "Không có công việc hoàn thành để dọn dẹp",
    toastConnectError: "Không kết nối được Backend Server!",
    justNow: "Vừa xong",
    minsAgo: (m) => `${m} phút trước`,
    hoursAgo: (h) => `${h} giờ trước`,
    highPriority: "Cao",
    medPriority: "Trung bình",
    lowPriority: "Thấp"
  }
};

function t(key, ...args) {
  const dict = I18N[currentLang] || I18N.en;
  const val = dict[key];
  if (typeof val === "function") return val(...args);
  return val || key;
}

function updateStaticUI() {
  document.documentElement.lang = currentLang;
  const dict = I18N[currentLang];
  
  const langFlag = document.getElementById("langFlag");
  const langText = document.getElementById("langText");
  if (langFlag) langFlag.textContent = dict.flag;
  if (langText) langText.textContent = dict.langText;

  const appSubtitle = document.getElementById("appSubtitle");
  if (appSubtitle) appSubtitle.textContent = dict.appSubtitle;

  const progressTitle = document.getElementById("progressTitle");
  if (progressTitle) progressTitle.textContent = dict.progressTitle;

  const taskInput = document.getElementById("taskInput");
  if (taskInput) taskInput.placeholder = dict.taskPlaceholder;

  const priorityLabel = document.getElementById("priorityLabel");
  if (priorityLabel) priorityLabel.textContent = dict.priorityLabel;

  const pHigh = document.getElementById("pHigh");
  const pMed = document.getElementById("pMed");
  const pLow = document.getElementById("pLow");
  if (pHigh) pHigh.textContent = dict.pHigh;
  if (pMed) pMed.textContent = dict.pMed;
  if (pLow) pLow.textContent = dict.pLow;

  const addBtnText = document.getElementById("addBtnText");
  if (addBtnText) addBtnText.textContent = dict.addBtnText;

  const tabAll = document.getElementById("tabAll");
  const tabActive = document.getElementById("tabActive");
  const tabCompleted = document.getElementById("tabCompleted");
  if (tabAll) tabAll.textContent = dict.tabAll;
  if (tabActive) tabActive.textContent = dict.tabActive;
  if (tabCompleted) tabCompleted.textContent = dict.tabCompleted;

  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.placeholder = dict.searchPlaceholder;

  const clearCompletedBtn = document.getElementById("clearCompletedBtn");
  if (clearCompletedBtn) clearCompletedBtn.textContent = dict.clearCompletedBtn;
}

function toggleLanguage() {
  currentLang = currentLang === "en" ? "vi" : "en";
  localStorage.setItem("loopdone_lang", currentLang);
  updateStaticUI();
  renderTodos();
}

function showToast(message, icon = "✨") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "toastOut 0.3s ease-in forwards";
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

function formatTime(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "";
  
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  
  if (diffSec < 60) return t("justNow");
  if (diffSec < 3600) return t("minsAgo", Math.floor(diffSec / 60));
  if (diffSec < 86400) return t("hoursAgo", Math.floor(diffSec / 3600));
  return date.toLocaleDateString(currentLang === "vi" ? "vi-VN" : "en-US", { day: "2-digit", month: "2-digit" });
}

async function fetchTodos() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("HTTP error " + res.status);
    todos = await res.json();
    renderTodos();
  } catch (err) {
    console.warn("REST API connection error", err);
    document.getElementById("modeText").textContent = "REST API (Disconnect)";
    document.getElementById("modeBadge").style.borderColor = "rgba(244, 63, 94, 0.4)";
    showToast(t("toastConnectError"), "⚠️");
  }
}

function renderTodos() {
  const list = document.getElementById("todoList");
  if (!list) return;
  list.innerHTML = "";

  const totalCount = todos.length;
  const completedCount = todos.filter(t => t.completed).length;
  const activeCount = totalCount - completedCount;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const progressStats = document.getElementById("progressStats");
  const progressBarFill = document.getElementById("progressBarFill");
  const itemsLeftCount = document.getElementById("itemsLeftCount");

  if (progressStats) progressStats.textContent = `${completedCount}/${totalCount} (${percent}%)`;
  if (progressBarFill) progressBarFill.style.width = `${percent}%`;
  if (itemsLeftCount) itemsLeftCount.textContent = t("itemsLeft", activeCount);

  const filtered = todos.filter(todo => {
    const matchesFilter = 
      currentFilter === "all" ? true :
      currentFilter === "active" ? !todo.completed :
      currentFilter === "completed" ? todo.completed : true;

    const matchesSearch = todo.text.toLowerCase().includes(currentSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (filtered.length === 0) {
    const emptyTitle = currentSearch 
      ? t("emptySearchTitle") 
      : currentFilter === "completed" 
      ? t("emptyCompletedTitle") 
      : t("emptyDefaultTitle");
      
    list.innerHTML = `
      <div class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
        </svg>
        <div class="empty-title">${emptyTitle}</div>
        <div class="empty-desc">${t("emptyDesc")}</div>
      </div>
    `;
    return;
  }

  filtered.forEach(todo => {
    const priorityKey = todo.priority === "high" ? "highPriority" : todo.priority === "low" ? "lowPriority" : "medPriority";
    const pLabel = t(priorityKey);
    const pClass = todo.priority || "medium";

    const li = document.createElement("li");
    li.className = `todo-item ${todo.completed ? "completed" : ""}`;
    
    li.innerHTML = `
      <div class="todo-left">
        <div class="checkbox-custom" onclick="toggleTodo(${todo.id})" title="Toggle status">
          <svg viewBox="0 0 24 24" fill="none">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <div class="todo-content">
          <span class="todo-text">${escapeHtml(todo.text)}</span>
          <div class="todo-meta">
            <span class="badge-priority ${pClass}">${pLabel}</span>
            ${todo.createdAt ? `<span class="todo-time">• ${formatTime(todo.createdAt)}</span>` : ""}
          </div>
        </div>
      </div>
      <div class="todo-actions">
        <button class="action-btn delete" onclick="deleteTodo(${todo.id})" title="Delete task">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    `;
    list.appendChild(li);
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

async function addTodo() {
  const input = document.getElementById("taskInput");
  const text = input.value.trim();
  if (text === "") {
    showToast(t("toastInputEmpty"), "⚠️");
    input.focus();
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, priority: selectedPriority })
    });
    if (!res.ok) throw new Error("Failed to add");
    
    input.value = "";
    showToast(t("toastTaskAdded"), "🎉");
    await fetchTodos();
  } catch (err) {
    showToast("Error adding task", "❌");
  }
}

async function toggleTodo(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "PATCH" });
    if (!res.ok) throw new Error("Failed to toggle");
    await fetchTodos();
  } catch (err) {
    showToast("Error updating task", "❌");
  }
}

async function deleteTodo(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete");
    showToast(t("toastTaskDeleted"), "🗑️");
    await fetchTodos();
  } catch (err) {
    showToast("Error deleting task", "❌");
  }
}

async function clearCompleted() {
  const hasCompleted = todos.some(t => t.completed);
  if (!hasCompleted) {
    showToast(t("toastNoCompleted"), "ℹ️");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/completed`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to clear");
    showToast(t("toastTasksCleared"), "✨");
    await fetchTodos();
  } catch (err) {
    showToast("Error clearing tasks", "❌");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateStaticUI();

  const langBtn = document.getElementById("langToggleBtn");
  if (langBtn) langBtn.addEventListener("click", toggleLanguage);

  const addBtn = document.getElementById("addBtn");
  const taskInput = document.getElementById("taskInput");

  if (addBtn) addBtn.addEventListener("click", addTodo);
  if (taskInput) {
    taskInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") addTodo();
    });
  }

  const priorityBtns = document.querySelectorAll(".priority-btn");
  priorityBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      priorityBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedPriority = btn.dataset.priority;
    });
  });

  const tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      renderTodos();
    });
  });

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearch = e.target.value;
      renderTodos();
    });
  }

  const clearBtn = document.getElementById("clearCompletedBtn");
  if (clearBtn) clearBtn.addEventListener("click", clearCompleted);

  fetchTodos();
});
