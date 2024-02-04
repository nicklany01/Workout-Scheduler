import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import mysql, { RowDataPacket } from 'mysql2/promise';
import bcrypt from 'bcrypt';

const app = express();
const PORT = process.env.PORT || 3001;
const SECRET_KEY = 'secret_key'; // Replace with a strong, unique secret key

const dbConfig = {
  host: 'your_sql_server_host',
  user: 'your_sql_username',
  password: 'your_sql_password',
  database: 'your_database_name',
};

app.use(cors());
app.use(bodyParser.json());

function validateToken(token: string): boolean {
  try {
    jwt.verify(token, SECRET_KEY);
    return true;
  } catch (error) {
    console.error('Token validation failed:', error);
    return false;
  }
}

const pool = mysql.createPool(dbConfig);

app.post('/api/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

    const user = (rows as RowDataPacket[])[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/signup', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const [existingUser] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

    const user = (existingUser as RowDataPacket[])[0];

    if (user) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);

    const [newUser] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

    const createdUser = (newUser as RowDataPacket[])[0];

    const token = jwt.sign({ userId: createdUser.id, username: createdUser.username }, SECRET_KEY, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error('Signup failed:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/validateToken', (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  if (validateToken(token)) {
    res.json({ valid: true });
  } else {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
