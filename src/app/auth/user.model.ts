import { Evaluation } from '../evaluations/evaluation.model';

export interface User {
uid?: string;
email?: string;
photoURL?: string;
displayName?: string;
organisation?: string;
organisationId?: string;
role?: string;
roles?: Roles;
classes?: string[];
classNumber?: number;
subjects?: string[];
imageURL?: string;
thumbnailURL?: string;
progress?: any;
projects?: any;
programs?: any;
evaluation?: Evaluation;
hasGoogleForEducation?: boolean;
}

export interface Progress {
projectId?: string;
green?: number;
lightgreen?: number;
yellow?: number;
red?: number;
remaining?: number;
}

export interface Roles {
// parent: boolean;
student: boolean;
teacher: boolean;
schooladmin: boolean;
// trajectorycounselor: boolean;
// companyadmin: boolean;
admin: boolean;
}
