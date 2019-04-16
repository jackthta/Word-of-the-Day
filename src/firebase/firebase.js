import * as firebase from 'firebase';
import apiKey from '../private/apiKeys';

// Initialize Firebase
  let FirebaseConfig = apiKey.FirebaseConfig;
  firebase.initializeApp(FirebaseConfig);

  const database = firebase.database();
  const googleAuthProvider = new firebase.auth.GoogleAuthProvider();

  export { firebase, googleAuthProvider, database as default };