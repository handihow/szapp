import { Action, createFeatureSelector, createSelector } from '@ngrx/store'
import { Project } from '../projects/project.model';
import { Program } from '../programs/program.model';
import { Skill } from '../skills/skill.model';
import { User } from '../auth/user.model';
import { Evaluation } from '../evaluations/evaluation.model';
import { Course } from '../courses/course.model';

import { OverviewActions, SELECT_PROJECT, UNSELECT_PROJECT, SELECT_PROGRAM, 
					UNSELECT_PROGRAM, SELECT_STUDENT, UNSELECT_STUDENT, START_COURSE, STOP_COURSE } from './overview.actions';
import * as fromRoot from '../app.reducer';

export interface OverviewState {
	selectedProject: Project;
	selectedProgram: Program;
	selectedStudent: User;
	activeCourse: Course;
}

export interface State extends fromRoot.State{
	overview: OverviewState;
}

const initialState: OverviewState = {
	selectedProject: null,
	selectedProgram: null,
	selectedStudent: null,
	activeCourse: null
};

export function overviewReducer(state = initialState, action: OverviewActions) {
	switch (action.type) {
		case SELECT_PROJECT:
			return {
				...state,
				selectedProject: action.payload
			}
		case UNSELECT_PROJECT:
			return {
				...state,
				selectedProject: null,
			}
		case SELECT_PROGRAM:
			return {
				...state,
				selectedProgram: action.payload
			}
		case UNSELECT_PROGRAM:
			return {
				...state,
				selectedProgram: null,
			}
		case SELECT_STUDENT:
			return {
				...state,
				selectedStudent: action.payload
			}
		case UNSELECT_STUDENT:
			return {
				...state,
				selectedStudent: null,
			}
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
		default: {
			return state;
		}
	}
}

export const getOverviewState = createFeatureSelector<OverviewState>('overview');

export const getSelectedProject = createSelector(getOverviewState, (state: OverviewState) => state.selectedProject);
export const hasSelectedProject = createSelector(getOverviewState, (state: OverviewState) => state.selectedProject != null);

export const getSelectedProgram = createSelector(getOverviewState, (state: OverviewState) => state.selectedProgram);
export const hasSelectedProgram = createSelector(getOverviewState, (state: OverviewState) => state.selectedProgram != null);

export const getSelectedStudent = createSelector(getOverviewState, (state: OverviewState) => state.selectedStudent );
export const hasSelectedStudent = createSelector(getOverviewState, (state: OverviewState) => state.selectedStudent != null);

export const getActiveCourse = createSelector(getOverviewState, (state: OverviewState) => state.activeCourse);
export const getIsEditingCourse = createSelector(getOverviewState, (state: OverviewState) => state.activeCourse != null);
