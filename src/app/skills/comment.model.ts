export interface Comment {
	comment: string;
	date?: Date;
	teacher?: string;

	//database references
	id?: string;
	user?: string;
}