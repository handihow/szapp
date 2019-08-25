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
import * as corrections from './corrections';

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
export const changeRoles = roles.changeRoles;
export const createUsers = roles.createUsers;
export const removeUser = roles.removeUser;

export const setClassNumbers = corrections.setClassNumbers;