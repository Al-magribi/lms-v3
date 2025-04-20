import "dotenv/config";
import app from "./app.js";
import { connectToDatabase } from "./config/config.js";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure MIME types
app.use((req, res, next) => {
  if (req.url.endsWith(".jsx") || req.url.endsWith(".js")) {
    res.setHeader("Content-Type", "application/javascript");
  }
  next();
});

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, "../client/dist")));

// Handle all routes - send index.html for client-side routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

connectToDatabase()
  .then(() => {
    const PORT = process.env.PORT;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server berjalan di http://0.0.0.0:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Gagal menyambungkan ke database:", error);
  });
