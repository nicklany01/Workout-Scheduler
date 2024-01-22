import React, { useState } from "react";
import { NavBar, Block } from "../components";
import { Container, Form, Button } from "react-bootstrap";
import { useData } from "../Context"; // Update the path based on your file structure

function Custom() {
	const { addExercisesToLog, saveData } = useData();

	const [selectedExercises, setSelectedExercises] = useState<Array<string[]>>(
		Array.from({ length: 7 }, () => [])
	);

	const handleExerciseChange = (
		dayIndex: number,
		exerciseIndex: number,
		exercise: string
	) => {
		setSelectedExercises((prevExercises) => {
			const newExercises = [...prevExercises];
			newExercises[dayIndex][exerciseIndex] = exercise;
			return newExercises;
		});
	};

	const handleAddExercise = (dayIndex: number) => {
		setSelectedExercises((prevExercises) => {
			const newExercises = [...prevExercises];
			newExercises[dayIndex] = [...(newExercises[dayIndex] || []), ""];
			return newExercises;
		});
	};

	const handleRemoveExercise = (dayIndex: number, exerciseIndex: number) => {
		setSelectedExercises((prevExercises) => {
			const newExercises = prevExercises.map((dayExercises, i) =>
				i === dayIndex
					? dayExercises
							.slice(0, exerciseIndex)
							.concat(dayExercises.slice(exerciseIndex + 1))
					: [...dayExercises]
			);
			return newExercises;
		});
	};

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const form = event.currentTarget;

		if (form.checkValidity()) {
			addExercisesToLog(selectedExercises);
			alert(
				`Selected exercises for each day: ${selectedExercises
					.map((dayExercises) => dayExercises.join(", "))
					.join(" | ")}`
			);
		} else {
			event.stopPropagation();
			alert("Please fill out all fields");
		}
	};

	return (
		<>
			<NavBar />
			<Container>
				<Form noValidate onSubmit={handleSubmit}>
					<Block
						selectedExercises={selectedExercises}
						setSelectedExercises={setSelectedExercises}
						onExerciseChange={handleExerciseChange}
						onAddExercise={handleAddExercise}
						onRemoveExercise={handleRemoveExercise}
					/>
					<div className="d-grid">
						<Button variant="primary mb-3" type="submit">
							Submit
						</Button>
						<Button
							variant="success mb-3"
							onClick={() => {
								saveData("logs");
								saveData("config");
							}}
						>
							Save
						</Button>
					</div>
				</Form>
			</Container>
		</>
	);
}

export default Custom;
