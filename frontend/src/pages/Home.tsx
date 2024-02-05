import { Container, Form, Navbar, Row } from "react-bootstrap";
import { NavBar, LogView } from "../components";
import { useData } from "../Context";
import { addDays, format } from "date-fns";
import { useEffect, useState } from "react";
import { Exercise, ExerciseLog, Log } from "../pages";

const Home = () => {
	const { logs, setLogs, saveData, exercises, setExercises, userData } =
		useData();

	const [greeting, setGreeting] = useState("");
	useEffect(() => {
		const currentTime = new Date().getHours();

		if (currentTime >= 5 && currentTime < 12) {
			setGreeting("Good Morning");
		} else if (currentTime >= 12 && currentTime < 18) {
			setGreeting("Good Afternoon");
		} else {
			setGreeting("Good Evening");
		}
	}, []);

	useEffect(() => {
		if (logs.size > 0) {
			saveData("logs");
		}
	}, [logs]);

	useEffect(() => {
		if (exercises.size > 0) {
			saveData("exercises");
		}
	}, [exercises]);

	const handleSubmit = (e: any) => {
		e.preventDefault();

		const date = format(new Date(), "yyyy-MM-dd");
		const log = logs.get(date);
		if (log !== undefined) {
			const newExercises = new Map<string, Exercise>(exercises);
			setLogs((prevLogs) => {
				const updatedLogs = new Map<string, Log>(prevLogs);

				const updatedExerciseLogs = log.exerciseLogs.map(
					(exerciseLog, index) => {
						let sets =
							parseInt(
								(
									document.getElementById(
										`sets-${index}`
									) as HTMLInputElement
								).value
							) || 0;
						let reps =
							parseInt(
								(
									document.getElementById(
										`reps-${index}`
									) as HTMLInputElement
								).value
							) || 0;
						let weight =
							parseInt(
								(
									document.getElementById(
										`weight-${index}`
									) as HTMLInputElement
								).value
							) || 0;

						var muscles = newExercises
							?.get(exerciseLog.exercise)
							?.muscles.map((muscle) => muscle);

						var exercise: Exercise = new Exercise(
							exerciseLog.exercise,
							muscles || []
						);
						const exerciseProgress = newExercises?.get(
							exerciseLog.exercise
						)?.progress;
						if (exerciseProgress !== undefined) {
							exercise.progress = new Map(
								Object.entries(exerciseProgress)
							);
						} else {
							exercise.progress = new Map();
						}
						// 1RM calculation
						const ORM = Math.round(
							weight / (1.0278 - 0.0278 * reps)
						);
						exercise.progress.set(date, ORM);
						exercise.progress.set(
							format(addDays(date, 1), "yyyy-MM-dd"),
							ORM
						);
						newExercises.set(exerciseLog.exercise, exercise);

						return new ExerciseLog(
							exerciseLog.exercise,
							sets,
							reps,
							weight
						);
					}
				);

				updatedLogs.set(date, { exerciseLogs: updatedExerciseLogs });
				return updatedLogs;
			});
			setExercises(newExercises);
			console.log(newExercises);
		}
	};
	return (
		<>
			<NavBar />
			<Container>
				<Navbar expand="lg" className="justify-content-center">
					<h1>
						{userData.get("name")
							? `${greeting}, ${userData.get("name")}!`
							: greeting + "!"}
					</h1>
				</Navbar>
				<Form>
					<Row>
						{[...logs.entries()].map(([date, log]) =>
							date >= format(new Date(), "yyyy-MM-dd") ? (
								<LogView
									current={
										date ===
										format(new Date(), "yyyy-MM-dd")
									}
									onHandleSubmit={(e) => handleSubmit(e)}
									key={date}
									log={log}
									date={date}
								/>
							) : null
						)}
					</Row>
				</Form>
			</Container>
		</>
	);
};

export default Home;
