"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUser = exports.addStudent = exports.createUsers = exports.changeProfile = exports.changeRoles = exports.addAdmin = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const uuid_1 = require("uuid");
const db = admin.firestore();
exports.addAdmin = functions.auth.user().onCreate(event => {
    const user = event; // The Firebase user.
    // Check if user meets role criteria.
    if (user.email &&
        user.email.endsWith('@handihow.com') &&
        user.emailVerified) {
        const customClaims = {
            // parent: false,
            student: false,
            teacher: true,
            schooladmin: true,
            // trajectorycounselor: false,
            // companyadmin: false,
            admin: true,
            organisation: 'handihow'
        };
        // Set custom user claims on this newly created user.
        return admin.auth().setCustomUserClaims(user.uid, customClaims)
            .then(_ => {
            return db.collection('users').doc(user.uid).set({
                uid: user.uid,
                email: user.email,
                photoURL: user.photoURL,
                displayName: user.displayName,
                organisation: 'HandiHow',
                organisationId: 'handihow',
                role: 'Admin',
                roles: customClaims
            });
        });
    }
    else {
        console.log('no admin rights given');
        return null;
    }
});
exports.changeRoles = functions.https.onCall((data, context) => {
    if (context && context.auth && context.auth.token && !context.auth.token.admin) {
        return {
            error: "Request not authorized. User must be an administrator to fulfill request."
        };
    }
    const email = data.email;
    const roles = data.roles;
    return admin.auth().getUserByEmail(email)
        .then(user => {
        return admin.auth().setCustomUserClaims(user.uid, roles)
            .then(() => __awaiter(void 0, void 0, void 0, function* () {
            yield db.collection('users').doc(user.uid).update({ roles: roles });
            return {
                result: "Request fulfilled!"
            };
        }))
            .catch(error => {
            return {
                error: "Something went wrong.. " + error
            };
        });
    })
        .catch(error => {
        return {
            error: 'Error fetching user data.. ' + error
        };
    });
});
exports.changeProfile = functions.https.onCall((data, context) => {
    if (context && context.auth && context.auth.token && !context.auth.token.admin) {
        return {
            error: "Request not authorized. User must be an administrator to fulfill request."
        };
    }
    const uid = data.uid;
    const email = data.email;
    const displayName = data.displayName;
    const officialClass = data.officialClass || null;
    const subjects = data.subjects || [];
    const classNumber = data.classNumber || null;
    return admin.auth().getUser(uid)
        .then(user => {
        return admin.auth().updateUser(uid, {
            email: email,
            displayName: displayName
        })
            .then(() => __awaiter(void 0, void 0, void 0, function* () {
            yield db.collection('users').doc(uid).update({
                email: email,
                displayName: displayName,
                officialClass: officialClass,
                subjects: subjects,
                classNumber: classNumber
            });
            return {
                result: "Request fulfilled!"
            };
        }))
            .catch(error => {
            return {
                error: "Something went wrong.. " + error
            };
        });
    })
        .catch(error => {
        return {
            error: 'Error fetching user data.. ' + error
        };
    });
});
exports.createUsers = functions.https.onCall((data, context) => __awaiter(void 0, void 0, void 0, function* () {
    if (!context.auth || !context.auth.token || !context.auth.token.admin) {
        return {
            error: "Verzoek afgewezen. Je hebt onvoldoende toegangsrechten."
        };
    }
    else if (!data || !data.organisation || !data.users || data.users.length === 0) {
        return {
            error: "Verzoek bevat onvoldoende gegevens. Verzoek kan niet worden verwerkt."
        };
    }
    //define the new users organisation
    const organisation = data.organisation.id;
    const organisationName = data.organisation.name;
    const batch = db.batch();
    const importedUsers = data.users;
    importedUsers.forEach((importedUser) => {
        importedUser.uid = uuid_1.v4();
        const customClaims = {
            // parent: false,
            student: importedUser.student,
            teacher: importedUser.teacher,
            schooladmin: importedUser.schooladmin,
            // trajectorycounselor: false,
            // companyadmin: false,
            admin: importedUser.admin,
            organisation: organisation
        };
        importedUser.customClaims = customClaims;
        const userRef = db.collection('users').doc(importedUser.uid);
        batch.set(userRef, {
            uid: importedUser.uid,
            email: importedUser.email,
            displayName: importedUser.displayName,
            organisation: organisationName,
            organisationId: organisation,
            role: importedUser.student ? 'Leerling' : importedUser.teacher ? 'Leraar' : 'Admin',
            roles: customClaims,
            photoURL: "https://ui-avatars.com/api/?background=03a9f4&color=F5F5F5&name=" + importedUser.displayName
        });
    });
    return admin.auth().importUsers(importedUsers)
        .then(function (results) {
        return batch.commit()
            .then(_ => {
            return {
                result: "Nieuwe gebruikers aangemaakt"
            };
        })
            .catch(err => {
            return {
                error: "Probleem bij bewaren van gegevens: " + err
            };
        });
    })
        .catch(error => {
        return {
            error: "Probleem bij importeren van gebruikers: " + error
        };
    });
}));
exports.addStudent = functions.https.onCall((data, context) => {
    if (!context.auth || !context.auth.token || !context.auth.token.admin) {
        return {
            error: "Verzoek afgewezen. Je hebt onvoldoende toegangsrechten."
        };
    }
    const organisation = data.organisation.id;
    //define the custom claims object for these new users
    const customClaims = {
        // parent: false,
        student: true,
        teacher: false,
        schooladmin: false,
        // trajectorycounselor: false,
        // companyadmin: false,
        admin: false,
        organisation: organisation
    };
    const newStudent = {
        uid: uuid_1.v4(),
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL
    };
    return admin.auth().createUser(newStudent)
        .then(userRecord => {
        return admin.auth().setCustomUserClaims(newStudent.uid, customClaims)
            .then(() => {
            return db.collection('users').doc(newStudent.uid).create(Object.assign(Object.assign({}, newStudent), { organisationId: organisation, organisation: data.organisation.name, role: 'Leerling', roles: customClaims, hasGoogleForEducation: true }))
                .then(writeResult => {
                return {
                    result: newStudent
                };
            })
                .catch(e => {
                return {
                    error: "Er ging iets mis.. " + e
                };
            });
        })
            .catch(err => {
            return {
                error: "Er ging iets mis.. " + err
            };
        });
    })
        .catch(error => {
        return {
            error: 'Er ging iets mis met het maken van het account.. ' + error
        };
    });
});
exports.removeUser = functions.https.onCall((data, context) => {
    if (!context.auth || !context.auth.token || !context.auth.token.admin) {
        return {
            error: "Verzoek afgewezen. Je hebt onvoldoende toegangsrechten."
        };
    }
    const email = data.email;
    return admin.auth().getUserByEmail(email)
        .then(user => {
        return admin.auth().deleteUser(user.uid)
            .then(() => __awaiter(void 0, void 0, void 0, function* () {
            yield db.collection('users').doc(user.uid).delete();
            return {
                result: "Gebruiker " + email + " is succesvol verwijderd."
            };
        }))
            .catch(error => {
            return {
                error: "Er ging iets mis.. " + error
            };
        });
    })
        .catch(error => {
        return {
            error: 'Probleem bij het vinden van de gebruiker.. ' + error
        };
    });
});
// export const removeDownloader = functions.https.onCall((data, context) => {
//   if(context && context.auth && context.auth.token && context.auth.token.admin !== true){
//     return {
//       error: "Request not authorized. User must be an administrator to fulfill request."
//     };
//   }
//   const email = data.email;
//   return admin.auth().getUserByEmail(email)
//   .then(user => {
//     if(user.customClaims && (user.customClaims as any).downloader === true) {
//       return admin.auth().setCustomUserClaims(user.uid, {
//         downloader: false
//       })
//       .then(async () => {
//         await db.collection('users').doc(user.uid).update({roles: {downloader: false}});
//         return {
//           result: "Request fulfilled! " + email + " is no longer a downloader."
//         }
//       })
//       .catch(error => {
//         return {
//           error: "Something went wrong.. " + error
//         }
//       });
//     } else {
//       return {
//         result: email + " is not a downloader."
//       };
//     }
//   })
//   .catch(error => {
//     return {
//       error: 'Error fetching user data.. ' + error
//     };
//   });
// });
//# sourceMappingURL=index.js.map