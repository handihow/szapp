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
const corrections = require("./corrections");
exports.calculateClassroomAveragesForPrograms = analysis.calculateClassroomAveragesForPrograms;
exports.correctEvaluationRecords = analysis.correctEvaluationRecords;
exports.onFileChange = images.onFileChange;
exports.onDeleteEvaluationUpdateProgramProgress = progress.onDeleteEvaluationUpdateProgramProgress;
exports.onDeleteEvaluationUpdateProgress = progress.onDeleteEvaluationUpdateProgress;
exports.onNewProgramProgress = progress.onNewProgramProgress;
exports.onNewProgress = progress.onNewProgress;
exports.onUpdateProgramProgress = progress.onUpdateProgramProgress;
exports.onUpdateProgress = progress.onUpdateProgress;
exports.jsonDownload = data.jsonDownload;
exports.addAdmin = roles.addAdmin;
exports.changeRoles = roles.changeRoles;
exports.changeProfile = roles.changeProfile;
exports.createUsers = roles.createUsers;
exports.addStudent = roles.addStudent;
exports.removeUser = roles.removeUser;
exports.setClassNumbers = corrections.setClassNumbers;
//# sourceMappingURL=index.js.map