import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveSession, isOnboardingComplete } from "../lib/storage.js";
import {
  initUsersIfEmpty,
  verifyLogin,
  registerUser,
  SEED_USERS,
} from "../lib/usersStorage.js";
import NetlifyTopbar from "../components/NetlifyTopbar.jsx";

const ROLES = [
  { value: "need_help", label: "Need Help" },
  { value: "can_help", label: "Can Help" },
  { value: "both", label: "Both" },
];

function roleLabel(value) {
  return ROLES.find((r) => r.value === value)?.label ?? value;
}

function startSession(user) {
  saveSession({
    userId: user.id,
    displayName: user.name,
    email: user.email.trim(),
    role: user.role,
    roleLabel: roleLabel(user.role),
    loggedInAt: new Date().toISOString(),
  });
}

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");

  const [loginEmail, setLoginEmail] = useState(SEED_USERS[0].email);
  const [loginPassword, setLoginPassword] = useState("demo1234");
  const [demoPick, setDemoPick] = useState(SEED_USERS[0].id);

  const [signName, setSignName] = useState("");
  const [signEmail, setSignEmail] = useState("");
  const [signPassword, setSignPassword] = useState("");
  const [signConfirm, setSignConfirm] = useState("");
  const [signRole, setSignRole] = useState(ROLES[0].value);

  const [error, setError] = useState("");

  useEffect(() => {
    initUsersIfEmpty();
  }, []);

  function applyDemoPick(id) {
    setDemoPick(id);
    const u = SEED_USERS.find((x) => x.id === id);
    if (u) {
      setLoginEmail(u.email);
      setLoginPassword(u.password);
    }
  }

  function handleLogin(e) {
    e.preventDefault();
    setError("");
    const user = verifyLogin(loginEmail, loginPassword);
    if (!user) {
      setError("Invalid email or password.");
      return;
    }
    startSession(user);
    navigate(isOnboardingComplete() ? "/dashboard" : "/onboarding", { replace: true });
  }

  function handleSignup(e) {
    e.preventDefault();
    setError("");
    if (!signName.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!signEmail.trim()) {
      setError("Please enter your email.");
      return;
    }
    if (signPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (signPassword !== signConfirm) {
      setError("Passwords do not match.");
      return;
    }
    const res = registerUser({
      name: signName,
      email: signEmail,
      password: signPassword,
      role: signRole,
    });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    startSession(res.user);
    navigate(isOnboardingComplete() ? "/dashboard" : "/onboarding", { replace: true });
  }

  return (
    <div className="nh-app">
      <NetlifyTopbar variant="auth" />

      <main className="auth-layout container">
        <div className="auth-wrap">
          <section className="auth-side fade-in" aria-labelledby="auth-info-title">
            <p className="eyebrow">Community access</p>
            <h1 id="auth-info-title" style={{ fontSize: "clamp(2.4rem, 4vw, 4rem)" }}>
              Enter the support network.
            </h1>
            <p>
              Choose a demo identity, set your role, and jump into a multi-page product flow
              designed for asking, offering, and tracking help with a premium interface.
            </p>
            <ul>
              <li>Role-based entry for Need Help, Can Help, or Both</li>
              <li>Direct path into dashboard, requests, AI Center, and community feed</li>
              <li>Persistent demo session powered by LocalStorage</li>
            </ul>
          </section>

          <section className="auth-card fade-in" aria-labelledby="auth-form-title">
            <p className="section-kicker">Login / Signup</p>
            <h2 id="auth-form-title">Authenticate your community profile</h2>

            <div className="auth-tabs" role="tablist" aria-label="Auth mode">
              <button
                type="button"
                role="tab"
                aria-selected={mode === "login"}
                className={`auth-tab ${mode === "login" ? "auth-tab--active" : ""}`}
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
              >
                Log in
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "signup"}
                className={`auth-tab ${mode === "signup" ? "auth-tab--active" : ""}`}
                onClick={() => {
                  setMode("signup");
                  setError("");
                }}
              >
                Sign up
              </button>
            </div>

            {mode === "login" ? (
              <form className="stack" onSubmit={handleLogin}>
                <div className="field">
                  <label htmlFor="auth-demo">Select demo user</label>
                  <select id="auth-demo" value={demoPick} onChange={(e) => applyDemoPick(e.target.value)}>
                    {SEED_USERS.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="auth-grid">
                  <div className="field">
                    <label htmlFor="auth-email">Email</label>
                    <input
                      id="auth-email"
                      type="email"
                      autoComplete="username"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="auth-password">Password</label>
                    <input
                      id="auth-password"
                      type="password"
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>
                </div>

                {error ? <p className="auth-error">{error}</p> : null}

                <button type="submit" className="btn btn-primary btn--block">
                  Continue to dashboard
                </button>
              </form>
            ) : (
              <form className="stack" onSubmit={handleSignup}>
                <div className="field">
                  <label htmlFor="sign-name">Full name</label>
                  <input
                    id="sign-name"
                    value={signName}
                    onChange={(e) => setSignName(e.target.value)}
                    autoComplete="name"
                    placeholder="Your name"
                  />
                </div>

                <div className="field">
                  <label htmlFor="sign-email">Email</label>
                  <input
                    id="sign-email"
                    type="email"
                    value={signEmail}
                    onChange={(e) => setSignEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </div>

                <div className="field">
                  <label htmlFor="sign-role">Role selection</label>
                  <select id="sign-role" value={signRole} onChange={(e) => setSignRole(e.target.value)}>
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="auth-grid">
                  <div className="field">
                    <label htmlFor="sign-pass">Password</label>
                    <input
                      id="sign-pass"
                      type="password"
                      value={signPassword}
                      onChange={(e) => setSignPassword(e.target.value)}
                      autoComplete="new-password"
                      placeholder="Min 6 characters"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="sign-confirm">Confirm</label>
                    <input
                      id="sign-confirm"
                      type="password"
                      value={signConfirm}
                      onChange={(e) => setSignConfirm(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                {error ? <p className="auth-error">{error}</p> : null}

                <button type="submit" className="btn btn-primary btn--block">
                  Create account and continue
                </button>
              </form>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
