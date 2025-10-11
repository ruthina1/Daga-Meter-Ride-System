import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api";
import "../styles/Login.css";

export default function Logins({ onLogin }) {
  const [credentials, setCredentials] = useState({ phone: "", password: "" });
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
      // ✅ Save token and staff info
      localStorage.setItem("token", result.token);
      localStorage.setItem(
        "staff",
        JSON.stringify({ name: result.staffName, phone: credentials.phone })
      );

      // ✅ Trigger parent handler if available
      if (onLogin) {
        onLogin(result.token, { name: result.staffName, phone: credentials.phone });
      }

      // ✅ Navigate to staff page
      navigate("/staffpage");
    } else {
      setError(result.message || "Login failed. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Staff Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="number"
              value={credentials.phone}
              onChange={(e) =>
                setCredentials({ ...credentials, phone: e.target.value })
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
