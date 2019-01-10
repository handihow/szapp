import { Action, createFeatureSelector, createSelector } from '@ngrx/store'
import { Program } from './program.model';

import { ProgramActions, START_PROGRAM, STOP_PROGRAM } from './program.actions';
import * as fromRoot from '../app.reducer';

export interface ProgramState {
	activeProgram: Program;
}

export interface State extends fromRoot.State{
	program: ProgramState;
}

const initialState: ProgramState = {
	activeProgram: null,
};

export function programReducer(state = initialState, action: ProgramActions) {
	switch (action.type) {
		case START_PROGRAM:
			return {
				...state,
				activeProgram: action.payload
			}
		case STOP_PROGRAM:
			return {
				...state,
				activeProgram: null,
			}
		default: {
			return state;
		}
	}
}

export const getProgramState = createFeatureSelector<ProgramState>('program');

export const getActiveProgram = createSelector(getProgramState, (state: ProgramState) => state.activeProgram);
export const getIsEditingProgram = createSelector(getProgramState, (state: ProgramState) => state.activeProgram != null);
