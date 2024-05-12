import React, { useState } from "react";
import { Card, Form, Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const response = await fetch(
      "https://zh-finance-app-backend-cc570dfa2211.herokuapp.com/api/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      }
    );
    const data = await response.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      onLogin(data.token); // Call the function passed through props
      navigate("/");
      console.log("Login successful");
    } else {
      console.log("Failed to log in");
    }
  };

  return (
    <Container className="mt-5 d-flex justify-content-center">
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
            <Button variant="primary" type="submit" style={{ width: "100%" }}>
              Login
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Login;
