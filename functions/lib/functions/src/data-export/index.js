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
const { Storage } = require('@google-cloud/storage');
// Creates a client
const gcs = new Storage({
    projectId: process.env.GCP_PROJECT
});
const path_1 = require("path");
const json2csv = require("json2csv").parse;
exports.csvJsonReport = functions
    .runWith({ timeoutSeconds: 300, memory: "2GB" })
    .pubsub
    .topic('reports')
    .onPublish((message, context) => __awaiter(this, void 0, void 0, function* () {
    const bucket = gcs.bucket('gs://szapp-c42bb.appspot.com');
    const fileName = new Date().getUTCMilliseconds() + '.csv';
    const bucketDir = 'reports/';
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
            destination: path_1.join(bucketDir, fileName)
        });
    }).catch((err) => {
        console.log(err);
    });
}));
//# sourceMappingURL=index.js.map