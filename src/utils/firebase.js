/* eslint-disable linebreak-style */
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/storage';
import 'firebase/firestore';
import 'firebase/functions';

// Initialize Firebase
const config = {
  apiKey: '',
  authDomain: '',
  databaseURL: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};
firebase.initializeApp(config);

export const auth = firebase.auth();

export default firebase;
