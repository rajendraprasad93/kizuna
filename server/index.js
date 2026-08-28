import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDb, pool } from "./db.js";
import authRoutes from "./routes/auth.js";
import reportsRoutes from "./routes/reports.js";
import categoriesRoutes from "./routes/categories.js";
import departmentsRoutes from "./routes/departments.js";
import actionsRoutes from "./routes/actions.js";
import notificationsRoutes from "./routes/notifications.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/departments", departmentsRoutes);
app.use("/api/actions", actionsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/admin", adminRoutes);

// Health check & DB connection status endpoint
app.get("/api/health", async (req, res) => {
  try {
    const dbCheck = await pool.query("SELECT NOW()");
    return res.json({
      status: "ok",
      database: "connected",
      timestamp: dbCheck.rows[0].now,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      database: "disconnected",
      error: err.message,
    });
  }
});

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error("Unhandled Server Error:", err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

// Start server and initialize DB
async function start() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(
        `🚀 CivicEye PostgreSQL Backend running at http://localhost:${PORT}`,
      );
    });
  } catch {
    console.error(
      "❌ Backend startup aborted because the database is unavailable.",
    );
    process.exitCode = 1;
  }
}

start();
