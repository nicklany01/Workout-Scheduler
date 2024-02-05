import { NavBar, Signup, Login } from "../components";
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Tabs, Tab, Button } from "react-bootstrap";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useData } from "../Context";

const Account: React.FC = () => {
	const { API_BASE_URL } = useData();
	const { userData, setUserData } = useData();
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	useEffect(() => {
		// Check if a valid token is present when the component mounts
		const token = localStorage.getItem("token");
		if (token) {
			validateToken(token);
			fetchUserDetails(token);
		} else if (window.ipcRenderer) {
			setIsLoggedIn(true);
		}
	}, []);

	const validateToken = async (token: string) => {
		try {
			const response = await axios.post(`${API_BASE_URL}/validateToken`, {
				token,
			});
			if (response.data.valid) {
				setIsLoggedIn(true);
			}
		} catch (error) {
			console.error("Token validation failed:", error);
			logoutUser();
		}
	};

	const fetchUserDetails = async (token: string) => {
		try {
			const response = await axios.post(
				`${API_BASE_URL}/getUserDetails`,
				{
					token,
				}
			);
			setUserData(new Map<string, string>(Object.entries(response.data)));
		} catch (error) {
			console.error("Error fetching user details:", error);
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
							<>
								<p>Welcome, {userData.get("username")}!</p>
								<Button
									variant="danger"
									onClick={logoutUser}
									className="w-100"
								> 
									Logout
								</Button>
							</>
						) : (
							<>
								<Tabs
									defaultActiveKey="login"
									className="mb-3"
									fill
								>
									<Tab eventKey="login" title="Login">
										<Login />
									</Tab>
									<Tab eventKey="signup" title="Sign Up">
										<Signup />
									</Tab>
								</Tabs>
								<div className="mt-3 w-100">
									<GoogleLogin
										onSuccess={handleGoogleLogin}
										onError={(error?: any) =>
											console.error(
												"Google login failed:",
												error
											)
										}
									/>
								</div>
							</>
						)}
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default Account;
