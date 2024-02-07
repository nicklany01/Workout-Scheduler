import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useData } from "../Context";
import axios from "axios";

const Login = () => {
	const { API_URL } = useData();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	const handleLogin = async (e: any) => {
		e.preventDefault();
		const credentials = { username, password };
		await loginUser(credentials);
		window.location.reload();
	};

	const loginUser = async (credentials: {
		username: string;
		password: string;
	}) => {
		try {
			const response = await axios.post(`${API_URL}/login`, credentials);
			const { token } = response.data;
			localStorage.setItem("token", token);
		} catch (error) {
			console.error("Login failed:", error);
		}
	};

	return (
		<Form onSubmit={handleLogin}>
			<Form.Group controlId="lformUsername">
				<Form.Label>Username:</Form.Label>
				<Form.Control
					type="text"
					placeholder="Enter your username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
				/>
			</Form.Group>
			<Form.Group controlId="lformPassword" className="mt-3">
				<Form.Label>Password:</Form.Label>
				<Form.Control
					type="password"
					placeholder="Enter your password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
			</Form.Group>
			<Button variant="primary" className="w-100 mt-3" type="submit">
				Login
			</Button>
		</Form>
	);
};

export default Login;
