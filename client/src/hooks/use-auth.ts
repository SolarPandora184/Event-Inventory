import { useState, useEffect } from "react";

const AUTH_STORAGE_KEY = "aesa_admin_auth";
const EVENT_NAME_STORAGE_KEY = "aesa_event_name";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [pendingAuth, setPendingAuth] = useState(false);

  useEffect(() => {
    // Check if user has previously accepted cookie storage and is authenticated
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const authenticate = () => {
    setIsAuthenticated(true);
    setPendingAuth(true);
    setShowCookieConsent(true);
  };

  const acceptCookies = () => {
    localStorage.setItem(AUTH_STORAGE_KEY, "true");
    setShowCookieConsent(false);
    setPendingAuth(false);
  };

  const declineCookies = () => {
    setShowCookieConsent(false);
    setPendingAuth(false);
    // Authentication is still valid for this session, just not saved
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return {
    isAuthenticated,
    showCookieConsent,
    authenticate,
    acceptCookies,
    declineCookies,
    logout
  };
}

export function useEventName() {
  const [eventName, setEventName] = useState("Event");

  useEffect(() => {
    const stored = localStorage.getItem(EVENT_NAME_STORAGE_KEY);
    if (stored) {
      setEventName(stored);
    }
  }, []);

  const updateEventName = (name: string) => {
    setEventName(name);
    localStorage.setItem(EVENT_NAME_STORAGE_KEY, name);
  };

  return {
    eventName,
    updateEventName
  };
}