import { Navigate, Outlet } from "react-router-dom";
import { loadSession, isOnboardingComplete } from "../lib/storage.js";
import NetlifyTopbar from "../components/NetlifyTopbar.jsx";

export default function ProtectedLayout() {
  if (!loadSession()) {
    return <Navigate to="/auth" replace />;
  }
  if (!isOnboardingComplete()) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="nh-app site-shell">
      <NetlifyTopbar variant="app" />
      <Outlet />
    </div>
  );
}
