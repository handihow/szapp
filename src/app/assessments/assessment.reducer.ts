import { Action, createFeatureSelector, createSelector } from '@ngrx/store'
import { Evaluation } from '../evaluations/evaluation.model';
import { User } from '../auth/user.model';
import { Course } from '../courses/course.model';
import { Formative } from '../formatives/formative.model';

import { AssessmentActions, START_ASSESSMENT, STOP_ASSESSMENT, START_COURSE, STOP_COURSE, 
				SET_ASSESSMENT_FILTER, UNSET_ASSESSMENT_FILTER, SET_FORMATIVE, UNSET_FORMATIVE} from './assessment.actions';
import * as fromRoot from '../app.reducer';

export interface AssessmentState {
	activeAssessment: Evaluation;
	activeCourse: Course;
	currentFilter: string;
	currentFormative: Formative;
}

export interface State extends fromRoot.State{
	assessment: AssessmentState;
}

const initialState: AssessmentState = {
	activeAssessment: null,
	activeCourse: null,
	currentFilter: null,
	currentFormative: null,
};

export function assessmentReducer(state = initialState, action: AssessmentActions) {
	switch (action.type) {
		case START_COURSE:
			return {
				...state,
				activeCourse: action.payload
			}
		case STOP_COURSE:
			return {
				...state,
				activeCourse: null,
			}
		case START_ASSESSMENT:
			return {
				...state,
				activeAssessment: action.payload
			}
		case STOP_ASSESSMENT:
			return {
				...state,
				activeAssessment: null
			}
		case SET_ASSESSMENT_FILTER:
			return {
				...state,
				currentFilter: action.payload
			}
		case UNSET_ASSESSMENT_FILTER:
			return {
				...state,
				currentFilter: null
			}
		case SET_ASSESSMENT_FILTER:
			return {
				...state,
				currentFilter: action.payload
			}
		case UNSET_ASSESSMENT_FILTER:
			return {
				...state,
				currentFilter: null
			}
		case SET_FORMATIVE:
			return {
				...state,
				currentFormative: action.payload
			}
		case UNSET_FORMATIVE:
			return {
				...state,
				currentFormative: null
			}
		default: {
			return state;
		}
	}
}

export const getAssessmentState = createFeatureSelector<AssessmentState>('assessment');

export const getActiveAssessment = createSelector(getAssessmentState, (state: AssessmentState) => state.activeAssessment);
export const getIsEditingAssessment = createSelector(getAssessmentState, (state: AssessmentState) => state.activeAssessment != null);
export const getActiveCourse = createSelector(getAssessmentState, (state: AssessmentState) => state.activeCourse);
export const getIsEditingCourse = createSelector(getAssessmentState, (state: AssessmentState) => state.activeCourse != null);
export const getCurrentFilter = createSelector(getAssessmentState, (state: AssessmentState) => state.currentFilter);
export const getCurrentFormative = createSelector(getAssessmentState, (state: AssessmentState) => state.currentFormative);

