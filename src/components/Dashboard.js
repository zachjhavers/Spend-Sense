import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table } from "react-bootstrap";
import { Pie } from "react-chartjs-2";
import { Bar } from "react-chartjs-2";
import { Line } from "react-chartjs-2";
import {
  Chart,
  BarElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  ArcElement,
} from "chart.js";

Chart.register(
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
);

function capitalize(text) {
  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function Dashboard() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState();
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState({ needs: 0, wants: 0 });

  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
    fetchExpenses();
  }, []);

  useEffect(() => {
    calculateTotalSpent();
  }, [transactions]);

  const calculateTotalSpent = () => {
    const total = transactions.reduce(
      (acc, t) => (t.type === "debit" ? acc + t.amount : acc),
      0
    );
    setTotalSpent(total);
  };

  const fetchAccounts = async () => {
    const response = await fetch(
      "https://zh-finance-app-backend-cc570dfa2211.herokuapp.com/api/accounts",
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (response.ok) {
      const data = await response.json();
      setAccounts(data);
    } else {
      console.log("Failed to fetch accounts");
    }
  };

  const fetchTransactions = async () => {
    const response = await fetch(
      "https://zh-finance-app-backend-cc570dfa2211.herokuapp.com/api/transactions",
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (response.ok) {
      const data = await response.json();
      setTransactions(data);
      setTotalSpent();
    } else {
      console.log("Failed to fetch transactions");
    }
  };

  const fetchExpenses = async () => {
    const response = await fetch(
      "https://zh-finance-app-backend-cc570dfa2211.herokuapp.com/api/expenses",
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    if (response.ok) {
      const data = await response.json();
      setExpenses(data);
      calculateTotalExpenses(data);
      setCategoryTotals(calculateCategoryTotals(data));
      setMonthlyBudget(calculateTotalExpenses(data));
    } else {
      console.log("Failed to fetch expenses");
    }
  };
  const calculateTotalExpenses = (expenses) => {
    const total = expenses.reduce((acc, expense) => acc + expense.amount, 0);
    setTotalExpenses(total);
  };

  const calculateCategoryTotals = (expenses) => {
    const totals = expenses.reduce((acc, expense) => {
      const category = expense.category.toLowerCase(); // assuming categories are 'Needs' or 'Wants'
      acc[category] = acc[category]
        ? acc[category] + expense.amount
        : expense.amount;
      return acc;
    }, {});

    return totals;
  };

  // Aggregate debit and credit totals
  const totals = transactions.reduce(
    (acc, transaction) => {
      if (transaction.type === "debit") {
        acc.debit += transaction.amount;
      } else if (transaction.type === "credit") {
        acc.credit += transaction.amount;
      }
      return acc;
    },
    { debit: 0, credit: 0 }
  );

  const debitCreditData = {
    labels: ["Outflow", "Inflow"],
    datasets: [
      {
        label: "Dollar Value",
        data: [totals.debit, totals.credit],
        backgroundColor: ["#FF6384", "#36A2EB"],
        borderColor: ["#FF6384", "#36A2EB"],
        borderWidth: 1,
      },
    ],
  };

  const debitCreditOptions = {
    indexAxis: "y", // Set the horizontal bar graph
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  const data = {
    labels: accounts.map((account) => account.name),
    datasets: [
      {
        label: "Account Balances",
        data: accounts.map((account) => account.balance),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  const budgetData = {
    labels: ["Needs", "Wants"],
    datasets: [
      {
        data: [categoryTotals.needs, categoryTotals.wants],
        backgroundColor: ["#FF6384", "#36A2EB"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB"],
      },
    ],
  };

  const budgetComparisonData = {
    labels: ["Monthly Budget", "Total Spent"],
    datasets: [
      {
        label: "Budget vs Expenses",
        data: [totalExpenses.toFixed(2), totals.debit],
        backgroundColor: ["#4BC0C0", "#FF6384"],
        borderColor: ["#4BC0C0", "#FF6384"],
        borderWidth: 1,
      },
    ],
  };

  const budgetComparisonOptions = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  return (
    <Container fluid>
      <Row className="mt-3">
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Account Balance</Card.Title>
              <Card.Text>
                <Pie data={data} options={options} />
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Recent Transactions</Card.Title>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 5).map((transaction) => (
                    <tr key={transaction._id}>
                      <td>{capitalize(transaction.description)}</td>
                      <td>${transaction.amount.toFixed(2)}</td>
                      <td>{capitalize(transaction.type)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Monthly Budget</Card.Title>
              <Pie data={budgetData} options={{ responsive: true }} />
              <Card.Text>${totalExpenses.toFixed(2)}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Col xs={12}>
        <Card>
          <Card.Body>
            <Card.Title>Debit vs Credit</Card.Title>
            <Bar data={debitCreditData} options={debitCreditOptions} />
          </Card.Body>
        </Card>
      </Col>
      <Col xs={12}>
        <Card>
          <Card.Body>
            <Card.Title>Budget vs Expenses</Card.Title>
            <Bar
              data={budgetComparisonData}
              options={budgetComparisonOptions}
            />
          </Card.Body>
        </Card>
      </Col>
    </Container>
  );
}

export default Dashboard;
