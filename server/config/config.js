import pkg from "pg";

const { Pool } = pkg;

const config = {
  user: process.env.P_USER,
  password: process.env.P_PASSWORD,
  host: process.env.P_HOST,
  database: process.env.P_DATABASE,
  port: 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  application_name: "LMS-V3",
  statement_timeout: 30000,
  query_timeout: 30000,
  prepare: true,
  keepalive: true,
  keepaliveInitialDelayMillis: 10000,
};

const pool = new Pool(config);

pool.on("connect", (client) => {
  console.log("New client connected to the database");
});

pool.on("remove", (client) => {
  console.log("Client removed from the pool");
});

const connectToDatabase = async () => {
  let retries = 5;
  while (retries > 0) {
    try {
      const client = await pool.connect();
      const result = await client.query("SELECT NOW() as current_time");
      client.release();

      console.log(
        `Connected to PostgreSQL database: ${result.rows[0].current_time}`
      );
      return;
    } catch (err) {
      console.error(
        `Error connecting to PostgreSQL (attempt ${6 - retries}/5):`,
        err
      );
      retries--;
      if (retries === 0) {
        throw new Error("Failed to connect to database after 5 attempts");
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
});

export { pool, connectToDatabase };
