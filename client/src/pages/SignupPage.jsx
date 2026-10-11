// client/src/pages/SignupPage.jsx
import { Link } from "react-router-dom";
import PasswordlessAuthCard from "../components/auth/PasswordlessAuthCard";
import "../styles/SignupMotion.css";

export default function SignupPage() {
  return (
    <div className="rise-stage">
      <Link to="/" className="auth__header-logo" aria-label="Rise Home">
        <img src="/rise_logo.svg" alt="Rise" />
      </Link>

      <div className="auth__root">
        <div className="auth__card-container">
          <PasswordlessAuthCard mode="signup" />
        </div>
      </div>
    </div>
  );
}
