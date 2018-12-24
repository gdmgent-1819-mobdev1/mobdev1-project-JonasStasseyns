/* eslint-disable no-use-before-define */
// Only import the compile function from handlebars instead of the entire library
import { compile } from 'handlebars';
import handlebars from 'handlebars';
import update from '../helpers/update';
import { getInstance } from '../firebase/firebase';

// Import the template to use
const homeTemplate = require('../templates/home.handlebars');
const form = require('../partials/form.handlebars');
const kotListTemplate = require('../partials/kotlistteplate.handlebars');



export default () => {
  // Data to be passed to the template
  const user = 'Test user';
  // Return the compiled template to the router
  update(compile(homeTemplate)({ user }));

  // wait for compilation
  const fileButton = document.querySelector('.filetest');
  // fileButton.addEventListener('change', uploadFile);
  addEventlisteners();
  firebaseRead();
};

const instance = getInstance();

function checkLoggedIn() {
  instance.auth().onAuthStateChanged((user) => {
    if (user) {
      // document.querySelector('.user-email').innerHTML = user.email;
    } else {
      console.log('Not logged In');
      document.querySelector('.form-signin').style.opacity = 1;
      // TODO replace css display with handlebars show partial thingy
    }
  });
}

checkLoggedIn();

function SignIn(email, password) {
  instance.auth().signInWithEmailAndPassword(email, password).catch((error) => {
    localNotification(error.message);
    // TODO create element for errormessage
    // TODO redirect
  });
}

handlebars.registerPartial('form', compile(form));


function SignUp(email, password) {
  instance.auth().createUserWithEmailAndPassword(email, password).catch((error) => {
    const errorMessage = error.message;
    // TODO create element for errormessage
    // TODO 'Verify email' message
  });
}


function addEventlisteners() {
  document.querySelector('.signin-submit').addEventListener('click', () => {
    const email = document.querySelector('.signin-email').value;
    const password = document.querySelector('.signin-password').value;
    SignIn(email, password);
  });

  // document.querySelector('body').addEventListener('click', () => {
  //   localNotification('Welcome to the crew, status-bar!');
  // });

  // Test
  // TMP add kot
  document.querySelector('.add-kot-submit').addEventListener('click', () => {
    const kotTitle = document.querySelector('.add-kot-title').value;
    const kotDescription = document.querySelector('.add-kot-description').value;
    const kotAddress = document.querySelector('.add-kot-address').value;
    instance.database().ref('kots').push({
      title: kotTitle,
      description: kotDescription,
      address: kotAddress,
    });
  });

  // document.querySelector('.signup-submit').addEventListener('click', () => {
  //   const email = document.querySelector('.signup-email').value;
  //   const password = document.querySelector('.signup-password').value;
  //   SignUp(email, password);
  // });
}

function uploadFile(e) {
  const file = e.target.files[0];
  const storageRef = instance.storage().ref('testmap/' + file.name);
  storageRef.put(file);
}

function firebaseRead() {
  // document.querySelector('.kotlist').innerHTML = '';
  const leadsRef = instance.database().ref();
  leadsRef.on('value', (snapshot) => {
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      console.log(data.title);
    });
    console.log(snapshot.val());
    const template = handlebars.compile(kotListTemplate);
    const templateData = template(snapshot.val());
    document.querySelector('.kotlist').innerHTML = templateData;
    console.log(templateData);
  });
}

function localNotification(message) {
  const status = document.querySelector('.status-bar');
  status.innerHTML = message;
  status.style.display = 'block';
  setTimeout(() => {
    status.style.display = 'none';
  }, 5000);
}
