import React, {
	createContext,
	useContext,
	ReactNode,
	useState,
	Dispatch,
	SetStateAction,
	useEffect,
} from "react";
import { Log, ExerciseLog, Exercise } from "./pages";
import { format, addDays } from "date-fns";

interface ContextProps {
	logs: Map<string, Log>;
	setLogs: Dispatch<SetStateAction<Map<string, Log>>>;
	exercises: Map<string, Exercise>;
	setExercises: Dispatch<SetStateAction<Map<string, Exercise>>>;
	config: Map<string, string>;
	setConfig: Dispatch<SetStateAction<Map<string, string>>>;

	addExercisesToLog: (selectedExercises: string[][]) => void;
	addExercise: (exercise: Exercise) => void;
	removeExercise: (exerciseName: string) => void;

	saveData: (data: string) => void;
}

const Context = createContext<ContextProps | undefined>(undefined);

export const ContextProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [logs, setLogs] = useState<Map<string, Log>>(new Map());
	const [exercises, setExercises] = useState<Map<string, Exercise>>(
		new Map()
	);
	const [config, setConfig] = useState<Map<string, string>>(new Map());

	// when component is mounted this executes
	useEffect(() => {
		// Check if ipcRenderer is available
		if (window.ipcRenderer) {
			// Request data from main process
			window.ipcRenderer.invoke("load-logs").then((logs) => {
				setLogs(logs);
			});
			window.ipcRenderer.invoke("load-exercises").then((ex) => {
				setExercises(ex);
			});
			window.ipcRenderer.invoke("load-config").then((config) => {
				setConfig(config);
			});
		}
	}, []);

	const addExercisesToLog = (selectedExercises: string[][]) => {
		var days = selectedExercises.length;
		console.log(selectedExercises);
		// Check that startDate is set or is in the future
		var dateString = config?.get("startDate");
		var date: Date;
		if (dateString === undefined) {
			date = new Date();
		} else {
			date = new Date(dateString);
			if (date < new Date()) {
				date = new Date();
			}
		}
		const originalDate = date;

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

			setConfig((prevConfig) => {
				const newConfig = new Map<string, string>(prevConfig);
				date = addDays(originalDate, days);
				newConfig.set("startDate", format(date, "yyyy-MM-dd"));
				return newConfig;
			});

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

	const saveData = (type: string) => {
		const types = new Map<string, any>([
			["logs", logs],
			["exercises", exercises],
			["config", config],
		]);
		// Check if ipcRenderer is available
		if (window.ipcRenderer) {
			if (!types.get(type)) {
				console.error(
					"Unable to infer data type. Please provide a valid data object."
				);
				return;
			}

			const data = types.get(type);
			window.ipcRenderer.send(
				`save-${type.toLowerCase()}`,
				Object.fromEntries(data.entries())
			);
		}
	};

	return (
		<Context.Provider
			value={{
				logs,
				setLogs,
				exercises,
				setExercises,
				config,
				setConfig,
				addExercisesToLog,
				addExercise,
				removeExercise,
				saveData,
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
