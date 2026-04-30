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
    <div className="app-page">
      <nav className="navbar">
        <div>
          <h2>Admin Dashboard</h2>
          <p>Manage users and all tasks</p>
        </div>

        <button onClick={logout}>Logout</button>
      </nav>

      <main className="container">
        <section className="panel">
          <h2>All Users</h2>

          <table>
            <thead>
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
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="panel">
          <h2>All Tasks</h2>

          {tasks.length === 0 ? (
            <p>No tasks available.</p>
          ) : (
            <div className="task-list">
              {tasks.map((task) => (
                <div className="task-card admin-task-card" key={task.id}>
                  <div>
                    <h3>{task.title}</h3>
                    <p>{task.description}</p>
                    <small>
                      By: {task.user_name} ({task.user_email})
                    </small>
                    <br />
                    <span className={task.status}>{task.status}</span>
                  </div>

                  <div className="actions">
                    <button
                      className="danger"
                      onClick={() => deleteTask(task.id)}
                    >
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