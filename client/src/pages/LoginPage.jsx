// client/src/pages/LoginPage.jsx
import { Link, useLocation } from "react-router-dom";
import PasswordlessAuthCard from "../components/auth/PasswordlessAuthCard";
import "../styles/SignupMotion.css";

export default function LoginPage() {
  const location = useLocation();
  const infoMessage = location.state?.message;

  return (
    <div className="rise-stage">
      <Link to="/" className="auth__header-logo" aria-label="Rise Home">
        <img src="/rise_logo.svg" alt="Rise" />
      </Link>

      <div className="auth__root">
        <div className="auth__card-container">
          <PasswordlessAuthCard mode="login" infoMessage={infoMessage} />
        </div>
      </div>
    </div>
  );
}
