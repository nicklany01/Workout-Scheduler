import React, {
	createContext,
	useContext,
	ReactNode,
	useState,
	Dispatch,
	SetStateAction,
} from "react";
import { Log, ExerciseLog, Exercise } from "./pages";
import { format, addDays } from "date-fns";
import axios from "axios";

interface ContextProps {
	logs: Map<string, Log>;
	setLogs: Dispatch<SetStateAction<Map<string, Log>>>;
	exercises: Map<string, Exercise>;
	setExercises: Dispatch<SetStateAction<Map<string, Exercise>>>;
	userData: Map<string, string>;
	setUserData: Dispatch<SetStateAction<Map<string, string>>>;

	addExercisesToLog: (selectedExercises: string[][]) => void;
	addExercise: (exercise: Exercise) => void;
	removeExercise: (exerciseName: string) => void;

	loadData: (data: string) => Promise<any>;
	saveData: (data: string) => Promise<any>;

	API_URL: string;
}
const Context = createContext<ContextProps | undefined>(undefined);

export const ContextProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const API_URL: string = import.meta.env.VITE_API_URL || "";
	const [logs, setLogs] = useState<Map<string, Log>>(new Map());
	const [exercises, setExercises] = useState<Map<string, Exercise>>(
		new Map()
	);
	const [userData, setUserData] = useState<Map<string, string>>(new Map());
	// when component is mounted this executes
	const addExercisesToLog = (selectedExercises: string[][]) => {
		var days = selectedExercises.length;
		console.log(selectedExercises);
		// Check that startDate is set or is in the future
		var dateString = userData?.get("startDate");
		var date: Date;
		if (dateString === undefined) {
			date = new Date();
		} else {
			date = new Date(dateString);
			if (date < new Date()) {
				date = new Date();
			}
		}

		setLogs((prevLogs) => {
			const newLogs = new Map<string, Log>(prevLogs);

			// Go through days and add log if there are exercises in the day. Add exercises to log if there
			for (var i = 0; i < days; i++) {
				if (selectedExercises[i].length > 0) {
					const log: Log = {
						exerciseLogs: [],
					};
					for (var j = 0; j < selectedExercises[i].length; j++) {
						const exerciseLog = new ExerciseLog(
							selectedExercises[i][j]
						);
						log.exerciseLogs.push(exerciseLog);
					}

					const logDate = addDays(date, i);
					newLogs.set(format(logDate, "yyyy-MM-dd"), log);
					console.log(format(logDate, "yyyy-MM-dd"));
				}
			}

			const sortedEntries = [...newLogs.entries()].sort(
				([keyA], [keyB]) => keyA.localeCompare(keyB)
			);

			return new Map<string, Log>(sortedEntries);
		});
	};

	const addExercise = (exercise: Exercise) => {
		setExercises((prevExercises) => {
			const newExercises = new Map<string, Exercise>(prevExercises);
			newExercises.set(exercise.name, exercise);

			// sort entries by key
			const sortedEntries = [...newExercises.entries()].sort(
				([keyA], [keyB]) => keyA.localeCompare(keyB)
			);

			const sortedExercises = new Map<string, Exercise>(sortedEntries);
			return sortedExercises;
		});
	};

	const removeExercise = (exerciseName: string) => {
		setExercises((prevExercises) => {
			const newExercises = new Map<string, Exercise>(prevExercises);
			newExercises.delete(exerciseName);
			return newExercises;
		});
	};

	const loadData = (type: string): Promise<any> => {
		return new Promise(async (resolve, reject) => {
			const types = new Map<string, Dispatch<SetStateAction<any>>>([
				["logs", setLogs],
				["exercises", setExercises],
				["userData", setUserData],
			]);

			const setter = types.get(type);
			if (!setter) {
				reject(
					new Error(
						"Unable to infer data type. Please provide a valid data object."
					)
				);
				return;
			}

			if (window.ipcRenderer) {
				window.ipcRenderer
					.invoke(`load-${type}`)
					.then((data) => {
						setter(data);
						resolve(data);
					})
					.catch((error) => {
						reject(error);
					});
			} else {
				try {
					const token = localStorage.getItem("token");
					if (token) {
						const response = await axios.get(
							`${API_URL}/get${
								type.charAt(0).toUpperCase() + type.slice(1)
							}`,
							{
								headers: {
									Authorization: `Bearer ${token}`,
								},
							}
						);

						let data;
						switch (type) {
							case "logs":
								data = new Map<string, Log>(
									Object.entries(response.data)
								);
								break;
							case "exercises":
								data = new Map<string, Exercise>(
									Object.entries(response.data)
								);
								break;
							case "userData":
								data = new Map<string, string>(
									Object.entries(response.data)
								);
								break;
						}

						setter(data);
						resolve(data);
					}
				} catch (error) {
					console.error("Error fetching user details:", error);
					reject(error);
				}
			}
		});
	};
	const saveData = (type: string): Promise<void> => {
		return new Promise((resolve, reject) => {
			const types = new Map<string, any>([
				["logs", logs],
				["exercises", exercises],
				["userData", userData],
			]);

			// Check if ipcRenderer is available
			if (window.ipcRenderer) {
				const data = types.get(type);
				if (!data) {
					reject(
						new Error(
							"Unable to infer data type. Please provide a valid data object."
						)
					);
					return;
				}
				window.ipcRenderer
					.invoke(`save-${type}`, Object.fromEntries(data.entries()))
					.then(() => {
						// Resolve the promise when the saving operation is successful
						resolve();
					})
					.catch((error) => {
						// Reject the promise if there's an error during saving
						reject(error);
					});
			} else {
			}
		});
	};

	return (
		<Context.Provider
			value={{
				logs,
				setLogs,
				exercises,
				setExercises,
				userData,
				setUserData,
				addExercisesToLog,
				addExercise,
				removeExercise,
				loadData,
				saveData,
				API_URL,
			}}
		>
			{children}
		</Context.Provider>
	);
};

export const useData = (): ContextProps => {
	const context = useContext(Context);
	if (!context) {
		throw new Error("useData must be used within a ContextProvider");
	}
	return context;
};
