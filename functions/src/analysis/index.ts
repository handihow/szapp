import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { Program } from '../../../src/app/programs/program.model';
import { User } from '../../../src/app/auth/user.model';
import { Evaluation } from '../../../src/app/evaluations/evaluation.model';

const db = admin.firestore();

export const calculateClassroomAveragesForPrograms = functions.pubsub
.topic('averages')
.onPublish(async (message, context) => {
	
	//first get all green evaluations from the database
	const evaluationQry = db.collection('evaluations').where("ratingTeacher", "<", 2);
	const greenEvaluationSnapshots = await evaluationQry.get();
	const greenEvaluations : Evaluation[] = [];
	greenEvaluationSnapshots.forEach((snap) => {
		const id = snap.id;
	    const data = snap.data() as Evaluation;
		greenEvaluations.push({id,...data});
	})
	// return Promise.resolve();
	// get all active programs and start looping through them
	const programQry = db.collection('programs').where("status", "==", "Actief");
	const programSnapshots = await  programQry.get();
	const activePrograms : Program[] = [];
	programSnapshots.forEach((snap) => {
		//get the data from the program and set the result document reference
	    const id= snap.id;
	    const data = snap.data() as Program;
	    activePrograms.push({id,...data});
	});
	activePrograms.forEach(async program => {    
	      const resultRef = db.collection('results').doc(program.id);
	      //get the total greens from the evaluations
	      const programEvaluations = greenEvaluations.filter(evaluation => evaluation.program === program.id);
	      let average = 0;
	      const results: {[key: string]: any} = {
	      	"programName": program.name,
	      	"lastUpdate": new Date(),
	      	"isValid": true
	      };
	      if(programEvaluations && programEvaluations.length>0){
	      	const total = programEvaluations.length;
	      	const students = [...new Set(programEvaluations.map(evaluation => evaluation.user))].length;
	      	average = total / students;
	      	results.average = average;
	      	const classrooms = [...new Set(programEvaluations.map(evaluation => evaluation.class))];
	      	classrooms.forEach(classroom => {
	      		if(!classroom){
	      			results.isValid = false;
	      		} else {
	      			const filteredProgramEvaluations = programEvaluations.filter(e => e.class === classroom);
		      		let classroomAverage = 0;
		      		if(filteredProgramEvaluations && filteredProgramEvaluations.length>0){
		      			const classroomtotal = filteredProgramEvaluations.length;
		      			const classroomstudents = [...new Set(filteredProgramEvaluations.map(e => e.user))].length;
		      			classroomAverage = classroomtotal / classroomstudents;
		      		}
		      		results[classroom] = classroomAverage;
	      		}
	      	})
	      }
	      await resultRef.set(results);
	});
});


export const correctEvaluationRecords = functions.runWith({timeoutSeconds: 300, memory: "2GB"}).pubsub
.topic('correction')
.onPublish(async (message, context) => {
	//first get all green evaluations from the database
	const evaluationQry = db.collection('evaluations');
	const allEvaluationSnapshots = await evaluationQry.get();
	const allEvaluations : Evaluation[] = [];
	allEvaluationSnapshots.forEach((snap) => {
		const data = snap.data() as Evaluation;
		const id = snap.id;
		allEvaluations.push({id, ...data});
	})
	const userQry = db.collection('users');
	const allUserSnapshots = await userQry.get();
	const allUsers : User[] = [];
	allUserSnapshots.forEach((snap) => {
		const data = snap.data() as User;
		const uid = snap.id;
		allUsers.push({uid, ...data});
	})
	allEvaluations.forEach(async evaluation => {
		const evalRef = db.collection('evaluations').doc(evaluation.id);
		if(!evaluation.class){
			const student = allUsers.find(user => user.uid === evaluation.user);
			if(student.classes && student.classes[0]){
				const classroom = student.classes[0];
				evaluation.class = classroom;
			}
		}
		await evalRef.set(evaluation, {merge: true});
	})
});
