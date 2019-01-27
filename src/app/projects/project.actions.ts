import { Action } from '@ngrx/store'; 
import { Project } from './project.model';

export const START_PROJECT = '[Project] Start Project';
export const STOP_PROJECT = '[Project] Stop Project';

export const SET_PROJECT_FILTER = '[String] Set Project Filter';
export const UNSET_PROJECT_FILTER = '[String] Unset Project Filter';

export class StartProject implements Action {
	readonly type = START_PROJECT;

	constructor(public payload: Project){}
}

export class StopProject implements Action {
	readonly type = STOP_PROJECT;

}

export class SetProjectFilter implements Action {
	readonly type = SET_PROJECT_FILTER;

	constructor(public payload: string){};
}

export class UnsetProjectFilter implements Action {
	readonly type = UNSET_PROJECT_FILTER;
}

export type ProjectActions = StartProject | StopProject | SetProjectFilter | UnsetProjectFilter;