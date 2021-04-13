"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onDeleteEvaluation = exports.onUpdateEvaluation = exports.onCreateEvaluation = void 0;
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const db = admin.firestore();
//function updates the progress results of the user 
const onNewProgress = (evaluation) => {
    //reference to the progress property in the results collection
    const progressRef = admin.firestore().collection('users').doc(evaluation.user).collection('results').doc('progress');
    return progressRef.get()
        .then(progress => {
        let progressToBeUpdated = progress.data();
        //if the user does not have any progress property (first time user)
        if (!progressToBeUpdated) {
            progressToBeUpdated = {};
            if (evaluation.ratingTeacher < 3) {
                progressToBeUpdated[evaluation.project] = 1;
            }
            else {
                progressToBeUpdated[evaluation.project] = 0;
            }
            //if the user has progress but not on this project
        }
        else if (!progressToBeUpdated[evaluation.project]) {
            if (evaluation.ratingTeacher < 3) {
                progressToBeUpdated[evaluation.project] = 1;
            }
            else {
                progressToBeUpdated[evaluation.project] = 0;
            }
            //user already has progress on this project, check if the progress needs to be updated
        }
        else if (evaluation.ratingTeacher < 3) {
            const updatedScore = progressToBeUpdated[evaluation.project] + 1;
            progressToBeUpdated[evaluation.project] = updatedScore;
            //when the rating of teacher was previous good, but now red (3) you lose a point
        }
        else if (evaluation.ratingTeacher === 3) {
            const updatedScore2 = progressToBeUpdated[evaluation.project] - 1;
            progressToBeUpdated[evaluation.project] = updatedScore2;
        }
        //update the progress results
        return progressRef.set(progressToBeUpdated);
    })
        .catch(err => {
        console.log(err);
        return;
    });
};
//function updates the program results of the user 
const onNewProgramProgress = (evaluation, weighted) => __awaiter(void 0, void 0, void 0, function* () {
    const weightedProgramProgressRef = db.collection('users').doc(evaluation.user)
        .collection('results').doc('weightedprogram');
    const programProgressRef = db.collection('users').doc(evaluation.user)
        .collection('results').doc('program');
    //reference to the progress property in the results collection
    const weightedProgramProgressSnap = yield weightedProgramProgressRef.get();
    const programProgressSnap = yield programProgressRef.get();
    let programProgressToBeUpdated;
    if (weighted && !weightedProgramProgressSnap.exists && programProgressSnap.exists) {
        programProgressToBeUpdated = programProgressSnap.data();
    }
    else if (weighted) {
        programProgressToBeUpdated = weightedProgramProgressSnap.data();
    }
    else {
        programProgressToBeUpdated = programProgressSnap.data();
    }
    const addingFactor = evaluation.skillWeight && weighted ? evaluation.skillWeight : 1;
    //if the user does not have any programs property (first time user)
    if (!programProgressToBeUpdated) {
        programProgressToBeUpdated = {};
        programProgressToBeUpdated[evaluation.program] = {};
        if (evaluation.ratingTeacher < 3) {
            programProgressToBeUpdated[evaluation.program].total = addingFactor;
        }
        else {
            programProgressToBeUpdated[evaluation.program].total = 0;
        }
        programProgressToBeUpdated[evaluation.program][evaluation.colorLabelTeacher] = addingFactor;
        //if the user has programs but not on this program
    }
    else if (!programProgressToBeUpdated[evaluation.program]) {
        programProgressToBeUpdated[evaluation.program] = {};
        if (evaluation.ratingTeacher < 3) {
            programProgressToBeUpdated[evaluation.program].total = addingFactor;
        }
        else {
            programProgressToBeUpdated[evaluation.program].total = 0;
        }
        programProgressToBeUpdated[evaluation.program][evaluation.colorLabelTeacher] = addingFactor;
        //user already has program progress reported
    }
    else {
        //first start updating the total score on this program
        if (evaluation.ratingTeacher < 3) {
            const updatedProgramScore = programProgressToBeUpdated[evaluation.program].total + addingFactor;
            programProgressToBeUpdated[evaluation.program].total = updatedProgramScore;
        }
        else {
            const updatedProgramScore2 = programProgressToBeUpdated[evaluation.program].total - addingFactor;
            programProgressToBeUpdated[evaluation.program].total = updatedProgramScore2;
        }
        const updatedProgramScore3 = programProgressToBeUpdated[evaluation.program][evaluation.colorLabelTeacher] ?
            programProgressToBeUpdated[evaluation.program][evaluation.colorLabelTeacher] + addingFactor : addingFactor;
        programProgressToBeUpdated[evaluation.program][evaluation.colorLabelTeacher] = updatedProgramScore3;
    }
    //update the progress results
    if (weighted) {
        return weightedProgramProgressRef.set(programProgressToBeUpdated);
    }
    else {
        return programProgressRef.set(programProgressToBeUpdated);
    }
});
exports.onCreateEvaluation = functions.firestore
    .document('evaluations/{evaluationId}')
    .onCreate((snap, context) => __awaiter(void 0, void 0, void 0, function* () {
    //get the data
    const evaluation = snap.data();
    //do not perform any update when the status is not set to reviewed ("Beoordeeld")
    if (evaluation.status !== "Beoordeeld") {
        return null;
    }
    if (!evaluation.skillWeight) {
        evaluation.skillWeight = 1;
    }
    yield onNewProgress(evaluation);
    yield onNewProgramProgress(evaluation, false);
    return onNewProgramProgress(evaluation, true);
}));
//function updates the progress results of the user 
const onUpdateProgress = (previousEvaluation, evaluation) => {
    //reference to the progress property in the results collection
    const progressRef = admin.firestore().collection('users').doc(evaluation.user).collection('results').doc('progress');
    return progressRef.get()
        .then(progress => {
        let progressToBeUpdated = progress.data();
        //if the user does not have any progress property (first time user)
        if (!progressToBeUpdated) {
            progressToBeUpdated = {};
            if (evaluation.ratingTeacher < 3) {
                progressToBeUpdated[evaluation.project] = 1;
            }
            else {
                progressToBeUpdated[evaluation.project] = 0;
            }
            //if the user has progress but not on this project
        }
        else if (!progressToBeUpdated[evaluation.project]) {
            if (evaluation.ratingTeacher < 3) {
                progressToBeUpdated[evaluation.project] = 1;
            }
            else {
                progressToBeUpdated[evaluation.project] = 0;
            }
            //user already has progress on this project, check if the progress needs to be updated
        }
        else if ((!previousEvaluation.colorLabelTeacher || previousEvaluation.ratingTeacher === 3)
            && evaluation.ratingTeacher < 3) {
            const updatedScore = progressToBeUpdated[evaluation.project] + 1;
            progressToBeUpdated[evaluation.project] = updatedScore;
            //when the rating of teacher was previous good, but now red (3) you lose a point
        }
        else if (previousEvaluation.ratingTeacher < 3 && evaluation.ratingTeacher === 3) {
            const updatedScore2 = progressToBeUpdated[evaluation.project] - 1;
            progressToBeUpdated[evaluation.project] = updatedScore2;
        }
        //update the progress results
        return progressRef.set(progressToBeUpdated);
    })
        .catch(err => {
        console.log(err);
        return;
    });
};
//function updates the program results of the user 
const onUpdateProgramProgress = (previousEvaluation, evaluation, weighted) => __awaiter(void 0, void 0, void 0, function* () {
    const weightedProgramProgressRef = db.collection('users').doc(evaluation.user)
        .collection('results').doc('weightedprogram');
    const programProgressRef = db.collection('users').doc(evaluation.user)
        .collection('results').doc('program');
    //reference to the progress property in the results collection
    const weightedProgramProgressSnap = yield weightedProgramProgressRef.get();
    const programProgressSnap = yield programProgressRef.get();
    let programProgressToBeUpdated;
    if (weighted && !weightedProgramProgressSnap.exists && programProgressSnap.exists) {
        programProgressToBeUpdated = programProgressSnap.data();
    }
    else if (weighted) {
        programProgressToBeUpdated = weightedProgramProgressSnap.data();
    }
    else {
        programProgressToBeUpdated = programProgressSnap.data();
    }
    const addingFactor = evaluation.skillWeight && weighted ? evaluation.skillWeight : 1;
    //if the user does not have any programs property (first time user)
    if (!programProgressToBeUpdated) {
        programProgressToBeUpdated = {};
        programProgressToBeUpdated[evaluation.program] = {};
        if (evaluation.ratingTeacher < 3) {
            programProgressToBeUpdated[evaluation.program].total = addingFactor;
        }
        else {
            programProgressToBeUpdated[evaluation.program].total = 0;
        }
        programProgressToBeUpdated[evaluation.program][evaluation.colorLabelTeacher] = addingFactor;
        //if the user has programs but not on this program
    }
    else if (!programProgressToBeUpdated[evaluation.program]) {
        programProgressToBeUpdated[evaluation.program] = {};
        if (evaluation.ratingTeacher < 3) {
            programProgressToBeUpdated[evaluation.program].total = addingFactor;
        }
        else {
            programProgressToBeUpdated[evaluation.program].total = 0;
        }
        programProgressToBeUpdated[evaluation.program][evaluation.colorLabelTeacher] = addingFactor;
        //user already has program progress reported
    }
    else {
        //first start updating the total score on this program
        if ((!previousEvaluation.colorLabelTeacher || previousEvaluation.ratingTeacher === 3)
            && evaluation.ratingTeacher < 3) {
            const updatedProgramScore = programProgressToBeUpdated[evaluation.program].total + addingFactor;
            programProgressToBeUpdated[evaluation.program].total = updatedProgramScore;
        }
        else if (previousEvaluation.ratingTeacher < 3 && evaluation.ratingTeacher === 3) {
            const updatedProgramScore2 = programProgressToBeUpdated[evaluation.program].total - addingFactor;
            programProgressToBeUpdated[evaluation.program].total = updatedProgramScore2;
        }
        //if there is a previous evaluation from the teacher, first subtract 1 from the previously evaluated color
        if (previousEvaluation.colorLabelTeacher) {
            const updatedProgramScore3 = programProgressToBeUpdated[evaluation.program][previousEvaluation.colorLabelTeacher] - addingFactor;
            programProgressToBeUpdated[evaluation.program][previousEvaluation.colorLabelTeacher] = updatedProgramScore3;
        }
        const updatedProgramScore4 = programProgressToBeUpdated[evaluation.program][evaluation.colorLabelTeacher] ?
            programProgressToBeUpdated[evaluation.program][evaluation.colorLabelTeacher] + addingFactor : addingFactor;
        programProgressToBeUpdated[evaluation.program][evaluation.colorLabelTeacher] = updatedProgramScore4;
    }
    //update the progress results
    //update the progress results
    if (weighted) {
        return weightedProgramProgressRef.set(programProgressToBeUpdated);
    }
    else {
        return programProgressRef.set(programProgressToBeUpdated);
    }
});
exports.onUpdateEvaluation = functions.firestore
    .document('evaluations/{evaluationId}')
    .onUpdate((change, context) => __awaiter(void 0, void 0, void 0, function* () {
    //get the data
    const previousEvaluation = change.before.data();
    const evaluation = change.after.data();
    //do not perform any update when the status is not set to reviewed ("Beoordeeld")
    if (evaluation.status !== "Beoordeeld") {
        return null;
    }
    yield onUpdateProgress(previousEvaluation, evaluation);
    yield onUpdateProgramProgress(previousEvaluation, evaluation, false);
    return onUpdateProgramProgress(previousEvaluation, evaluation, true);
}));
//function updates the progress results of the user 
const onDeleteEvaluationUpdateProgress = (deletedValue) => {
    //reference to the progress property in the results collection
    const progressRef = db.collection('users').doc(deletedValue.user).collection('results').doc('progress');
    return progressRef.get()
        .then(progress => {
        const progressToBeUpdated = progress.data();
        if (deletedValue.ratingTeacher < 3) {
            progressToBeUpdated[deletedValue.project] -= 1;
        }
        //update the progress results
        return progressRef.set(progressToBeUpdated);
    })
        .catch(err => {
        console.log(err);
        return;
    });
};
//function updates the program results of the user 
const onDeleteEvaluationUpdateProgramProgress = (deletedValue, weighted) => {
    //reference to the progress property in the results collection
    let programProgressRef;
    if (weighted) {
        programProgressRef = db.collection('users').doc(deletedValue.user).collection('results').doc('weightedprogram');
    }
    else {
        programProgressRef = db.collection('users').doc(deletedValue.user).collection('results').doc('program');
    }
    return programProgressRef.get()
        .then(programProgress => {
        const programProgressToBeUpdated = programProgress.data();
        const addingFactor = deletedValue.skillWeight && weighted ? deletedValue.skillWeight : 1;
        //subtract 1 from the previously evaluated color
        programProgressToBeUpdated[deletedValue.program][deletedValue.colorLabelTeacher] -= addingFactor;
        if (deletedValue.ratingTeacher < 3) {
            programProgressToBeUpdated[deletedValue.program].total -= addingFactor;
        }
        //update the progress results
        return programProgressRef.set(programProgressToBeUpdated);
    })
        .catch(err => {
        console.log(err);
        return;
    });
};
exports.onDeleteEvaluation = functions.firestore
    .document('evaluations/{evaluationId}')
    .onDelete((snap, context) => __awaiter(void 0, void 0, void 0, function* () {
    //get the data
    const deletedValue = snap.data();
    //do not perform any update when the status is not set to reviewed ("Beoordeeld")
    if (deletedValue.status !== "Beoordeeld") {
        return null;
    }
    yield onDeleteEvaluationUpdateProgress(deletedValue);
    yield onDeleteEvaluationUpdateProgramProgress(deletedValue, false);
    return onDeleteEvaluationUpdateProgramProgress(deletedValue, true);
}));
//# sourceMappingURL=index.js.map