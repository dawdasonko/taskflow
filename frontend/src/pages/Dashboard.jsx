import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
  });

  const fetchTasks = async () => {
    const res = await API.get("/tasks");
    setTasks(res.data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) return;

    await API.post("/tasks", form);
    setForm({ title: "", description: "" });
    fetchTasks();
  };

  const toggleStatus = async (task) => {
    await API.put(`/tasks/${task.id}`, {
      ...task,
      status: task.status === "pending" ? "completed" : "pending",
    });

    fetchTasks();
  };

  const deleteTask = async (id) => {
    await API.delete(`/tasks/${id}`);
    fetchTasks();
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="app-page">
      <nav className="navbar">
        <div>
          <h2>TaskFlow</h2>
          <p>Welcome, {user.name}</p>
        </div>

        <button onClick={logout}>Logout</button>
      </nav>

      <main className="container">
        <section className="panel">
          <h2>Add New Task</h2>

          <form onSubmit={addTask} className="task-form">
            <input
              placeholder="Task title"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
            />

            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <button type="submit">Add Task</button>
          </form>
        </section>

        <section className="panel">
          <h2>Your Tasks</h2>

          {tasks.length === 0 ? (
            <p>No tasks yet.</p>
          ) : (
            <div className="task-list">
              {tasks.map((task) => (
                <div className="task-card" key={task.id}>
                  <div>
                    <h3>{task.title}</h3>
                    <p>{task.description}</p>
                    <span className={task.status}>
                      {task.status}
                    </span>
                  </div>

                  <div className="actions">
                    <button onClick={() => toggleStatus(task)}>
                      Toggle
                    </button>
                    <button className="danger" onClick={() => deleteTask(task.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}