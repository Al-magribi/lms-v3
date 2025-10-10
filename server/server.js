import "dotenv/config";
import app from "./app.js"; // Pastikan file app.js mengekspor 'app' dari express()
import { connectToDatabase } from "./config/config.js";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Penanganan Frontend ---

// 1. Tentukan path ke direktori build client
const clientBuildPath = path.join(__dirname, "../client/dist");

// 2. Sajikan file statis (JS, CSS, gambar) dari direktori build client
app.use(express.static(clientBuildPath));

// --- Penanganan API ---
// Semua rute API Anda harus didefinisikan di sini, idealnya dengan prefix /api.
// Contoh: app.use('/api/users', userRoutes);

app.get("/api/check-server", (req, res) => {
  res.send("Server is running");
});

// --- Rute Catch-All untuk SPA ---
// 3. Untuk semua permintaan GET lainnya yang bukan file statis atau API,
//    kirim kembali index.html agar routing sisi klien (React Router) dapat mengambil alih.
app.get("*", (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

// --- Koneksi Database dan Start Server ---
connectToDatabase()
  .then(() => {
    const PORT = process.env.PORT || 5000; // Beri nilai default untuk keamanan
    const DOMAIN = process.env.DOMAIN || "localhost";
    const PROTOCOL = process.env.NODE_ENV === "production" ? "https" : "http";

    app.listen(PORT, () => {
      console.log(`Server berjalan di ${PROTOCOL}://${DOMAIN}:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Gagal menyambungkan ke database:", error);
  });
