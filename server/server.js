import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/db.js";
import imageRoutes from "./routes/ImageRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import sdkRoutes from "./routes/sdkRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/image", imageRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/sdk", sdkRoutes);
app.get("/", (req, res) => {

    res.json({

        success: true,

        message: "AI Token Monitor Backend Running"

    });

});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(`Server running on http://localhost:${PORT}`);

});