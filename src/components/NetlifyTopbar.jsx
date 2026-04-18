import { NavLink, Link, useNavigate } from "react-router-dom";
import { loadSession, clearSession, clearProfile } from "../lib/storage.js";

const linkClass = ({ isActive }) => (isActive ? "active" : undefined);

const btnNavClass =
  (base) =>
  ({ isActive }) =>
    [base, isActive ? "nh-topbar-cta--active" : ""].filter(Boolean).join(" ");

export default function NetlifyTopbar({ variant = "app" }) {
  const navigate = useNavigate();
  const session = loadSession();

  function handleLogout() {
    clearSession();
    clearProfile();
    navigate("/", { replace: true });
  }

  const appMainLinks = (
    <>
      <NavLink to="/dashboard" end className={linkClass}>
        Dashboard
      </NavLink>
      <NavLink to="/explore" className={linkClass}>
        Explore
      </NavLink>
      <NavLink to="/create-request" className={linkClass}>
        Create Request
      </NavLink>
      <NavLink to="/messages" className={linkClass}>
        Messages
      </NavLink>
      <NavLink to="/profile" className={linkClass}>
        Profile
      </NavLink>
    </>
  );

  return (
    <header className="topbar">
      {variant === "app" ? (
        <div className="container nh-topbar nh-topbar--app">
          <Link className="brand nh-topbar-brand" to={session ? "/dashboard" : "/"}>
            <span className="brand-badge">H</span>
            <span>HelpHub AI</span>
          </Link>

          <nav className="nh-topbar-nav nh-topbar-nav--app" aria-label="App">
            <div className="nh-app-navbar-links nav-links">{appMainLinks}</div>
          </nav>

          <div className="nh-topbar-tools nh-topbar-tools--app">
            <details className="nh-topbar-more">
              <summary className="btn btn-secondary btn-compact nh-topbar-more__btn">
                More
              </summary>
              <div className="nh-topbar-more__menu">
                <NavLink to="/leaderboard" className={linkClass}>
                  Leaderboard
                </NavLink>
                <NavLink to="/admin" className={linkClass}>
                  Admin
                </NavLink>
              </div>
            </details>
            <NavLink
              to="/notifications"
              className={btnNavClass("btn btn-secondary btn-compact nh-topbar-cta")}
            >
              Notifications
            </NavLink>
            <NavLink to="/ai-center" className={btnNavClass("btn btn-primary btn-compact nh-topbar-cta")}>
              Open AI Center
            </NavLink>
            <button type="button" className="btn btn-secondary btn-compact" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`container nh-topbar nh-topbar--inline${variant === "onboarding" ? " nh-topbar--onboarding" : ""}`}
        >
          <Link className="brand nh-topbar-brand" to={session ? "/dashboard" : "/"}>
            <span className="brand-badge">H</span>
            <span>HelpHub AI</span>
          </Link>
          {variant === "auth" ? (
            <nav className="nh-nav-scroll nav-links" aria-label="Primary">
              <NavLink to="/" end className={linkClass}>
                Home
              </NavLink>
              <NavLink to="/explore" className={linkClass}>
                Explore
              </NavLink>
              <NavLink to="/leaderboard" className={linkClass}>
                Leaderboard
              </NavLink>
              <NavLink to="/ai-center" className={linkClass}>
                AI Center
              </NavLink>
            </nav>
          ) : (
            <nav className="nh-nav-scroll nav-links" aria-label="Primary">
              <NavLink to="/auth" className={linkClass}>
                Back to login
              </NavLink>
            </nav>
          )}
        </div>
      )}
    </header>
  );
}
