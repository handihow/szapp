import { Action } from '@ngrx/store'; 
import { Course } from './course.model';

export const START_COURSE = '[Course] Start Course';
export const STOP_COURSE = '[Course] Stop Course';


export class StartCourse implements Action {
	readonly type = START_COURSE;

	constructor(public payload: Course){}
}

export class StopCourse implements Action {
	readonly type = STOP_COURSE;

}

export type CourseActions = StartCourse | StopCourse;