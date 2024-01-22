import React from "react";
import ReactDOM from "react-dom/client";
import {
	Home,
	About,
	ErrorPage,
	Custom,
	Template,
	Exercises,
	Progress,
} from "./pages";
import "bootstrap/dist/css/bootstrap.min.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ContextProvider } from "./Context";

// Set theme by changing <html> attribute
const htmlElement = document.documentElement;
htmlElement.setAttribute("data-bs-theme", "dark");

// Set up React Router
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
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<ContextProvider>
			<RouterProvider router={router} />
		</ContextProvider>
	</React.StrictMode>
);

// Remove Preload scripts loading
postMessage({ payload: "removeLoading" }, "*");

// Use contextBridge
window.ipcRenderer.on("main-process-message", (_event, message) => {
	console.log(message);
});
