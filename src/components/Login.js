import React, { useState } from "react";
import { Card, Form, Button, Container } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom"; // Import Link from react-router-dom
import { Helmet } from "react-helmet";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const response = await fetch("https://api.spendsense.ca/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      onLogin(data.token); // Call the function passed through props
      navigate("/");
    } else {
      console.log("Failed to log in");
    }
  };

  return (
    <Container className="mt-5 d-flex justify-content-center">
      <Helmet>
        <title>Login - Spend Sense</title>
        <meta
          name="description"
          content="Log in to access your Spend Sense dashboard and manage your finances."
        />
      </Helmet>
      <Card style={{ width: "24rem" }}>
        <Card.Body>
          <Card.Title>Login</Card.Title>
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              style={{ width: "100%", marginBottom: "10px" }}
            >
              Login
            </Button>
            <Button
              variant="secondary"
              as={Link}
              to="/register"
              style={{ width: "100%" }}
            >
              Register
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Login;
