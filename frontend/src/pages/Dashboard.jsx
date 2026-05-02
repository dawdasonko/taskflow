import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: "", description: "" });

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
    <div className="app-bg min-vh-100">
      <nav className="navbar navbar-expand-lg bg-white shadow-sm px-4">
        <div>
          <h3 className="fw-bold text-primary mb-0">TaskFlow</h3>
          <small className="text-muted">Welcome, {user.name}</small>
        </div>

        <button className="btn btn-outline-danger ms-auto" onClick={logout}>
          Logout
        </button>
      </nav>

      <main className="container py-4">
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-3">Add New Task</h4>

                <form onSubmit={addTask}>
                  <div className="mb-3">
                    <label className="form-label">Task Title</label>
                    <input
                      className="form-control"
                      placeholder="Task title"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Description"
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                    />
                  </div>

                  <button type="submit" className="btn btn-primary w-100">
                    Add Task
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-3">Your Tasks</h4>

                {tasks.length === 0 ? (
                  <div className="alert alert-info mb-0">No tasks yet.</div>
                ) : (
                  <div className="d-grid gap-3">
                    {tasks.map((task) => (
                      <div
                        className="border rounded-4 p-3 bg-light d-flex justify-content-between align-items-start gap-3 task-responsive"
                        key={task.id}
                      >
                        <div>
                          <h5 className="fw-bold mb-1">{task.title}</h5>
                          <p className="text-muted mb-2">{task.description}</p>

                          <span
                            className={`badge ${
                              task.status === "completed"
                                ? "text-bg-success"
                                : "text-bg-warning"
                            }`}
                          >
                            {task.status}
                          </span>
                        </div>

                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => toggleStatus(task)}
                          >
                            Toggle
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => deleteTask(task.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}