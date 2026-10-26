import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { errorMessage } from "../api/client";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  // Message shown after registering, or when the session expired
  const notice = location.state?.registered
    ? "Account created successfully! Please sign in."
    : searchParams.get("expired")
      ? "Your session has expired. Please sign in again."
      : "";

  const [accountType, setAccountType] = useState("student");
  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!email || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      // Saves the JWT token + user (localStorage if "Remember me", otherwise sessionStorage)
      const result = await login(email, password, rememberMe, accountType);
      const destination = accountType === "club"
        ? result.managedClubs.length ? `/clubs/${result.managedClubs[0].id}` : "/clubs"
        : location.state?.from || "/dashboard";
      navigate(destination, { replace: true });
    } catch (error) {
      setMessage(errorMessage(error, "Unable to connect to the server."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* Background decorative elements */}
      <div className="background-glow glow-one"></div>
      <div className="background-glow glow-two"></div>

      <main className="login-container">

        {/* ================= LEFT PANEL ================= */}
        <section className="login-visual">

          <div className="visual-overlay"></div>

          <div className="visual-content">

            {/* Logo */}
            <div className="brand">
              <div className="brand-name">UCM</div>

              <div className="brand-title">
                UNIVERSITY CLUB
                <br />
                MANAGEMENT SYSTEM
              </div>

              <div className="brand-line"></div>
            </div>

            {/* Main message */}
            <div className="visual-message">

              <h1>
                CONNECT.
                <br />
                <span>LEAD.</span>
                <br />
                BELONG.
              </h1>

              <p>
                Discover university clubs, join vibrant
                communities, participate in events and
                activities, and make the most of your
                university journey.
              </p>

              <div className="small-line"></div>

            </div>

          </div>

        </section>


        {/* ================= RIGHT PANEL ================= */}
        <section className="login-form-section">

          <div className="login-form-container">

            <div className="welcome-section">

              <h2>{accountType === "club" ? "CLUB SIGN IN" : "WELCOME BACK!"}</h2>

              <p>
                {accountType === "club"
                  ? "Manage your club, publish events and share announcements."
                  : "Sign in to discover clubs, join events and manage your account."}
              </p>

            </div>


            <div className="account-type-picker" role="tablist" aria-label="Sign in as">
              <button type="button" role="tab" aria-selected={accountType === "student"} className={accountType === "student" ? "active" : ""} onClick={() => { setAccountType("student"); setMessage(""); }}>
                Student
              </button>
              <button type="button" role="tab" aria-selected={accountType === "club"} className={accountType === "club" ? "active" : ""} onClick={() => { setAccountType("club"); setMessage(""); }}>
                Club
              </button>
            </div>
            {accountType === "club" && <p className="account-type-help">Use your student email and password. You can create your club after signing in.</p>}

            <form onSubmit={handleLogin}>

              {/* EMAIL */}
              <div className="input-group">

                <label htmlFor="email">
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <rect
                        x="3"
                        y="5"
                        width="18"
                        height="14"
                        rx="2"
                      />
                      <path d="m3 7 9 6 9-6" />
                    </svg>
                  </span>

                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    autoComplete="email"
                  />

                </div>

              </div>


              {/* PASSWORD */}
              <div className="input-group">

                <label htmlFor="password">
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <rect
                        x="5"
                        y="10"
                        width="14"
                        height="10"
                        rx="2"
                      />
                      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    </svg>
                  </span>

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M3 3l18 18" />
                        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                        <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 8.5 4 9.8 6a16 16 0 0 1-3.1 3.5" />
                        <path d="M6.2 6.2C4.3 7.5 2.9 9.3 2.2 10c1.3 2 4.8 6 9.8 6 1.1 0 2.1-.2 3-.5" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M2.2 12s3.5-6 9.8-6 9.8 6 9.8 6-3.5 6-9.8 6-9.8-6-9.8-6Z" />
                        <circle cx="12" cy="12" r="2.5" />
                      </svg>
                    )}
                  </button>

                </div>

              </div>


              {/* OPTIONS */}
              <div className="login-options">

                <label className="remember">

                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(e.target.checked)
                    }
                  />

                  <span className="custom-checkbox"></span>

                  <span>Remember me</span>

                </label>

                <button
                  type="button"
                  className="forgot-password"
                  onClick={() =>
                    setMessage(
                      "Please contact the system administrator to reset your password."
                    )
                  }
                >
                  Forgot password?
                </button>

              </div>


              {/* SUCCESS / INFO MESSAGE */}
              {notice && !message && (
                <div className="login-message success">
                  {notice}
                </div>
              )}

              {/* ERROR MESSAGE */}
              {message && (
                <div className="login-message">
                  {message}
                </div>
              )}


              {/* LOGIN BUTTON */}
              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    {accountType === "club" ? "Continue as club" : "Sign in as student"}
                    <span className="arrow">→</span>
                  </>
                )}

              </button>


              {/* DIVIDER */}
              <div className="divider">

                <span></span>

                <p>OR</p>

                <span></span>

              </div>


              {/* GOOGLE BUTTON */}
              <button
                type="button"
                className="google-button"
                onClick={() =>
                  setMessage(
                    "Google sign-in will be available soon."
                  )
                }
              >

                <span className="google-icon">
                  G
                </span>

                <span>
                  Sign in with Google
                </span>

              </button>


              {/* SIGN UP */}
              <div className="signup-text">

                Don't have an account?

                <button
                  type="button"
                  onClick={() => navigate("/register")}
                >
                  Sign up
                </button>

              </div>

            </form>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Login;