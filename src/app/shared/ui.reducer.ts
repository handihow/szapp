import { Action } from '@ngrx/store'

import { UIActions, START_LOADING, STOP_LOADING, SCREENTYPE } from './ui.actions';

export interface State {
	isLoading: boolean;
	screenType: string;
}

const initialState: State = {
	isLoading: false,
	screenType: "desktop"
};

export function uiReducer(state = initialState, action: UIActions) {
	switch (action.type) {
		case START_LOADING:
			return {
				...state,
				isLoading: true
			}
		case STOP_LOADING:
			return {
				...state,
				isLoading: false
			}
		case SCREENTYPE:
			return {
				...state,
				screenType: action.payload
			}
		default: {
			return state;
		}
	}
}

export const getIsLoading = (state: State ) => state.isLoading;
export const getScreenType = (state: State) => state.screenType;