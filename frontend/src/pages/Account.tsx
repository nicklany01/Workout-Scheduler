import { NavBar } from "../components";
import React, { useEffect, useState } from "react";
import { Form, Button, Container, Row, Col, Stack } from "react-bootstrap";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Account: React.FC = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	useEffect(() => {
		// Check if a valid token is present when the component mounts
		const token = localStorage.getItem("token");
		if (token) {
			validateToken(token);
		}
	}, []);

	const validateToken = async (token: string) => {
		try {
			const response = await axios.post(`${API_BASE_URL}/validateToken`, {
				token,
			});

			// If the token is valid, set the login status to true
			setIsLoggedIn(true);
		} catch (error) {
			// If the token is invalid or the validation fails, log out the user
			console.error("Token validation failed:", error);
			logoutUser();
		}
	};

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
			validateToken(token);
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
			const { token } = response.data;
			localStorage.setItem("token", token);
			validateToken(token);
		} catch (error) {
			console.error("Signup failed:", error);
		}
	};

	const handleGoogleLogin = (response: any) => {
		console.log("Google login response:", response);
		// You can send the Google login response to your server for authentication
	};

	const logoutUser = () => {
		localStorage.removeItem("token");
		setIsLoggedIn(false);
	};

	return (
		<>
			<NavBar />
			<Container>
				<Row className="justify-content-center">
					<Col xs={12} md={6}>
						<h1 className="mt-5 mb-3">Account Page</h1>
						{isLoggedIn ? (
							<p>Hello, {username}!</p>
						) : (
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
						)}
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
