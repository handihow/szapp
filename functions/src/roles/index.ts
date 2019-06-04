import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const addAdmin = functions.auth.user().onCreate(event => {
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
  } else {
    console.log('no admin rights given')
  	return null;
  }
});

export const addDownloader = functions.https.onCall((data, context) => {
  if(context && context.auth && context.auth.token && context.auth.token.admin !== true){
    return {
      error: "Request not authorized. User must be an administrator to fulfill request."
    };
  }
  const email = data.email;
  return admin.auth().getUserByEmail(email)
  .then(user => {
    if(user.customClaims && (user.customClaims as any).downloader === true) {
      return {
        result: email + " is already a downloader."
      };
    } else {
      return admin.auth().setCustomUserClaims(user.uid, {
        downloader: true
      })
      .then(async () => {
        await db.collection('users').doc(user.uid).update({roles: {downloader: true}});
        return {
          result: "Request fulfilled! " + email + " is now a downloader."
        }
      })
      .catch(error => {
        return {
          error: "Something went wrong.. " + error
        }
      });
    }
  })
  .catch(error => {
    return {
      error: 'Error fetching user data.. ' + error
    };
  });
});

export const removeDownloader = functions.https.onCall((data, context) => {
  if(context && context.auth && context.auth.token && context.auth.token.admin !== true){
    return {
      error: "Request not authorized. User must be an administrator to fulfill request."
    };
  }
  const email = data.email;
  return admin.auth().getUserByEmail(email)
  .then(user => {
    if(user.customClaims && (user.customClaims as any).downloader === true) {
      return admin.auth().setCustomUserClaims(user.uid, {
        downloader: false
      })
      .then(async () => {
        await db.collection('users').doc(user.uid).update({roles: {downloader: false}});
        return {
          result: "Request fulfilled! " + email + " is no longer a downloader."
        }
      })
      .catch(error => {
        return {
          error: "Something went wrong.. " + error
        }
      });

    } else {
      
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