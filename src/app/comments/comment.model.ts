export interface Comment {
	//comment and created at
	comment: string;
	created?: any;
	isReadByStudent?: boolean;
	isReported?: boolean;
	
	//duplicate info useful for table reporting
	studentName?: string;
	teacherName?: string;
	className?: string;

	//database ids
	id?: string;
	organisation?: string;
	student?: string;
	teacher?: string;
}