import { Skill } from '../skills/skill.model';

export interface Project {
	name: string;
	code?: string;
	classes?: string[];
	subjects?: string[];
	skills?: Skill[];
	created?: any;
	status?: string;
	id?: string;
	organisation?: string;
	user?: string;
	color?: string;
	projectTaskUrl?: string;
	starred?: any;
	//helper properties to be able to generate the correct csv file
	classStr?: string;
	subjectStr?: string;
	localDate?: string;
	progress?: number;
	countSkills?: number;
}