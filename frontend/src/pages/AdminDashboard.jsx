import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);

  const fetchAdminData = async () => {
    const usersRes = await API.get("/admin/users");
    const tasksRes = await API.get("/admin/tasks");

    setUsers(usersRes.data);
    setTasks(tasksRes.data);
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const deleteTask = async (id) => {
    await API.delete(`/admin/tasks/${id}`);
    fetchAdminData();
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="app-bg min-vh-100">
      <nav className="navbar navbar-expand-lg bg-white shadow-sm px-4">
        <div>
          <h3 className="fw-bold text-primary mb-0">Admin Dashboard</h3>
          <small className="text-muted">Manage users and all tasks</small>
        </div>

        <button className="btn btn-outline-danger ms-auto" onClick={logout}>
          Logout
        </button>
      </nav>

      <main className="container py-4">
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4">
            <h4 className="fw-bold mb-3">All Users</h4>

            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span
                          className={`badge ${
                            user.role === "admin"
                              ? "text-bg-primary"
                              : "text-bg-secondary"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-4">
            <h4 className="fw-bold mb-3">All Tasks</h4>

            {tasks.length === 0 ? (
              <div className="alert alert-info mb-0">No tasks available.</div>
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
                      <small className="text-muted d-block mb-2">
                        By: {task.user_name} ({task.user_email})
                      </small>

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

                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => deleteTask(task.id)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}