import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { loadSession, clearSession, clearProfile } from "../lib/storage.js";

const navClass = ({ isActive }) =>
  isActive ? "app-navbar__link app-navbar__link--active" : "app-navbar__link";

export default function AppNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = loadSession();

  const createNavClass = ({ isActive }) => {
    const onCreate =
      isActive ||
      location.pathname === "/create" ||
      location.pathname === "/create-request";
    return onCreate ? "app-navbar__link app-navbar__link--active" : "app-navbar__link";
  };

  function handleLogout() {
    clearSession();
    clearProfile();
    navigate("/", { replace: true });
  }

  return (
    <header className="app-navbar">
      <div className="app-navbar__bar">
        <div className="app-navbar__inner">
          <Link to="/dashboard" className="nav__brand nav__brand--link">
            <span className="nav__logo nav__logo--square" aria-hidden>
              H
            </span>
            <span className="nav__title">HelpHub AI</span>
          </Link>

          <nav className="app-navbar__links" aria-label="App">
            <NavLink to="/dashboard" end className={navClass}>
              Dashboard
            </NavLink>
            <NavLink to="/explore" className={navClass}>
              Explore
            </NavLink>
            <NavLink to="/create-request" className={createNavClass}>
              Create
            </NavLink>
            <NavLink to="/messages" className={navClass}>
              Messages
            </NavLink>
            <NavLink to="/leaderboard" className={navClass}>
              Leaderboard
            </NavLink>
            <NavLink to="/ai-center" className={navClass}>
              AI Center
            </NavLink>
            <NavLink to="/notifications" className={navClass}>
              Notifications
            </NavLink>
            <NavLink to="/profile" className={navClass}>
              Profile
            </NavLink>
            <NavLink to="/admin" className={navClass}>
              Admin
            </NavLink>
          </nav>

          <div className="app-navbar__actions">
            {session ? (
              <span className="app-navbar__user" title={session.email}>
                {session.displayName}
              </span>
            ) : null}
            <Link to="/" className="btn btn--ghost btn--sm">
              Landing
            </Link>
            <button type="button" className="btn btn--primary btn--sm" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
