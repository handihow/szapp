import { Action, createFeatureSelector, createSelector } from '@ngrx/store'
import { Course } from './course.model';

import { CourseActions, START_COURSE, STOP_COURSE,SET_COURSE_FILTER, UNSET_COURSE_FILTER } from './course.actions';
import * as fromRoot from '../app.reducer';

export interface CourseState {
	activeCourse: Course;
	courseFilter: string;
}

export interface State extends fromRoot.State{
	course: CourseState;
}

const initialState: CourseState = {
	activeCourse: null,
	courseFilter: null
};

export function courseReducer(state = initialState, action: CourseActions) {
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
		case SET_COURSE_FILTER:
			return {
				...state,
				courseFilter: action.payload
			}
		case UNSET_COURSE_FILTER:
			return {
				...state,
				courseFilter: null
			}
		default: {
			return state;
		}
	}
}

export const getCourseState = createFeatureSelector<CourseState>('course');

export const getActiveCourse = createSelector(getCourseState, (state: CourseState) => state.activeCourse);
export const getCourseFilter = createSelector(getCourseState, (state: CourseState) => state.courseFilter);
export const getIsEditingCourse = createSelector(getCourseState, (state: CourseState) => state.activeCourse != null);
