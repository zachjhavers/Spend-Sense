// Importing necessary libraries and modules
import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Card,
  Table,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import { getSessionToken } from "@descope/react-sdk";

// Capitalize the first letter of each word
function capitalize(text) {
  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// Ledger component
function Ledger() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("credit");
  const [description, setDescription] = useState("");
  const sessionToken = getSessionToken();

  // Fetch accounts and transactions
  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
  }, []);

  // Fetch accounts
  async function fetchAccounts() {
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
      console.log("Failed to fetch accounts");
    }
  }

  // Fetch transactions
  async function fetchTransactions() {
    const response = await fetch("https://api.spendsense.ca/api/transactions", {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + sessionToken,
      },
    });
    const data = await response.json();
    if (response.ok) {
      setTransactions(data);
    } else {
      console.log("Failed to fetch transactions");
    }
  }

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch("https://api.spendsense.ca/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + sessionToken,
      },
      body: JSON.stringify({
        accountId: selectedAccount,
        amount: Number(amount),
        type,
        description,
      }),
    });

    if (response.ok) {
      fetchTransactions();
      fetchAccounts();
    } else {
      const errorData = await response.json();
      console.log(`Failed to submit transaction: ${errorData.message}`);
    }
  };

  // Handle delete transaction
  const handleDeleteTransaction = async (transactionId) => {
    try {
      const response = await fetch(
        `https://api.spendsense.ca/api/transactions/${transactionId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + sessionToken,
          },
        }
      );
      if (response.ok) {
        setTransactions(
          transactions.filter(
            (transaction) => transaction._id !== transactionId
          )
        );
        console.log("Transaction deleted successfully!");
      } else {
        console.log("Failed to delete transaction");
      }
    } catch (error) {
      console.error("Error deleting transaction");
    }
  };

  // Render Ledger component
  return (
    <Container className="mt-4">
      <Row>
        <Col lg={12}>
          <Card>
            <Card.Header>Manage Transactions</Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6} lg={3}>
                    <Form.Group>
                      <Form.Label>Account</Form.Label>
                      <Form.Control
                        as="select"
                        value={selectedAccount}
                        onChange={(e) => setSelectedAccount(e.target.value)}
                        required
                      >
                        <option value="">Select an Account</option>
                        {accounts.map((account) => (
                          <option key={account._id} value={account._id}>
                            {account.name} - ${account.balance.toFixed(2)}
                          </option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                  </Col>
                  <Col md={6} lg={3}>
                    <Form.Group>
                      <Form.Label>Amount</Form.Label>
                      <Form.Control
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} lg={3}>
                    <Form.Group>
                      <Form.Label>Type</Form.Label>
                      <Form.Control
                        as="select"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        required
                      >
                        <option value="credit">Income / Debt</option>
                        <option value="debit">Expense</option>
                      </Form.Control>
                    </Form.Group>
                  </Col>
                  <Col md={6} lg={3}>
                    <Form.Group>
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button type="submit" className="mt-2">
                  Submit Transaction
                </Button>
              </Form>
              <Table striped bordered hover size="sm" className="mt-3">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction._id}>
                      <td>{transaction.description}</td>
                      <td>${transaction.amount.toFixed(2)}</td>
                      <td>
                        {transaction.type === "debit"
                          ? "Expense"
                          : "Income / Debt"}
                      </td>
                      <td className="d-flex flex-column">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            handleDeleteTransaction(transaction._id)
                          }
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Ledger;
