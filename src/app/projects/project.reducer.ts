import { Action, createFeatureSelector, createSelector } from '@ngrx/store'
import { Project } from './project.model';

import { ProjectActions, START_PROJECT, STOP_PROJECT } from './project.actions';
import * as fromRoot from '../app.reducer';

export interface ProjectState {
	activeProject: Project;
}

export interface State extends fromRoot.State{
	project: ProjectState;
}

const initialState: ProjectState = {
	activeProject: null,
};

export function projectReducer(state = initialState, action: ProjectActions) {
	switch (action.type) {
		case START_PROJECT:
			return {
				...state,
				activeProject: action.payload
			}
		case STOP_PROJECT:
			return {
				...state,
				activeProject: null,
			}
		default: {
			return state;
		}
	}
}

export const getProjectState = createFeatureSelector<ProjectState>('project');

export const getActiveProject = createSelector(getProjectState, (state: ProjectState) => state.activeProject);
export const getIsEditingProject = createSelector(getProjectState, (state: ProjectState) => state.activeProject != null);
