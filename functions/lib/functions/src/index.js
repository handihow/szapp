"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
const functions = require("firebase-functions");
admin.initializeApp(functions.config().firebase);
const analysis = require("./analysis");
const images = require("./images");
const progress = require("./progress");
exports.calculateClassroomAveragesForPrograms = analysis.calculateClassroomAveragesForPrograms;
exports.correctEvaluationRecords = analysis.correctEvaluationRecords;
exports.onFileChange = images.onFileChange;
exports.onDeleteEvaluationUpdateProgramProgress = progress.onDeleteEvaluationUpdateProgramProgress;
exports.onDeleteEvaluationUpdateProgress = progress.onDeleteEvaluationUpdateProgress;
exports.onNewProgramProgress = progress.onNewProgramProgress;
exports.onNewProgress = progress.onNewProgress;
exports.onUpdateProgramProgress = progress.onUpdateProgramProgress;
exports.onUpdateProgress = progress.onUpdateProgress;
//# sourceMappingURL=index.js.map