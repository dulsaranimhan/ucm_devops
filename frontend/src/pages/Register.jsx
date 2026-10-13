import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { errorMessage } from "../api/client";
import { FACULTIES } from "../utils/format";
import "./Login.css";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    student_id: "",
    faculty: "Engineering",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!form.name || !form.email || !form.password) {
      setMessage("Please fill in your name, email and password.");
      return;
    }
    if (form.password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const data = { ...form };
      delete data.confirmPassword;
      await api.post("/auth/register", data);
      navigate("/login", {
        state: { registered: true, email: form.email },
      });
    } catch (error) {
      setMessage(errorMessage(error, "Unable to connect to the server."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="background-glow glow-one"></div>
      <div className="background-glow glow-two"></div>

      <main className="login-container">
        {/* ================= LEFT PANEL ================= */}
        <section className="login-visual">
          <div className="visual-overlay"></div>

          <div className="visual-content">
            <div className="brand">
              <div className="brand-name">UCM</div>
              <div className="brand-title">
                UNIVERSITY CLUB
                <br />
                MANAGEMENT SYSTEM
              </div>
              <div className="brand-line"></div>
            </div>

            <div className="visual-message">
              <h1>
                JOIN.
                <br />
                <span>CREATE.</span>
                <br />
                INSPIRE.
              </h1>
              <p>
                Create your account to join clubs, register for events and stay
                up to date with everything happening on campus.
              </p>
              <div className="small-line"></div>
            </div>
          </div>
        </section>

        {/* ================= RIGHT PANEL ================= */}
        <section className="login-form-section">
          <div className="login-form-container">
            <div className="welcome-section compact">
              <h2>CREATE ACCOUNT</h2>
              <p>It only takes a minute to get started.</p>
            </div>

            <form onSubmit={handleRegister} className="register-form">
              <div className="input-group">
                <label htmlFor="name">Full name</label>
                <div className="input-wrapper">
                  <input id="name" className="plain" placeholder="e.g. Nimal Perera" value={form.name} onChange={set("name")} autoComplete="name" />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="reg-email">University email</label>
                <div className="input-wrapper">
                  <input
                    id="reg-email"
                    className="plain"
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={set("email")}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="student_id">Registration no. (optional)</label>
                  <div className="input-wrapper">
                    <input id="student_id" className="plain" placeholder="EG/2023/1234" value={form.student_id} onChange={set("student_id")} />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="faculty">Faculty</label>
                  <div className="input-wrapper">
                    <select id="faculty" value={form.faculty} onChange={set("faculty")}>
                      {FACULTIES.map((f) => (
                        <option key={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="reg-password">Password</label>
                  <div className="input-wrapper">
                    <input
                      id="reg-password"
                      className="plain"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 characters"
                      value={form.password}
                      onChange={set("password")}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="confirm">Confirm password</label>
                  <div className="input-wrapper">
                    <input
                      id="confirm"
                      className="plain"
                      type={showPassword ? "text" : "password"}
                      placeholder="Repeat password"
                      value={form.confirmPassword}
                      onChange={set("confirmPassword")}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              </div>

              <div className="login-options">
                <label className="remember">
                  <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />
                  <span className="custom-checkbox"></span>
                  <span>Show passwords</span>
                </label>
              </div>

              {message && <div className="login-message">{message}</div>}

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <span className="arrow">→</span>
                  </>
                )}
              </button>

              <div className="signup-text">
                Already have an account?
                <Link to="/login">Sign in</Link>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Register;
