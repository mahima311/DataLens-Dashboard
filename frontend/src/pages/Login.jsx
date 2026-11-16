
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChartNoAxesCombined, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const result = login(email, password);

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate(location.state?.from || "/dashboard", { replace: true });
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
          <h1>Your data journey starts here.</h1>
          <p>
            Sign in to access your analytics workspace and explore your datasets.
          </p>
        </div>

        <small>DataLens · Analytics workspace</small>
      </aside>

      <main className="auth-form-area">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Welcome back</h2>
          <p className="auth-subtitle">
            Enter your account details to continue.
          </p>

          {error && <div className="form-error" role="alert">{error}</div>}

          <div className="form-field">
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="login-password">Password</label>

            <div className="password-wrap">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
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

          <button type="submit" className="primary-button auth-submit">
            Log in
          </button>

          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Create one</Link>
          </p>

          <div className="demo-notice">
            Development demo only. Do not use a real or reused password.
            Account data is stored in this browser.
          </div>

          <p className="auth-switch">
            <Link to="/">Back to home</Link>
          </p>
        </form>
      </main>
    </div>
  );
}
