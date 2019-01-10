import { Skill } from '../skills/skill.model';

export interface Program {
	name: string;
	code?: string;
	skills?: Skill[];
	created?: any;
	status?: string;
	id?: string;
	organisation?: string;
	user?: string;
	countSkills?: number;
	starred?: any;

	//transform to local date for csv download
	localDate?: Date;
}