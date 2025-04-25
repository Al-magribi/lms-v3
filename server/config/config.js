import pkg from "pg";

const { Pool } = pkg;

// Error types mapping
const ERROR_TYPES = {
  "57P01": "Pool Exhausted - Terlalu banyak koneksi yang diminta",
  "08006": "Connection Failure - Gagal terhubung ke database",
  "28P01": "Authentication Failed - Username atau password salah",
  "3D000": "Database Does Not Exist - Database tidak ditemukan",
  "08001": "Unable to Connect - Tidak dapat terhubung ke server",
  "08004": "Server Rejected - Server menolak koneksi",
  "08007": "Connection Failure - Koneksi terputus",
  40001: "Deadlock - Terjadi deadlock",
  "40P01": "Deadlock - Terjadi deadlock",
  "55P03": "Lock Timeout - Timeout saat menunggu lock",
  57014: "Query Canceled - Query dibatalkan",
  57000: "Statement Timeout - Query melebihi batas waktu",
};

const config = {
  user: process.env.P_USER,
  password: process.env.P_PASSWORD,
  host: process.env.P_HOST,
  database: process.env.P_DATABASE,
  port: 5432,
  max: 100,
  min: 20,
  idleTimeoutMillis: 300000,
  connectionTimeoutMillis: 60000,
  application_name: "LMS-V3",
  statement_timeout: 120000,
  query_timeout: 120000,
  prepare: true,
  keepalive: true,
  keepaliveInitialDelayMillis: 10000,
  maxUses: 7500,
  allowExitOnIdle: true,
};

const pool = new Pool(config);

// Fungsi untuk mendapatkan waktu Indonesia (WIB)
const getIndonesianTime = () => {
  return new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
};

// Fungsi untuk membaca dan mencatat error
const logError = (error, context = "") => {
  const errorType = ERROR_TYPES[error.code] || "Unknown Error";
  const timestamp = getIndonesianTime();

  console.error(`
[${timestamp}] Database Error:
Type: ${errorType}
Code: ${error.code}
Context: ${context}
Message: ${error.message}
Stack: ${error.stack}
  `);

  // Simpan error ke file log jika diperlukan
  // fs.appendFileSync('database-errors.log', errorLog);
};

// Error handling untuk pool
pool.on("error", (err, client) => {
  logError(err, "Pool Error");

  if (err.code === "57P01" || err.code === "08006") {
    console.log("Mencoba menghubungkan ulang ke database...");
    connectToDatabase();
  }
});

pool.on("connect", (client) => {
  console.log(`[${getIndonesianTime()}] Koneksi baru ke database berhasil`);
});

pool.on("remove", (client) => {
  console.log(`[${getIndonesianTime()}] Client dihapus dari pool`);
});

// Monitoring pool setiap 30 detik
setInterval(() => {
  const poolStatus = {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
    timestamp: getIndonesianTime(),
  };

  console.log(`
[${poolStatus.timestamp}] Status Pool:
Total Koneksi: ${poolStatus.total}
Koneksi Idle: ${poolStatus.idle}
Request Menunggu: ${poolStatus.waiting}
  `);
}, 30000);

const connectToDatabase = async () => {
  let retries = 5;
  const retryDelay = 5000;

  while (retries > 0) {
    try {
      const client = await pool.connect();
      const result = await client.query(
        "SELECT NOW() AT TIME ZONE 'Asia/Jakarta' as current_time"
      );
      client.release();

      console.log(
        `[${getIndonesianTime()}] Terhubung ke PostgreSQL: ${
          result.rows[0].current_time
        }`
      );
      return;
    } catch (err) {
      logError(err, `Percobaan koneksi ke-${6 - retries}/5`);
      retries--;
      if (retries === 0) {
        console.error(
          "[KRITIS] Gagal terhubung ke database setelah 5 percobaan"
        );
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
};

const getClient = async () => {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const client = await pool.connect();
      return client;
    } catch (err) {
      if (err.code === "57P01") {
        retryCount++;
        const waitTime = Math.min(1000 * Math.pow(2, retryCount), 10000);
        logError(err, `Pool Exhausted - Percobaan ${retryCount}/${maxRetries}`);
        console.error(`Menunggu ${waitTime}ms sebelum mencoba lagi...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }
      logError(err, "Error saat mendapatkan client");
      throw err;
    }
  }
  throw new Error("Gagal mendapatkan client setelah maksimum percobaan");
};

const checkPoolHealth = async () => {
  try {
    const client = await pool.connect();
    try {
      await client.query("SELECT 1");
      return true;
    } finally {
      client.release();
    }
  } catch (err) {
    logError(err, "Health Check Failed");
    return false;
  }
};

// Fungsi untuk mendapatkan statistik pool
const getPoolStats = () => {
  return {
    totalConnections: pool.totalCount,
    idleConnections: pool.idleCount,
    waitingRequests: pool.waitingCount,
    timestamp: getIndonesianTime(),
  };
};

export {
  pool,
  connectToDatabase,
  getClient,
  checkPoolHealth,
  getPoolStats,
  logError,
};
