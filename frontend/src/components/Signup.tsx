import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useData } from "../Context";
import axios from "axios";

const Signup = () => {
	const { API_BASE_URL } = useData();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	const handleSignup = async (e: any) => {
		e.preventDefault();
		const userData = { username, password };
		await signupUser(userData);
        window.location.reload();
	};

	const signupUser = async (credentials: {
		username: string;
		password: string;
	}) => {
		try {
			const response = await axios.post(
				`${API_BASE_URL}/signup`,
				credentials
			);
			// Handle successful signup
			console.log("Signup successful:", response.data);
			const { token } = response.data;
			localStorage.setItem("token", token);
		} catch (error) {
			console.error("Signup failed:", error);
		}
	};
	return (
		<Form onSubmit={handleSignup}>
			<Form.Group controlId="sformUsername">
				<Form.Label>Username:</Form.Label>
				<Form.Control
					type="text"
					placeholder="Enter your username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
				/>
			</Form.Group>
			<Form.Group controlId="sformPassword" className="mt-3">
				<Form.Label>Password:</Form.Label>
				<Form.Control
					type="password"
					placeholder="Enter your password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
			</Form.Group>
			<Button variant="primary" type="submit" className="w-100 mt-3">
				Signup
			</Button>
		</Form>
	);
};

export default Signup;
