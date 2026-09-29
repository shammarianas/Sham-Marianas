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

// Hydrate only pre-rendered pages. The initial loader has a wrapper element
// around .loader-wrap, so a broad :not() selector incorrectly treated it as content.
const hasInitialLoader = rootElement?.querySelector(".loader-wrap");
const hasRealContent = Boolean(rootElement?.firstElementChild && !hasInitialLoader);
if (hasRealContent) {
  ReactDOM.hydrateRoot(rootElement, app);
} else {
  ReactDOM.createRoot(rootElement).render(app);
}
