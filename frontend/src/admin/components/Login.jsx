import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ for navigation
import { login } from "../services/api";
import "../styles/Login.css";

export default function Login({ onLogin }) {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(credentials);
    console.log("Login API result:", result);

    if (result.success) {
      // save token for ProtectedRoute
      localStorage.setItem("token", result.token);
      localStorage.setItem("admin", JSON.stringify(result.user)); // backend sends admin object

      // call parent handler if needed
      if (onLogin) {
        onLogin(result.token, result.user);
      }

      // ✅ navigate to dashboard (your App.js route)
      navigate("/dashboard");
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Admin Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) =>
                setCredentials({ ...credentials, username: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              required
            />
          </div>
          <button type="submit" disabled={loading} className="login-button">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
