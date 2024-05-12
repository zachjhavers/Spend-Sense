import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Navbar, Nav, Container } from "react-bootstrap";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Accounts from "./components/Accounts";
import Budget from "./components/Budget";
import Ledger from "./components/Ledger";
import UseNavigator from "./components/UseNavigator"; // This is a new component to handle navigation.

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (token) => {
    localStorage.setItem("token", token);
    setIsLoggedIn(true);
  };

  return (
    <Router>
      <Navbar bg="primary" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">
            Financial Dashboard
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />{" "}
          {/* Button to toggle the Navbar collapse on small screens */}
          <Navbar.Collapse id="basic-navbar-nav">
            {" "}
            {/* Content area that will collapse in mobile view */}
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
                  <Nav.Link as={Link} to="/logout">
                    Logout
                  </Nav.Link>
                </>
              ) : (
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route
            path="/logout"
            element={<UseNavigator setIsLoggedIn={setIsLoggedIn} />}
          />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/ledger" element={<Ledger />} />
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
