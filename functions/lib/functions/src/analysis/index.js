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
exports.correctEvaluationRecords = exports.calculateClassroomAveragesForPrograms = void 0;
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const db = admin.firestore();
exports.calculateClassroomAveragesForPrograms = functions.pubsub
    .topic('averages')
    .onPublish((message, context) => __awaiter(void 0, void 0, void 0, function* () {
    //first get all green evaluations from the database
    const evaluationQry = db.collection('evaluations').where("ratingTeacher", "<", 2);
    const greenEvaluationSnapshots = yield evaluationQry.get();
    const greenEvaluations = [];
    greenEvaluationSnapshots.forEach((snap) => {
        const id = snap.id;
        const data = snap.data();
        greenEvaluations.push(Object.assign({ id }, data));
    });
    // return Promise.resolve();
    // get all active programs and start looping through them
    const programQry = db.collection('programs').where("status", "==", "Actief");
    const programSnapshots = yield programQry.get();
    const activePrograms = [];
    programSnapshots.forEach((snap) => {
        //get the data from the program and set the result document reference
        const id = snap.id;
        const data = snap.data();
        activePrograms.push(Object.assign({ id }, data));
    });
    activePrograms.forEach((program) => __awaiter(void 0, void 0, void 0, function* () {
        const resultRef = db.collection('results').doc(program.id);
        //get the total greens from the evaluations
        const programEvaluations = greenEvaluations.filter(evaluation => evaluation.program === program.id);
        let average = 0;
        const results = {
            "programName": program.name,
            "lastUpdate": new Date(),
            "isValid": true
        };
        if (programEvaluations && programEvaluations.length > 0) {
            const total = programEvaluations.length;
            const students = [...new Set(programEvaluations.map(evaluation => evaluation.user))].length;
            average = total / students;
            results.average = average;
            const classrooms = [...new Set(programEvaluations.map(evaluation => evaluation.class))];
            classrooms.forEach(classroom => {
                if (!classroom) {
                    results.isValid = false;
                }
                else {
                    const filteredProgramEvaluations = programEvaluations.filter(e => e.class === classroom);
                    let classroomAverage = 0;
                    if (filteredProgramEvaluations && filteredProgramEvaluations.length > 0) {
                        const classroomtotal = filteredProgramEvaluations.length;
                        const classroomstudents = [...new Set(filteredProgramEvaluations.map(e => e.user))].length;
                        classroomAverage = classroomtotal / classroomstudents;
                    }
                    results[classroom] = classroomAverage;
                }
            });
        }
        yield resultRef.set(results);
    }));
}));
exports.correctEvaluationRecords = functions.runWith({ timeoutSeconds: 300, memory: "2GB" }).pubsub
    .topic('correction')
    .onPublish((message, context) => __awaiter(void 0, void 0, void 0, function* () {
    //first get all green evaluations from the database
    const evaluationQry = db.collection('evaluations');
    const allEvaluationSnapshots = yield evaluationQry.get();
    const allEvaluations = [];
    allEvaluationSnapshots.forEach((snap) => {
        const data = snap.data();
        const id = snap.id;
        allEvaluations.push(Object.assign({ id }, data));
    });
    const userQry = db.collection('users');
    const allUserSnapshots = yield userQry.get();
    const allUsers = [];
    allUserSnapshots.forEach((snap) => {
        const data = snap.data();
        const uid = snap.id;
        allUsers.push(Object.assign({ uid }, data));
    });
    allEvaluations.forEach((evaluation) => __awaiter(void 0, void 0, void 0, function* () {
        const evalRef = db.collection('evaluations').doc(evaluation.id);
        if (!evaluation.class) {
            const student = allUsers.find(user => user.uid === evaluation.user);
            if (student.classes && student.classes[0]) {
                const classroom = student.classes[0];
                evaluation.class = classroom;
            }
        }
        yield evalRef.set(evaluation, { merge: true });
    }));
}));
//# sourceMappingURL=index.js.map