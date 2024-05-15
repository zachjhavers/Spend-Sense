import React, { useState, useEffect, useCallback } from "react";
import { Card } from "react-bootstrap";
import { getSessionToken } from "@descope/react-sdk";
import { Doughnut } from "react-chartjs-2";

// Constants
const API_URL = "https://api.spendsense.ca/api";
const HEADERS = (sessionToken) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${sessionToken}`,
});

function RecentTransactionsChart() {
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
        let data = await response.json();
        // Sorting transactions by description
        data = data.sort((a, b) => a.description.localeCompare(b.description));
        setTransactions(data);
      } else {
        throw new Error("Failed to fetch transactions");
      }
    } catch (error) {
      console.error(error.message);
    }
  }, [sessionToken]);

  // Calculate the sums for each transaction description
  const sumByDescription = useCallback((transactions) => {
    const sums = transactions.reduce((acc, transaction) => {
      const descKey = transaction.description;
      acc[descKey] = (acc[descKey] || 0) + transaction.amount;
      return acc;
    }, {});
    return sums;
  }, []);

  // Prepare data for the Doughnut chart
  const transactionSums = sumByDescription(transactions);
  const doughnutData = {
    labels: Object.keys(transactionSums),
    datasets: [
      {
        label: "Transactions by Description",
        data: Object.values(transactionSums),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#C9CB3A",
          "#FF9F40",
        ],
        hoverBackgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#C9CB3A",
          "#FF9F40",
        ],
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return tooltipItem.label + ": $" + tooltipItem.raw.toFixed(2);
          },
        },
      },
    },
  };

  // Render component
  return (
    <Card>
      <Card.Body>
        <Card.Title>Recent Transactions</Card.Title>
        {transactions.length > 0 ? (
          <Doughnut data={doughnutData} options={doughnutOptions} />
        ) : (
          <div className="text-center p-3">No transactions yet.</div>
        )}
      </Card.Body>
    </Card>
  );
}

export default RecentTransactionsChart;
