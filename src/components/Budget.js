import React, { useState, useEffect } from "react";
import { Button, Card, Form, Table, Row, Col } from "react-bootstrap";

function Budget() {
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    category: "Needs",
    label: "",
  });
  const [editingId, setEditingId] = useState(null); // Track which expense is being edited

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch("https://api.spendsense.ca/api/expenses", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
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
          Authorization: `Bearer ${localStorage.getItem("token")}`,
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
        setEditingId(null); // Reset editing mode
      } else {
        console.log("Failed to save expense");
      }
    } catch (error) {
      console.error("Save Expense Error: ", error);
    }
  };

  const handleEdit = (expense) => {
    setNewExpense({
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      label: expense.label,
    });
    setEditingId(expense._id);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `https://api.spendsense.ca/api/expenses/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.ok) {
        setExpenses(expenses.filter((exp) => exp._id !== id));
      } else {
        console.log("Failed to delete expense");
      }
    } catch (error) {
      console.error("Delete Expense Error: ", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense({ ...newExpense, [name]: value });
  };

  return (
    <Card className="mt-4">
      <Card.Header>Monthly Budget</Card.Header>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Description</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Label</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense._id}>
              <td>{expense.description}</td>
              <td>${expense.amount.toFixed(2)}</td>
              <td>{expense.category}</td>
              <td>{expense.label || "No Label"}</td>
              <td className="d-flex flex-column">
                <Button
                  variant="primary"
                  size="sm"
                  className="mb-2" // Adds margin to the bottom of the 'Edit' button
                  onClick={() => handleEdit(expense)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
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
      <Card.Body>
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
              <Form.Group>
                <Form.Label>Label</Form.Label>
                <Form.Control
                  type="text"
                  name="label"
                  value={newExpense.label}
                  onChange={handleInputChange}
                />
              </Form.Group>

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
