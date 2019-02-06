import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

var db = admin.firestore();

//function updates the progress results of the user 
export const onNewProgress = functions.firestore
.document('evaluations/{evaluationId}')
.onCreate((snap, context) => {
		//get the data
		const evaluation = snap.data();
		//do not perform any update when the status is not set to reviewed ("Beoordeeld")
		if(evaluation.status!=="Beoordeeld"){
			return null;
		}
		//reference to the progress property in the results collection
		const progressRef = admin.firestore().collection('users').doc(evaluation.user).collection('results').doc('progress');	
		return progressRef.get()
		.then(progress => {
			var progressToBeUpdated = progress.data();
			//if the user does not have any progress property (first time user)
			if(!progressToBeUpdated){
				progressToBeUpdated = {};
				if(evaluation.ratingTeacher<3){
					progressToBeUpdated[evaluation.project] = 1;
				} else {
					progressToBeUpdated[evaluation.project] = 0;
				}
				//if the user has progress but not on this project
			} else if(!progressToBeUpdated[evaluation.project]) {
				if(evaluation.ratingTeacher<3){
					progressToBeUpdated[evaluation.project] = 1;
				} else {
					progressToBeUpdated[evaluation.project] = 0;
				}
				//user already has progress on this project, check if the progress needs to be updated
			} else if(evaluation.ratingTeacher < 3){
				let updatedScore = progressToBeUpdated[evaluation.project] + 1;
				progressToBeUpdated[evaluation.project] = updatedScore;
				//when the rating of teacher was previous good, but now red (3) you lose a point
			} else if(evaluation.ratingTeacher === 3){
				let updatedScore2 = progressToBeUpdated[evaluation.project] - 1;
				progressToBeUpdated[evaluation.project] = updatedScore2;
			}
				//update the progress results
				return progressRef.set(progressToBeUpdated);
			})
		.catch(err => console.log(err))
	});

//function updates the progress results of the user 
export const onUpdateProgress = functions.firestore
.document('evaluations/{evaluationId}')
.onUpdate((change, context) => {
		//get the data
		const previousEvaluation = change.before.data();
		const evaluation = change.after.data();
		//do not perform any update when the status is not set to reviewed ("Beoordeeld")
		if(evaluation.status!=="Beoordeeld"){
			return null;
		}
		//reference to the progress property in the results collection
		const progressRef = admin.firestore().collection('users').doc(evaluation.user).collection('results').doc('progress');	
		return progressRef.get()
		.then(progress => {
			var progressToBeUpdated = progress.data();
				//if the user does not have any progress property (first time user)
				if(!progressToBeUpdated){
					progressToBeUpdated = {};
					if(evaluation.ratingTeacher<3){
						progressToBeUpdated[evaluation.project] = 1;
					} else {
						progressToBeUpdated[evaluation.project] = 0;
					}
				//if the user has progress but not on this project
			} else if(!progressToBeUpdated[evaluation.project]) {
				if(evaluation.ratingTeacher<3){
					progressToBeUpdated[evaluation.project] = 1;
				} else {
					progressToBeUpdated[evaluation.project] = 0;
				}
				//user already has progress on this project, check if the progress needs to be updated
			} else if((!previousEvaluation.colorLabelTeacher || previousEvaluation.ratingTeacher===3) 
				&& evaluation.ratingTeacher < 3){
				let updatedScore = progressToBeUpdated[evaluation.project] + 1;
				progressToBeUpdated[evaluation.project] = updatedScore;
				//when the rating of teacher was previous good, but now red (3) you lose a point
			} else if(previousEvaluation.ratingTeacher < 3 && evaluation.ratingTeacher === 3){
				let updatedScore2 = progressToBeUpdated[evaluation.project] - 1;
				progressToBeUpdated[evaluation.project] = updatedScore2;
			}
				//update the progress results
				return progressRef.set(progressToBeUpdated);
			})
		.catch(err => console.log(err))
	});

//function updates the program results of the user 
export const onNewProgramProgress = functions.firestore
.document('evaluations/{evaluationId}')
.onCreate((snap, context) => {
		//get the data
		const evaluation = snap.data();
		//do not perform any update when the status is not set to reviewed ("Beoordeeld")
		if(evaluation.status!=="Beoordeeld"){
			return null;
		}
		//reference to the progress property in the results collection
		const programProgressRef = db.collection('users').doc(evaluation.user).collection('results').doc('program');	
		return programProgressRef.get()
		.then(programProgress => {
			var programProgressToBeUpdated = programProgress.data();
			//if the user does not have any programs property (first time user)
			if(!programProgressToBeUpdated){
				programProgressToBeUpdated = {};
				programProgressToBeUpdated[evaluation.program] = {};
				if(evaluation.ratingTeacher<3){
					programProgressToBeUpdated[evaluation.program].total = 1;
				} else {
					programProgressToBeUpdated[evaluation.program].total = 0;
				}
				programProgressToBeUpdated[evaluation.program][evaluation.colorLabelTeacher] = 1;
				//if the user has programs but not on this program
			} else if(!programProgressToBeUpdated[evaluation.program]) {
				programProgressToBeUpdated[evaluation.program] = {};
				if(evaluation.ratingTeacher<3){
					programProgressToBeUpdated[evaluation.program].total = 1;
				} else {
					programProgressToBeUpdated[evaluation.program].total = 0;
				}
				programProgressToBeUpdated[evaluation.program][evaluation.colorLabelTeacher] = 1;
				//user already has program progress reported
			} else {
				//first start updating the total score on this program
				if(evaluation.ratingTeacher < 3){
						let updatedProgramScore = programProgressToBeUpdated[evaluation.program].total + 1;
					programProgressToBeUpdated[evaluation.program].total = updatedProgramScore;
				} else {
					let updatedProgramScore2 = programProgressToBeUpdated[evaluation.program].total - 1;
					programProgressToBeUpdated[evaluation.program].total = updatedProgramScore2;
				}
				let updatedProgramScore3 = programProgressToBeUpdated[evaluation.program][evaluation.colorLabelTeacher] ?
				programProgressToBeUpdated[evaluation.program][evaluation.colorLabelTeacher] + 1 : 1;
				programProgressToBeUpdated[evaluation.program][evaluation.colorLabelTeacher] = updatedProgramScore3;
			}
			//update the progress results
			return programProgressRef.set(programProgressToBeUpdated);
		})
		.catch(err => console.log(err))
	});

