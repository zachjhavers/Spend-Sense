import React from "react";
import { Container, Card } from "react-bootstrap";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { Descope } from "@descope/react-sdk";

function Login() {
  const navigate = useNavigate();

  const handleSuccess = (e) => {
    navigate("/");
  };

  const handleError = (err) => {
    console.error("Login failed", err);
  };

  return (
    <Container className="mt-5 d-flex justify-content-center" fluid>
      <Helmet>
        <title>Login - Spend Sense</title>
        <meta
          name="description"
          content="Log in to access your Spend Sense dashboard and manage your finances."
        />
      </Helmet>
      <Card>
        <Descope
          flowId="sign-up-or-in"
          theme="light"
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </Card>
    </Container>
  );
}

export default Login;
