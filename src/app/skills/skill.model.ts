import { Evaluation } from '../evaluations/evaluation.model';
import { Project } from '../projects/project.model';

export interface Skill {
order?: any; // the order number of the skill (volgnummer)
competency?: string; // the description of the skill/competency and the subject
topic?: string;
link?: string;
linkText?: string;
weight?: number;
hasAttachments?: boolean;
id?: string; // database references
program?: string; // database references
organisation?: string; // database references
projects?: any; // database references
studentColor?: string;  // helpful properties for reporting
studentIcon?: string;  // helpful properties for reporting
teacherColor?: string;  // helpful properties for reporting
teacherIcon?: string;  // helpful properties for reporting
teacherColorLabel?: string;  // helpful properties for reporting
teacherEvaluated?: any;  // helpful properties for reporting
evaluation?: Evaluation;  // helpful properties for reporting
ratingTeacher?: number;  // helpful properties for reporting
listedUnderProjects?: Project[];  // helpful properties for reporting
}
