import { Skill } from '../../skills/skill.model';

export interface Skillgroup {
	topic?: string;
	skills?: Skill[];
}