import { useEffect, useState } from "react";
import { getTodayDashboard } from "../api/dashboardApi";
import "./DashboardCards.css";

export default function DashboardCards() {
  const [dashboard, setDashboard] = useState({
    totalRequests: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalTokens: 0,
    totalCost: 0,
  });

  const loadDashboard = async () => {
    try {
      const res = await getTodayDashboard();
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
        <h1>{dashboard.totalInputTokens}</h1>
      </div>

      <div className="card">
        <h3>Output Tokens</h3>
        <h1>{dashboard.totalOutputTokens}</h1>
      </div>

      <div className="card">
        <h3>Total Tokens</h3>
        <h1>{dashboard.totalTokens}</h1>
      </div>

      <div className="card">
        <h3>Estimated Cost</h3>
        <h1>${Number(dashboard.totalCost).toFixed(6)}</h1>
      </div>

    </div>
  );
}