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
const db = admin.firestore();
exports.addAdmin = functions.auth.user().onCreate(event => {
    const user = event; // The Firebase user.
    // Check if user meets role criteria.
    if (user.email &&
        user.email.endsWith('@handihow.com') &&
        user.emailVerified) {
        const customClaims = {
            admin: true,
        };
        // Set custom user claims on this newly created user.
        return admin.auth().setCustomUserClaims(user.uid, customClaims);
    }
    else {
        console.log('no admin rights given');
        return null;
    }
});
exports.addDownloader = functions.https.onCall((data, context) => {
    if (context && context.auth && context.auth.token && context.auth.token.admin !== true) {
        return {
            error: "Request not authorized. User must be an administrator to fulfill request."
        };
    }
    const email = data.email;
    return admin.auth().getUserByEmail(email)
        .then(user => {
        if (user.customClaims && user.customClaims.downloader === true) {
            return {
                result: email + " is already a downloader."
            };
        }
        else {
            return admin.auth().setCustomUserClaims(user.uid, {
                downloader: true
            })
                .then(() => __awaiter(this, void 0, void 0, function* () {
                yield db.collection('users').doc(user.uid).update({ roles: { downloader: true } });
                return {
                    result: "Request fulfilled! " + email + " is now a downloader."
                };
            }))
                .catch(error => {
                return {
                    error: "Something went wrong.. " + error
                };
            });
        }
    })
        .catch(error => {
        return {
            error: 'Error fetching user data.. ' + error
        };
    });
});
exports.removeDownloader = functions.https.onCall((data, context) => {
    if (context && context.auth && context.auth.token && context.auth.token.admin !== true) {
        return {
            error: "Request not authorized. User must be an administrator to fulfill request."
        };
    }
    const email = data.email;
    return admin.auth().getUserByEmail(email)
        .then(user => {
        if (user.customClaims && user.customClaims.downloader === true) {
            return admin.auth().setCustomUserClaims(user.uid, {
                downloader: false
            })
                .then(() => __awaiter(this, void 0, void 0, function* () {
                yield db.collection('users').doc(user.uid).update({ roles: { downloader: false } });
                return {
                    result: "Request fulfilled! " + email + " is no longer a downloader."
                };
            }))
                .catch(error => {
                return {
                    error: "Something went wrong.. " + error
                };
            });
        }
        else {
            return {
                result: email + " is not a downloader."
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