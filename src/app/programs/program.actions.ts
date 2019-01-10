import { Action } from '@ngrx/store'; 
import { Program } from './program.model';

export const START_PROGRAM = '[Program] Start Program';
export const STOP_PROGRAM = '[Program] Stop Program';


export class StartProgram implements Action {
	readonly type = START_PROGRAM;

	constructor(public payload: Program){}
}

export class StopProgram implements Action {
	readonly type = STOP_PROGRAM;

}

export type ProgramActions = StartProgram | StopProgram;