import { Action } from '@ngrx/store'; 
import { Course } from './course.model';

export const START_COURSE = '[Course] Start Course';
export const STOP_COURSE = '[Course] Stop Course';

export const SET_COURSE_FILTER = '[String] Set Course Filter';
export const UNSET_COURSE_FILTER = '[String] Unset Course Filter';

export class StartCourse implements Action {
	readonly type = START_COURSE;

	constructor(public payload: Course){}
}

export class StopCourse implements Action {
	readonly type = STOP_COURSE;

}

export class SetCourseFilter implements Action {
	readonly type = SET_COURSE_FILTER;

	constructor(public payload: string){};
}

export class UnsetCourseFilter implements Action {
	readonly type = UNSET_COURSE_FILTER;
}

export type CourseActions = StartCourse | StopCourse | SetCourseFilter | UnsetCourseFilter;