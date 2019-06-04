import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as cors from 'cors';
cors({
  origin: true,
});
admin.initializeApp(functions.config().firebase);

import * as analysis from './analysis';
import * as images from './images';
import * as progress from './progress';
import * as data from './data-export';
import * as roles from './roles';

export const calculateClassroomAveragesForPrograms = analysis.calculateClassroomAveragesForPrograms;
export const correctEvaluationRecords = analysis.correctEvaluationRecords;

export const onFileChange = images.onFileChange;

export const onDeleteEvaluationUpdateProgramProgress = progress.onDeleteEvaluationUpdateProgramProgress;
export const onDeleteEvaluationUpdateProgress = progress.onDeleteEvaluationUpdateProgress;
export const onNewProgramProgress = progress.onNewProgramProgress;
export const onNewProgress = progress.onNewProgress;
export const onUpdateProgramProgress = progress.onUpdateProgramProgress;
export const onUpdateProgress = progress.onUpdateProgress;

export const jsonDownload = data.jsonDownload;

export const addAdmin = roles.addAdmin;
export const addDownloader = roles.addDownloader;
export const removeDownloader = roles.removeDownloader;
