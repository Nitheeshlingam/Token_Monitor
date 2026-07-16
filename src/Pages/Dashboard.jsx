import { useEffect, useState } from "react";
// import axios from "axios";

import DashboardCards from "../components/DashboardCards";
import DailyUsageChart from "../components/DailyUsageChart";
// import ImageAnalysis from "../components/ImageAnalysis";

import "../App.css";

function Dashboard() {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");

  // AI Models
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");

  // -----------------------------
  // Load Available Models
  // -----------------------------
  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/image/models"
      );

      setModels(res.data.models || []);

      if (res.data.models.length > 0) {
        setSelectedModel(res.data.models[0]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // -----------------------------
  // Upload Image
  // -----------------------------
  const uploadImage = async () => {
    if (!image) {
      alert("Please select an image");
      return;
    }

    if (!selectedModel) {
      alert("Please select a model");
      return;
    }

    const token = localStorage.getItem("token");

    const formData = new FormData();

    formData.append("image", image);
    formData.append("model", selectedModel);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/image/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setDescription(res.data.description);

      alert("Image analyzed successfully!");
    } catch (err) {
      console.log(err);

      alert(err.response?.data?.message || err.message);
    }
  };

  // -----------------------------
  // Logout
  // -----------------------------
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/";
  };

  return (
    <div className="container">

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>AI Token Monitor</h1>

        {/* <button onClick={logout}>
          Logout
        </button> */}
      </div>

      {/* Upload */}

      {/* <div className="upload-section">

        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <div className="model-select">

          <label>
            <b>AI Model</b>
          </label>

          <br />

          <select
            value={selectedModel}
            onChange={(e) =>
              setSelectedModel(e.target.value)
            }
          >
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

        <br />

        <button onClick={uploadImage}>
          Analyze Image
        </button>

      </div> */}

      <DashboardCards />

      <DailyUsageChart />

      {/* <ImageAnalysis description={description} /> */}

    </div>
  );
}

export default Dashboard;