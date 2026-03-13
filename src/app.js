import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import routes
import noticeRoutes from './routes/notic.js';
// import newsRoutes from "./routes/newsRoutes.js";
import galleryRoutes from "./routes/gallary.js";
import newsRoutes from "./routes/news.js";




dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


app.use("/api/notice", noticeRoutes);
// app.use("/api/news", newsRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/news", newsRoutes);


export default app;