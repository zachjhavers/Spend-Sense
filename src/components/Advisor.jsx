import React, { useState, useEffect } from "react";
import { Card } from "react-bootstrap";
import { getSessionToken } from "@descope/react-sdk";

// Constants
const API_URL = "https://api.spendsense.ca/api";
const HEADERS = (sessionToken) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${sessionToken}`,
});

function Advisor() {
  const [data, setData] = useState({
    expenses: [],
    accounts: [],
    transactions: [],
    advice: [],
    isLoading: false,
    error: "",
  });

  const sessionToken = getSessionToken();

  useEffect(() => {
    let isMounted = true;
    setData((prev) => ({ ...prev, isLoading: true }));

    const fetchData = async () => {
      try {
        const [expensesRes, accountsRes, transactionsRes] = await Promise.all([
          fetch(`${API_URL}/expenses`, { headers: HEADERS(sessionToken) }),
          fetch(`${API_URL}/accounts`, { headers: HEADERS(sessionToken) }),
          fetch(`${API_URL}/transactions`, { headers: HEADERS(sessionToken) }),
        ]);

        if (!expensesRes.ok || !accountsRes.ok || !transactionsRes.ok)
          throw new Error("Failed to fetch data");

        const [expenses, accounts, transactions] = await Promise.all([
          expensesRes.json(),
          accountsRes.json(),
          transactionsRes.json(),
        ]);

        if (isMounted) {
          setData({
            expenses,
            accounts,
            transactions,
            isLoading: false,
            error: "",
            advice: [],
          });
          // Check if there is data in all categories before fetching advice
          if (expenses.length && accounts.length && transactions.length) {
            fetchFinancialAdvice(expenses, accounts, transactions);
          } else {
            setData((prev) => ({
              ...prev,
              isLoading: false,
              advice: [
                "Ensure all data categories are populated to receive financial advice.",
              ],
            }));
          }
        }
      } catch (error) {
        if (isMounted)
          setData((prev) => ({
            ...prev,
            error: error.message,
            isLoading: false,
          }));
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchFinancialAdvice = async (expenses, accounts, transactions) => {
    const financialData = { accounts, transactions, expenses };

    try {
      const response = await fetch(`${API_URL}/advice`, {
        method: "POST",
        headers: HEADERS(sessionToken),
        body: JSON.stringify(financialData),
      });
      if (response.ok) {
        const data = await response.json();
        setData((prev) => ({
          ...prev,
          advice: formatAdvice(data.message.content),
        }));
      } else {
        throw new Error(`Failed to fetch financial advice: ${response.status}`);
      }
    } catch (error) {
      setData((prev) => ({ ...prev, error: error.message }));
    }
  };

  const formatAdvice = (adviceText) =>
    adviceText.split("\n").filter((line) => line.trim() !== "");

  // Render component
  return (
    <Card>
      <Card.Body>
        <Card.Title>Financial Advisor</Card.Title>
        <div className="d-flex flex-column">
          {data.isLoading ? (
            <div>Loading advice...</div>
          ) : data.error ? (
            <div>Loading advice...</div>
          ) : data.advice.length > 0 ? (
            data.advice.map((item, index) => (
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
  );
}

export default Advisor;
