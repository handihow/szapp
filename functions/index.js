const admin = require('firebase-admin');
const functions = require('firebase-functions');

admin.initializeApp(functions.config().firebase);

var db = admin.firestore();

const gcs = require('@google-cloud/storage');
const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const fs = require('fs');

//creates a resized image when an images is uploaded
exports.onFileChange = functions.storage.object().onFinalize((object) => {
  	const fileBucket = object.bucket; // The Storage bucket that contains the file.
	const filePath = object.name; // File path in the bucket.
	const contentType = object.contentType; // File content type.
	const resourceState = object.resourceState; // The resourceState is 'exists' or 'not_exists' (for file/folder deletions).
	const metageneration = object.metageneration; // Number of times metadata has been generated. New objects have a value of 1.

	// Exit if this is triggered on a file that is not an image.
	if (!contentType.startsWith('image/')) {
		console.log('This is not an image.');
		return null;
	}

	// Get the file name.
	const fileName = path.basename(filePath);
	// Exit if the image is already a thumbnail.
	if (fileName.startsWith('resized-')) {
		console.log('We already renamed that file!');
		return null;
	}
  	// Download file from bucket.
  	const bucket = gcs.bucket(fileBucket);
  	const tempFilePath = path.join(os.tmpdir(), fileName);
  	const metadata = {
  		contentType: contentType,
  	};
  	return bucket.file(filePath).download({
  		destination: tempFilePath,
  	}).then(() => {
  		console.log('Image downloaded locally to', tempFilePath);
	  // Generate a resized image using ImageMagick.
	  return spawn('convert', [tempFilePath, '-resize', '500x500', tempFilePath]);
	}).then(() => {
		console.log('Resized image created at', tempFilePath);
	  // We add a 'resized-' prefix to resized file name. That's where we'll upload the resized image.
	  const thumbFileName = `resized-${fileName}`;
	  const thumbFilePath = path.join(path.dirname(filePath), thumbFileName);
	  // Uploading the thumbnail.
	  return bucket.upload(tempFilePath, {
	  	destination: thumbFilePath,
	  	metadata: metadata,
	  });
	  // Once the thumbnail has been uploaded delete the local file to free up disk space.
	}).then(() => fs.unlinkSync(tempFilePath));

});

//function updates the progress results of the user 
exports.onUpdateProgress = functions.firestore
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
exports.onUpdateProgramProgress = functions.firestore
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
exports.onDeleteEvaluationUpdateProgress = functions.firestore
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
exports.onDeleteEvaluationUpdateProgramProgress = functions.firestore
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

exports.calculateClassroomAveragesForPrograms = functions.pubsub
.topic('averages')
.onPublish(async (message, context) => {
	//first get all green evaluations from the database
	const evaluationQry = db.collection('evaluations').where("ratingTeacher", "<", 2);
	const greenEvaluationSnapshots = await evaluationQry.get();
	var greenEvaluations = [];
	greenEvaluationSnapshots.forEach((snap) => {
		greenEvaluations.push(snap.data());
	})
	// console.log(greenEvaluations);
	// return Promise.resolve();
	// get all active programs and start looping through them
	const programQry = db.collection('programs').where("status", "==", "Actief");
	return programQry.get()
	  .then((programs)=>{
	    return programs.forEach((snap)=>{
	      //get the data from the program and set the result document reference
	      var programId = snap.id;
	      var program = snap.data();
	      const resultRef = db.collection('results').doc(programId);
	      //get the total greens from the evaluations
	      const programEvaluations = greenEvaluations.filter(evaluation => evaluation.program === programId);
	      var average = 0;
	      var results = {};
	      if(programEvaluations && programEvaluations.length>0){
	      	const total = programEvaluations.length;
	      	const students = [...new Set(programEvaluations.map(evaluation => evaluation.user))].length;
	      	average = total / students;
	      	const classrooms = [...new Set(programEvaluations.map(evaluation => evaluation.class))];
	      	classrooms.forEach((classroom) => {
	      		const filteredProgramEvaluations = programEvaluations.filter(e => e.class === classroom);
	      		var classroomAverage = 0;
	      		if(filteredProgramEvaluations && filteredProgramEvaluations.length>0){
	      			const classroomtotal = filteredProgramEvaluations.length;
	      			const classroomstudents = [...new Set(filteredProgramEvaluations.map(e => e.user))].length;
	      			classroomAverage = classroomtotal / classroomstudents;
	      		}
	      		results[classroom] = classroomAverage;
	      	})
	      }
	      results.average = average;
	      results.programName = program.name;
	      results.lastUpdate = new Date();
	      return resultRef.set(results);
	  });
	});
});
