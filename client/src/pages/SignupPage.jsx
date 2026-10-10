import { useEffect, useId, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import "../styles/SignupMotion.css";

const SIGN_IN_VARIANTS = {
  default: { opacity: 1, scale: 1, y: 0, x: "-50%" },
  verifying: { opacity: 0.6, scale: 0.95, y: -10, x: "-50%" },
};

const VERIFY_VARIANTS = {
  default: { opacity: 0, y: 100, x: "-50%" },
  verifying: { opacity: 1, y: 0, x: "-50%" },
};

const TEXT_VARIANTS = {
  initial: { opacity: 0, filter: "blur(10px)", y: -10 },
  animate: { opacity: 1, filter: "blur(0px)", y: 0 },
  exit: { opacity: 0, filter: "blur(10px)", y: 10 },
};

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


function ConditionalField({ open, label, error, ...props }) {
  const internalId = useId();
  const id = props.id || internalId;
  const errorId = `${id}-error`;

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="password-field-wrapper"
          layout="size"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ type: "spring", bounce: 0.15, visualDuration: 0.3 }}
          className="auth__field"
          style={{ marginTop: "0.85rem", overflow: "visible" }}
        >
          <label htmlFor={id}>{label}</label>
          <input
            autoFocus
            {...props}
            id={id}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
          />
          <AnimatePresence>
            {error && (
              <motion.p
                key="password-error"
                layout="position"
                id={errorId}
                className="auth__field-error"
                role="alert"
                aria-live="polite"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
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

function ResendButton({ onResend, disabled, initialCooldown = 30 }) {
  const [countdown, setCountdown] = useState(initialCooldown);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResend = async () => {
    if (countdown > 0 || disabled || loading) return;
    setLoading(true);
    try {
      const res = await onResend();
      setCountdown(res?.cooldown || 30);
    } catch {
      // Handled by parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className="resend"
      onClick={handleResend}
      disabled={countdown > 0 || disabled || loading}
      style={{ marginInline: "auto", marginTop: "0.75rem" }}
    >
      {loading ? (
        "Sending new code…"
      ) : countdown > 0 ? (
        `Didn't receive a code? Resend (${countdown}s)`
      ) : (
        "Didn't receive a code? Resend"
      )}
    </button>
  );
}

function SignUpInitialCard({ onOtpRequested }) {
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (!showPassword) return;
    const handleKeyUp = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setPassword("");
        setShowPassword(false);
        setPasswordError("");
      }
    };
    window.addEventListener("keyup", handleKeyUp);
    return () => window.removeEventListener("keyup", handleKeyUp);
  }, [showPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPasswordError("");

    const cleanEmail = emailAddress.trim().toLowerCase();
    if (!cleanEmail || !/\S+@\S+\.\S+/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!showPassword) {
      setShowPassword(true);
      return;
    }

    if (!password || password.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/signup/request-otp", {
        email: cleanEmail,
        password,
      });
      onOtpRequested(cleanEmail, data?.cooldown || 30);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send verification code. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div variants={SIGN_IN_VARIANTS} className="auth__card" initial="default">
      <AnimatePresence initial={false} mode="popLayout">
        {!showPassword ? (
          <motion.h3
            key="sign-in-title"
            className="auth__card-title"
            variants={TEXT_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            Create your Rise account
          </motion.h3>
        ) : (
          <motion.h3
            key="sign-up-title"
            className="auth__card-title"
            variants={TEXT_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            Choose a secure password
          </motion.h3>
        )}
      </AnimatePresence>
      <p className="auth__card-description">Start your learning journey with Rise</p>

      {error && <div className="auth__alert-error" role="alert">{error}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="auth__field">
          <label htmlFor="signup-email">Email address</label>
          <input
            id="signup-email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            value={emailAddress}
            disabled={loading}
            onChange={(e) => {
              setEmailAddress(e.target.value);
              if (error) setError("");
            }}
          />
        </div>

        <ConditionalField
          label="Password"
          name="password"
          id="signup-password"
          type="password"
          placeholder="Min. 8 characters"
          required
          disabled={loading}
          onBlur={({ target }) => {
            if (target.value.length > 0) setShowPassword(true);
          }}
          onChange={(e) => {
            setPassword(e.target.value);
            if (passwordError) setPasswordError("");
          }}
          value={password}
          open={showPassword}
          error={passwordError}
        />

        <motion.button
          layout="position"
          className="btn btn--primary"
          style={{ marginTop: "1.5rem" }}
          type="submit"
          disabled={loading}
          transition={{ type: "spring", bounce: 0.15, visualDuration: 0.3 }}
        >
          {loading ? <Spinner size={14} /> : <span>{showPassword ? "Continue" : "Next"}</span>}
        </motion.button>
      </form>

      <motion.p
        layout="position"
        className="auth__footer-note"
        transition={{ type: "spring", bounce: 0.15, visualDuration: 0.3 }}
      >
        Already have an account? <Link to="/login">Log in</Link>
      </motion.p>
    </motion.div>
  );
}

function VerifyCard({ email, initialCooldown, onCancel, onComplete }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/signup/verify-otp", {
        email,
        otp,
      });
      onComplete(data);
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid or expired code. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccessMsg("");
    try {
      const { data } = await api.post("/auth/signup/resend-otp", { email });
      setSuccessMsg("A fresh verification code has been sent!");
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to resend verification code.";
      setError(msg);
      throw err;
    }
  };

  const handleOtpChange = (val) => {
    setOtp(val);
    if (error) setError("");
  };

  return (
    <motion.div
      className="auth__card auth__card--overlay"
      variants={VERIFY_VARIANTS}
      initial="default"
      animate="verifying"
      exit="default"
    >
      <h3 className="auth__card-title">Verify your email</h3>
      <p className="auth__card-description">
        Enter the 6-digit code sent to <br />
        <strong>{email}</strong>
      </p>

      {error && <div className="auth__alert-error" role="alert">{error}</div>}
      {successMsg && (
        <div
          style={{
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            color: "#065f46",
            padding: "0.625rem 0.875rem",
            borderRadius: "0.625rem",
            fontSize: "0.8125rem",
            marginTop: "1rem",
            textAlign: "center"
          }}
          role="status"
        >
          {successMsg}
        </div>
      )}

      <form onSubmit={handleVerify}>
        <div className="auth__field" style={{ width: "min-content", marginInline: "auto" }}>
          <OTPInput
            autoFocus
            length={6}
            value={otp}
            onChange={handleOtpChange}
            disabled={loading}
          />
        </div>

        <ResendButton
          onResend={handleResend}
          disabled={loading}
          initialCooldown={initialCooldown}
        />

        <button
          className="btn btn--primary"
          style={{ marginTop: "1.5rem" }}
          type="submit"
          disabled={loading || otp.length < 6}
        >
          {loading ? <Spinner size={14} /> : <span>Verify and continue</span>}
        </button>
      </form>

      <button
        className="btn btn--ghost"
        onClick={onCancel}
        type="button"
        style={{ marginTop: "0.75rem" }}
        disabled={loading}
      >
        Start over
      </button>
    </motion.div>
  );
}

export default function SignupPage() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [cooldownTime, setCooldownTime] = useState(30);
  const [resetKey, setResetKey] = useState(0);

  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = (e) => setReducedMotion(e.matches);
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const handleOtpRequested = (email, cooldown) => {
    setSignupEmail(email);
    setCooldownTime(cooldown);
    setIsVerifying(true);
  };

  const handleReset = () => {
    setIsVerifying(false);
    setSignupEmail("");
    setResetKey((k) => k + 1);
  };

  const handleComplete = (data) => {
    if (data?.user) {
      login(data.user);
    }
    navigate("/");
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

        <motion.div animate={isVerifying ? "verifying" : "default"} className="auth__root">
          <div className="auth__card-container">
            <SignUpInitialCard
              key={resetKey}
              onOtpRequested={handleOtpRequested}
            />
            <AnimatePresence mode="popLayout">
              {isVerifying && (
                <VerifyCard
                  email={signupEmail}
                  initialCooldown={cooldownTime}
                  onCancel={handleReset}
                  onComplete={handleComplete}
                />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </MotionConfig>
  );
}
