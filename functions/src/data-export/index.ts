import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const {Storage} = require('@google-cloud/storage');
// Creates a client
const gcs = new Storage({
  projectId: process.env.GCP_PROJECT
});

import { join } from 'path';

const json2csv = require("json2csv").parse;
export const csvJsonReport = functions
.runWith({timeoutSeconds: 300, memory: "2GB"})
.pubsub
.topic('reports')
.onPublish( async (message, context) => {
  const bucket = gcs.bucket('gs://szapp-c42bb.appspot.com');
  const fileName = new Date().getUTCMilliseconds() + '.csv'
  const bucketDir = 'reports/'

  const db = admin.firestore();
  const evaluationsRef = db.collection('evaluations');
  return evaluationsRef.get()
    .then((querySnapshot) => {
      const evaluations = [];

      querySnapshot.forEach(doc => {
        const evaluation = doc.data();
        evaluations.push(evaluation);
      });
      const csv = json2csv(evaluations);
      return bucket.upload(csv, {
        destination: join(bucketDir, fileName)
      });
    }).catch((err) => {
      console.log(err);
    });

});