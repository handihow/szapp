import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
const UUID = require("uuid/v4");

const db = admin.firestore();

export const addAdmin = functions.auth.user().onCreate(event => {
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
      })
    });
  } else {
    console.log('no admin rights given')
  	return null;
  }
});

export const changeRoles = functions.https.onCall((data, context) => {
  if(context && context.auth && context.auth.token && !context.auth.token.admin){
    return {
      error: "Request not authorized. User must be an administrator to fulfill request."
    };
  }
  const email = data.email;
  const roles = data.roles;
  return admin.auth().getUserByEmail(email)
  .then(user => {
    return admin.auth().setCustomUserClaims(user.uid, roles)
    .then(async () => {
      await db.collection('users').doc(user.uid).update({roles: roles});
      return {
        result: "Request fulfilled!"
      }
    })
    .catch(error => {
      return {
        error: "Something went wrong.. " + error
      }
    });
    
  })
  .catch(error => {
    return {
      error: 'Error fetching user data.. ' + error
    };
  });
});


export const createUsers = functions.https.onCall(async (data, context) => {
  if(!context.auth || !context.auth.token || !context.auth.token.admin){
    return {
      error: "Verzoek afgewezen. Je hebt onvoldoende toegangsrechten."
    };
  } else if(!data || !data.organisation || !data.users || data.users.length === 0){
    return {
      error: "Verzoek bevat onvoldoende gegevens. Verzoek kan niet worden verwerkt."
    };
  }
  //define the new users organisation
  const organisation : string = data.organisation.id;
  const organisationName : string = data.organisation.name;

  const batch = db.batch();
  const importedUsers = data.users;

  importedUsers.forEach((importedUser) => {
    importedUser.uid = UUID();
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
      role: importedUser.student ? 'Student' : importedUser.teacher ? 'Leraar' : 'Admin',
      roles: customClaims,
      photoURL: "https://ui-avatars.com/api/?background=03a9f4&color=F5F5F5&name=" + importedUser.displayName
    });
  });

  return admin.auth().importUsers(importedUsers)
     .then(function(results) {
        return batch.commit()
        .then( _ => {
          return {
            result: "Nieuwe gebruikers aangemaakt"
          }
        })
        .catch(err => {
          return {
            error: "Probleem bij bewaren van gegevens: " + err
          }
        });
      })
      .catch(error => {
        return {
          error: "Probleem bij importeren van gebruikers: " + error
        }
      });
});

// export const editUser = functions.https.onCall((data, context) => {
//   if(!context.auth || !context.auth.token || !context.auth.token.oadmin){
//     return {
//       error: "Verzoek afgewezen. Je hebt onvoldoende toegangsrechten."
//     };
//   }
//   const email = data.email;

//   //define the role and organisation and possibly school
//   const role : string = data.role;
//   const accesslevel : number = userRoles[role].accesslevel;
//   const organisation : string = data.organisation;
//   const school : string = data.school ? data.school : null;
//   //define the custom claims object for these new users
//   const customClaims = {};
//   customClaims[role] = true;
//   customClaims['accesslevel'] = accesslevel;
//   customClaims[organisation] = true;
//   if(school){
//     customClaims[school] = true;
//   }

//   return admin.auth().getUserByEmail(email)
//   .then(user => {
//     return admin.auth().setCustomUserClaims(user.uid,customClaims)
//     .then(async () => {
//       data.accesslevel = accesslevel;
//       await db.collection('users').doc(user.uid).update(data);
//       return {
//         result: "Gebruiker " + email + " is bijgewerkt."
//       }
//     })
//     .catch(error => {
//       return {
//         error: "Er ging iets mis.. " + error
//       }
//     });
//   })
//   .catch(error => {
//     return {
//       error: 'Probleem bij het vinden van de gebruiker.. ' + error
//     };
//   });
// });


export const removeUser = functions.https.onCall((data, context) => {
  if(!context.auth || !context.auth.token || !context.auth.token.admin){
    return {
      error: "Verzoek afgewezen. Je hebt onvoldoende toegangsrechten."
    };
  }
  const email = data.email;
  return admin.auth().getUserByEmail(email)
  .then(user => {
    return admin.auth().deleteUser(user.uid)
    .then(async () => {
      await db.collection('users').doc(user.uid).delete();
      return {
        result: "Gebruiker " + email + " is succesvol verwijderd."
      }
    })
    .catch(error => {
      return {
        error: "Er ging iets mis.. " + error
      }
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