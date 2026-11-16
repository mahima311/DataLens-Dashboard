
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChartNoAxesCombined, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

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

    navigate("/dashboard");
  }

  return (
    <div className="auth-page">
      <aside className="auth-visual">
        <Link to="/" className="brand-logo">
          <span className="brand-icon">
            <ChartNoAxesCombined size={22} />
          </span>
          DataLens
        </Link>

        <div>
          <h1>Make more sense of your data.</h1>
          <p>
            Create an account to access your workspace and start exploring
            supported datasets.
          </p>
        </div>

        <small>DataLens · Analytics workspace</small>
      </aside>

      <main className="auth-form-area">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Create account</h2>
          <p className="auth-subtitle">
            Enter your details to get started.
          </p>

          {error && <div className="form-error" role="alert">{error}</div>}

          <div className="form-field">
            <label htmlFor="signup-name">Full name</label>
            <input
              id="signup-name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="signup-email">Email address</label>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="signup-password">Password</label>

            <div className="password-wrap">
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="signup-confirm">Confirm password</label>
            <input
              id="signup-confirm"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </div>

          <button type="submit" className="primary-button auth-submit">
            Create account
          </button>

          <p className="auth-switch">
            Already registered? <Link to="/login">Log in</Link>
          </p>

          <div className="demo-notice">
            Demo only: account details are saved in this browser.
            Do not use your real or reused password.
          </div>

          <p className="auth-switch">
            <Link to="/">Back to home</Link>
          </p>
        </form>
      </main>
    </div>
  );
}
