import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Evaluation } from '../../../src/app/evaluations/evaluation.model';

export const jsonDownload = functions.runWith({
  timeoutSeconds: 300,
  memory: '1GB'
}).https.onCall((data, context) => {
  
  if(context && context.auth && context.auth.token && context.auth.token.downloader !== true){
    return {
          error: "Request not authorized. User must be a downloader to fulfill request."
      }
  }

  const db = admin.firestore();
  const evaluationsRef = db.collection('evaluations');

  const limit = parseInt(data.limit);
  
  return evaluationsRef.orderBy('created', 'desc').limit(limit).get()
    .then((querySnapshot) => {
      const evaluations : Evaluation[] = [];

      querySnapshot.forEach(doc => {
        const evaluationData = doc.data() as Evaluation;

        const evaluation : Evaluation = {
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
        }
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

function sanitizeString (desc) {
    let itemDesc;
    if (desc) {
        itemDesc = desc.replace(/(\r\n|\n|\r|\s+|\t|&nbsp;)/gm,' ');
        itemDesc = itemDesc.replace(/,/g, ' ');
        itemDesc = itemDesc.replace(/;/g, ' ');
        itemDesc = itemDesc.replace(/"/g, ' ');
        itemDesc = itemDesc.replace(/'/g, ' ');
        itemDesc = itemDesc.replace(/ +(?= )/g,' ');
    } else {
        itemDesc = '-';
    }
    return itemDesc;
}
