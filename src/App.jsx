import { useState } from "react";
import axios from "axios";
import DashboardCards from "./components/DashboardCards";
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

      console.log("Success:", res.data);

      setDescription(res.data.description);

      alert("Image analyzed successfully!");

      // Refresh dashboard cards
      window.location.reload();

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
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <button onClick={uploadImage}>
          Analyze Image
        </button>
      </div>

      <DashboardCards />

      {description && (
        <div
          style={{
            marginTop: "30px",
            background: "#fff",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h2>Gemini Response</h2>
          <p>{description}</p>
        </div>
      )}
    </div>
  );
}

export default App;