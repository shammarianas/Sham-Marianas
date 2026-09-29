import "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { UserProvider } from "./Context/UserProvider.jsx";
import { HelmetProvider } from "react-helmet-async";
import { Buffer } from "buffer";

window.Buffer = Buffer;

const rootElement = document.getElementById("root");

const app = (
  <HelmetProvider>
    <UserProvider>
      <App />
    </UserProvider>
  </HelmetProvider>
);

// If rootElement has real rendered content (not just the initial loader), hydrate it; otherwise createRoot
const hasRealContent = rootElement && rootElement.querySelector(":not(.loader-wrap)");
if (hasRealContent) {
  ReactDOM.hydrateRoot(rootElement, app);
} else {
  ReactDOM.createRoot(rootElement).render(app);
}