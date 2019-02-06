import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp(functions.config().firebase);

import * as analysis from './analysis';
import * as images from './images';
import * as progress from './progress';

export const calculateClassroomAveragesForPrograms = analysis.calculateClassroomAveragesForPrograms;
export const correctEvaluationRecords = analysis.correctEvaluationRecords;

export const onFileChange = images.onFileChange;

export const onDeleteEvaluationUpdateProgramProgress = progress.onDeleteEvaluationUpdateProgramProgress;
export const onDeleteEvaluationUpdateProgress = progress.onDeleteEvaluationUpdateProgress;
export const onNewProgramProgress = progress.onNewProgramProgress;
export const onNewProgress = progress.onNewProgress;
export const onUpdateProgramProgress = progress.onUpdateProgramProgress;
export const onUpdateProgress = progress.onUpdateProgress;