//function updates the program results of the user 
export const onUpdateProgramProgress = functions.firestore
.document('evaluations/{evaluationId}')
.onUpdate((change, context) => {
		//get the data
		const previousEvaluation = change.before.data();
		const evaluation = change.after.data();
		//do not perform any update when the status is not set to reviewed ("Beoordeeld")
		if(evaluation.status!=="Beoordeeld"){
			return null;
		}
		//reference to the progress property in the results collection
		const programProgressRef = db.collection('users').doc(evaluation.user).collection('results').doc('program');	
		return programProgressRef.get()
		.then(programProgress => {
			var programProgressToBeUpdated = programProgress.data();
				//if the user does not have any programs property (first time user)
				if(!programProgressToBeUpdated){
					programProgressToBeUpdated = {};
					programProgressToBeUpdated[evaluation.program] = {};
					if(evaluation.ratingTeacher<3){
						programProgressToBeUpdated[evaluation.program].total = 1;
					} else {
						programProgressToBeUpdated[evaluation.program].total = 0;
					}
					programProgressToBeUpdated[evaluation.program][evaluation.colorLabelTeacher] = 1;
				//if the user has programs but not on this program
			} else if(!programProgressToBeUpdated[evaluation.program]) {
				programProgressToBeUpdated[evaluation.program] = {};
				if(evaluation.ratingTeacher<3){
					programProgressToBeUpdated[evaluation.program].total = 1;
				} else {
					programProgressToBeUpdated[evaluation.program].total = 0;
				}
				programProgressToBeUpdated[evaluation.program][evaluation.colorLabelTeacher] = 1;
				//user already has program progress reported
			} else {
					//first start updating the total score on this program
					if((!previousEvaluation.colorLabelTeacher || previousEvaluation.ratingTeacher===3) 
						&& evaluation.ratingTeacher < 3){
						let updatedProgramScore = programProgressToBeUpdated[evaluation.program].total + 1;
					programProgressToBeUpdated[evaluation.program].total = updatedProgramScore;
				} else if (previousEvaluation.ratingTeacher < 3 && evaluation.ratingTeacher === 3){
					let updatedProgramScore2 = programProgressToBeUpdated[evaluation.program].total - 1;
					programProgressToBeUpdated[evaluation.program].total = updatedProgramScore2;
				}
					//if there is a previous evaluation from the teacher, first subtract 1 from the previously evaluated color
					if(previousEvaluation.colorLabelTeacher){
						let updatedProgramScore3 = programProgressToBeUpdated[evaluation.program][previousEvaluation.colorLabelTeacher] - 1;
						programProgressToBeUpdated[evaluation.program][previousEvaluation.colorLabelTeacher] = updatedProgramScore3;
					}
					let updatedProgramScore4 = programProgressToBeUpdated[evaluation.program][evaluation.colorLabelTeacher] ?
					programProgressToBeUpdated[evaluation.program][evaluation.colorLabelTeacher] + 1 : 1;
					programProgressToBeUpdated[evaluation.program][evaluation.colorLabelTeacher] = updatedProgramScore4;
				}
				//update the progress results
				return programProgressRef.set(programProgressToBeUpdated);
			})
		.catch(err => console.log(err))
	});

//function updates the progress results of the user 
export const onDeleteEvaluationUpdateProgress = functions.firestore
.document('evaluations/{evaluationId}')
.onDelete((snap, context) => {
		//get the data
		const deletedValue = snap.data(); 
		//do not perform any update when the status is not set to reviewed ("Beoordeeld")
		if(deletedValue.status!=="Beoordeeld"){
			return null;
		}
		//reference to the progress property in the results collection
		const progressRef = db.collection('users').doc(deletedValue.user).collection('results').doc('progress');	
		return progressRef.get()
		.then(progress => {
			var progressToBeUpdated = progress.data();
			if(deletedValue.ratingTeacher < 3){
				progressToBeUpdated[deletedValue.project] -= 1;
			} 
			//update the progress results
			return progressRef.set(progressToBeUpdated);
		})
		.catch(err => console.log(err))
	});

//function updates the program results of the user 
export const onDeleteEvaluationUpdateProgramProgress = functions.firestore
.document('evaluations/{evaluationId}')
.onDelete((snap, context) => {
		//get the data
		const deletedValue = snap.data(); 
		//do not perform any update when the status is not set to reviewed ("Beoordeeld")
		if(deletedValue.status!=="Beoordeeld"){
			return null;
		}
		//reference to the progress property in the results collection
		const programProgressRef = db.collection('users').doc(deletedValue.user).collection('results').doc('program');	
		return programProgressRef.get()
		.then(programProgress => {
			var programProgressToBeUpdated = programProgress.data();
			//subtract 1 from the previously evaluated color
			programProgressToBeUpdated[deletedValue.program][deletedValue.colorLabelTeacher] -= 1;
			if(deletedValue.ratingTeacher < 3){
				programProgressToBeUpdated[deletedValue.program].total -= 1 ;
			}
			//update the progress results
			return programProgressRef.set(programProgressToBeUpdated);
		})
		.catch(err => console.log(err))
	});