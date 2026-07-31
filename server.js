const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.static(__dirname)); // phục vụ index.html, app.js, style.css...

let todos = [
  { id: 1, text: "Hoàn thiện thiết kế giao diện Loopdone", priority: "high", completed: true, createdAt: new Date().toISOString() },
  { id: 2, text: "Kết nối REST API backend Node.js / Express", priority: "medium", completed: false, createdAt: new Date().toISOString() },
  { id: 3, text: "Viết tài liệu README chi tiết và hướng dẫn sử dụng", priority: "low", completed: false, createdAt: new Date().toISOString() }
];
let nextId = 4;

// Lấy toàn bộ danh sách
app.get("/api/todos", (req, res) => res.json(todos));

// Thêm todo mới
app.post("/api/todos", (req, res) => {
  if (!req.body.text || !req.body.text.trim()) {
    return res.status(400).json({ error: "Nội dung công việc không được để trống" });
  }
  const todo = {
    id: nextId++,
    text: req.body.text.trim(),
    priority: req.body.priority || "medium",
    completed: false,
    createdAt: new Date().toISOString()
  };
  todos.push(todo);
  res.status(201).json(todo);
});

// Toggle trạng thái hoàn thành
app.patch("/api/todos/:id", (req, res) => {
  const todo = todos.find((t) => t.id === parseInt(req.params.id));
  if (!todo) return res.status(404).json({ error: "Không tìm thấy công việc" });
  todo.completed = !todo.completed;
  res.json(todo);
});

// Xóa tất cả todo đã hoàn thành (Khai báo trước :id để tránh trùng route)
app.delete("/api/todos/completed", (req, res) => {
  todos = todos.filter((t) => !t.completed);
  res.status(204).send();
});

// Xóa todo theo id
app.delete("/api/todos/:id", (req, res) => {
  const initialLen = todos.length;
  todos = todos.filter((t) => t.id !== parseInt(req.params.id));
  if (todos.length === initialLen) {
    return res.status(404).json({ error: "Không tìm thấy công việc" });
  }
  res.status(204).send();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server Loopdone đang chạy tại http://localhost:${PORT}`));

