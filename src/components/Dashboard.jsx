// Importing Required Libraries
import React, { useState, useEffect, useMemo } from "react";
import { Container, Row, Col, Card, Table } from "react-bootstrap";
import { Pie } from "react-chartjs-2";
import { Bar } from "react-chartjs-2";
import { parseISO, startOfMonth, format } from "date-fns";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import useDeepCompareEffect from "use-deep-compare-effect";
import { getSessionToken } from "@descope/react-sdk";
import {
  Chart,
  BarElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  ArcElement,
} from "chart.js";

// Registering Chart Components
Chart.register(
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
);

// Function To Capatalize First Letter Of Text
function capitalize(text) {
  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// Dashboard Function
function Dashboard() {
  // Const Variables For Dashboard Function
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState();
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState({ needs: 0, wants: 0 });
  const [groupedTransactions, setGroupedTransactions] = useState({});
  const [groupedExpenses, setGroupedExpenses] = useState({});
  const [groupedAccounts, setGroupedAccounts] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(
    format(startOfMonth(new Date()), "yyyy-MM")
  );
  const sessionToken = getSessionToken();
  const [advice, setAdvice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Const Variables For Month Filtering
  const filteredTransactions = groupedTransactions[selectedMonth] || [];
  const filteredExpenses = groupedExpenses[selectedMonth] || [];
  const filteredAccounts = groupedAccounts[selectedMonth] || [];

  // Function To Group By Month
  const groupDataByMonth = (data) => {
    return data.reduce((acc, item) => {
      const timestamp = item.timestamp || item.createdAt;

      if (!timestamp) {
        return acc;
      }

      try {
        const monthStart = format(startOfMonth(parseISO(timestamp)), "yyyy-MM");
        if (!acc[monthStart]) {
          acc[monthStart] = [];
        }
        acc[monthStart].push(item);
      } catch (error) {
        console.error("Error processing timestamp for item");
      }

      return acc;
    }, {});
  };

  // Function For Downloading Report
  const downloadCombinedReport = (contentIds, fileName) => {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    let currentHeight = 10;

    const captureContent = (id, index = 0) => {
      const input = document.getElementById(id);
      if (!input) {
        return;
      }

      html2canvas(input, {
        scale: 2,
        useCORS: true,
      })
        .then((canvas) => {
          const imgWidth = 170;
          const pageHeight = 83;
          let imgHeight = (canvas.height * imgWidth) / canvas.width;
          if (imgHeight > pageHeight) {
            imgHeight = pageHeight;
            const imgWidthAdjusted = (canvas.width * imgHeight) / canvas.height;
            pdf.addImage(
              canvas.toDataURL("image/png"),
              "PNG",
              (210 - imgWidthAdjusted) / 2,
              currentHeight,
              imgWidthAdjusted,
              imgHeight
            );
          } else {
            pdf.addImage(
              canvas.toDataURL("image/png"),
              "PNG",
              (210 - imgWidth) / 2,
              currentHeight,
              imgWidth,
              imgHeight
            );
          }

          currentHeight += imgHeight + 10;
          if (index < contentIds.length - 1 && currentHeight < 280) {
            captureContent(contentIds[index + 1], index + 1);
          } else {
            if (index < contentIds.length - 1) {
              pdf.addPage();
              currentHeight = 10;
              captureContent(contentIds[index + 1], index + 1);
            } else {
              pdf.save(`${fileName}-${new Date().toISOString()}.pdf`);
            }
          }
        })
        .catch((err) => {
          console.error("Failed to capture element");
        });
    };

    captureContent(contentIds[0]);
  };

  // Use Effect For Grabbing Data
  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
    fetchExpenses();
  }, []);

  // Use Effect For Grabbing By Month
  useEffect(() => {
    const fetchData = async () => {
      const transactionsResponse = await fetch(
        "https://api.spendsense.ca/api/transactions",
        {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + sessionToken,
          },
        }
      );
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setGroupedTransactions(groupDataByMonth(transactionsData));
      } else {
        console.log("Failed to fetch transactions");
      }

      const expensesResponse = await fetch(
        "https://api.spendsense.ca/api/expenses",
        {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + sessionToken,
          },
        }
      );
      if (expensesResponse.ok) {
        const expensesData = await expensesResponse.json();
        setGroupedExpenses(groupDataByMonth(expensesData));
      } else {
        console.log("Failed to fetch expenses");
      }

      const accountsResponse = await fetch(
        "https://api.spendsense.ca/api/accounts",
        {
          headers: {
            Accept: "application/json",
            Authorization: "Bearer " + sessionToken,
          },
        }
      );
      if (accountsResponse.ok) {
        const accountsData = await accountsResponse.json();
        setGroupedAccounts(groupDataByMonth(accountsData));
      } else {
        console.error("Failed to fetch accounts");
      }
    };

    fetchData();
  }, []);

  // Use Effect For Calculating Total Spent
  useEffect(() => {
    calculateTotalSpent();
  }, [transactions]);

  // Function For Calculating Total Spent
  const calculateTotalSpent = () => {
    const total = transactions.reduce(
      (acc, t) => (t.type === "debit" ? acc + t.amount : acc),
      0
    );
    setTotalSpent(total);
  };

  // Functions For Fetching User Data
  const fetchAccounts = async () => {
    const response = await fetch("https://api.spendsense.ca/api/accounts", {
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + sessionToken,
      },
    });
    if (response.ok) {
      const data = await response.json();
      setAccounts(data);
    } else {
      console.error("Failed to fetch accounts");
    }
  };

  const fetchTransactions = async () => {
    const response = await fetch("https://api.spendsense.ca/api/transactions", {
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + sessionToken,
      },
    });
    if (response.ok) {
      const data = await response.json();
      setTransactions(data);
    } else {
      console.error("Failed to fetch transactions");
    }
  };

  // Function For Fetching Expenses
  const fetchExpenses = async () => {
    const response = await fetch("https://api.spendsense.ca/api/expenses", {
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + sessionToken,
      },
    });
    if (response.ok) {
      const data = await response.json();
      setExpenses(data);
      calculateTotalExpenses(data);
      setCategoryTotals(calculateCategoryTotals(data));
      setMonthlyBudget(calculateTotalExpenses(data));
    } else {
      console.error("Failed to fetch expenses");
    }
  };

  // Function For Calculating Total Expenses
  const calculateTotalExpenses = (expenses) => {
    const total = expenses.reduce((acc, expense) => acc + expense.amount, 0);
    setTotalExpenses(total);
  };

  // Function For Calculating Category Totals
  const calculateCategoryTotals = (expenses) => {
    const totals = expenses.reduce((acc, expense) => {
      const category = expense.category.toLowerCase();
      acc[category] = acc[category]
        ? acc[category] + expense.amount
        : expense.amount;
      return acc;
    }, {});

    return totals;
  };

  const formatAdvice = (adviceText) => {
    // Split and filter empty lines if necessary
    return adviceText.split("\n").filter((line) => line.trim() !== "");
  };

  // Function For Fetching Financial Advice
  const fetchFinancialAdvice = async () => {
    setIsLoading(true);
    setError("");

    // Prepare the data to send
    const financialData = {
      accounts,
      transactions: filteredTransactions,
      expenses: filteredExpenses,
    };

    try {
      const response = await fetch("https://api.spendsense.ca/api/advice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + sessionToken,
        },
        body: JSON.stringify(financialData), // Send the financial data as JSON
      });
      if (response.ok) {
        const data = await response.json();
        setAdvice(formatAdvice(data.message.content)); // Ensure to capture the correct data key for advice
      } else {
        throw new Error(`Failed to fetch financial advice: ${response.status}`);
      }
    } catch (err) {
      setError("Failed to fetch financial advice. Please try again later.");
      console.error(err.message);
    }
    setIsLoading(false);
  };

  // Ensure this function is only called once or based on specific dependencies
  useDeepCompareEffect(() => {
    fetchFinancialAdvice();
  }, [filteredAccounts, filteredTransactions, filteredExpenses]);

  // Functions For Generating Chart Data
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

  // Data For Debit vs Credit Chart
  const debitCreditData = {
    labels: ["Expense", "Income"],
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

  // Options For Debit vs Credit Chart
  const debitCreditOptions = {
    indexAxis: "y",
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

  // Data For Account Balance Chart
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

  // Options For Account Balance Chart
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  // Data For Budget Chart
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

  // Data For Budget Comparison Chart
  const budgetComparisonData = {
    labels: ["Monthly Budget", "Total Spent"],
    datasets: [
      {
        label: "Budget vs Total Spent",
        data: [totalExpenses.toFixed(2), totals.debit],
        backgroundColor: ["#4BC0C0", "#FF6384"],
        borderColor: ["#4BC0C0", "#FF6384"],
        borderWidth: 1,
      },
    ],
  };

  // Options For Budget Comparison Chart
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

  // Render
  return (
    <Container fluid>
      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              <Card.Title>Month</Card.Title>
              <div className="d-flex flex-column">
                <div className="mb-3">
                  {Object.keys(groupedTransactions).length > 0 ? (
                    <select
                      id="monthSelector"
                      className="form-select"
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      value={selectedMonth}
                    >
                      {Object.keys(groupedTransactions).map((month) => (
                        <option key={month} value={month}>
                          {format(new Date(month + "-01"), "MMMM yyyy")}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-center p-3">Not enough data yet.</div>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              <Card.Title>Insights</Card.Title>
              <div className="d-flex flex-column">
                {isLoading ? (
                  <div>Loading advice...</div>
                ) : error ? (
                  <div style={{ color: "red" }}>{error}</div>
                ) : advice.length > 0 ? (
                  advice.map((item, index) => (
                    <p key={index}>
                      {item.includes("**") ? (
                        <strong>{item.replace(/\*\*/g, "")}</strong>
                      ) : (
                        item
                      )}
                    </p>
                  ))
                ) : (
                  <div>No Insights Yet.</div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              <Card.Title>Recent Transactions</Card.Title>
              {transactions.length > 0 ? (
                <Table responsive="sm" striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 10).map((transaction) => (
                      <tr key={transaction._id}>
                        <td>{capitalize(transaction.description)}</td>
                        <td>${transaction.amount.toFixed(2)}</td>
                        <td>
                          {transaction.type === "debit"
                            ? "Expense"
                            : "Income / Debt"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center p-3">No transactions yet.</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col md={6} className="d-flex">
          <Card className="flex-grow-1">
            <Card.Body>
              <Card.Title>Account Balance</Card.Title>
              {data.labels.length > 0 ? (
                <Pie data={data} options={options} id="accountBalanceChart" />
              ) : (
                <div className="text-center p-3">No data available.</div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="d-flex">
          <Card className="flex-grow-1">
            <Card.Body>
              <Card.Title>Monthly Budget</Card.Title>
              {totalExpenses > 0 ? (
                <>
                  <Pie data={budgetData} options={{ responsive: true }} />
                  <Card.Text>${totalExpenses.toFixed(2)}</Card.Text>
                </>
              ) : (
                <div className="text-center p-3">No data available.</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Col xs={12}>
        <Card>
          <Card.Body>
            <Card.Title>Income vs Expenses</Card.Title>
            {transactions.length > 0 ? (
              <Bar
                data={debitCreditData}
                options={debitCreditOptions}
                id="debitCreditChart"
              />
            ) : (
              <div className="text-center p-3">No data available.</div>
            )}
          </Card.Body>
        </Card>
      </Col>
      <Col xs={12}>
        <Card>
          <Card.Body>
            <Card.Title>Budget vs Total Spent</Card.Title>
            {totalExpenses > 0 || totals.debit > 0 ? (
              <Bar
                data={budgetComparisonData}
                options={budgetComparisonOptions}
                id="budgetComparisonChart"
              />
            ) : (
              <div className="text-center p-3">No data available.</div>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Container>
  );
}

export default Dashboard;
