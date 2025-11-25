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
  53300: "Too Many Connections - Batas koneksi database tercapai", // Tambahan
};

const config = {
  user: process.env.P_USER,
  password: process.env.P_PASSWORD,
  host: process.env.P_HOST,
  port: process.env.P_PORT,
  database: process.env.P_DATABASE,
  // PENTING: Jangan 2000. Sesuaikan dengan limit server (biasanya 100).
  // Diset 90 untuk menyisakan ruang bagi superuser/maintenance.
  max: 90,
  idleTimeoutMillis: 10000, // Kurangi jadi 10 detik agar koneksi nganggur cepat mati
  connectionTimeoutMillis: 5000, // Percepat timeout
  maxUses: 7500,
  application_name: "LMS-V3",
  statement_timeout: 120000,
  query_timeout: 120000,
  prepare: true,
  keepalive: true,
  keepaliveInitialDelayMillis: 10000,
  maxWaitingClients: 50, // Jangan biarkan antrian terlalu panjang
  idleInTransactionSessionTimeout: 30000, // Matikan transaksi macet > 30 detik
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
};

// --- LOGIC RESET POOL ---
const forceResetConnection = async (reason) => {
  console.error(`\n[${getIndonesianTime()}] [CRITICAL] ${reason}`);
  console.error("!!! MEMULAI PROSEDUR RESET KONEKSI !!!");
  console.error("Mengakhiri semua koneksi pool...");

  try {
    // Mencoba menutup pool dengan sopan
    await pool.end();
    console.log("Pool berhasil ditutup.");
  } catch (e) {
    console.error("Gagal menutup pool secara normal, memaksa keluar...");
  }

  console.log("Merestart service untuk membersihkan koneksi menjadi 0...");
  // Exit code 1 akan memicu Nodemon/PM2 untuk restart otomatis
  // Ini adalah cara paling bersih untuk "Koneksi menjadi 0"
  process.exit(1);
};

// Enhanced pool monitoring
const monitorPool = async () => {
  const stats = {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
    timestamp: getIndonesianTime(),
  };

  console.log(`
[${stats.timestamp}] Status Pool:
Total Koneksi: ${stats.total}/${config.max}
Koneksi Idle: ${stats.idle}
Request Menunggu: ${stats.waiting}
  `);

  // LOGIC UTAMA: Jika penuh atau macet, lakukan Reset
  if (stats.total >= config.max) {
    await forceResetConnection("POOL PENUH (MAX CAPACITY REACHED)");
  }

  // Jika banyak yang antri tapi tidak ada yang idle (kemungkinan deadlock)
  if (stats.waiting > 20 && stats.idle === 0) {
    await forceResetConnection("REQUEST MACET (HIGH WAITING, NO IDLE)");
  }
};

// Monitor pool lebih cepat (setiap 10 detik) untuk respons cepat
setInterval(monitorPool, 10000);

// Enhanced error handling for pool
pool.on("error", (err, client) => {
  logError(err, "Pool Error");

  // Jika error karena koneksi penuh, langsung reset
  if (err.code === "53300" || err.code === "57P01") {
    forceResetConnection("DATABASE MENOLAK KONEKSI (TOO MANY CLIENTS)");
  }
});

pool.on("connect", (client) => {
  // Optional: Uncomment jika ingin log setiap koneksi (bisa spam log)
  // console.log(`[${getIndonesianTime()}] Koneksi baru dibuat. Total: ${pool.totalCount}`);
});

pool.on("remove", (client) => {
  // Client removed
});

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

      // Jika error karena penuh saat startup, langsung paksa reset
      if (err.code === "53300" || err.code === "57P01") {
        process.exit(1);
      }

      if (retries === 0) {
        console.error("[KRITIS] Gagal terhubung ke database. Restarting...");
        process.exit(1);
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
      await client.query("SET statement_timeout = $1", [
        config.statement_timeout,
      ]);
      return client;
    } catch (err) {
      retryCount++;
      const waitTime = 1000;

      // Jika error koneksi penuh, jangan retry, biarkan monitorPool mereset
      if (err.code === "53300" || err.code === "57P01") {
        throw new Error("Server Database Penuh - Tunggu Reset Otomatis");
      }

      if (retryCount >= maxRetries) {
        logError(err, "Gagal mendapatkan client");
        throw err;
      }

      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
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
