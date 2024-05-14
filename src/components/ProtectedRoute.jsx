// Import Necessary Modules
import React from "react";
import { Navigate } from "react-router-dom";

// Protected Route Component
const ProtectedRoute = ({ children, isLoggedIn }) => {
  // Return If Logged In
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
