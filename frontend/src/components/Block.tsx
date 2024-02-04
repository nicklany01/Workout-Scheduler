import React, { useState } from "react";
import { Button, InputGroup, Stack } from "react-bootstrap";
import Day from "./Day";

const MAXDAYS = 14;
const MINDAYS = 1;

interface BlockProps {
	selectedExercises: string[][];
	setSelectedExercises: React.Dispatch<React.SetStateAction<string[][]>>;
	onExerciseChange: (
		dayIndex: number,
		exerciseIndex: number,
		exercise: string
	) => void;
	onAddExercise: (dayIndex: number) => void;
	onRemoveExercise: (dayIndex: number, exerciseIndex: number) => void;
}

const Block: React.FC<BlockProps> = ({
	selectedExercises,
	setSelectedExercises,
	onExerciseChange,
	onAddExercise,
	onRemoveExercise,
}) => {
	const [items, setItems] = useState<number>(7);

	const handleAddItem = (add: boolean) => {
		setItems((prevItems) => {
			const newItems = add ? prevItems + 1 : prevItems - 1;
			return Math.max(MINDAYS, Math.min(newItems, MAXDAYS));
		});
		setSelectedExercises((prevExercises) => {
			const newExercises = [...prevExercises];
			if (add && items !== MAXDAYS) {
				newExercises.push([]);
			} else if (!add && items !== MINDAYS) {
				newExercises.pop();
			}

			return newExercises;
		});
	};

	return (
		<Stack gap={3} className="pb-3">
			<Stack direction="horizontal">
				<div className="d-flex align-items-center">
					<h5 style={{ whiteSpace: "nowrap" }}>
						Number of days in Block: {items}
					</h5>
				</div>
				<InputGroup>
					<Button
						style={{ width: "50px" }}
						className="ms-auto"
						variant="secondary"
						onClick={() => handleAddItem(false)}
					>
						<h5>-</h5>
					</Button>
					<Button
						style={{ width: "50px" }}
						variant="secondary"
						onClick={() => handleAddItem(true)}
					>
						<h5>+</h5>
					</Button>
				</InputGroup>
			</Stack>
			{Array.from({ length: items }, (_, dayIndex) => (
				<Day
					key={dayIndex}
					dayIndex={dayIndex}
					selectedExercises={selectedExercises[dayIndex] || []}
					onExerciseChange={(exerciseIndex, exercise) =>
						onExerciseChange(dayIndex, exerciseIndex, exercise)
					}
					onAddExercise={() => onAddExercise(dayIndex)}
					onRemoveExercise={(exerciseIndex) =>
						onRemoveExercise(dayIndex, exerciseIndex)
					}
				/>
			))}
		</Stack>
	);
};

export default Block;
