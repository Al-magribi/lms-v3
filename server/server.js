import "dotenv/config";
import app from "./app.js";
import { connectToDatabase } from "./config/config.js";

app.get("/", (req, res) => {
  res.send("Server is active");
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
