import { NavBar } from "../components";
import React, { useState } from "react";
import { Form, Button, Container, Row, Col, Stack } from "react-bootstrap";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

const API_BASE_URL = "https://workout.lany.pro/api";

const Account: React.FC = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	const handleLogin = async () => {
		const credentials = { username, password };
		await loginUser(credentials);
	};

	const handleSignup = async () => {
		const userData = { username, password };
		await signupUser(userData);
	};

	const loginUser = async (credentials: {
		username: string;
		password: string;
	}) => {
		try {
			const response = await axios.post(
				`${API_BASE_URL}/login`,
				credentials
			);
			const { token } = response.data;
			localStorage.setItem("token", token);
			// Redirect or update state as needed
		} catch (error) {
			console.error("Login failed:", error);
		}
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
		} catch (error) {
			console.error("Signup failed:", error);
		}
	};

	const handleGoogleLogin = (response: any) => {
		console.log("Google login response:", response);
		// You can send the Google login response to your server for authentication
	};

	return (
		<>
			<NavBar />
			<Container>
				<Row className="justify-content-center">
					<Col xs={12} md={6}>
						<h1 className="mt-5 mb-3">Account Page</h1>
						<Form>
							<Form.Group controlId="formUsername">
								<Form.Label>Username:</Form.Label>
								<Form.Control
									type="text"
									placeholder="Enter your username"
									value={username}
									onChange={(e) =>
										setUsername(e.target.value)
									}
								/>
							</Form.Group>
							<Form.Group
								controlId="formPassword"
								className="mt-3"
							>
								<Form.Label>Password:</Form.Label>
								<Form.Control
									type="password"
									placeholder="Enter your password"
									value={password}
									onChange={(e) =>
										setPassword(e.target.value)
									}
								/>
							</Form.Group>
							<Stack direction="horizontal" className="mt-3">
								<Button
									variant="primary"
									type="button"
									onClick={handleLogin}
									className="w-100 me-2"
								>
									Login
								</Button>
								<Button
									variant="primary"
									type="button"
									onClick={handleSignup}
									className="w-100"
								>
									Signup
								</Button>
							</Stack>
						</Form>
						<div className="mt-3 w-100">
							<GoogleLogin
								onSuccess={handleGoogleLogin}
								onError={(error?: any) =>
									console.error("Google login failed:", error)
								}
							/>
						</div>
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default Account;
