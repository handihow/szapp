"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setOfficialClass = exports.setClassNumbers = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();
exports.setClassNumbers = functions.https.onCall((data, context) => {
    if (context && context.auth && context.auth.token && context.auth.token.admin !== true) {
        return {
            error: "Request not authorized. User must be an administrator to fulfill request."
        };
    }
    return db.collection("users").where('role', '==', 'Leerling').get()
        .then(users => {
        const batch = db.batch();
        let count = 0;
        users.forEach(user => {
            const returnedUser = Object.assign({ uid: user.id }, user.data());
            const userRef = db.collection("users").doc(returnedUser.uid);
            if (!returnedUser.classNumber) {
                batch.update(userRef, { "classNumber": 99 });
                count += 1;
            }
        });
        if (count > 0) {
            return batch.commit()
                .then(_ => {
                return {
                    result: "Successfully updated " + count + " user records with class number"
                };
            })
                .catch(err => {
                return {
                    error: 'Error fetching user data.. ' + err
                };
            });
        }
        else {
            return {
                result: "No need to update any user records in the database"
            };
        }
    })
        .catch(error => {
        return {
            error: 'Error fetching user data.. ' + error
        };
    });
});
exports.setOfficialClass = functions.https.onCall((data, context) => {
    if (context && context.auth && context.auth.token && context.auth.token.admin !== true) {
        return {
            error: "Request not authorized. User must be an administrator to fulfill request."
        };
    }
    return db.collection("users").where('roles.student', '==', true).get()
        .then(users => {
        const batch = db.batch();
        let count = 0;
        users.forEach(user => {
            const returnedUser = Object.assign({ uid: user.id }, user.data());
            const userRef = db.collection("users").doc(returnedUser.uid);
            const officialClass = returnedUser.classes && returnedUser.classes[0] ? returnedUser.classes[0] : '-';
            batch.update(userRef, { "officialClass": officialClass });
            count += 1;
        });
        if (count > 0) {
            return batch.commit()
                .then(_ => {
                return {
                    result: "Successfully updated " + count + " user records with official class"
                };
            })
                .catch(err => {
                return {
                    error: 'Error fetching user data.. ' + err
                };
            });
        }
        else {
            return {
                result: "No need to update any user records in the database"
            };
        }
    })
        .catch(error => {
        return {
            error: 'Error fetching user data.. ' + error
        };
    });
});
//# sourceMappingURL=index.js.map