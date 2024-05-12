import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { Navbar, Nav, Container } from "react-bootstrap";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Accounts from "./components/Accounts";
import Budget from "./components/Budget";
import Ledger from "./components/Ledger";
import UseNavigator from "./components/UseNavigator";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
    setLoading(false); // Set loading to false after checking token
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem("token", token);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  if (loading) {
    return <div>Loading...</div>; // Or any other loading indicator
  }

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
              {isLoggedIn ? (
                <>
                  <Nav.Link as={Link} to="/accounts">
                    Accounts
                  </Nav.Link>
                  <Nav.Link as={Link} to="/budget">
                    Budget
                  </Nav.Link>
                  <Nav.Link as={Link} to="/ledger">
                    Ledger
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
            element={
              isLoggedIn ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
            }
          />
          <Route path="/register" element={<Register />} />
          <Route
            path="/logout"
            element={<UseNavigator setIsLoggedIn={setIsLoggedIn} />}
          />
          <Route
            path="/accounts"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Accounts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/budget"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Budget />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ledger"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Ledger />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
