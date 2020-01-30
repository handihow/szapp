"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const cors = require("cors");
cors({
    origin: true,
});
admin.initializeApp(functions.config().firebase);
const analysis = require("./analysis");
const images = require("./images");
const progress = require("./progress");
const data = require("./data-export");
const roles = require("./roles");
// import * as corrections from './corrections';
exports.calculateClassroomAveragesForPrograms = analysis.calculateClassroomAveragesForPrograms;
// export const correctEvaluationRecords = analysis.correctEvaluationRecords;
exports.onFileChange = images.onFileChange;
exports.onCreateEvaluation = progress.onCreateEvaluation;
exports.onUpdateEvaluation = progress.onUpdateEvaluation;
exports.onDeleteEvaluation = progress.onDeleteEvaluation;
exports.jsonDownload = data.jsonDownload;
exports.addAdmin = roles.addAdmin;
exports.changeRoles = roles.changeRoles;
exports.changeProfile = roles.changeProfile;
exports.createUsers = roles.createUsers;
exports.addStudent = roles.addStudent;
exports.removeUser = roles.removeUser;
// export const setClassNumbers = corrections.setClassNumbers;
// export const setOfficialClass = corrections.setOfficialClass;
//# sourceMappingURL=index.js.map