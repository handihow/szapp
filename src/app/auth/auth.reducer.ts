import { Action } from '@ngrx/store'
import { User } from './user.model';
import { Organisation } from './organisation.model';

import { AuthActions, SET_AUTHENTICATED, SET_UNAUTHENTICATED, SET_ORGANISATION, SET_ORGANISATIONS } from './auth.actions';

export interface State {
	isAuthenticated: boolean;
	isTeacher: boolean;
	user: User;
	organisation: Organisation;
	organisations: Organisation[];
}

const initialState: State = {
	isAuthenticated: false,
	isTeacher: false,
	user: null,
	organisation: null,
	organisations: []
};

export function authReducer(state = initialState, action: AuthActions) {
	switch (action.type) {
		case SET_AUTHENTICATED:
			return {
				...state,
				isAuthenticated: true,
				isTeacher: action.payload.role === 'Leraar' ? true : false,
				user: action.payload
			}
		case SET_UNAUTHENTICATED:
			return {
				...state,
				isAuthenticated: false,
				isTeacher: false,
				user: null,
				organisation: null,
				organisations: []
			}
		case SET_ORGANISATION: 
			return {
				...state,
				organisation: action.payload
			}
		case SET_ORGANISATIONS: 
			return {
				...state,
				organisations: action.payload
			}
		default: {
			return state;
		}
	}
}

export const getIsAuth = (state: State ) => state.isAuthenticated;
export const getIsTeacher = (state: State) => state.isTeacher;
export const getCurrentUser = (state: State ) => state.user;
export const getCurrentOrganisation = (state: State) => state.organisation;
export const getOrganisations = (state: State) => state.organisations;
