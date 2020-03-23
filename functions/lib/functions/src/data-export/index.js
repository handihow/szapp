"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
var striptags = require('striptags');
exports.jsonDownload = functions.runWith({
    timeoutSeconds: 300,
    memory: '1GB'
}).https.onCall((data, context) => __awaiter(this, void 0, void 0, function* () {
    if (context && context.auth && context.auth.token && !(context.auth.token.schooladmin || context.auth.token.admin)) {
        return {
            error: "Request not authorized. User must be a school admin to fulfill request."
        };
    }
    else if (!data.limit || !data.organisation) {
        return {
            error: "No data limit or organisation found in the data request."
        };
    }
    const db = admin.firestore();
    const evaluationsRef = db.collection('evaluations');
    const organisation = data.organisation;
    const limit = parseInt(data.limit);
    let programs = [];
    const programSnap = yield db.collection('programs').get();
    if (!programSnap.empty) {
        programSnap.docs.forEach(d => {
            const program = Object.assign({ id: d.id }, d.data());
            programs.push(program);
        });
    }
    return evaluationsRef.where("organisation", '==', organisation).orderBy('created', 'desc').limit(limit).get()
        .then((querySnapshot) => {
        const evaluations = [];
        querySnapshot.forEach(doc => {
            const evaluationData = doc.data();
            let programCode = '';
            let programName = '';
            const programIndex = programs.findIndex(p => p.id === evaluationData.program);
            if (programIndex > -1) {
                programCode = programs[programIndex].code;
                programName = programs[programIndex].name;
            }
            const evaluation = {
                created: evaluationData.created ? evaluationData.created.toDate().toLocaleDateString() : '-',
                evaluated: evaluationData.evaluated ? evaluationData.evaluated.toDate().toLocaleDateString() : '-',
                class: typeof evaluationData.class === 'string' ? evaluationData.class : '-',
                colorLabelStudent: returnSafe(evaluationData.colorLabelStudent),
                colorLabelTeacher: returnSafe(evaluationData.colorLabelTeacher),
                commentStudent: striptags(returnSafe(evaluationData.commentStudent)),
                commentTeacher: striptags(returnSafe(evaluationData.commentTeacher)),
                programCode: returnSafe(programCode),
                programName: returnSafe(programName),
                projectCode: returnSafe(evaluationData.projectCode),
                projectName: returnSafe(evaluationData.projectName),
                skillCompetency: striptags(returnSafe(evaluationData.skillCompetency)),
                skillWeight: evaluationData.skillWeight ? evaluationData.skillWeight : 1,
                skillOrder: returnSafe(evaluationData.skillOrder),
                skillTopic: striptags(returnSafe(evaluationData.skillTopic)),
                status: returnSafe(evaluationData.status),
                studentName: returnSafe(evaluationData.studentName),
                teacherName: returnSafe(evaluationData.teacherName)
            };
            evaluations.push(evaluation);
        });
        return {
            result: 'Succesfully downloaded the information',
            evaluations: evaluations
        };
    })
        .catch(err => {
        return {
            error: "Error in request :" + err.message
        };
    });
}));
function returnSafe(inputString) {
    if (typeof inputString === 'undefined' || inputString === null || inputString === "") {
        return '-';
    }
    else {
        return inputString;
    }
}
// function sanitizeString (desc) {
//     let itemDesc;
//     if (desc) {
//         itemDesc = desc.replace(/(\r\n|\n|\r|\s+|\t|&nbsp;)/gm,' ');
//         itemDesc = itemDesc.replace(/,/g, ' ');
//         itemDesc = itemDesc.replace(/;/g, ' ');
//         itemDesc = itemDesc.replace(/"/g, ' ');
//         itemDesc = itemDesc.replace(/'/g, ' ');
//         itemDesc = itemDesc.replace(/ +(?= )/g,' ');
//     } else {
//         itemDesc = '-';
//     }
//     return itemDesc;
// }
//# sourceMappingURL=index.js.map