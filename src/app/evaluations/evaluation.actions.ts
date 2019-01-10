import { Action } from '@ngrx/store'; 
import { Evaluation } from './evaluation.model';
import { Project } from '../projects/project.model';
import { User } from '../auth/user.model';
import { Skill } from '../skills/skill.model';

export const SET_PROJECT = '[Project] Set Project';
export const UNSET_PROJECT = '[Project] Unset Project';
export const SET_STUDENT = '[User] Set Student';
export const UNSET_STUDENT = '[User] Unset Student';
export const SET_SKILL = '[Skill] Set Skill';
export const UNSET_SKILL = '[Skill] Unset Skill';
export const SET_EVALUATION = '[Evaluation] Set Evaluation';
export const UNSET_EVALUATION = '[Evaluation] Unset Evaluation';


export class SetProject implements Action {
	readonly type = SET_PROJECT;

	constructor(public payload: Project){}
}

export class UnsetProject implements Action {
	readonly type = UNSET_PROJECT;

}

export class SetStudent implements Action {
	readonly type = SET_STUDENT;

	constructor(public payload: User){}
}

export class UnsetStudent implements Action {
	readonly type = UNSET_STUDENT;
}

export class SetSkill implements Action {
	readonly type = SET_SKILL;

	constructor(public payload: Skill){}
}

export class UnsetSkill implements Action {
	readonly type = UNSET_SKILL;
}

export class SetEvaluation implements Action {
	readonly type = SET_EVALUATION;

	constructor(public payload: Evaluation){}
}

export class UnsetEvaluation implements Action {
	readonly type = UNSET_EVALUATION;

}

export type EvaluationActions = SetProject | UnsetProject | SetStudent | UnsetStudent | SetSkill | UnsetSkill 
									| SetEvaluation | UnsetEvaluation;

				 