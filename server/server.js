// import "dotenv/config";
// import app from "./app.js";
// import { connectToDatabase } from "./config/config.js";
// import path from "path";
// import { fileURLToPath } from "url";
// import express from "express";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Serve static files from the client directory
// app.use(express.static(path.join(__dirname, "../client/dist")));

// app.get("/check-server", (req, res) => {
//   res.send("Server is running");
// });

// // Handle all routes - send index.html for client-side routing
// app.get("/{*splat}", (req, res) => {
//   res.sendFile(path.join(__dirname, "../client/dist/index.html"));
// });

// connectToDatabase()
//   .then(() => {
//     const PORT = process.env.PORT;
//     const DOMAIN = process.env.DOMAIN || "localhost";
//     const PROTOCOL = process.env.NODE_ENV === "production" ? "https" : "http";

//     app.listen(PORT, () => {
//       console.log(`Server berjalan di ${PROTOCOL}://${DOMAIN}:${PORT}`);
//     });
//   })
//   .catch((error) => {
//     console.error("Gagal menyambungkan ke database:", error);
//   });

// server.js

import "dotenv/config";
import app from "./app.js"; // Pastikan file app.js Anda ada dan mengekspor instance express
import { connectToDatabase } from "./config/config.js";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";

// Konfigurasi dasar untuk mendapatkan __dirname di ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Tentukan path absolut ke folder build client Anda
// path.resolve lebih andal di lingkungan server yang berbeda
const clientDistPath = path.resolve(__dirname, "../client/dist");

// 2. [PENTING] Tambahkan log untuk melihat path absolut yang digunakan
// Cek log di aaPanel untuk memastikan path ini benar
console.log(`[SERVER INFO] Serving static files from: ${clientDistPath}`);

// 3. Sajikan file statis dari path absolut yang sudah ditentukan
app.use(express.static(clientDistPath));

// Rute sederhana untuk mengecek apakah server berjalan
app.get("/check-server", (req, res) => {
  res.send("Server is running");
});

// 4. Handle semua rute lain (catch-all) untuk mendukung client-side routing
// Menggunakan "*" adalah sintaks yang paling umum dan standar
app.get("*", (req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

// Sambungkan ke database dan jalankan server
connectToDatabase()
  .then(() => {
    const PORT = process.env.PORT || 3000; // Beri nilai default jika PORT tidak ada
    const DOMAIN = process.env.DOMAIN || "localhost";
    const PROTOCOL = process.env.NODE_ENV === "production" ? "https" : "http";

    app.listen(PORT, () => {
      console.log(`Server berjalan di ${PROTOCOL}://${DOMAIN}:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Gagal menyambungkan ke database:", error);
    process.exit(1); // Keluar dari proses jika koneksi database gagal
  });
