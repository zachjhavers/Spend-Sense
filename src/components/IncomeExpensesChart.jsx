import React, { useState, useEffect, useCallback } from "react";
import { Card } from "react-bootstrap";
import { getSessionToken } from "@descope/react-sdk";
import { Doughnut } from "react-chartjs-2"; // Import Doughnut

// Constants
const API_URL = "https://api.spendsense.ca/api";
const HEADERS = (sessionToken) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${sessionToken}`,
});

function IncomeExpensesChart() {
  const [sessionToken, setSessionToken] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchSessionToken = async () => {
      const token = await getSessionToken();
      setSessionToken(token);
    };

    fetchSessionToken();
  }, []);

  useEffect(() => {
    if (sessionToken) {
      fetchTransactions();
    }
  }, [sessionToken]);

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/transactions`, {
        headers: HEADERS(sessionToken),
      });
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      } else {
        throw new Error("Failed to fetch transactions");
      }
    } catch (error) {
      console.error(error.message);
    }
  }, [sessionToken]);

  const calculateDebitCreditData = useCallback((transactions) => {
    const credits = transactions
      .filter((t) => t.type === "credit")
      .reduce((acc, cur) => acc + cur.amount, 0);
    const debits = transactions
      .filter((t) => t.type === "debit")
      .reduce((acc, cur) => acc + cur.amount, 0);
    const debts = transactions
      .filter((t) => t.type === "debt")
      .reduce((acc, cur) => acc + cur.amount, 0);

    return {
      labels: ["Income", "Expenses", "Debt"],
      datasets: [
        {
          label: "Income vs Expenses vs Debt",
          data: [credits, debits, debts],
          backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56"],
          hoverBackgroundColor: ["#36A2EB", "#FF6384", "#FFCE56"],
        },
      ],
    };
  }, []);

  // Data and options for the chart
  const debitCreditData = calculateDebitCreditData(transactions);
  const debitCreditOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  // Render component
  return (
    <Card>
      <Card.Body>
        <Card.Title>Income, Expenses & Debt</Card.Title>
        {transactions.length > 0 ? (
          <Doughnut
            data={debitCreditData}
            options={debitCreditOptions}
            id="debitCreditChart"
          />
        ) : (
          <div className="text-center p-3">No data available.</div>
        )}
      </Card.Body>
    </Card>
  );
}

export default IncomeExpensesChart;
