import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import { User } from '../../../src/app/auth/user.model';


const db = admin.firestore();

export const setClassNumbers = functions.https.onCall((data, context) => {
  if(context && context.auth && context.auth.token && context.auth.token.admin !== true){
    return {
      error: "Request not authorized. User must be an administrator to fulfill request."
    };
  }

  return db.collection("users").where('role', '==', 'Leerling').get()
  .then(users => {
    const batch = db.batch();
    let count = 0;
    users.forEach(user => {
      const returnedUser : User = {uid: user.id, ... user.data() as User};
      const userRef = db.collection("users").doc(returnedUser.uid);
      if(!returnedUser.classNumber){
        batch.update(userRef, {"classNumber": 99});
        count += 1;  
      }
    });
    if(count > 0) {
      return batch.commit()
      .then( _ => {
        return {
          result: "Successfully updated " + count + " user records with class number"
        }
      })
      .catch(err => {
        return {
          error: 'Error fetching user data.. ' + err
        };  
      });
    } else {
      return {
        result: "No need to update any user records in the database"
      }
    }
    
  })
  .catch(error => {
    return {
      error: 'Error fetching user data.. ' + error
    };
  });

});

