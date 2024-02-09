import React, { useEffect, useState } from "react";
import { NavBar, Block } from "../components";
import { Container, Form, Button, Stack } from "react-bootstrap";
import { useData } from "../Context"; // Update the path based on your file structure
import { format, formatDate } from "date-fns";

function Custom() {
	const { addExercisesToLog, saveData, loadData } = useData();

	const [startDate, setStartDate] = useState<string>(
		format(new Date(), "yyyy-MM-dd")
	);
	const [endDate, setEndDate] = useState<string>(
		format(new Date(Date.now() - 86400000), "yyyy-MM-dd")
	);

	useEffect(() => {
		loadData("exercises");
	});

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
			addExercisesToLog(selectedExercises, startDate);
			console.log(
				`Selected exercises for each day: ${selectedExercises
					.map((dayExercises) => dayExercises.join(", "))
					.join(" | ")}`
			);
			const newEndDate = new Date(endDate);
			newEndDate.setDate(newEndDate.getDate() + selectedExercises.length);
			setEndDate(formatDate(newEndDate, "yyyy-MM-dd"));
		} else {
			event.stopPropagation();
			// add alert to fill out all fields
		}
	};

	return (
		<>
			<NavBar />
			<Container>
				<Form noValidate onSubmit={handleSubmit}>
					<Form.Group className="mb-3" as={Stack} direction="horizontal">
						<h5 className="me-3" style={{whiteSpace: "nowrap"}}>Start Date</h5>
						<Form.Control
							type="date"
							value={startDate}
							required
							onChange={(e) => {
								setStartDate(e.target.value);
								setEndDate(e.target.value);
							}}
						/>
					</Form.Group>
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
								saveData(
									"logs",
									`insert:${startDate}:${endDate}`
								);
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
