"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
exports.jsonDownload = functions.runWith({
    timeoutSeconds: 300,
    memory: '1GB'
}).https.onCall((data, context) => {
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
    let evaluationsRef = db.collection('evaluations');
    const organisation = data.organisation;
    const limit = parseInt(data.limit);
    return evaluationsRef.where("organisation", '==', organisation).orderBy('created', 'desc').limit(limit).get()
        .then((querySnapshot) => {
        const evaluations = [];
        querySnapshot.forEach(doc => {
            const evaluationData = doc.data();
            const evaluation = {
                created: evaluationData.created ? evaluationData.created.toDate().toLocaleDateString() : '-',
                evaluated: evaluationData.evaluated ? evaluationData.evaluated.toDate().toLocaleDateString() : '-',
                class: evaluationData.class ? evaluationData.class[0] : '-',
                colorLabelStudent: sanitizeString(evaluationData.colorLabelStudent),
                colorLabelTeacher: sanitizeString(evaluationData.colorLabelTeacher),
                commentStudent: sanitizeString(evaluationData.commentStudent),
                commentTeacher: sanitizeString(evaluationData.commentTeacher),
                projectCode: sanitizeString(evaluationData.projectCode),
                projectName: sanitizeString(evaluationData.projectName),
                skillCompetency: sanitizeString(evaluationData.skillCompetency),
                skillOrder: sanitizeString(evaluationData.skillOrder),
                skillTopic: sanitizeString(evaluationData.skillTopic),
                status: sanitizeString(evaluationData.status),
                studentName: sanitizeString(evaluationData.studentName),
                teacherName: sanitizeString(evaluationData.teacherName)
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
});
function sanitizeString(desc) {
    let itemDesc;
    if (desc) {
        itemDesc = desc.replace(/(\r\n|\n|\r|\s+|\t|&nbsp;)/gm, ' ');
        itemDesc = itemDesc.replace(/,/g, ' ');
        itemDesc = itemDesc.replace(/;/g, ' ');
        itemDesc = itemDesc.replace(/"/g, ' ');
        itemDesc = itemDesc.replace(/'/g, ' ');
        itemDesc = itemDesc.replace(/ +(?= )/g, ' ');
    }
    else {
        itemDesc = '-';
    }
    return itemDesc;
}
//# sourceMappingURL=index.js.map