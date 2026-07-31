const API_URL = "/api/todos";

// State
let todos = [];
let currentFilter = "all";
let currentSearch = "";
let selectedPriority = "medium";

// Priority Labels & Colors Mapping
const PRIORITY_MAP = {
  high: { label: "Cao", class: "high" },
  medium: { label: "Trung bình", class: "medium" },
  low: { label: "Thấp", class: "low" }
};

// --- Toast Notification ---
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

// --- Format Relative Time ---
function formatTime(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "";
  
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  
  if (diffSec < 60) return "Vừa xong";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

// --- Fetch & Render ---
async function fetchTodos() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("HTTP error " + res.status);
    todos = await res.json();
    renderTodos();
  } catch (err) {
    console.warn("Không kết nối được REST API server. Kiểm tra lại server.js.", err);
    document.getElementById("modeText").textContent = "REST API (Disconnect)";
    document.getElementById("modeBadge").style.borderColor = "rgba(244, 63, 94, 0.4)";
    showToast("Không kết nối được Backend Server!", "⚠️");
  }
}

function renderTodos() {
  const list = document.getElementById("todoList");
  if (!list) return;
  list.innerHTML = "";

  // 1. Calculate & Update Overall Statistics
  const totalCount = todos.length;
  const completedCount = todos.filter(t => t.completed).length;
  const activeCount = totalCount - completedCount;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const progressStats = document.getElementById("progressStats");
  const progressBarFill = document.getElementById("progressBarFill");
  const itemsLeftCount = document.getElementById("itemsLeftCount");

  if (progressStats) progressStats.textContent = `${completedCount}/${totalCount} (${percent}%)`;
  if (progressBarFill) progressBarFill.style.width = `${percent}%`;
  if (itemsLeftCount) itemsLeftCount.textContent = `${activeCount} công việc đang chờ`;

  // 2. Filter & Search List
  const filtered = todos.filter(todo => {
    const matchesFilter = 
      currentFilter === "all" ? true :
      currentFilter === "active" ? !todo.completed :
      currentFilter === "completed" ? todo.completed : true;

    const matchesSearch = todo.text.toLowerCase().includes(currentSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // 3. Render Empty State if no items
  if (filtered.length === 0) {
    const emptyTitle = currentSearch 
      ? "Không tìm thấy công việc phù hợp" 
      : currentFilter === "completed" 
      ? "Chưa có công việc nào hoàn thành" 
      : "Chưa có công việc nào!";
      
    list.innerHTML = `
      <div class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
        </svg>
        <div class="empty-title">${emptyTitle}</div>
        <div class="empty-desc">Hãy thêm công việc mới hoặc thay đổi bộ lọc bên trên.</div>
      </div>
    `;
    return;
  }

  // 4. Render Todo Items
  filtered.forEach(todo => {
    const pInfo = PRIORITY_MAP[todo.priority] || PRIORITY_MAP["medium"];
    const li = document.createElement("li");
    li.className = `todo-item ${todo.completed ? "completed" : ""}`;
    
    li.innerHTML = `
      <div class="todo-left">
        <div class="checkbox-custom" onclick="toggleTodo(${todo.id})" title="Đánh dấu hoàn thành">
          <svg viewBox="0 0 24 24" fill="none">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <div class="todo-content">
          <span class="todo-text">${escapeHtml(todo.text)}</span>
          <div class="todo-meta">
            <span class="badge-priority ${pInfo.class}">${pInfo.label}</span>
            ${todo.createdAt ? `<span class="todo-time">• ${formatTime(todo.createdAt)}</span>` : ""}
          </div>
        </div>
      </div>
      <div class="todo-actions">
        <button class="action-btn delete" onclick="deleteTodo(${todo.id})" title="Xóa công việc">
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

// Utility HTML escape
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// --- API Action Functions ---
async function addTodo() {
  const input = document.getElementById("taskInput");
  const text = input.value.trim();
  if (text === "") {
    showToast("Vui lòng nhập nội dung công việc!", "⚠️");
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
    showToast("Đã thêm công việc mới!", "🎉");
    await fetchTodos();
  } catch (err) {
    showToast("Lỗi khi thêm công việc", "❌");
  }
}

async function toggleTodo(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "PATCH" });
    if (!res.ok) throw new Error("Failed to toggle");
    await fetchTodos();
  } catch (err) {
    showToast("Lỗi khi cập nhật trạng thái", "❌");
  }
}

async function deleteTodo(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete");
    showToast("Đã xóa công việc", "🗑️");
    await fetchTodos();
  } catch (err) {
    showToast("Lỗi khi xóa công việc", "❌");
  }
}

async function clearCompleted() {
  const hasCompleted = todos.some(t => t.completed);
  if (!hasCompleted) {
    showToast("Không có công việc hoàn thành để dọn dẹp", "ℹ️");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/completed`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to clear");
    showToast("Đã dọn dẹp các công việc đã xong!", "✨");
    await fetchTodos();
  } catch (err) {
    showToast("Lỗi khi dọn dẹp công việc", "❌");
  }
}

// --- Event Listeners Setup ---
document.addEventListener("DOMContentLoaded", () => {
  // Add button & Enter key
  const addBtn = document.getElementById("addBtn");
  const taskInput = document.getElementById("taskInput");

  if (addBtn) addBtn.addEventListener("click", addTodo);
  if (taskInput) {
    taskInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") addTodo();
    });
  }

  // Priority Selector buttons
  const priorityBtns = document.querySelectorAll(".priority-btn");
  priorityBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      priorityBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedPriority = btn.dataset.priority;
    });
  });

  // Filter Tabs
  const tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      renderTodos();
    });
  });

  // Search Input
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearch = e.target.value;
      renderTodos();
    });
  }

  // Clear Completed Button
  const clearBtn = document.getElementById("clearCompletedBtn");
  if (clearBtn) clearBtn.addEventListener("click", clearCompleted);

  // Initial Fetch
  fetchTodos();
});
