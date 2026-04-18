export const SESSION_KEY = "helplytics_session";
export const PROFILE_KEY = "helplytics_profile";

export function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function clearProfile() {
  localStorage.removeItem(PROFILE_KEY);
}

/** True when profile exists, is marked complete, and belongs to the logged-in user. */
export function isOnboardingComplete() {
  const session = loadSession();
  const profile = loadProfile();
  if (!session || !profile?.onboardingComplete) return false;
  return profile.userId === session.userId;
}
