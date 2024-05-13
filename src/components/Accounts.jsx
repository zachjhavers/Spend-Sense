import React, { useState, useEffect } from "react";
import { Container, Button, Table, Form, Modal, Card } from "react-bootstrap";
import { getSessionToken } from "@descope/react-sdk";

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentAccount, setCurrentAccount] = useState({
    id: "",
    name: "",
    balance: "",
  });
  const sessionToken = getSessionToken();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    const response = await fetch("https://api.spendsense.ca/api/accounts", {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + sessionToken,
      },
    });
    const data = await response.json();
    if (response.ok) {
      setAccounts(data);
    } else {
      console.error("Failed to fetch accounts");
    }
  };

  const handleShow = (account = { _id: "", name: "", balance: "" }) => {
    setCurrentAccount({
      id: account._id,
      name: account.name,
      balance: account.balance,
    });
    setShowModal(true);
  };

  const handleClose = () => setShowModal(false);

  const handleSave = async () => {
    const method = currentAccount.id ? "PATCH" : "POST";
    const url = currentAccount.id
      ? `https://api.spendsense.ca/api/accounts/${currentAccount.id}`
      : "https://api.spendsense.ca/api/accounts";

    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + sessionToken,
      },
      body: JSON.stringify({
        name: currentAccount.name,
        balance: parseFloat(currentAccount.balance),
      }),
    });

    if (response.ok) {
      fetchAccounts();
      handleClose();
    } else {
      console.log("Failed to save account");
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      console.log("Error: No ID provided for deletion");
      return;
    }
    const response = await fetch(
      `https://api.spendsense.ca/api/accounts/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + sessionToken,
        },
      }
    );

    if (response.ok) {
      fetchAccounts();
      setAccounts(accounts.filter((account) => account.id !== id));
    } else {
      console.log("Failed to delete account");
    }
  };

  return (
    <Container>
      <Card>
        <Card.Header>Accounts</Card.Header>
        <Card.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Account Name</th>
                <th>Balance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account._id}>
                  <td>{account.name}</td>
                  <td>${account.balance}</td>
                  <td className="d-flex flex-column">
                    <Button
                      variant="primary"
                      size="sm"
                      className="mb-2"
                      onClick={() => handleShow(account)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="mb-2"
                      onClick={() => handleDelete(account._id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Button onClick={() => handleShow()} className="mb-3">
            Add Account
          </Button>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {currentAccount.id ? "Edit Account" : "Add Account"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Account Name</Form.Label>
              <Form.Control
                type="text"
                value={currentAccount.name}
                onChange={(e) =>
                  setCurrentAccount({ ...currentAccount, name: e.target.value })
                }
                placeholder="Enter account name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Balance</Form.Label>
              <Form.Control
                type="number"
                value={currentAccount.balance}
                onChange={(e) =>
                  setCurrentAccount({
                    ...currentAccount,
                    balance: e.target.value,
                  })
                }
                placeholder="Enter balance"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Accounts;
