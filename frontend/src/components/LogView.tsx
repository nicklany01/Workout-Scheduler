import { Card, ListGroup, Row, Col, Form, Button } from "react-bootstrap";
import { ExerciseLog, Log } from "../pages";

interface LogViewProps {
	log: Log;
	date: string;
	current: boolean;
	onHandleSubmit: (e: any) => void;
}

const checkComplete = (log: Log) => {
	return log.exerciseLogs.every((exerciseLog: ExerciseLog) => {
		return (
			exerciseLog.sets !== 0 &&
			exerciseLog.reps !== 0
		);
	});
};

const LogView: React.FC<LogViewProps> = ({
	log,
	date,
	current,
	onHandleSubmit,
}) => {
	return (
		<Col xs={current ? 12 : 4} className="mb-3">
			<Card
				key={date}
				border={
					current
						? checkComplete(log)
							? "success"
							: "warning"
						: "secondary"
				}
			>
				<Card.Header>{date}</Card.Header>
				<Card.Body className="p-2">
					<ListGroup className="list-group-flush">
						{log.exerciseLogs.map((exerciseLog, index) => (
							<ListGroup.Item key={index} className="pb-0 pt-1">
								<Row>
									<Col className="d-flex align-items-center justify-content-center">
										<h5>{exerciseLog.exercise}</h5>
									</Col>
									{current && (
										<>
											<Form.Group
												as={Col}
												controlId={`sets-${index}`}
											>
												<Form.Label>Sets</Form.Label>
												<Form.Control
													type="sets"
													defaultValue={exerciseLog.sets.toString()}
													className="mb-2"
												/>
											</Form.Group>
											<Form.Group
												as={Col}
												controlId={`reps-${index}`}
											>
												<Form.Label>Reps</Form.Label>
												<Form.Control
													type="reps"
													defaultValue={exerciseLog.reps.toString()}
												/>
											</Form.Group>
											<Form.Group
												as={Col}
												controlId={`weight-${index}`}
											>
												<Form.Label>Weight</Form.Label>
												<Form.Control
													type="weight"
													defaultValue={exerciseLog.weight.toString()}
												/>
											</Form.Group>
										</>
									)}
								</Row>
							</ListGroup.Item>
						))}
					</ListGroup>
					{current && (
						<Button
							className="w-100"
							variant="success"
							type="submit"
							onClick={onHandleSubmit}
						>
							Submit
						</Button>
					)}
				</Card.Body>
			</Card>
		</Col>
	);
};

export default LogView;
