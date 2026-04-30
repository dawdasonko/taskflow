const express = require("express");
const pool = require("../db");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const [tasks] = await pool.query(
      "SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );

    res.json(tasks);
  } catch (error) {
    console.error("Get Tasks Error:", error);
    res.status(500).json({ message: "Server error while fetching tasks" });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Task title is required" });
    }

    const [result] = await pool.query(
      "INSERT INTO tasks (user_id, title, description, status) VALUES (?, ?, ?, ?)",
      [req.user.id, title, description || "", "pending"]
    );

    res.status(201).json({
      message: "Task created successfully",
      taskId: result.insertId,
    });
  } catch (error) {
    console.error("Create Task Error:", error);
    res.status(500).json({ message: "Server error while creating task" });
  }
});

router.put("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    const [tasks] = await pool.query(
      "SELECT * FROM tasks WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );

    if (tasks.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    await pool.query(
      "UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ? AND user_id = ?",
      [
        title || tasks[0].title,
        description !== undefined ? description : tasks[0].description,
        status || tasks[0].status,
        id,
        req.user.id,
      ]
    );

    res.json({ message: "Task updated successfully" });
  } catch (error) {
    console.error("Update Task Error:", error);
    res.status(500).json({ message: "Server error while updating task" });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    const [tasks] = await pool.query(
      "SELECT * FROM tasks WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );

    if (tasks.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    await pool.query("DELETE FROM tasks WHERE id = ? AND user_id = ?", [
      id,
      req.user.id,
    ]);

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete Task Error:", error);
    res.status(500).json({ message: "Server error while deleting task" });
  }
});

module.exports = router;