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

function BudgetChart() {
  const [sessionToken, setSessionToken] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState({ needs: 0, wants: 0 });

  useEffect(() => {
    const fetchSessionToken = async () => {
      const token = await getSessionToken();
      setSessionToken(token);
    };

    fetchSessionToken();
  }, []);

  useEffect(() => {
    if (sessionToken) {
      fetchExpenses();
    }
  }, [sessionToken]);

  const fetchExpenses = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/expenses`, {
        headers: HEADERS(sessionToken),
      });
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
        const totals = calculateCategoryTotals(data);
        setCategoryTotals(totals);
        setTotalExpenses(totals.needs + totals.wants);
      } else {
        throw new Error("Failed to fetch expenses");
      }
    } catch (error) {
      console.error(error.message);
    }
  }, [sessionToken]);

  const calculateCategoryTotals = useCallback((expenses) => {
    const initialTotals = { needs: 0, wants: 0 };
    return expenses.reduce((acc, expense) => {
      const category = expense.category.toLowerCase();
      if (acc[category] !== undefined) {
        acc[category] += expense.amount;
      }
      return acc;
    }, initialTotals);
  }, []);

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
        <Card.Title>Monthly Budget</Card.Title>
        {expenses.length > 0 ? (
          <>
            <Doughnut data={budgetData} options={doughnutOptions} />
            <Card.Text>Total Expenses: ${totalExpenses.toFixed(2)}</Card.Text>
          </>
        ) : (
          <div className="text-center p-3">No data available.</div>
        )}
      </Card.Body>
    </Card>
  );
}

export default BudgetChart;
