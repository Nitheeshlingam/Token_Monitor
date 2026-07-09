import "./ImageAnalysis.css";

export default function ImageAnalysis({ description }) {
  if (!description) return null;

  return (
    <div className="analysis-card">
      <h2>🤖 AI Image Analysis</h2>

      <div className="analysis-content">
        <pre>{description}</pre>
      </div>
    </div>
  );
}