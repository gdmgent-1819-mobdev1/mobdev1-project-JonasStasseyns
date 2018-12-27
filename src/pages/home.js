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
const menuTemplate = require('../partials/menu.handlebars');

let currentUser = '';

export default () => {
  // Data to be passed to the template
  const user = 'Test user';

  // Return the compiled template to the router
  update(compile(homeTemplate)({ user }));

  // wait for compilation
  firebaseRead();
  checkLoggedIn();
  buildMenu();
};

export { buildMenu, currentUser };

const instance = getInstance();

function checkLoggedIn(signin) {
  instance.auth().onAuthStateChanged((user) => {
    if (user) {
      currentUser = user;
      if (signin) {
        localNotification('Signed in successfully');
        document.querySelector('.form-signin').remove();
        buildMenu();
      }
    } else {
      currentUser = 'none';
      console.log('Not logged In');
    }
  });
}

// instance.auth().signOut();

checkLoggedIn();

function SignIn(email, password) {
  instance.auth().signInWithEmailAndPassword(email, password).catch((error) => {
    localNotification(error.message);
    // TODO create element for errormessage
    // TODO redirect
  });
  checkLoggedIn(true);
}

handlebars.registerPartial('form', compile(form));


function SignUp(email, password) {
  instance.auth().createUserWithEmailAndPassword(email, password).catch((error) => {
    const errorMessage = error.message;
    // TODO create element for errormessage
    // TODO 'Verify email' message
  });
}

function compileAuthForm(type, typeCase, alt, altCase) {
  const compiledForm = compile(form)({
    type, typeCase, alt, altCase,
  });
  document.querySelector('.form-space').innerHTML = compiledForm;
  document.querySelector('.auth-submit').addEventListener('click', () => {
    const email = document.querySelector('.signin-email').value;
    const password = document.querySelector('.signin-password').value;
    if (type === 'signin') {
      SignIn(email, password);
    } else if (type === 'signup') {
      SignUp(email, password);
    }
  });
  document.querySelector(`.${alt}-switch`).addEventListener('click', () => {
    compileAuthForm(alt, altCase, type, typeCase);
  });
}

function buildMenu() {
  // Menu button
  console.log(currentUser);
  const menu = document.querySelector('.menu');
  document.querySelector('.menu-icon').addEventListener('click', () => {
    const compiledMenu = compile(menuTemplate)({ email: currentUser.email });
    menu.innerHTML = compiledMenu;
    menu.style.display = 'block';
    document.querySelector('.close-menu').addEventListener('click', () => {
      menu.style.display = 'none';
    });
    if (document.querySelector('.show-signin')) {
      document.querySelector('.show-signin').addEventListener('click', () => {
        menu.style.display = 'none';
        compileAuthForm('signin', 'Sign in', 'signup', 'Sign up');
      });
    }
  });
}

function firebaseRead() {
  document.querySelector('.kotlist').innerHTML = '';
  const leadsRef = instance.database().ref();
  leadsRef.on('value', (snapshot) => {
    const template = handlebars.compile(kotListTemplate);
    const templateData = template(snapshot.val());
    console.log(templateData);
    document.querySelector('.kotlist').innerHTML = templateData;
  });
}

function localNotification(message) {
  const status = document.querySelector('.status-bar');
  console.log(status);
  status.innerHTML = message;
  status.style.display = 'block';
  setTimeout(() => {
    status.style.display = 'none';
  }, 5000);
}
