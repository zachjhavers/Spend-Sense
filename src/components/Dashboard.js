import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table } from "react-bootstrap";
import { Pie } from "react-chartjs-2";
import { Bar } from "react-chartjs-2";
import { parseISO, startOfMonth, format } from "date-fns";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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
  const [groupedTransactions, setGroupedTransactions] = useState({});
  const [groupedExpenses, setGroupedExpenses] = useState({});
  const [groupedAccounts, setGroupedAccounts] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(
    format(startOfMonth(new Date()), "yyyy-MM")
  );

  const filteredTransactions = groupedTransactions[selectedMonth] || [];
  const filteredExpenses = groupedExpenses[selectedMonth] || [];
  const filteredAccounts = groupedAccounts[selectedMonth] || [];

  const groupDataByMonth = (data) => {
    return data.reduce((acc, item) => {
      // Attempt to find a valid timestamp from known possible fields
      const timestamp = item.timestamp || item.createdAt;

      if (!timestamp) {
        console.log("Item skipped (no timestamp or createdAt):", item);
        return acc; // Skip this item if no valid timestamp is found
      }

      try {
        const monthStart = format(startOfMonth(parseISO(timestamp)), "yyyy-MM");
        if (!acc[monthStart]) {
          acc[monthStart] = [];
        }
        acc[monthStart].push(item);
      } catch (error) {
        console.error("Error processing timestamp for item:", item, error);
      }

      return acc;
    }, {});
  };

  const downloadCombinedReport = (contentIds, fileName) => {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    let currentHeight = 10; // Start placing images 10mm from the top of the page

    const captureContent = (id, index = 0) => {
      console.log("Capturing content for ID:", id); // Log which ID is being processed
      const input = document.getElementById(id);
      if (!input) {
        console.error("Element not found for ID:", id); // Error if element not found
        return; // Exit if no input found to avoid further errors
      }

      html2canvas(input, {
        scale: 2, // Increasing scale for better resolution
        useCORS: true, // This can help if your charts load resources over CORS
      })
        .then((canvas) => {
          const imgWidth = 170; // Width of the image in the PDF
          const pageHeight = 83; // Each image should approximately take up one-third of A4's height (about 93mm)
          let imgHeight = (canvas.height * imgWidth) / canvas.width; // Calculate the proportional height

          // Adjust if the image height is too large for the third of the page
          if (imgHeight > pageHeight) {
            imgHeight = pageHeight; // Adjust height to fit
            const imgWidthAdjusted = (canvas.width * imgHeight) / canvas.height;
            pdf.addImage(
              canvas.toDataURL("image/png"),
              "PNG",
              (210 - imgWidthAdjusted) / 2, // Center the image horizontally
              currentHeight, // Start at the current height offset
              imgWidthAdjusted,
              imgHeight
            );
          } else {
            pdf.addImage(
              canvas.toDataURL("image/png"),
              "PNG",
              (210 - imgWidth) / 2, // Center the image horizontally
              currentHeight, // Start at the current height offset
              imgWidth,
              imgHeight
            );
          }

          currentHeight += imgHeight + 10; // Increase currentHeight by imgHeight plus a 10mm margin

          // Check if there are more IDs to process and enough space on the page
          if (index < contentIds.length - 1 && currentHeight < 280) {
            // Adjusted for page margins
            captureContent(contentIds[index + 1], index + 1); // Process the next ID
          } else {
            if (index < contentIds.length - 1) {
              pdf.addPage();
              currentHeight = 10; // Reset current height for new page
              captureContent(contentIds[index + 1], index + 1);
            } else {
              pdf.save(`${fileName}-${new Date().toISOString()}.pdf`); // Save the PDF after the last element
            }
          }
        })
        .catch((err) => {
          console.error("Failed to capture element:", err); // Catch and log any error from html2canvas
        });
    };

    captureContent(contentIds[0]); // Start capturing from the first element
  };

  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
    fetchExpenses();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Transactions
      const transactionsResponse = await fetch(
        "https://api.spendsense.ca/api/transactions",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setGroupedTransactions(groupDataByMonth(transactionsData));
      } else {
        console.log("Failed to fetch transactions");
      }

      // Fetch Expenses
      const expensesResponse = await fetch(
        "https://api.spendsense.ca/api/expenses",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (expensesResponse.ok) {
        const expensesData = await expensesResponse.json();
        setGroupedExpenses(groupDataByMonth(expensesData));
      } else {
        console.log("Failed to fetch expenses");
      }

      // Fetch Accounts if they have timestamps
      const accountsResponse = await fetch(
        "https://api.spendsense.ca/api/accounts",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (accountsResponse.ok) {
        const accountsData = await accountsResponse.json();
        setGroupedAccounts(groupDataByMonth(accountsData)); // Assuming accounts have timestamps
      } else {
        console.log("Failed to fetch accounts");
      }
    };

    fetchData();
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
    const response = await fetch("https://api.spendsense.ca/api/accounts", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (response.ok) {
      const data = await response.json();
      setAccounts(data);
    } else {
      console.log("Failed to fetch accounts");
    }
  };

  const fetchTransactions = async () => {
    const response = await fetch("https://api.spendsense.ca/api/transactions", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (response.ok) {
      const data = await response.json();
      setTransactions(data);
      setTotalSpent();
    } else {
      console.log("Failed to fetch transactions");
    }
  };

  const fetchExpenses = async () => {
    const response = await fetch("https://api.spendsense.ca/api/expenses", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
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
                <Pie data={data} options={options} id="accountBalanceChart" />
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
      <Row>
        <Col xs={12}>
          <Card>
            <Card.Body>
              <Card.Title>Month</Card.Title>
              <div className="d-flex flex-column">
                <div className="mb-3">
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
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    downloadCombinedReport(
                      [
                        "accountBalanceChart",
                        "debitCreditChart",
                        "budgetComparisonChart",
                      ],
                      "Monthly Report"
                    )
                  }
                >
                  Generate Report
                </button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Col xs={12}>
        <Card>
          <Card.Body>
            <Card.Title>Debit vs Credit</Card.Title>
            <Bar
              data={debitCreditData}
              options={debitCreditOptions}
              id="debitCreditChart"
            />
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
              id="budgetComparisonChart"
            />
          </Card.Body>
        </Card>
      </Col>
    </Container>
  );
}

export default Dashboard;
