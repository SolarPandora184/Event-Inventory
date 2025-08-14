import { useState, useEffect } from "react";
import { database } from "@/lib/firebase";
import { ref, set, onValue } from "firebase/database";

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
    // Listen for changes from Firebase only
    const eventNameRef = ref(database, "settings/eventName");
    const unsubscribe = onValue(eventNameRef, (snapshot) => {
      const firebaseEventName = snapshot.val();
      if (firebaseEventName) {
        setEventName(firebaseEventName);
      }
    });

    return () => unsubscribe();
  }, []);

  const updateEventName = async (name: string) => {
    setEventName(name);
    
    // Save to Firebase only
    try {
      await set(ref(database, "settings/eventName"), name);
    } catch (error) {
      console.error("Error saving event name to Firebase:", error);
    }
  };

  return {
    eventName,
    updateEventName
  };
}