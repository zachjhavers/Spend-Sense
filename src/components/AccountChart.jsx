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

function AccountChart() {
  const [sessionToken, setSessionToken] = useState(null);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const fetchSessionToken = async () => {
      const token = await getSessionToken();
      setSessionToken(token);
    };

    fetchSessionToken();
  }, []);

  useEffect(() => {
    if (sessionToken) {
      fetchAccounts();
    }
  }, [sessionToken]);

  // Functions For Fetching User Data
  const fetchAccounts = async () => {
    try {
      const response = await fetch(`${API_URL}/accounts`, {
        headers: HEADERS(sessionToken),
      });
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      } else {
        throw new Error("Failed to fetch accounts");
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  // Helper function to check if the account name suggests it's a debt account
  const isDebtAccount = (name) => {
    const debtKeywords = [
      "debt",
      "visa",
      "credit",
      "loan",
      "overdraft",
      "borrow",
    ];
    return debtKeywords.some((keyword) => name.toLowerCase().includes(keyword));
  };

  // Calculate the total balance of all accounts, subtracting debt accounts
  const totalBalance = accounts.reduce((acc, account) => {
    if (isDebtAccount(account.name)) {
      return acc - account.balance;
    } else {
      return acc + account.balance;
    }
  }, 0);

  // Data For Account Balance Chart
  const data = {
    labels: accounts.map((account) => account.name),
    datasets: [
      {
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
        <Card.Title>Accounts</Card.Title>
        {data.labels.length > 0 ? (
          <>
            <Doughnut data={data} options={options} id="accountBalanceChart" />
            <Card.Text>Total Balance: ${totalBalance.toFixed(2)}</Card.Text>
          </>
        ) : (
          <div className="text-center p-3">No data available.</div>
        )}
      </Card.Body>
    </Card>
  );
}

export default AccountChart;
