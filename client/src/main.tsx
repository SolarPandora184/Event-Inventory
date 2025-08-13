import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Handle GitHub Pages SPA routing
if (sessionStorage.redirect) {
  const redirect = sessionStorage.redirect;
  delete sessionStorage.redirect;
  if (redirect !== location.pathname) {
    history.replaceState(null, '', redirect);
  }
}

createRoot(document.getElementById("root")!).render(<App />);
