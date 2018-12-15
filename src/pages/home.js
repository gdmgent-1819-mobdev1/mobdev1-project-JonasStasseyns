/* eslint-disable no-use-before-define */
// Only import the compile function from handlebars instead of the entire library
import { compile } from 'handlebars';
import update from '../helpers/update';
import { getInstance } from '../firebase/firebase';

// Import the template to use
const homeTemplate = require('../templates/home.handlebars');

export default () => {
  // Data to be passed to the template
  const user = 'Test user';
  // Return the compiled template to the router
  update(compile(homeTemplate)({ user }));

  addEventlisteners();
};

const instance = getInstance();

function checkLoggedIn() {
  instance.auth().onAuthStateChanged((user) => {
    if (user) {
      console.log('Logged In');
    } else {
      console.log('Not logged In');
      document.querySelector('.signin-form').style.opacity = 1;
      // TODO replace css display with handlebars show partial thingy
    }
  });
}

checkLoggedIn();

function SignIn(email, password) {
  instance.auth().signInWithEmailAndPassword(email, password).catch((error) => {
    const errorMessage = error.message;
    // TODO create element for errormessage
    // TODO redirect
  });
}

function SignUp(email, password) {
  instance.auth().createUserWithEmailAndPassword(email, password).catch((error) => {
    const errorMessage = error.message;
    // TODO create element for errormessage
    // TODO 'Verify email' message
  });
}

function addEventlisteners(){
  // document.querySelector('.signin-submit').addEventListener('click', () => {
  //   const email = document.querySelector('.signin-email').value;
  //   const password = document.querySelector('.signin-password').value;
  //   SignIn(email, password);

    // TMP add kot
    document.querySelector('.add-kot-submit').addEventListener('click', () => {
      const kotTitle = document.querySelector('.add-kot-title');
      const kotDescription = document.querySelector('.add-kot-description');
      const kotAddress = document.querySelector('.add-kot-address');
      console.log('fire');
      instance.database().ref('kots/').push({
        title: kotTitle,
        description: kotDescription,
        address: kotAddress,
      });
    });
  });

  // document.querySelector('.signup-submit').addEventListener('click', () => {
  //   const email = document.querySelector('.signup-email').value;
  //   const password = document.querySelector('.signup-password').value;
  //   SignUp(email, password);
  // });
}
