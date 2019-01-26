import { Action } from '@ngrx/store'; 
import { Evaluation } from '../evaluations/evaluation.model';
import { Course } from '../courses/course.model';
import { Formative } from '../formatives/formative.model';

export const START_COURSE = '[Course] Start Course';
export const STOP_COURSE = '[Course] Stop Course';

export const START_ASSESSMENT = '[Assessment] Start Assessment';
export const STOP_ASSESSMENT = '[Assessment] Stop Assessment';

export const SET_ASSESSMENT_FILTER = '[String] Set Assessment Filter';
export const UNSET_ASSESSMENT_FILTER = '[String] Unset Assessment Filter';

export const SET_FORMATIVE = '[Formative] Set Formative'
export const UNSET_FORMATIVE = '[Formative] UnSet Formative'

export class StartCourse implements Action {
	readonly type = START_COURSE;

	constructor(public payload: Course){}
}

export class StopCourse implements Action {
	readonly type = STOP_COURSE;

}

export class StartAssessment implements Action {
	readonly type = START_ASSESSMENT;

	constructor(public payload: Evaluation){}
}

export class StopAssessment implements Action {
	readonly type = STOP_ASSESSMENT;

}

export class SetAssessmentFilter implements Action {
	readonly type = SET_ASSESSMENT_FILTER;

	constructor(public payload: string){};
}

export class UnsetAssessmentFilter implements Action {
	readonly type = UNSET_ASSESSMENT_FILTER;
}

export class SetFormative implements Action {
	readonly type = SET_FORMATIVE;

	constructor(public payload: Formative){};
}

export class UnsetFormative implements Action {
	readonly type = UNSET_FORMATIVE;
}

export type AssessmentActions = StartAssessment | StopAssessment | StartCourse | StopCourse | 
									SetAssessmentFilter | UnsetAssessmentFilter | SetFormative | UnsetFormative;

