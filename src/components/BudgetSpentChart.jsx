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

function BudgetSpentChart() {
  const [sessionToken, setSessionToken] = useState(null);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [monthlyBudget, setMonthlyBudget] = useState(0);

  useEffect(() => {
    const fetchSessionToken = async () => {
      const token = await getSessionToken();
      setSessionToken(token);
    };

    fetchSessionToken();
  }, []);

  useEffect(() => {
    if (sessionToken) {
      fetchBudgetAndExpenses();
    }
  }, [sessionToken]);

  const fetchBudgetAndExpenses = useCallback(async () => {
    try {
      const budgetResponse = await fetch(`${API_URL}/expenses`, {
        // This is actually the budget
        headers: HEADERS(sessionToken),
      });
      const expensesResponse = await fetch(`${API_URL}/transactions`, {
        // These are actual expenses
        headers: HEADERS(sessionToken),
      });

      if (budgetResponse.ok && expensesResponse.ok) {
        const budgetData = await budgetResponse.json();
        const expensesData = await expensesResponse.json();
        const monthlyBudgetTotal = budgetData.reduce(
          (acc, budget) => acc + budget.amount,
          0
        );
        const totalExpensesCalculated = expensesData
          .filter(
            (expense) => expense.type === "debit" || expense.type === "debt"
          )
          .reduce((acc, filteredExpense) => acc + filteredExpense.amount, 0);

        setMonthlyBudget(monthlyBudgetTotal);
        setTotalExpenses(totalExpensesCalculated);
      } else {
        throw new Error("Failed to fetch budget or expenses");
      }
    } catch (error) {
      console.error(error.message);
    }
  }, [sessionToken]);

  // Prepare data for the chart
  const doughnutData = {
    labels: ["Monthly Budget", "Total Spent"],
    datasets: [
      {
        data: [monthlyBudget, totalExpenses],
        backgroundColor: ["#36A2EB", "#FF6384"],
        hoverBackgroundColor: ["#36A2EB", "#FF6384"],
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
        <Card.Title>Budget & Total Spent</Card.Title>
        {totalExpenses > 0 || monthlyBudget > 0 ? (
          <Doughnut
            data={doughnutData}
            options={doughnutOptions}
            id="budgetComparisonChart"
          />
        ) : (
          <div className="text-center p-3">No data available.</div>
        )}
      </Card.Body>
    </Card>
  );
}

export default BudgetSpentChart;
