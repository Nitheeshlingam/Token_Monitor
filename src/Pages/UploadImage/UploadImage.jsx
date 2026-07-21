import { useEffect, useState } from "react";
import axios from "axios";

function UploadImage() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");

  // Load available models
  useEffect(() => {
      loadModels();
  }, []);  

  const loadModels = async () => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/image/models`
    );

    console.log("===============");
    console.log("Full Response:", res);
    console.log("Response Data:", res.data);
    console.log("Models:", res.data.models);
    console.log("Length:", res.data.models.length);
    console.log("===============");

    setModels([...res.data.models]);

    if (res.data.models.length > 0) {
      setSelectedModel(res.data.models[0]);
    }

  } catch (err) {
    console.error(err);
  }
};
useEffect(() => {
  console.log("Current Models State:", models);
}, [models]);

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

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

    // Send selected model
    formData.append("model", selectedModel);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/gemini/analyze`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(res.data);

      alert("Image Analyzed Successfully!");
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
    <div style={{ padding: "30px" }}>
      <h2>Upload Image</h2>

      <input
        type="file"
        accept="image/*"
        onChange={handleImage}
      />

      <br />
      <br />

      {/* AI Model Dropdown */}
      <label>
        <b>AI Model</b>
      </label>

      <br />

      <select
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
        style={{
          width: "260px",
          height: "40px",
          marginTop: "8px",
        }}
      >
        {models.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>

      <br />
      <br />

      {preview && (
        <img
          src={preview}
          alt="Preview"
          width="250"
        />
      )}

      <br />
      <br />

      <button onClick={uploadImage}>
        Analyze Image
      </button>
    </div>
  );
}

export default UploadImage;