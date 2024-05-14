// Import Dependancies
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import { Analytics } from "@vercel/analytics/react";
import CopyrightFooter from "./components/CopyRightFooter";
import { AuthProvider } from "@descope/react-sdk";

// Dont Print Console Logs In Production
if (process.env.NODE_ENV === "production") {
  console.log = () => {};
  console.error = () => {};
  console.debug = () => {};
}

// Serve The App
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider projectId={process.env.REACT_APP_PROJECT_ID}>
      <App />
      <CopyrightFooter />
      <Analytics />
    </AuthProvider>
  </React.StrictMode>
);
