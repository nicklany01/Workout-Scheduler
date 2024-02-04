import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import {
	Home,
	About,
	ErrorPage,
	Custom,
	Template,
	Exercises,
	Progress,
	Account,
} from "./pages";
import "bootstrap/dist/css/bootstrap.min.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ContextProvider } from "./Context";

const htmlElement = document.documentElement;
htmlElement.setAttribute("data-bs-theme", "dark");

const router = createBrowserRouter([
	{
		path: "/",
		element: <Home />,
		errorElement: <ErrorPage />,
	},
	{
		path: "/Custom",
		element: <Custom />,
		errorElement: <ErrorPage />,
	},
	{
		path: "/Template",
		element: <Template />,
		errorElement: <ErrorPage />,
	},
	{
		path: "/exercises",
		element: <Exercises />,
		errorElement: <ErrorPage />,
	},
	{
		path: "/progress",
		element: <Progress />,
		errorElement: <ErrorPage />,
	},
	{
		path: "/about",
		element: <About />,
		errorElement: <ErrorPage />,
	},
	{
		path: "/account",
		element: <Account />,
		errorElement: <ErrorPage />,
	},

]);

ReactDOM.createRoot(document.getElementById("root")!).render(
	<GoogleOAuthProvider clientId="296356440068-i3cgkvicod3a13s5ljnn2vbofnevrcbd.apps.googleusercontent.com">
		<React.StrictMode>
			<ContextProvider>
				<RouterProvider router={router} />
			</ContextProvider>
		</React.StrictMode>
	</GoogleOAuthProvider>
);

// Remove Preload scripts loading
postMessage({ payload: "removeLoading" }, "*");

// Use contextBridge
if (window.ipcRenderer) {
	window.ipcRenderer.on("main-process-message", (_event, message) => {
		console.log(message);
	});
}