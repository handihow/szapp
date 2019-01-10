import { Action, createFeatureSelector, createSelector } from '@ngrx/store'
import { Evaluation } from './evaluation.model';
import { Project } from '../projects/project.model';
import { User } from '../auth/user.model';
import { Skill } from '../skills/skill.model';

import { EvaluationActions, SET_PROJECT, UNSET_PROJECT, SET_STUDENT, UNSET_STUDENT, 
			SET_SKILL, UNSET_SKILL, SET_EVALUATION, UNSET_EVALUATION } from './evaluation.actions';
import * as fromRoot from '../app.reducer';

export interface EvaluationState {
	activeProject: Project;
	student: User;
	activeSkill: Skill;
	activeEvaluation: Evaluation;
}

export interface State extends fromRoot.State{
	evaluation: EvaluationState;
}

const initialState: EvaluationState = {
	activeProject: null,
	student: null,
	activeSkill: null,
	activeEvaluation: null,
};

export function evaluationReducer(state = initialState, action: EvaluationActions) {
	switch (action.type) {

		case SET_PROJECT:
			return {
				...state,
				activeProject: action.payload
			}
		case UNSET_PROJECT:
			return {
				...state,
				activeProject: null,
				activeEvaluation: null
			}
		case SET_STUDENT:
			return {
				...state,
				student: action.payload
			}
		case UNSET_STUDENT:
			return {
				...state,
				student: null
			}
		case SET_SKILL:
			return {
				...state,
				activeSkill: action.payload
			}
		case UNSET_SKILL:
			return {
				...state,
				activeSkill: null
			}
		case SET_EVALUATION:
			return {
				...state,
				activeEvaluation: action.payload
			}
		case UNSET_EVALUATION:
			return {
				...state,
				activeEvaluation: null
			}
		default: {
			return state;
		}
	}
}

export const getEvaluationState = createFeatureSelector<EvaluationState>('evaluation');

export const getActiveProject = createSelector(getEvaluationState, (state: EvaluationState) => state.activeProject);
export const hasActiveProject = createSelector(getEvaluationState, (state: EvaluationState) => state.activeProject != null);

export const getActiveSkill = createSelector(getEvaluationState, (state: EvaluationState) => state.activeSkill);
export const hasActiveSkill = createSelector(getEvaluationState, (state: EvaluationState) => state.activeSkill != null);

export const getActiveEvaluation = createSelector(getEvaluationState, (state: EvaluationState) => state.activeEvaluation);
export const hasActiveEvaluation = createSelector(getEvaluationState, (state: EvaluationState) => state.activeEvaluation != null);

export const getStudent = createSelector(getEvaluationState, (state: EvaluationState) => state.student);
export const hasSelectedStudent = createSelector(getEvaluationState, (state: EvaluationState) => state.student != null);



