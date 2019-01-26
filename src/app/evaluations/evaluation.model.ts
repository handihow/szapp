
export interface Evaluation {
	
	//student input
	urlStudent?: string,
	commentStudent?: string,
	colorStudent?: string,
	colorLabelStudent?: string,
	iconStudent?: string,
	ratingStudent?: number,
	imageURL?: string,
	thumbnailURL?: string,
	class?: string,
	
	//teacher input
	teacher?: string,
	commentTeacher?: string,
	colorTeacher?: string,
	colorLabelTeacher?: string,
	iconTeacher?: string,
	ratingTeacher?: number,
	
	//dates (created and evaluated)
	created?: any;
	evaluated?: any;
	
	//status of the evaluation
	status?: string;
	toBeAdded?: boolean;
	
	//database references 
	id?: string;
	skill?: string;
	organisation?: string;
	user?: string;
	historyId?: string;

	//useful information for reports
	skillOrder?: string;
	skillCompetency?: string;
	skillTopic?: string;
	studentName?: string;
	teacherName?: string;
	project?: string;
	projectName?: string;
	projectCode?: string;
	program?: string;
	formative?: string;
	formativeName?: string;
	formativeDate?: any;
	
}