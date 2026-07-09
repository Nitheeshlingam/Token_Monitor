import { useState } from "react";
import axios from "axios";
import DashboardCards from "./components/DashboardCards";
import DailyUsageChart from "./components/DailyUsageChart";
import ImageAnalysis from "./components/ImageAnalysis";
import "./App.css";

function App() {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");

  const uploadImage = async () => {
    if (!image) {
      alert("Please select an image");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    try {
      const res = await axios.post(
      "http://localhost:5000/api/image/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("Upload Response:", res.data);

    setDescription(res.data.description);

    alert("Image analyzed successfully!");

      // ❌ Do NOT reload the page
      // window.location.reload();

    } catch (err) {
      console.error(err);

      if (err.response) {
        alert(err.response.data.message);
      } else {
        alert(err.message);
      }
    }
  };

  return (
    <div className="container">

      <h1>AI Token Monitor</h1>

      <div className="upload-box">
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <button onClick={uploadImage}>
          Analyze Image
        </button>
      </div>

      {/* Dashboard */}
      <DashboardCards />

      {/* Chart */}
      <DailyUsageChart />

      {/* AI Analysis */}
      <ImageAnalysis description={description} />

    </div>
  );
}

export default App;