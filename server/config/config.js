import pkg from "pg"

const { Pool } = pkg

const config = {
	user: process.env.P_USER,
	password: process.env.P_PASSWORD,
	host: process.env.P_HOST,
	database: process.env.P_DATABASE,
	port: 5432,
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 2000,
}

const pool = new Pool(config)

const connectToDatabase = async () => {
	try {
		const client = await pool.connect()
		const result = await client.query("SELECT NOW() as current_time")
		client.release()

		console.log(
			`Connected to PostgreSQL database: ${result.rows[0].current_time}`
		)
	} catch (err) {
		console.error("Error connecting to PostgreSQL:", err)
	}
}

pool.on("error", (err, client) => {
	console.error("Unexpected error on idle client", err)
	process.exit(-1)
})

export { pool, connectToDatabase }
