import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import jwt, { Secret } from "jsonwebtoken";
import cors from "cors";
import mysql, { RowDataPacket } from "mysql2/promise";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
const app = express();
const PORT = 3001;
const SECRET_KEY: Secret = process.env.SECRET_KEY || "";

const dbConfig = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE,
	port: 3306,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
};
const pool = mysql.createPool(dbConfig);

app.use(cors());
app.use(bodyParser.json());

const startServer = async () => {
	try {
		const connection = await pool.getConnection();
		console.log("Connected to MySQL database");
		connection.release();

		// Continue with starting the Express server
		app.listen(PORT, () => {
			console.log(`Server is running on http://localhost:${PORT}`);
		});
	} catch (err) {
		console.error("Error establishing MySQL connection pool:", err);
		process.exit(1);
	}
};

function validateToken(token: string): boolean {
	try {
		jwt.verify(token, SECRET_KEY);
		return true;
	} catch (error) {
		console.error('Token validation failed:', error);
		return false;
	}
}

app.post("/api/login", async (req: Request, res: Response) => {
	const { username, password } = req.body;

	try {
		const [rows] = await pool.query(
			"SELECT * FROM users WHERE username = ?",
			[username]
		);

		const user = (rows as RowDataPacket[])[0];

		if (!user) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		const passwordMatch = await bcrypt.compare(password, user.password);

		if (!passwordMatch) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		const token = jwt.sign(
			{ userId: user.id, username: user.username },
			SECRET_KEY,
			{ expiresIn: "12h" }
		);

		res.json({ token });
	} catch (error) {
		console.error("Login failed:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

app.post("/api/signup", async (req: Request, res: Response) => {
	const { username, password } = req.body;

	try {
		const [existingUser] = await pool.query(
			"SELECT * FROM users WHERE username = ?",
			[username]
		);

		const user = (existingUser as RowDataPacket[])[0];

		if (user) {
			return res.status(400).json({ error: "Username already taken" });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		await pool.query(
			"INSERT INTO users (username, password) VALUES (?, ?)",
			[username, hashedPassword]
		);

		const [newUser] = await pool.query(
			"SELECT * FROM users WHERE username = ?",
			[username]
		);

		const createdUser = (newUser as RowDataPacket[])[0];

		const token = jwt.sign(
			{ userId: createdUser.id, username: createdUser.username },
			SECRET_KEY,
			{ expiresIn: "12h" }
		);

		res.json({ token });
	} catch (error) {
		console.error("Signup failed:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

app.post("/api/validateToken", (req: Request, res: Response) => {
	const { token } = req.body;

	if (!token) {
		return res.status(401).json({ error: "Token not provided" });
	}

	if (validateToken(token)) {
		res.json({ valid: true });
	} else {
		res.status(401).json({ error: "Invalid token" });
	}
});

app.post("/api/getUserDetails", async (req: Request, res: Response) => {
	const { token } = req.body;

	if (!token) {
		return res.status(401).json({ error: "Token not provided" });
	}

	try {
		const decodedToken = jwt.verify(token, SECRET_KEY) as {
			userId: number;
			username: string;
		};

		const userDetails = (
			(await pool.query("SELECT * FROM users WHERE id = ?", [
				decodedToken.userId,
			])) as RowDataPacket[]
    )[0][0];
    
		res.json({
			id: userDetails.id,
			username: userDetails.username,
			preferredname: userDetails.preferredname,
			email: userDetails.email,
		});
	} catch (error) {
		console.error("Error decoding token:", error);
		res.status(401).json({ error: "Invalid token" });
	}
});

startServer();

// handle any errors
app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
	console.error("Unhandled error:", err);

	if (process.env.NODE_ENV === "development") {
		res.status(500).json({
			error: "Internal Server Error",
			details: err.message,
		});
	} else {
		// Send a more generic response in production for security
		res.status(500).json({ error: "Internal Server Error" });
	}
});
