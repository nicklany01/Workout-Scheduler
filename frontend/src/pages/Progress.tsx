import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js/auto";
import "chartjs-adapter-date-fns";
import { Line } from "react-chartjs-2";
import { NavBar } from "../components";
import { useLocation } from "react-router-dom";
import { useData } from "../Context";
import { Container, Dropdown, Stack } from "react-bootstrap";
import ColorHash from "color-hash";
import { useEffect } from "react";

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
);

const Progress = () => {
	const { exercises, loadData } = useData();
	const { search } = useLocation();
	const params = new URLSearchParams(search);
	var exerciseSpecified = params.get("exercise");
	if (exerciseSpecified) {
		exerciseSpecified = decodeURIComponent(exerciseSpecified);
	}

	useEffect(() => {
		loadData("exercises");
	}, []);

	var options = {
		responsive: true,
		plugins: {
			legend: {
				display: exerciseSpecified ? false : true,
			},
			title: {
				display: true,
				text:
					"Progress" +
					(exerciseSpecified ? ` for ${exerciseSpecified}` : ""),
			},
			scales: {
				x: {
					type: "time",
					time: {
						unit: "month",
					},
				},
			},
		},
	};

	var datasets;
	if (exerciseSpecified && exercises.get(exerciseSpecified)) {
		const progressData = exercises.get(exerciseSpecified)?.progress || {};

		// Format data for the chart
		const dataPoints = Object.entries(progressData).map(
			([date, value]) => ({
				x: date,
				y: value,
			})
		);
		datasets = [
			{
				data: dataPoints,
				borderColor: "rgb(255, 99, 132)",
				backgroundColor: "rgba(255, 99, 132, 0.5)",
			},
		];
	} else {
		console.log(exercises);
		const colorHash = new ColorHash();
		datasets = Array.from(exercises.values()).map((exercise) => {
			const dataPoints = Object.entries(exercise.progress).map(
				([date, value]) => ({
					x: date,
					y: value,
				})
			);
			return {
				label: exercise.name || undefined,
				data: dataPoints,
				borderColor: colorHash.hex(exercise.name),
				backgroundColor: colorHash.hex(exercise.name) + "80",
			};
		});

		// Sort datasets by the earliest progress date in their set (this prevents a bug that causes larger date values to appear before smaller ones because dataset came first in the array)
		// reduce time complexity of comparisons by finding min date first (reduces from O(n^2 log n) to O(n log n) for sorting
		const minDate = datasets.map((dataset: { data: any[]; }) => {
			return {
				dataset, minDate: dataset.data.reduce((min, dataPoint) => (dataPoint.x < min ? dataPoint.x : min), dataset.data[0].x)
				}
			}
		);
		minDate.sort((a, b) => a.minDate.localeCompare(b.minDate));
		datasets = minDate.map(({ dataset }) => dataset);
	}
	const data = {
		datasets,
	};

	return (
		<>
			<NavBar />
			<Container>
				<Stack>
					<Dropdown>
						<Dropdown.Toggle>Exercises</Dropdown.Toggle>
						<Dropdown.Menu
							style={{ maxHeight: "200px", overflowY: "auto" }}
						>
							<Dropdown.Item href="/progress">
								All Exercises
							</Dropdown.Item>
							<Dropdown.Divider />

							{[...exercises.entries()].map(([exIndex, ex]) => (
								<Dropdown.Item
									key={exIndex}
									href={`/progress?exercise=${exIndex}`}
								>
									{ex.name}
								</Dropdown.Item>
							))}
						</Dropdown.Menu>
					</Dropdown>
					<Line options={options} data={data} />
				</Stack>
			</Container>
		</>
	);
};

export default Progress;
