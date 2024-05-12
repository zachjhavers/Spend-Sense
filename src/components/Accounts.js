import React, { useState, useEffect } from "react";
import { Container, Button, Table, Form, Modal } from "react-bootstrap";

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentAccount, setCurrentAccount] = useState({
    id: "",
    name: "",
    balance: "",
  });

  // Fetch accounts from the backend on component mount
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    const response = await fetch(
      "https://zh-finance-app-backend-cc570dfa2211.herokuapp.com/api/accounts",
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Assume you store your token in localStorage
        },
      }
    );
    const data = await response.json();
    if (response.ok) {
      setAccounts(data);
    } else {
      console.log("Failed to fetch accounts");
    }
  };

  const handleShow = (account = { id: "", name: "", balance: "" }) => {
    setCurrentAccount(account);
    setShowModal(true);
  };

  const handleClose = () => setShowModal(false);

  const handleSave = async () => {
    const method = currentAccount.id ? "PATCH" : "POST";
    const url = currentAccount.id
      ? `https://zh-finance-app-backend-cc570dfa2211.herokuapp.com/api/accounts/${currentAccount.id}`
      : "https://zh-finance-app-backend-cc570dfa2211.herokuapp.com/api/accounts";

    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Assume you store your token in localStorage
      },
      body: JSON.stringify({
        name: currentAccount.name,
        balance: parseFloat(currentAccount.balance),
      }),
    });

    if (response.ok) {
      fetchAccounts(); // Re-fetch accounts to update the list
      handleClose();
    } else {
      console.log("Failed to save account");
    }
  };

  const handleDelete = async (accountId) => {
    const response = await fetch(
      `https://zh-finance-app-backend-cc570dfa2211.herokuapp.com/api/accounts/${accountId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Assume you store your token in localStorage
        },
      }
    );

    if (response.ok) {
      setAccounts(accounts.filter((account) => account.id !== accountId)); // Update state locally
    } else {
      console.log("Failed to delete account");
    }
  };

  return (
    <Container>
      <Button onClick={() => handleShow()} className="mb-3">
        Add Account
      </Button>
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
            <tr key={account.id}>
              <td>{account.name}</td>
              <td>${account.balance}</td>
              <td>
                <Button variant="secondary" onClick={() => handleShow(account)}>
                  Edit
                </Button>{" "}
                <Button
                  variant="danger"
                  onClick={() => handleDelete(account.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

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
          <Button variant="secondary" onClick={handleClose}>
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
