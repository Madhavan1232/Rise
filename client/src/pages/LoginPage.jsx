import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion, MotionConfig } from "motion/react";
import { AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import "../styles/SignupMotion.css";

function Spinner({ size = 14 }) {
  return (
    <div style={{ width: size, height: size, display: "inline-block", position: "relative" }}>
      <div className="spinner" style={{ width: size, height: size }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="spinner__bar"
            style={{
              transform: `rotate(${i * 30}deg) translate(146%)`,
              animationDelay: `-${1.2 - i * 0.1}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function GoogleIcon({ size = 18, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function GitHubIcon({ size = 18, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    return err ? decodeURIComponent(err) : "";
  });
  const [oauthNotice, setOauthNotice] = useState("");

  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const authHandledRef = useRef(false);

  // Listen for OAuth callback tokens or errors returned in URL parameters
  useEffect(() => {
    if (authHandledRef.current) return;

    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const errorParam = params.get("error");
    const nameParam = params.get("name");
    const emailParam = params.get("email");
    const avatarParam = params.get("avatar");

    if (errorParam) {
      authHandledRef.current = true;
      navigate("/login", { replace: true });
      return;
    }

    if (token) {
      authHandledRef.current = true;
      // 1. Save session token
      localStorage.setItem("rise_token", token);

      let name = nameParam ? decodeURIComponent(nameParam) : "";
      let email = emailParam ? decodeURIComponent(emailParam) : "";
      let avatar = avatarParam ? decodeURIComponent(avatarParam) : "";
      let id = null;

      // Extract details from JWT payload as well
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (!name && payload.name) name = payload.name;
        if (!email && payload.email) email = payload.email;
        if (!avatar && (payload.avatarUrl || payload.avatar_url)) {
          avatar = payload.avatarUrl || payload.avatar_url;
        }
        if (payload.id) id = payload.id;
      } catch {}

      const userData = {
        id,
        name: name || "User",
        email: email || "",
        avatar_url: avatar || null,
        avatar: avatar || null,
      };

      // 2. Update current user/auth state in React Context & localStorage
      login(userData);

      // 3. Redirect to home page ('/') using the existing router navigation
      navigate("/", { replace: true });
    }
  }, [location.search, navigate, login]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = (e) => setReducedMotion(e.matches);
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  function validate() {
    const e = {};
    const cleanEmail = form.email.trim();
    if (!cleanEmail) {
      e.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
      e.email = "Please enter a valid email address.";
    }
    if (!form.password) {
      e.password = "Password is required.";
    }
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    setOauthNotice("");
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      if (data?.user) {
        if (data.token) {
          localStorage.setItem("rise_token", data.token);
        }
        login(data.user);
      }
      navigate("/");
    } catch (err) {
      setServerError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: "" }));
    if (serverError) setServerError("");
  };

  const handleOAuth = (provider) => {
    setOauthNotice(`Redirecting to ${provider}...`);
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    if (provider.toLowerCase() === "google") {
      window.location.href = `${apiBase}/auth/google`;
    } else if (provider.toLowerCase() === "github") {
      window.location.href = `${apiBase}/auth/github`;
    }
  };

  return (
    <MotionConfig
      reducedMotion={reducedMotion ? "always" : "never"}
      transition={{ type: "spring", bounce: 0.25, visualDuration: 0.4 }}
    >
      <div className="rise-stage">
        <Link to="/" className="auth__header-logo" aria-label="Rise Home">
          <img src="/rise_logo.svg" alt="Rise" />
        </Link>

        <div className="auth__root">
          <div className="auth__card-container auth__card-container--static">
            <motion.div
              className="auth__card auth__card--static"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", bounce: 0.25, visualDuration: 0.4 }}
            >
              <h1 className="auth__card-title">Welcome back to Rise</h1>
              <p className="auth__card-description">Continue your learning journey</p>

              {serverError && (
                <div className="auth__alert-error" role="alert" aria-live="assertive">
                  <AlertCircle size={14} aria-hidden="true" />
                  <span>{serverError}</span>
                </div>
              )}

              {oauthNotice && (
                <div className="auth__notice" role="status" aria-live="polite">
                  {oauthNotice}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="auth__field">
                  <label htmlFor="login-email">Email address</label>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={form.email}
                    onChange={set("email")}
                    disabled={loading}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "login-email-error" : undefined}
                  />
                  {errors.email && (
                    <p className="auth__field-error" id="login-email-error" role="alert" aria-live="polite">
                      <AlertCircle size={12} aria-hidden="true" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                <div className="auth__field" style={{ marginTop: "1rem" }}>
                  <div className="auth__label-row">
                    <label htmlFor="login-password">Password</label>
                    <a
                      href="#"
                      className="auth__forgot-link"
                      onClick={(e) => {
                        e.preventDefault();
                        setOauthNotice("Password recovery instructions will be sent to your registered email.");
                      }}
                    >
                      Forgot password?
                    </a>
                  </div>
                  <input
                    id="login-password"
                    name="password"
                    type="password"
                    required
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={set("password")}
                    disabled={loading}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? "login-password-error" : undefined}
                  />
                  {errors.password && (
                    <p className="auth__field-error" id="login-password-error" role="alert" aria-live="polite">
                      <AlertCircle size={12} aria-hidden="true" />
                      <span>{errors.password}</span>
                    </p>
                  )}
                </div>

                <motion.button
                  layout="position"
                  className="btn btn--primary"
                  style={{ marginTop: "1.5rem" }}
                  type="submit"
                  disabled={loading}
                  transition={{ type: "spring", bounce: 0.15, visualDuration: 0.3 }}
                >
                  {loading ? <Spinner size={14} /> : <span>Log in</span>}
                </motion.button>
              </form>

              <div className="auth__divider" role="separator">
                <span>or continue with</span>
              </div>

              <div className="auth__oauth-group">
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() => handleOAuth("Google")}
                  disabled={loading}
                >
                  <GoogleIcon size={18} aria-hidden="true" />
                  <span>Continue with Google</span>
                </button>

                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() => handleOAuth("GitHub")}
                  disabled={loading}
                >
                  <GitHubIcon size={18} aria-hidden="true" />
                  <span>Continue with GitHub</span>
                </button>
              </div>

              <motion.p
                layout="position"
                className="auth__footer-note"
                transition={{ type: "spring", bounce: 0.15, visualDuration: 0.3 }}
              >
                Don’t have an account? <Link to="/signup">Sign up</Link>
              </motion.p>
            </motion.div>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
