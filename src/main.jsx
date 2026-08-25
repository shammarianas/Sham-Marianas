import React from "react";
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

if (rootElement.hasChildNodes()) {
  ReactDOM.hydrateRoot(rootElement, app);
} else {
  ReactDOM.createRoot(rootElement).render(app);
}