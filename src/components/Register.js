import React, { useState } from "react";
import { Form, Button, Container, Card } from "react-bootstrap";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch(
      "https://zh-finance-app-backend-cc570dfa2211.herokuapp.com/api/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      }
    );
    const data = await response.json();
    if (response.ok) {
      console.log("Registration successful");
    } else {
      console.log(`Failed to register: ${data.error}`);
    }
  };

  return (
    <Container className="mt-5 d-flex justify-content-center">
      <Card style={{ width: "24rem" }}>
        <Card.Body>
          <Card.Title>Register</Card.Title>
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
              Register
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Register;
