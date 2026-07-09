import { useEffect, useState } from "react";
import { getDashboardSummary } from "../api/dashboardApi";
import "./DashboardCards.css";

export default function DashboardCards() {
  const [dashboard, setDashboard] = useState({
    totalRequests: 0,
    inputTokens: 0,
    outputTokens: 0,
    billableTokens: 0,
    estimatedCost: 0,
    avgLatency: 0,
    successRequests: 0,
    failedRequests: 0,
  });

  // USD to INR Exchange Rate
  const USD_TO_INR = 86;

  // Convert USD cost to INR
  const estimatedCostInr =
    Number(dashboard.estimatedCost) * USD_TO_INR;

  const loadDashboard = async () => {
    try {
      const res = await getDashboardSummary();

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
  }, []);

  return (
    <div className="cards">

      <div className="card">
        <h3>Today's Requests</h3>
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
        <h3>Average Latency</h3>
        <h1>{Number(dashboard.avgLatency).toFixed(0)} ms</h1>
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
  );
}