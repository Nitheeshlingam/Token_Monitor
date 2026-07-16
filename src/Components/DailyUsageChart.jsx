import { useEffect, useState } from "react";
import { getDailyUsage } from "../api/dashboardApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ---------------------
// Format Date
// ---------------------
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-GB");
};

// ---------------------
// Custom Tooltip
// ---------------------
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const row = payload[0].payload;

  return (
    <div
      style={{
        background: "#fff",
        padding: "15px",
        borderRadius: "12px",
        border: "1px solid #ddd",
        boxShadow: "0 8px 20px rgba(0,0,0,.15)",
        minWidth: "220px",
      }}
    >
      <div
        style={{
          fontWeight: "bold",
          marginBottom: "12px",
          color: "#111827",
          fontSize: "16px",
        }}
      >
        📅 {formatDate(label)}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <span>Total Requests</span>
        <strong>{row.requests}</strong>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span style={{ color: "#2563eb" }}>
          Billable Tokens
        </span>

        <strong style={{ color: "#2563eb" }}>
          {Number(row.billableTokens).toLocaleString()}
        </strong>
      </div>
    </div>
  );
};

export default function DailyUsageChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    loadChart();
  }, []);

  const loadChart = async () => {
    try {
      const res = await getDailyUsage();

      console.log("Chart Data:", res.data);

      setData(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: 430,
        background: "#fff",
        marginTop: "30px",
        padding: "25px",
        borderRadius: "15px",
        boxShadow: "0 5px 20px rgba(0,0,0,.1)",
      }}
    >
      <h2
        style={{
          marginBottom: "20px",
          color: "#1f2937",
        }}
      >
        Daily Billable Tokens
      </h2>

      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 20,
            left: 0,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="day"
            tickFormatter={formatDate}
            tick={{ fontSize: 13 }}
          />

          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 13 }}
          />

          <Tooltip content={<CustomTooltip />} />

          <Bar
            dataKey="billableTokens"
            fill="#2563eb"
            radius={[8, 8, 0, 0]}
            barSize={45}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}