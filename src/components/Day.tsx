import React from "react";
import { Card, ListGroup, Form, Button, InputGroup } from "react-bootstrap";
import { useData } from "../Context";

interface DayProps {
	dayIndex: number;
	selectedExercises: string[];
	onExerciseChange: (exerciseIndex: number, exercise: string) => void;
	onAddExercise: () => void;
	onRemoveExercise: (exerciseIndex: number) => void;
}

const Day: React.FC<DayProps> = ({
	dayIndex,
	selectedExercises,
	onExerciseChange,
	onAddExercise,
	onRemoveExercise,
}) => {
	const { exercises } = useData();
	return (
		<Card key={dayIndex}>
			<Card.Header>Day {dayIndex + 1}</Card.Header>
			<Card.Body>
				<ListGroup className="list-group-flush">
					{selectedExercises.map((exercise, exerciseIndex) => (
						<ListGroup.Item key={exerciseIndex}>
							<InputGroup>
								<Button
									variant="danger"
									onClick={() =>
										onRemoveExercise(exerciseIndex)
									}
								>
									-
								</Button>
								<Form.Select
									required
									value={exercise}
									onChange={(e) =>
										onExerciseChange(
											exerciseIndex,
											e.target.value
										)
									}
									isInvalid={
										exercise === "" ||
										exercise === "Select Exercise"
									}
								>
									<option value="" disabled>
										Select Exercise
									</option>
									{[...exercises.entries()].map(
										([optionIndex, option]) => (
											<option
												key={optionIndex}
												value={option.name}
											>
												{option.name}
											</option>
										)
									)}
								</Form.Select>
								<Form.Control.Feedback type="invalid">
									Please select an exercise.
								</Form.Control.Feedback>
							</InputGroup>
						</ListGroup.Item>
					))}
				</ListGroup>
				<Button variant="secondary" onClick={onAddExercise}>
					Add Exercise
				</Button>
			</Card.Body>
		</Card>
	);
};

export default Day;
