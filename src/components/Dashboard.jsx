// Importing Required Libraries
import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import Advisor from "./Advisor";
import AccountChart from "./AccountChart";
import BudgetChart from "./BudgetChart";
import IncomeExpensesChart from "./IncomeExpensesChart";
import BudgetSpentChart from "./BudgetSpentChart";
import TransactionsByTypeChart from "./TransactionsByTypeChart";
import RecentTransactionsChart from "./RecentTransactionsChart";
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

// Dashboard Function
function Dashboard() {
  // Render
  return (
    <Container fluid>
      <Row className="mb-3">
        <Col xs={12}>
          <Advisor />
        </Col>
      </Row>
      <Row className="mb-3">
        <Col lg={6} md={12}>
          <IncomeExpensesChart />
        </Col>
        <Col lg={6} md={12}>
          <BudgetSpentChart />
        </Col>
      </Row>
      <Row className="mb-3">
        <Col lg={6} md={12}>
          <AccountChart />
        </Col>
        <Col lg={6} md={12}>
          <BudgetChart />
        </Col>
      </Row>
      <Row className="mb-3">
        <Col lg={6} md={12}>
          <RecentTransactionsChart />
        </Col>
        <Col lg={6} md={12}>
          <TransactionsByTypeChart />
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;
