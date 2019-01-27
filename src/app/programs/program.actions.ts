import { Action } from '@ngrx/store'; 
import { Program } from './program.model';

export const START_PROGRAM = '[Program] Start Program';
export const STOP_PROGRAM = '[Program] Stop Program';

export const SET_PROGRAM_FILTER = '[String] Set Program Filter';
export const UNSET_PROGRAM_FILTER = '[String] Unset Program Filter';

export class StartProgram implements Action {
	readonly type = START_PROGRAM;

	constructor(public payload: Program){}
}

export class StopProgram implements Action {
	readonly type = STOP_PROGRAM;

}

export class SetProgramFilter implements Action {
	readonly type = SET_PROGRAM_FILTER;

	constructor(public payload: string){};
}

export class UnsetProgramFilter implements Action {
	readonly type = UNSET_PROGRAM_FILTER;
}

export type ProgramActions = StartProgram | StopProgram | SetProgramFilter | UnsetProgramFilter;