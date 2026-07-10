import { useEffect, useState } from "react";
import { getDashboardSummary } from "../api/dashboardApi";
import "./DashboardCards.css";

export default function DashboardCards() {
  const [filter, setFilter] = useState("today");

  const [selectedModel, setSelectedModel] = useState("ALL");
  const [dashboard, setDashboard] = useState({
    totalRequests: 0,
    inputTokens: 0,
    outputTokens: 0,
    billableTokens: 0,
    estimatedCost: 0,
    successRequests: 0,
    failedRequests: 0,
  });

  // USD → INR
  const USD_TO_INR = 95.45;
  const estimatedCostInr =
    Number(dashboard.estimatedCost) * USD_TO_INR;

  const loadDashboard = async () => {
    try {
      const res = await getDashboardSummary(
        filter,
        selectedModel
      );

      console.log(res.data);

      setDashboard(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
  loadDashboard();

  const interval = setInterval(loadDashboard, 5000);

  return () => clearInterval(interval);
}, [filter, selectedModel]);

 return (
    <>
      {/* Toolbar */}
      <div className="dashboard-toolbar">
        <div className="model-filter">
          <label>Select Model:</label>

          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            <option value="ALL">All Models</option>
            <option value="gemini-2.5-flash-lite">
              Gemini 2.5 Flash Lite
            </option>
            <option value="gemini-2.5-flash">
              Gemini 2.5 Flash
            </option>
            <option value="gemini-2.5-pro">
              Gemini 2.5 Pro
            </option>
          </select>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="cards">

        {/* Total Requests */}
        <div className="card">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              border: "none",
              background: "transparent",
              fontSize: "18px",
              fontWeight: "bold",
              cursor: "pointer",
              marginBottom: "10px",
            }}
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7days">Last 7 Days</option>
            <option value="all">All Time</option>
          </select>

          <h3>Total Requests</h3>
          <h1>{dashboard.totalRequests}</h1>
        </div>

        <div className="card">
          <h3>Input Tokens</h3>
          <h1>{dashboard.inputTokens}</h1>
        </div>

        <div className="card">
          <h3>Output Tokens</h3>
          <h1>{dashboard.outputTokens}</h1>
        </div>

        <div className="card">
          <h3>Billable Tokens</h3>
          <h1>{dashboard.billableTokens}</h1>
        </div>

        <div className="card">
          <h3>Estimated Cost (INR)</h3>
          <h1>₹{estimatedCostInr.toFixed(4)}</h1>
        </div>

        <div className="card">
          <h3>Success</h3>
          <h1>{dashboard.successRequests}</h1>
        </div>

        <div className="card">
          <h3>Failed</h3>
          <h1>{dashboard.failedRequests}</h1>
        </div>

      </div>
    </>
  );
}