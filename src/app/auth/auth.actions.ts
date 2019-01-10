import { Action } from '@ngrx/store'; 
import { User } from './user.model';
import { Organisation } from './organisation.model';

export const SET_AUTHENTICATED = '[Auth] Set Authenticated';
export const SET_UNAUTHENTICATED = '[Auth] Set Unauthenticated';
export const SET_ORGANISATION = '[Auth] Set Organisation';
export const SET_ORGANISATIONS = '[Auth] Set Organisations';

export class SetAuthenticated implements Action {
	readonly type = SET_AUTHENTICATED;

	constructor(public payload: User){}
}

export class SetUnauthenticated implements Action {
	readonly type = SET_UNAUTHENTICATED;
}

export class SetOrganisation implements Action {
	readonly type = SET_ORGANISATION;

	constructor(public payload: Organisation){}
}

export class SetOrganisations implements Action {
	readonly type = SET_ORGANISATIONS;

	constructor(public payload: Organisation[]){}
}



export type AuthActions = SetAuthenticated | SetUnauthenticated | SetOrganisation | SetOrganisations;