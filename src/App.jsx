import { useEffect, useState } from "react";
import axios from "axios";

import DashboardCards from "./components/DashboardCards";
import DailyUsageChart from "./components/DailyUsageChart";
import ImageAnalysis from "./components/ImageAnalysis";

import "./App.css";

function App() {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");

  // Upload Model
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

      console.log("Available Models:", res.data);

      const modelList = res.data.models || [];

      setModels(modelList);

      if (modelList.length > 0) {
        setSelectedModel(modelList[0]);
      }

    } catch (err) {
      console.error("Load Models Error:", err);
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

    const formData = new FormData();

    formData.append("image", image);
    formData.append("model", selectedModel);

    try {
      const token = localStorage.getItem("token");

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

      console.log(res.data);

      setDescription(res.data.description);

      alert("Image analyzed successfully!");

    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
        err.message
      );
    }
  };

  return (
    <div className="container">

      <h1>AI Token Monitor</h1>

      {/* Upload Section */}

      <div className="upload-section">

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
            style={{
              width: "260px",
              height: "40px",
              marginTop: "8px",
            }}
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

      </div>

      {/* Dashboard */}

      <DashboardCards />

      {/* Daily Usage */}

      <DailyUsageChart />

      {/* AI Response */}

      <ImageAnalysis
        description={description}
      />

    </div>
  );
}

export default App;