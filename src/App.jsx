import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";
import ExplorePage from "./pages/ExplorePage.jsx";
import CreateRequestPage from "./pages/CreateRequestPage.jsx";
import RequestDetailPage from "./pages/RequestDetailPage.jsx";
import ProtectedLayout from "./layouts/ProtectedLayout.jsx";
import "./App.css";
import "./netlify-scoped.css";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import MessagesPage from "./pages/MessagesPage.jsx";
import LeaderboardPage from "./pages/LeaderboardPage.jsx";
import AICenterPage from "./pages/AICenterPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/join" element={<Navigate to="/auth" replace />} />
        <Route path="/onboarding" element={<OnboardingPage />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/create" element={<CreateRequestPage />} />
          <Route path="/create-request" element={<CreateRequestPage />} />
          <Route path="/requests/:id" element={<RequestDetailPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/ai-center" element={<AICenterPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
