// client/src/components/auth/PasswordlessAuthCard.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AlertCircle, Info } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api";
import "../../styles/SignupMotion.css";

function Spinner({ size = 16, color = "currentColor" }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        lineHeight: 0,
        position: "relative",
      }}
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="spinner-svg"
        style={{ display: "block", overflow: "visible" }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <line
            key={i}
            x1="12"
            y1="2"
            x2="12"
            y2="6.5"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            transform={`rotate(${i * 30} 12 12)`}
            opacity={Math.max(0.18, 1 - i * 0.07)}
          />
        ))}
      </svg>
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



function OTPInput({ length = 6, value, onChange, autoFocus, disabled }) {
  const activeIndex = Math.min(value.length, length - 1);
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, length);
    onChange(val);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (pasted) {
      onChange(pasted);
    }
  };

  return (
    <div className="otp" onClick={() => inputRef.current?.focus()}>
      <input
        ref={inputRef}
        className="otp__input"
        data-testid="otp-input"
        value={value}
        onChange={handleChange}
        onPaste={handlePaste}
        inputMode="numeric"
        autoComplete="one-time-code"
        aria-label="Verification code"
        autoFocus={autoFocus}
        disabled={disabled}
      />
      <div className="otp__slots" aria-hidden="true">
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className="otp__slot"
            data-active={i === activeIndex && value.length < length}
          >
            {value[i] ?? ""}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PasswordlessAuthCard({ mode = "login", infoMessage: propInfoMessage, onSuccess, redirectTo = "/" }) {
  const [step, setStep] = useState("email"); // "email" | "otp"
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [emailError, setEmailError] = useState("");
  const [serverError, setServerError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null); // "google" | "github" | null
  const [cooldown, setCooldown] = useState(0);

  // Secure account linking state
  const [linkToken, setLinkToken] = useState("");
  const [linkProvider, setLinkProvider] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const authHandledRef = useRef(false);

  // Read message from router state or query param
  const infoMessage = propInfoMessage || location.state?.message || new URLSearchParams(location.search).get("message");

  const isAnyLoading = loading || Boolean(oauthLoading);

  // ── 1. Check URL parameters for OAuth redirects, notices, or linking ──
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get("token");
    const errParam = params.get("error");
    const noticeParam = params.get("notice");
    const linkPending = params.get("link_pending");
    const providerParam = params.get("provider");
    const linkEmail = params.get("email");
    const linkTokenParam = params.get("link_token");
    const statusParam = params.get("status");
    const otpRequiredParam = params.get("otp_required");
    const devOtpParam = params.get("dev_otp");

    // Handle OAuth success token
    if (tokenParam && !authHandledRef.current) {
      authHandledRef.current = true;
      localStorage.setItem("rise_token", tokenParam);

      let name = params.get("name") ? decodeURIComponent(params.get("name")) : "";
      let username = params.get("username") ? decodeURIComponent(params.get("username")) : "";
      let userEmail = params.get("email") ? decodeURIComponent(params.get("email")) : "";
      let avatar = params.get("avatar") ? decodeURIComponent(params.get("avatar")) : "";
      let id = null;

      try {
        const payload = JSON.parse(atob(tokenParam.split(".")[1]));
        if (!name && payload.name) name = payload.name;
        if (!username && payload.username) username = payload.username;
        if (!userEmail && payload.email) userEmail = payload.email;
        if (!avatar && (payload.avatarUrl || payload.avatar_url)) {
          avatar = payload.avatarUrl || payload.avatar_url;
        }
        if (payload.id) id = payload.id;
      } catch {}

      const userData = {
        id,
        name: name || username || "",
        username: username || "",
        email: userEmail || "",
        avatar_url: avatar || null,
        avatar: avatar || null,
      };

      login(userData);
      if (onSuccess) onSuccess(userData);
      else navigate(redirectTo, { replace: true });
      return;
    }

    if (errParam) {
      setServerError(decodeURIComponent(errParam));
    }
    if (noticeParam) {
      setNotice(decodeURIComponent(noticeParam));
    }

    // Handle Google/GitHub OAuth OTP requirement (Bugs 1 & 2)
    if ((statusParam === "otp_required" || otpRequiredParam === "1") && linkEmail) {
      const decodedEmail = decodeURIComponent(linkEmail);
      setEmail(decodedEmail);
      setStep("otp");
      setCooldown(30);
      setLinkToken("");
      if (devOtpParam) {
        setNotice(`Verification code (dev): ${devOtpParam}`);
      } else {
        setNotice(`A verification code was sent to ${decodedEmail}`);
      }
    }

    // Handle pending OAuth account linking prompt
    if (linkPending === "1" && linkTokenParam && linkEmail) {
      setEmail(decodeURIComponent(linkEmail));
      setLinkToken(linkTokenParam);
      setLinkProvider(providerParam ? decodeURIComponent(providerParam) : "account");
      setCooldown(30);
      setStep("otp");
      const devOtp = params.get("dev_otp");
      if (devOtp) {
        setNotice(`Gmail SMTP daily limit reached. Development OTP: ${devOtp}`);
      }
    }
  }, [location.search, navigate, login, onSuccess, redirectTo]);

  // ── 2. Live countdown timer for OTP resend cooldown ──
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // ── 3. PageShow recovery for back-forward navigation cache ──
  useEffect(() => {
    const handlePageShow = (e) => {
      if (e.persisted) {
        setOauthLoading(null);
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  // ── Email format validation ──
  function validateEmail(val) {
    const clean = (val || "").trim().toLowerCase();
    if (!clean) return "Email address is required.";
    if (!/\S+@\S+\.\S+/.test(clean)) return "Please enter a valid email address.";
    return "";
  }

  // ── Step 1: Send OTP to email ──
  async function handleSendOtp(e) {
    if (e) e.preventDefault();
    if (isAnyLoading || cooldown > 0) return;

    setServerError("");
    setNotice("");

    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }
    setEmailError("");
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      const { data } = await api.post("/auth/request-otp", { email: cleanEmail, mode });
      setStep("otp");
      setOtp("");
      setCooldown(data?.cooldown || 30);
      if (data?.notice) {
        setNotice(data.notice);
      }
    } catch (err) {
      if (err.response?.status === 409) {
        navigate('/login', {
          state: { message: 'You already have an account. Log in here.' }
        });
        return;
      }
      const remaining = err.response?.data?.cooldownRemaining;
      if (remaining && remaining > 0) {
        setCooldown(remaining);
        setStep("otp");
      } else if (err.response?.status === 404) {
        setServerError(err.response?.data?.message || "No account found. Please sign up to create an account.");
      } else {
        setServerError(err.response?.data?.message || "Failed to send verification code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: Verify OTP ──
  async function handleVerifyOtp(e) {
    if (e) e.preventDefault();
    if (isAnyLoading) return;

    if (otp.length !== 6) {
      setServerError("Please enter the complete 6-digit verification code.");
      return;
    }

    setServerError("");
    setLoading(true);

    try {
      let data;
      if (linkToken) {
        // Verifying account linking OTP
        const res = await api.post("/auth/link/verify-otp", {
          link_token: linkToken,
          otp,
        });
        data = res.data;
      } else {
        // Verifying standard login/signup OTP
        const res = await api.post("/auth/verify-otp", {
          email: email.trim().toLowerCase(),
          otp,
        });
        data = res.data;
      }

      if (data?.token) {
        localStorage.setItem("rise_token", data.token);
      }
      if (data?.user) {
        login(data.user);
        if (onSuccess) onSuccess(data.user);
        else navigate(redirectTo);
      }
    } catch (err) {
      setServerError(err.response?.data?.message || "Invalid or expired verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Resend OTP ──
  async function handleResendOtp() {
    if (cooldown > 0 || isAnyLoading) return;
    setServerError("");
    setLoading(true);

    try {
      const endpoint = linkToken ? "/auth/link/resend-otp" : "/auth/resend-otp";
      const payload = linkToken ? { link_token: linkToken } : { email: email.trim().toLowerCase() };
      const { data } = await api.post(endpoint, payload);
      setCooldown(data?.cooldown || 30);
      setNotice("A fresh verification code has been sent to your email.");
    } catch (err) {
      const remaining = err.response?.data?.cooldownRemaining;
      if (remaining && remaining > 0) {
        setCooldown(remaining);
      } else {
        setServerError(err.response?.data?.message || "Failed to resend code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  // ── Handle Google OAuth click ──
  function handleGoogleOAuth() {
    if (isAnyLoading) return;
    setOauthLoading("google");
    setServerError("");
    setNotice("");

    const apiBase = import.meta.env?.VITE_API_URL || "http://localhost:5000/api";

    if (typeof window !== "undefined" && window.__MOCK_OAUTH_REDIRECT__) {
      try {
        window.__MOCK_OAUTH_REDIRECT__("google");
      } catch (error) {
        if (error?.response?.status === 409) {
          navigate('/login', {
            state: { message: 'You already have an account. Log in here.' }
          });
          return;
        }
      }
      return;
    }

    try {
      window.location.href = `${apiBase}/auth/google?mode=${mode}`;
    } catch (error) {
      if (error?.response?.status === 409) {
        navigate('/login', {
          state: { message: 'You already have an account. Log in here.' }
        });
        return;
      }
      setOauthLoading(null);
      setServerError("Unable to connect to Google. Please try again.");
    }
  }

  return (
    <div className="auth__card" data-testid="auth-card">
      {step === "email" ? (
        <>
          <h1 className="auth__card-title">Continue with email</h1>
          <p className="auth__card-description">Enter your email to receive a one-time verification code.</p>

          {/* Info banner for returning user nudge */}
          {infoMessage && (
            <div className="info-banner" role="status">
              <Info size={16} aria-hidden="true" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Reserved alert slot */}
          <div className="auth__alert-slot" data-testid="auth-alert-slot" aria-live="polite">
            {serverError ? (
              <div className="auth__alert-error" role="alert" aria-live="assertive">
                <AlertCircle size={14} aria-hidden="true" />
                <span>{serverError}</span>
              </div>
            ) : notice ? (
              <div className="auth__notice" role="status">
                {notice}
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSendOtp} noValidate>
            <div className="auth__field">
              <label htmlFor="auth-email">Email address</label>
              <input
                id="auth-email"
                data-testid={mode === "signup" ? "signup-email" : "login-email"}
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                disabled={isAnyLoading}
                aria-invalid={Boolean(emailError)}
                aria-describedby={emailError ? "auth-email-error" : undefined}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                  if (serverError) setServerError("");
                }}
              />
              {emailError && (
                <p className="auth__field-error" id="auth-email-error" role="alert" aria-live="polite">
                  <AlertCircle size={12} aria-hidden="true" />
                  <span>{emailError}</span>
                </p>
              )}
            </div>

            <button
              className="btn btn--primary"
              style={{ marginTop: "1.5rem" }}
              type="submit"
              disabled={isAnyLoading}
              data-testid={mode === "signup" ? "signup-submit-btn" : "login-submit-btn"}
            >
              {loading ? (
                <span className="btn__loading-wrapper">
                  <Spinner size={16} color="#ffffff" />
                  <span>Sending code...</span>
                </span>
              ) : (
                <span>Continue</span>
              )}
            </button>
          </form>

          <div className="auth__divider" role="separator">
            <span>OR</span>
          </div>

          <button
            type="button"
            className="btn btn--outline"
            onClick={handleGoogleOAuth}
            disabled={isAnyLoading}
            data-testid={mode === "signup" ? "signup-google-btn" : "login-google-btn"}
            data-loading={oauthLoading === "google" ? "true" : undefined}
          >
            {oauthLoading === "google" ? (
              <span className="btn__loading-wrapper">
                <Spinner size={16} />
                <span>Connecting to Google...</span>
              </span>
            ) : (
              <span className="btn__content-wrapper">
                <GoogleIcon size={18} aria-hidden="true" />
                <span>Continue with Google</span>
              </span>
            )}
          </button>

          <p className="auth__footer-note">
            {mode === "signup" ? (
              <>
                Already have an account? <Link to="/login">Log in</Link>
              </>
            ) : (
              <>
                Don’t have an account? <Link to="/signup">Sign up</Link>
              </>
            )}
          </p>
        </>
      ) : (
        <>
          <h2 className="auth__card-title">
            {linkToken ? `Link your ${linkProvider} account` : "Verify your email"}
          </h2>
          <p className="auth__card-description">
            {linkToken ? (
              <>
                Enter the 6-digit code sent to <strong>{email}</strong> to link your {linkProvider} account.
              </>
            ) : (
              <>
                We sent a 6-digit code to <strong>{email}</strong>
              </>
            )}
          </p>

          {/* Reserved alert slot */}
          <div className="auth__alert-slot" data-testid="auth-alert-slot" aria-live="polite">
            {serverError ? (
              <div className="auth__alert-error" role="alert" aria-live="assertive">
                <AlertCircle size={14} aria-hidden="true" />
                <span>{serverError}</span>
              </div>
            ) : notice ? (
              <div className="auth__notice" role="status">
                {notice}
              </div>
            ) : null}
          </div>

          <form onSubmit={handleVerifyOtp} noValidate>
            <OTPInput
              length={6}
              value={otp}
              onChange={(val) => {
                setOtp(val);
                if (serverError) setServerError("");
              }}
              autoFocus
              disabled={isAnyLoading}
            />

            <button
              className="btn btn--primary"
              style={{ marginTop: "1.5rem" }}
              type="submit"
              disabled={otp.length !== 6 || isAnyLoading}
              data-testid="otp-submit-btn"
            >
              {loading ? (
                <span className="btn__loading-wrapper">
                  <Spinner size={16} color="#ffffff" />
                  <span>Verifying...</span>
                </span>
              ) : (
                <span>Verify code</span>
              )}
            </button>

            <button
              type="button"
              className="resend"
              onClick={handleResendOtp}
              disabled={cooldown > 0 || isAnyLoading}
              style={{ marginInline: "auto", marginTop: "1rem" }}
            >
              {cooldown > 0
                ? `Didn't receive a code? Resend (${cooldown}s)`
                : "Didn't receive a code? Resend"}
            </button>

            <button
              type="button"
              className="btn btn--ghost"
              style={{ marginTop: "0.5rem" }}
              disabled={isAnyLoading}
              onClick={() => {
                setStep("email");
                setOtp("");
                setServerError("");
                setNotice("");
                setLinkToken("");
              }}
            >
              Use another email
            </button>
          </form>
        </>
      )}
    </div>
  );
}
