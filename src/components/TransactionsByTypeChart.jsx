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

function TransactionsByTypeChart() {
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

  // Function to capitalize the first letter of each word
  const capitalize = (s) =>
    s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

  // Calculate the sums for each transaction type
  const sumByType = useCallback((transactions) => {
    const sums = transactions.reduce((acc, transaction) => {
      const typeKey = capitalize(transaction.type); 
      acc[typeKey] = (acc[typeKey] || 0) + transaction.amount;
      return acc;
    }, {});
    return sums;
  }, []);

  // Prepare data for the Doughnut chart
  const transactionTypeSums = sumByType(transactions);
  const doughnutData = {
    labels: Object.keys(transactionTypeSums),
    datasets: [
      {
        label: "Transactions by Type",
        data: Object.values(transactionTypeSums),
        backgroundColor: [
          "#36A2EB", 
          "#FF6384", 
          "#FFCE56", 
        ],
        hoverBackgroundColor: ["#36A2EB", "#FF6384", "#FFCE56"],
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
        <Card.Title>Transactions by Type</Card.Title>
        {transactions.length > 0 ? (
          <Doughnut data={doughnutData} options={doughnutOptions} />
        ) : (
          <div className="text-center p-3">No transactions yet.</div>
        )}
      </Card.Body>
    </Card>
  );
}

export default TransactionsByTypeChart;
