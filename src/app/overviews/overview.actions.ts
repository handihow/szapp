import { Action } from '@ngrx/store'; 
import { Project } from '../projects/project.model';
import { Program } from '../programs/program.model';
import { User } from '../auth/user.model';
import { Course } from '../courses/course.model';
import { Formative } from '../formatives/formative.model';

export const SELECT_PROJECT = '[Project] Start Project';
export const UNSELECT_PROJECT = '[Project] Stop Project';
export const SELECT_PROGRAM = '[Program] Start Prgram';
export const UNSELECT_PROGRAM = '[Program] Stop Program';
export const SELECT_STUDENT = '[User] Set Student';
export const UNSELECT_STUDENT = '[User] Unset Student'
export const START_COURSE = '[Course] Start Course';
export const STOP_COURSE = '[Course] Stop Course';
export const SELECT_FORMATIVE = '[Formative] Start Formative';
export const UNSELECT_FORMATIVE = '[Formative] Stop Formative';

export class SelectProject implements Action {
	readonly type = SELECT_PROJECT;

	constructor(public payload: Project){}
}

export class UnselectProject implements Action {
	readonly type = UNSELECT_PROJECT;

}

export class SelectProgram implements Action {
	readonly type = SELECT_PROGRAM;

	constructor(public payload: Program){}
}

export class UnselectProgram implements Action {
	readonly type = UNSELECT_PROGRAM;

}

export class SelectStudent implements Action {
	readonly type = SELECT_STUDENT;

	constructor(public payload: User){}
}

export class UnselectStudent implements Action {
	readonly type = UNSELECT_STUDENT;
}

export class StartCourse implements Action {
	readonly type = START_COURSE;

	constructor(public payload: Course){}
}

export class StopCourse implements Action {
	readonly type = STOP_COURSE;

}

export class SelectFormative implements Action {
	readonly type = SELECT_FORMATIVE;

	constructor(public payload: Project){}
}

export class UnselectFormative implements Action {
	readonly type = UNSELECT_FORMATIVE;

}


export type OverviewActions = SelectProject | UnselectProject | SelectProgram | 
				UnselectProgram | SelectStudent | UnselectStudent | StartCourse | StopCourse | 
				SelectFormative | UnselectFormative;
