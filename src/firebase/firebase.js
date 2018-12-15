const firebaseInstance = require('firebase');

// Initialize Firebase
// TODO: Replace with your project's config
const config = {
  apiKey: 'AIzaSyDkqTcCHDJgh-3m7pfH_wUNurKQXkkpEj8',
  authDomain: 'jonasstasseyns-eindopdracht.firebaseapp.com',
  databaseURL: 'https://jonasstasseyns-eindopdracht.firebaseio.com/',
  projectId: 'jonasstasseyns-eindopdracht',
  storageBucket: 'jonasstasseyns-eindopdracht.appspot.com',
  messagingSenderId: '977534476748',
};

let instance = null;

const initFirebase = () => {
  instance = firebaseInstance.initializeApp(config);
};

const getInstance = () => {
  if (!instance) {
    initFirebase();
  }
  return instance;
};
export {
  initFirebase,
  getInstance,
};
