const express = require("express");
const pool = require("../db");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Admin Users Error:", error);
    res.status(500).json({ message: "Server error while fetching users" });
  }
});

router.get("/tasks", protect, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        tasks.id,
        tasks.title,
        tasks.description,
        tasks.status,
        tasks.created_at,
        users.name AS user_name,
        users.email AS user_email
      FROM tasks
      JOIN users ON tasks.user_id = users.id
      ORDER BY tasks.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Admin Tasks Error:", error);
    res.status(500).json({ message: "Server error while fetching all tasks" });
  }
});

router.delete("/tasks/:id", protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted by admin successfully" });
  } catch (error) {
    console.error("Admin Delete Task Error:", error);
    res.status(500).json({ message: "Server error while deleting task" });
  }
});

module.exports = router;