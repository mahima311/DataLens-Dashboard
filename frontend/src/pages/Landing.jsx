
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChartNoAxesCombined, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Landing() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  function changeMode(value) {
    setMode(value);
    setError("");
    setPassword("");
    setConfirmPassword("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (mode === "signup") {
      if (name.trim().length < 2) {
        setError("Please enter your full name.");
        return;
      }

      if (password.length < 8) {
        setError("Password must contain at least 8 characters.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      const result = signup(name, email, password);

      if (!result.success) {
        setError(result.message);
        return;
      }
    } else {
      const result = login(email, password);

      if (!result.success) {
        setError(result.message);
        return;
      }
    }

    navigate("/dashboard");
  }

  return (
    <main className="landing-auth-page">
      <div className="landing-auth-content">

        <div className="landing-brand">
          <span className="landing-brand-icon">
            <ChartNoAxesCombined size={27} />
          </span>

          <h1>DataLens</h1>
        </div>

        <p className="landing-tagline">
          Your data, made clearer.
        </p>

        <section className="landing-auth-card">

          <h2>Welcome to DataLens</h2>

          <p className="landing-card-subtitle">
            Access your personal analytics workspace.
          </p>

          <div className="landing-auth-toggle">
            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => changeMode("login")}
            >
              Login
            </button>

            <button
              type="button"
              className={mode === "signup" ? "active" : ""}
              onClick={() => changeMode("signup")}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit}>

            {mode === "signup" && (
              <div className="landing-form-field">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="landing-form-field">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="landing-form-field">
              <label>Password</label>

              <div className="landing-password-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    mode === "signup"
                      ? "At least 8 characters"
                      : "Enter your password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={
                    mode === "login"
                      ? "current-password"
                      : "new-password"
                  }
                  required
                />

                <button
                  type="button"
                  className="landing-eye-button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <div className="landing-form-field">
                <label>Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
            )}

            {error && (
              <div className="landing-form-error" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="landing-submit-button"
            >
              {mode === "login" ? "Login to DataLens" : "Create Account"}
            </button>

          </form>

          <p className="landing-bottom-text">
            {mode === "login"
              ? "New to DataLens? Create an account."
              : "Already have an account? Login."}
          </p>

        </section>

        <p className="landing-footer">
          DataLens · Analytics Workspace
        </p>

      </div>
    </main>
  );
}
