import { Evaluation } from '../evaluations/evaluation.model';
import { Project } from '../projects/project.model';

export interface Skill {
	//the order number of the skill (volgnummer)
	order?: any;

	//the description of the skill/competency and the subject
	competency?: string;
	topic?: string;
	link?: string;
	hasAttachments?: boolean;

	//database references
	id?: string;
	program?: string;
	organisation?: string;
	projects?: any;
	
	//helpful properties for reporting
	studentColor?: string;
	studentIcon?: string;
	teacherColor?: string;
	teacherIcon?: string;
	teacherColorLabel?: string;
	teacherEvaluated?: any;
	evaluation?: Evaluation;
	ratingTeacher?: number;
	listedUnderProjects?: Project[];
}