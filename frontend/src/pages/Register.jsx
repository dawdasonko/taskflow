import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await API.post("/auth/register", form);
      navigate("/login");
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-bg">
      <div className="card shadow-lg border-0 auth-box">
        <div className="card-body p-4 p-md-5">
          <h1 className="text-center fw-bold text-primary mb-2">Create Account</h1>
          <p className="text-center text-muted mb-4">Start organizing your daily work</p>

          {message && <div className="alert alert-danger">{message}</div>}

          <form onSubmit={handleRegister}>
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input
                name="name"
                className="form-control form-control-lg"
                placeholder="Enter full name"
                value={form.name}
                onChange={handleChange}
              />
            </div>

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
              Register
            </button>
          </form>

          <p className="text-center mt-4 mb-0">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}