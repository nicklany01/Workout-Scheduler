import express, { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import jwt, { Secret } from "jsonwebtoken";
import cors from "cors";
import mysql, { ResultSetHeader, RowDataPacket } from "mysql2/promise";
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

const getExercisesData = async (userId: number) => {
	const query = `
        SELECT
            e.name AS exercise_name,
            JSON_OBJECT(
                'name', e.name,
                'muscles', JSON_ARRAYAGG(COALESCE(m.name)),
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

	return pool.query(query, [userId]).then(([results]) => {
		const exerciseData: { [key: string]: any } = {};
		for (const row of results as RowDataPacket[]) {
			exerciseData[row.exercise_name] = row.exercise_data;
		}
		return exerciseData;
	});
};

app.get(
	"/api/getExercises",
	authenticateToken,
	async (req: Request, res: Response) => {
		try {
			const exerciseData = await getExercisesData(req.user.userId);
			res.json(exerciseData);
		} catch (error) {
			console.error("Error getting exercises:", error);
			res.status(500).json({ error: "Internal Server Error" });
		}
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

app.post(
	"/api/updateLogs",
	authenticateToken,
	(req: Request, res: Response) => {
		const query = `
	UPDATE exercise_logs AS el
	JOIN logs AS l ON el.log_id = l.id
	JOIN exercises AS e ON el.exercise_id = e.id
	SET
		el.sets = ?,
		el.reps = ?,
		el.weight = ?
	WHERE
		l.user_id = ? AND
		l.id = ? AND
		e.name = ?;
	`;
		const { date, exerciseLogs } = req.body;
		exerciseLogs.forEach((exerciseLog: any) => {
			pool.query(query, [
				exerciseLog.sets,
				exerciseLog.reps,
				exerciseLog.weight,
				req.user.userId,
				date,
				exerciseLog.exercise,
			]);
		});
	}
);

const deleteLogsInRange = async (
	req: Request,
	res: Response,
	next: express.NextFunction
) => {
	const { startDate, endDate } = req.body;
	try {
		const connection = await pool.getConnection();

		await connection.beginTransaction();

		const deleteExerciseLogsQuery = `DELETE FROM exercise_logs WHERE log_id BETWEEN ? AND ?`;
		const deleteLogsQuery = `DELETE FROM logs WHERE id BETWEEN ? AND ?`;

		await connection.query(deleteExerciseLogsQuery, [startDate, endDate]);
		await connection.query(deleteLogsQuery, [startDate, endDate]);

		await connection.commit();

		connection.release();
		next(); // Proceed to the next middleware or route handler
	} catch (error) {
		res.status(500).json({
			error: "Failed to delete logs or commit transaction",
		});
	}
};

app.post(
	"/api/insertLogs",
	authenticateToken,
	deleteLogsInRange,
	async (req, res) => {
		const { logs } = req.body;
		const insertLogQuery = `INSERT INTO logs (id, user_id) VALUES (?, ?)`;
		const insertExerciseLogQuery = `INSERT INTO exercise_logs (log_id, exercise_id, sets, reps, weight) VALUES (?, (SELECT id FROM exercises WHERE name = ?), ?, ?, ?)`;

		const connection = await pool.getConnection();
		try {
			await connection.beginTransaction();
			for (const [date, log] of Object.entries(logs)) {
				const [results] = await connection.query(insertLogQuery, [
					date,
					req.user.userId,
				]);
				for (const exerciseLog of (log as { exerciseLogs: any[] })
					?.exerciseLogs) {
					await connection.query(insertExerciseLogQuery, [
						date,
						exerciseLog.exercise,
						exerciseLog.sets,
						exerciseLog.reps,
						exerciseLog.weight,
					]);
				}
			}
			await connection.commit();
			res.sendStatus(200);
		} catch (error) {
			await connection.rollback();
			res.status(500).send("Error inserting logs");
		} finally {
			connection.release();
		}
	}
);

app.post(
	"/api/saveExercises",
	authenticateToken,
	async (req: Request, res: Response) => {
		const { exercises } = req.body;
		const dbExercises = await getExercisesData(req.user.userId);

		const toDelete = Object.keys(dbExercises).filter(
			(exercise) => !(exercise in exercises)
		);

		const toInsert = Object.keys(exercises).filter(
			(exercise) => !(exercise in dbExercises)
		);

		const connection = await pool.getConnection();

		try {
			await connection.beginTransaction();

			const deleteQuery = `DELETE FROM exercises WHERE name = ? AND user_id = ?;`;
			for (const exercise of toDelete) {
				await connection.query(deleteQuery, [
					exercise,
					req.user.userId,
				]);
			}

			const insertExerciseQuery = `INSERT INTO exercises (name, user_id) VALUES (?, ?)`;
			for (const exercise of toInsert) {
				const [exerciseResult] = await connection.query(
					insertExerciseQuery,
					[exercise, req.user.userId]
				);
				const exerciseId = (exerciseResult as ResultSetHeader).insertId;
				for (const muscleName of exercises[exercise].muscles) {
					const [muscleResult] = await connection.query(
						`SELECT id FROM muscles WHERE name = ?;`,
						[muscleName]
					);
					const muscleId = (muscleResult as RowDataPacket[])[0].id;
					// Insert associated exercise_muscles data
					await connection.query(
						`INSERT INTO exercise_muscles (exercise_id, muscle_id) VALUES (?, ?);`,
						[exerciseId, muscleId]
					);
				}
			}

			await connection.commit();

			connection.release();

			res.status(200).json({ message: "Exercises updated successfully" });
		} catch (error) {
			await connection.rollback();

			connection.release();

			console.error("Error updating exercises:", error);

			res.status(500).json({
				error: "An error occurred while updating exercises",
			});
		} finally {
			if (connection) {
				connection.release();
			}
		}
	}
);

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
