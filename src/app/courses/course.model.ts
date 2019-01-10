import { User } from '../auth/user.model';

export interface Course {
	name: string;
	code?: string;
	teachers?: User[];
	students?: User[];
	created?: any;
	status?: string;
	id?: string;
	organisation?: string;
	user?: string;
	isGoogleClassroom?: boolean;
	googleClassroomInfo?: any;
}