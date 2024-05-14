// Import necessary libraries
import React, { useState, useEffect } from "react";
import { Button, Card, Form, Table, Row, Col } from "react-bootstrap";
import { getSessionToken } from "@descope/react-sdk";

// Budget component
function Budget() {
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    category: "Needs",
    label: "",
  });

  // Get session token
  const [editingId, setEditingId] = useState(null);
  const sessionToken = getSessionToken();

  // Fetch expenses
  useEffect(() => {
    fetchExpenses();
  }, []);

  // Fetch expenses
  const fetchExpenses = async () => {
    try {
      const response = await fetch("https://api.spendsense.ca/api/expenses", {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + sessionToken,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setExpenses(data);
      } else {
        console.log("Failed to fetch expenses");
      }
    } catch (error) {
      console.error("Fetch Error: ", error);
    }
  };

  // Add or update expense
  const handleAddOrUpdateExpense = async () => {
    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `https://api.spendsense.ca/api/expenses/${editingId}`
      : "https://api.spendsense.ca/api/expenses";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + sessionToken,
        },
        body: JSON.stringify(newExpense),
      });
      const savedExpense = await response.json();
      if (response.ok) {
        setExpenses(
          editingId
            ? expenses.map((exp) =>
                exp._id === savedExpense._id ? savedExpense : exp
              )
            : [...expenses, savedExpense]
        );
        setNewExpense({
          description: "",
          amount: "",
          category: "Needs",
          label: "",
        });
        setEditingId(null);
      } else {
        console.log("Failed to save expense");
      }
    } catch (error) {
      console.error("Save Expense Error");
    }
  };

  // Edit expense
  const handleEdit = (expense) => {
    setNewExpense({
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      label: expense.label,
    });
    setEditingId(expense._id);
  };

  // Delete expense
  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `https://api.spendsense.ca/api/expenses/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + sessionToken,
          },
        }
      );
      if (response.ok) {
        setExpenses(expenses.filter((exp) => exp._id !== id));
      } else {
        console.log("Failed to delete expense");
      }
    } catch (error) {
      console.error("Delete Expense Error");
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense({ ...newExpense, [name]: value });
  };

  // Render component
  return (
    <Card className="mt-4">
      <Card.Header>Monthly Budget</Card.Header>
      <Card.Body>
        <Table striped bordered hover size="sm" className="mt-3">
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense._id}>
                <td>{expense.description}</td>
                <td>${expense.amount.toFixed(2)}</td>
                <td>{expense.category}</td>
                <td className="d-flex flex-column">
                  <Button
                    variant="primary"
                    size="sm"
                    className="mb-2"
                    onClick={() => handleEdit(expense)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleDelete(expense._id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  type="text"
                  name="description"
                  value={newExpense.description}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Amount</Form.Label>
                <Form.Control
                  type="number"
                  name="amount"
                  value={newExpense.amount}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Category</Form.Label>
                <Form.Control
                  as="select"
                  name="category"
                  value={newExpense.category}
                  onChange={handleInputChange}
                >
                  <option value="Needs">Needs</option>
                  <option value="Wants">Wants</option>
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Button className="mt-4" onClick={handleAddOrUpdateExpense}>
                {editingId ? "Update Expense" : "Add Expense"}
              </Button>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default Budget;
