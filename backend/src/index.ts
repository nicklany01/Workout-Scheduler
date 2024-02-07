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

// This is so that the request object can have a user property
declare global {
	namespace Express {
		interface Request {
			user: {
				userId: number;
				username: string;
			};
		}
	}
}

const authenticateToken = (
	req: Request,
	res: Response,
	next: express.NextFunction
) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];
	if (token == null)
		return res.sendStatus(401).json({ error: "Token not provided" }); // Unauthorized

	var decodedToken;
	try {
		decodedToken = jwt.verify(token, SECRET_KEY) as {
			userId: number;
			username: string;
		};
	} catch (error) {
		console.error("Token validation failed:", error);
		return res.sendStatus(403); // Forbidden
	}

	req.user = {
		userId: decodedToken.userId,
		username: decodedToken.username,
	};
	next();
};

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

app.get(
	"/api/validateToken",
	authenticateToken,
	(req: Request, res: Response) => {
		res.json({ valid: true });
	}
);

app.get(
	"/api/getUserData",
	authenticateToken,
	async (req: Request, res: Response) => {
		try {
			const userDetails = (
				(await pool.query("SELECT * FROM users WHERE id = ?", [
					req.user.userId,
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
	}
);

app.get(
	"/api/getexercises",
	authenticateToken,
	(req: Request, res: Response) => {
		const query = `
    SELECT
    e.name AS exercise_name,
    JSON_OBJECT(
        'name', e.name,
        'muscles', CASE WHEN COUNT(m.name) > 0 THEN JSON_ARRAYAGG(m.name) ELSE NULL END,
        'progress', JSON_OBJECTAGG(IFNULL(l.id, ''), CASE WHEN el.weight = 0 THEN el.reps ELSE ROUND(el.weight / (1.0278 - (0.0278 * el.reps)), 2) END)
    ) AS exercise_data
	FROM
 	   exercises e
	LEFT JOIN
    	exercise_logs el ON e.id = el.exercise_id
	LEFT JOIN
	    logs l ON el.log_id = l.id
	LEFT JOIN
	    exercise_muscles em ON e.id = em.exercise_id
	LEFT JOIN
	    muscles m ON em.muscle_id = m.id
	WHERE
	    (e.user_id IS NULL OR e.user_id = ?)
	GROUP BY
	    e.id;

  `;
		pool.query(query, [req.user.userId]).then(([results]) => {
			try {
				const exerciseData: { [key: string]: any } = {};
				for (const row of results as RowDataPacket[]) {
					exerciseData[row.exercise_name] = row.exercise_data;
				}
				res.json(exerciseData);
			} catch (error) {
				console.error("Error getting exercises:", error);
				res.status(500).json({ error: "Internal Server Error" });
			}
		});
	}
);

app.get("/api/getLogs", authenticateToken, (req: Request, res: Response) => {
	const query = `
	SELECT
    DATE_FORMAT(el.log_id, '%Y-%m-%d') AS log_date,
    JSON_OBJECT(
        'exerciseLogs',
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'exercise', e.name,
                'sets', el.sets,
                'reps', el.reps,
                'weight', el.weight
            )
        )
		) AS log_data
	FROM
		exercise_logs el
	JOIN
		exercises e ON el.exercise_id = e.id
	JOIN
		logs l ON el.log_id = l.id
	WHERE
		l.user_id = ?
	GROUP BY
		el.log_id;`;
	pool.query(query, [req.user.userId]).then(([results]) => {
		try {
			const logData: { [key: string]: any } = {};
			for (const row of results as RowDataPacket[]) {
				logData[row.log_date] = row.log_data;
			}
			res.json(logData);
		} catch (error) {
			console.error("Error getting exercises:", error);
			res.status(500).json({ error: "Internal Server Error" });
		}
	});
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
