import * as fromUi from './shared/ui.reducer';
import * as fromAuth from './auth/auth.reducer';
import { ActionReducer, ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';

export interface State {
	ui: fromUi.State;
	auth: fromAuth.State;
}

export const reducers: ActionReducerMap<State> = {
	ui: fromUi.uiReducer,
	auth: fromAuth.authReducer
}

export const getUiState = createFeatureSelector<fromUi.State>('ui');
export const getIsLoading = createSelector(getUiState, fromUi.getIsLoading);
export const getScreenType = createSelector(getUiState, fromUi.getScreenType);

export const getAuthState = createFeatureSelector<fromAuth.State>('auth');
export const getIsAuth = createSelector(getAuthState, fromAuth.getIsAuth);
export const getIsTeacher = createSelector(getAuthState, fromAuth.getIsTeacher);
export const getPermissions = createSelector(getAuthState, fromAuth.getPermissions);
export const getCurrentUser = createSelector(getAuthState, fromAuth.getCurrentUser);
export const getCurrentOrganisation = createSelector(getAuthState, fromAuth.getCurrentOrganisation);
export const getOrganisations = createSelector(getAuthState, fromAuth.getOrganisations);