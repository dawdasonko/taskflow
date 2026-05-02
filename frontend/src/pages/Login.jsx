import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-bg">
      <div className="card shadow-lg border-0 auth-box">
        <div className="card-body p-4 p-md-5">
          <h1 className="text-center fw-bold text-primary mb-2">TaskFlow</h1>
          <p className="text-center text-muted mb-4">Login to manage your tasks</p>

          {message && <div className="alert alert-danger">{message}</div>}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                name="email"
                type="email"
                className="form-control form-control-lg"
                placeholder="Enter email"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                name="password"
                type="password"
                className="form-control form-control-lg"
                placeholder="Enter password"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-100">
              Login
            </button>
          </form>

          <p className="text-center mt-4 mb-2">
            No account? <Link to="/register">Register</Link>
          </p>

          <p className="text-center small text-muted mb-0">
            Admin: admin@taskflow.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
}