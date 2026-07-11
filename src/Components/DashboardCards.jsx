import { useEffect, useState } from "react";
import {
  getDashboardSummary,
  getModels,
  getDetails,
} from "../api/dashboardApi";

import UserUsageModal from "./UserUsageModal";

import "./DashboardCards.css";

export default function DashboardCards() {
  const today = new Date().toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [models, setModels] = useState([]);
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

  // Modal
  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [users, setUsers] = useState([]);

  const USD_TO_INR = 95.45;

  const estimatedCostInr =
    Number(dashboard.estimatedCost || 0) * USD_TO_INR;

  // ----------------------------
  // Load Models
  // ----------------------------
  const loadModels = async () => {
    try {
      const res = await getModels(startDate, endDate);

      setModels(res.data.models || []);

      if (
        res.data.models?.includes(selectedModel) ||
        selectedModel === "ALL"
      ) {
        // keep current selection
      } else {
        setSelectedModel(
          res.data.defaultModel || "ALL"
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------------
  // Load Dashboard
  // ----------------------------
  const loadDashboard = async () => {
    try {
      const res = await getDashboardSummary(
        startDate,
        endDate,
        selectedModel
      );

      setDashboard(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------------
  // Load Details
  // ----------------------------
  const openDetails = async (type, title) => {
  try {
    console.log("Opening:", type);

    const res = await getDetails(
      type,
      startDate,
      endDate,
      selectedModel
    );

    console.log("Details Response:", res.data);

    setUsers(res.data.data || []);
    setModalTitle(title);
    setOpenModal(true);

  } catch (err) {
    console.error(err);
  }
};
  // ----------------------------
  // Initial Load
  // ----------------------------
  useEffect(() => {
    loadModels();
  }, []);

  // ----------------------------
  // Reload Models on Date Change
  // ----------------------------
  useEffect(() => {
    loadModels();
  }, [startDate, endDate]);

  // ----------------------------
  // Reload Dashboard
  // ----------------------------
  useEffect(() => {
    loadDashboard();

    const interval = setInterval(() => {
      loadDashboard();
    }, 5000);

    return () => clearInterval(interval);
  }, [startDate, endDate, selectedModel]);

  return (
    <>
      <div className="dashboard-toolbar">

        <div className="date-filter">

          <label>From:</label>

          <input
            type="date"
            value={startDate}
            onChange={(e) =>
              setStartDate(e.target.value)
            }
          />

          <label>To:</label>

          <input
            type="date"
            value={endDate}
            onChange={(e) =>
              setEndDate(e.target.value)
            }
          />

        </div>

        <div className="model-filter">

          <label>AI Model</label>

          <select
            value={selectedModel}
            onChange={(e) =>
              setSelectedModel(e.target.value)
            }
          >
            {models.length > 1 && (
              <option value="ALL">
                All Models
              </option>
            )}

            {models.map((model) => (
              <option
                key={model}
                value={model}
              >
                {model}
              </option>
            ))}
          </select>

        </div>

      </div>

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
          <h1>{dashboard.inputTokens}</h1>
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
          <h1>{dashboard.outputTokens}</h1>
        </div>

        <div
          className="card"
          onClick={() =>
            openDetails(
              "billable",
              "Billable Tokens"
            )
          }
        >
          <h3>Total Tokens</h3>
          <h1>{dashboard.billableTokens}</h1>
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
          <h1>
            ₹{estimatedCostInr.toFixed(4)}
          </h1>
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

      <UserUsageModal
        open={openModal}
        title={modalTitle}
        users={users}
        onClose={() =>
          setOpenModal(false)
        }
      />

    </>
  );
}