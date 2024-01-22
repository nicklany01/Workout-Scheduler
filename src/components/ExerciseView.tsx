import React from "react";
import { Button, Card } from "react-bootstrap";
import { Exercise } from "../pages";
import { useData } from "../Context";

interface ExerciseCardProps {
	exercise: Exercise;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise }) => {
	const { removeExercise } = useData();
	return (
		<Card className="mb-3" style={{ minHeight: "170px" }}>
			<Card.Header className="d-flex">
				{exercise.name}
				<Button
					variant="danger"
					className="ms-auto"
					style={{
						width: "30px",
						height: "30px",
						padding: "0",
						lineHeight: "inherit",
					}}
					onClick={() => removeExercise(exercise.name)}
				>
					<span className="d-flex align-items-center justify-content-center">
						-
					</span>
				</Button>
			</Card.Header>
			<Card.Body className="d-flex flex-column">
				<Card.Text>
					<strong>Muscles:</strong> {exercise.muscles.join(", ")}
				</Card.Text>
				<div className="mt-auto">
					<Button
						variant="outline-success"
						href={`/progress?exercise=${exercise.name}`}
					>
						Progress
					</Button>
				</div>
			</Card.Body>
		</Card>
	);
};

export default ExerciseCard;
