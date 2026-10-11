// client/src/pages/LoginPage.jsx
import { Link } from "react-router-dom";
import PasswordlessAuthCard from "../components/auth/PasswordlessAuthCard";
import "../styles/SignupMotion.css";

export default function LoginPage() {
  return (
    <div className="rise-stage">
      <Link to="/" className="auth__header-logo" aria-label="Rise Home">
        <img src="/rise_logo.svg" alt="Rise" />
      </Link>

      <div className="auth__root">
        <div className="auth__card-container">
          <PasswordlessAuthCard mode="login" />
        </div>
      </div>
    </div>
  );
}
