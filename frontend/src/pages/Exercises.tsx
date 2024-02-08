import React, { useEffect, useRef, useState } from "react";
import {
	Container,
	Row,
	Col,
	Form,
	Card,
	Button,
	InputGroup,
} from "react-bootstrap";
import { useData } from "../Context";
import { NavBar, ExerciseView } from "../components";
import { Exercise, Muscle } from "../pages";

const Exercises = () => {
	const { exercises, addExercise, loadData, saveData } = useData();

	const availableMuscles: Muscle[] = [
		"Abs",
		"Biceps",
		"Calves",
		"Cardio",
		"Chest",
		"Forearms",
		"Front Delts",
		"Glutes",
		"Hamstrings",
		"Lats",
		"Obliques",
		"Quads",
		"Rear Delts",
		"Side Delts",
		"Traps",
		"Triceps",
	];

	const [exerciseName, setExerciseName] = useState("");
	const [muscles, setMuscles] = useState<Array<Muscle>>([]);
	const [validated, setValidated] = useState(false);

	const selectMuscleRef = useRef<HTMLSelectElement | null>(null);

	useEffect(() => {
		if (selectMuscleRef.current) {
			// Save the current scroll position
			const originalScrollTop = selectMuscleRef.current.scrollTop;

			selectMuscleRef.current.focus();

			// Restore the scroll position after a short delay
			setTimeout(() => {
				if (selectMuscleRef.current) {
					selectMuscleRef.current.scrollTop = originalScrollTop;
				}
			}, 0);
		}
	}, [muscles]);

	useEffect(() => {
		if (exercises.size > 0) {
			saveData("exercises");
		}
	}, [exercises]);

	useEffect(() => {
		loadData("exercises");
	}, []);

	const toggleMuscle = (selectedMuscle: Muscle) => {
		setMuscles((prevMuscles) =>
			prevMuscles.includes(selectedMuscle)
				? prevMuscles.filter((muscle) => muscle !== selectedMuscle)
				: [...prevMuscles, selectedMuscle]
		);
	};

	const handleMuscleMouseDown = (
		e: React.MouseEvent<HTMLOptionElement, MouseEvent>,
		muscle: Muscle
	) => {
		e.preventDefault();

		// Toggle the muscle
		toggleMuscle(muscle);
	};

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const form = event.currentTarget;

		if (form.checkValidity() && !exercises.has(exerciseName)) {
			const exercise = new Exercise(exerciseName, [...muscles]);
			addExercise(exercise);
			setExerciseName("");
			setMuscles([]);
			setValidated(false);
		} else {
			setValidated(true);
		}
	};

	return (
		<>
			<NavBar />
			<Container>
				<Form noValidate onSubmit={handleSubmit}>
					<Card className="mb-3" style={{ minHeight: "170px" }}>
						<Card.Header>
							<InputGroup hasValidation>
								<Form.Control
									type="text"
									placeholder="New Exercise"
									required
									value={exerciseName}
									onChange={(e) =>
										setExerciseName(e.target.value)
									}
									isInvalid={
										(validated &&
											exercises.has(exerciseName)) ||
										(validated && exerciseName === "")
									}
									isValid={validated}
								/>
								<Form.Control.Feedback type="invalid">
									Please enter a unique exercise name.
								</Form.Control.Feedback>
							</InputGroup>
						</Card.Header>
						<Card.Body>
							<strong>Muscles: </strong> {muscles.join(", ")}
							<Form.Group
								className="mt-3"
								controlId="selectMuscle"
							>
								<Form.Select
									required
									multiple
									ref={selectMuscleRef}
									value={muscles}
									onChange={(e) => console.log(e)}
									isInvalid={
										validated && muscles.length === 0
									}
									isValid={validated} // if isInvalid is true, isValid is ignored
								>
									{availableMuscles.map((option) => (
										<option
											key={option}
											value={option}
											onMouseDown={(e) =>
												handleMuscleMouseDown(e, option)
											}
										>
											{option}
										</option>
									))}
								</Form.Select>
								<Form.Control.Feedback type="invalid">
									Please select at least one muscle.
								</Form.Control.Feedback>
							</Form.Group>
							<Button
								variant="success"
								className="w-100 mt-3"
								type="submit"
							>
								Create Exercise
							</Button>
						</Card.Body>
					</Card>
				</Form>
				<Row>
					{[...exercises.entries()].map(([exIndex, ex]) => (
						<Col key={exIndex} md={4} xs={6}>
							<ExerciseView exercise={ex} />
						</Col>
					))}
				</Row>
			</Container>
		</>
	);
};

export default Exercises;
