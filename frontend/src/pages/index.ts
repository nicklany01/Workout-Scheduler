export { default as About } from './About';
export { default as Custom } from './Custom';
export { default as ErrorPage } from './ErrorPage';
export { default as Home } from './Home';
export { default as Template } from './Template';
export { default as Exercises } from './Exercises';
export { default as Progress } from './Progress';
export { default as Account } from './Account';

export class ExerciseLog {
	constructor(public exercise: string, public sets: number = 0, public reps: number = 0, public weight: number = 0) { }
}

export interface Log {
	exerciseLogs: ExerciseLog[];
}

export type Muscle = 'Triceps' | 'Biceps' | 'Forearms' | 'Chest' | 'Front Delts' | 'Side Delts' | 'Rear Delts' | 'Lats' | 'Traps' | 'Quads' | 'Hamstrings' | 'Calves' | 'Abs' | 'Obliques' | 'Glutes' | 'Cardio';

export class Exercise{
	static Placeholder: Exercise = new Exercise('Placeholder', []);

	constructor(public name: string, public muscles: Muscle[], public progress: Map<string, number> = new Map<string, number>) {}
}
