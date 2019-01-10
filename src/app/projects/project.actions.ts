import { Action } from '@ngrx/store'; 
import { Project } from './project.model';

export const START_PROJECT = '[Project] Start Project';
export const STOP_PROJECT = '[Project] Stop Project';

export class StartProject implements Action {
	readonly type = START_PROJECT;

	constructor(public payload: Project){}
}

export class StopProject implements Action {
	readonly type = STOP_PROJECT;

}

export type ProjectActions = StartProject | StopProject;