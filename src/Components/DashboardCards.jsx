import { useEffect, useState } from "react";
import {
  getDashboardSummary,
  getDetails,
} from "../api/dashboardApi";

import UserUsageModal from "./UserUsageModal";
import "./DashboardCards.css";

export default function DashboardCards({
  startDate,
  endDate,
  model,
}) {
  const [dashboard, setDashboard] = useState({
    totalRequests: 0,
    inputTokens: 0,
    outputTokens: 0,
    billableTokens: 0,
    estimatedCost: 0,
    averageLatency: 0,
    successRequests: 0,
    failedRequests: 0,
  });

  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [users, setUsers] = useState([]);

  // NEW
  const [selectedType, setSelectedType] = useState("");

  const estimatedCost = Number(dashboard.estimatedCost || 0);

  // -----------------------
  // Load Dashboard
  // -----------------------
  const loadDashboard = async () => {
    try {
      const res = await getDashboardSummary(
        startDate,
        endDate,
        model
      );

      setDashboard(
        res.data.data || {
          totalRequests: 0,
          inputTokens: 0,
          outputTokens: 0,
          billableTokens: 0,
          estimatedCost: 0,
          averageLatency: 0,
          successRequests: 0,
          failedRequests: 0,
        }
      );
    } catch (err) {
      console.error("Dashboard Error:", err);
    }
  };

  // -----------------------
  // Open Details Modal
  // -----------------------
  const openDetails = async (type, title) => {
    try {

      // Remember which card was clicked
      setSelectedType(type);

      const res = await getDetails(
        type,
        startDate,
        endDate,
        model
      );

      setUsers(res.data.data || []);
      setModalTitle(title);
      setOpenModal(true);

    } catch (err) {
      console.error("Details Error:", err);
    }
  };

  // -----------------------
  // Reload Dashboard
  // -----------------------
  useEffect(() => {
    loadDashboard();

    const interval = setInterval(() => {
      loadDashboard();
    }, 5000);

    return () => clearInterval(interval);

  }, [startDate, endDate, model]);

  return (
    <>
      <div className="cards">

        <div
          className="card"
          onClick={() =>
            openDetails(
              "requests",
              "Total Requests"
            )
          }
        >
          <h3>Total Requests</h3>
          <h1>{dashboard.totalRequests}</h1>
        </div>

        <div
          className="card"
          onClick={() =>
            openDetails(
              "input",
              "Input Tokens"
            )
          }
        >
          <h3>Input Tokens</h3>
          <h1>
            {Number(dashboard.inputTokens).toLocaleString()}
          </h1>
        </div>

        <div
          className="card"
          onClick={() =>
            openDetails(
              "output",
              "Output Tokens"
            )
          }
        >
          <h3>Output Tokens</h3>
          <h1>
            {Number(dashboard.outputTokens).toLocaleString()}
          </h1>
        </div>

        <div
          className="card"
          onClick={() =>
            openDetails(
              "billable",
              "Total Tokens"
            )
          }
        >
          <h3>Total Tokens</h3>
          <h1>
            {Number(dashboard.billableTokens).toLocaleString()}
          </h1>
        </div>

        <div
          className="card"
          onClick={() =>
            openDetails(
              "cost",
              "Estimated Cost"
            )
          }
        >
          <h3>Estimated Cost (INR)</h3>
          <h1>₹{estimatedCost.toFixed(6)}</h1>
        </div>

        <div
          className="card"
          onClick={() =>
            openDetails(
              "latency",
              "Average Latency"
            )
          }
        >
          <h3>Avg Latency</h3>
          <h1>{Math.round(dashboard.averageLatency)} ms</h1>
        </div>

        <div
          className="card"
          onClick={() =>
            openDetails(
              "success",
              "Successful Requests"
            )
          }
        >
          <h3>Success</h3>
          <h1>{dashboard.successRequests}</h1>
        </div>

        <div
          className="card"
          onClick={() =>
            openDetails(
              "failed",
              "Failed Requests"
            )
          }
        >
          <h3>Failed</h3>
          <h1>{dashboard.failedRequests}</h1>
        </div>

      </div>

      <UserUsageModal
        open={openModal}
        title={modalTitle}
        users={users}
        activeColumn={selectedType}
        onClose={() => setOpenModal(false)}
      />
    </>
  );
}