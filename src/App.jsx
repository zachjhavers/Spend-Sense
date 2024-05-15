// Import Necessary Modules
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { Navbar, Nav, Container } from "react-bootstrap";
import { useSession, useDescope } from "@descope/react-sdk";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Accounts from "./components/Accounts";
import Budget from "./components/Budget";
import Ledger from "./components/Ledger";
import ProtectedRoute from "./components/ProtectedRoute";

// App Component
const App = () => {
  // Is Authenticated
  const { isAuthenticated, isSessionLoading } = useSession();
  // Use Descope
  const descope = useDescope();

  // If Session Is Loading
  if (isSessionLoading) {
    return <div>Loading...</div>;
  }

  // Handle Logout
  const handleLogout = () => {
    descope.logout();
  };

  // Render
  return (
    <Router>
      <Navbar bg="primary" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">
            Spend Sense
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ml-auto">
              {isAuthenticated ? (
                <>
                  <Nav.Link as={Link} to="/accounts">
                    Accounts
                  </Nav.Link>
                  <Nav.Link as={Link} to="/budget">
                    Budget
                  </Nav.Link>
                  <Nav.Link as={Link} to="/ledger">
                    Transactions
                  </Nav.Link>
                  <Nav.Link as={Link} to="/logout" onClick={handleLogout}>
                    Logout
                  </Nav.Link>
                </>
              ) : null}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container>
        <Routes>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" /> : <Login />}
          />
          <Route path="/logout" element={<Navigate to="/login" />} />
          <Route
            path="/accounts"
            element={
              <ProtectedRoute isLoggedIn={isAuthenticated}>
                <Accounts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/budget"
            element={
              <ProtectedRoute isLoggedIn={isAuthenticated}>
                <Budget />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ledger"
            element={
              <ProtectedRoute isLoggedIn={isAuthenticated}>
                <Ledger />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute isLoggedIn={isAuthenticated}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Container>
    </Router>
  );
};

export default App;
