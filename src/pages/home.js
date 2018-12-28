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

const instance = getInstance();

// window.location.href = '/#/detail';

let currentUser = '';

export default () => {
  // Data to be passed to the template
  const user = 'Test user';

  // Return the compiled template to the router
  update(compile(homeTemplate)({ user }));

  // wait for compilation
  checkLoggedIn();
  buildMenu();
  firebaseRead();
  checkLoggedIn();

  handlebars.registerPartial('form', compile(form));
};

function checkLoggedIn(signin) {
  instance.auth().onAuthStateChanged((user) => {
    if (user) {
      currentUser = user;
      console.log(user.uid);
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

function SignIn(user) {
  instance.auth().signInWithEmailAndPassword(user.email, user.password).then(() => {
    localNotification('Signed in successfully');
  }).catch((error) => {
    localNotification(error.message);
  });
  checkLoggedIn(true);
}

function SignUp(userInput) {
  const user = userInput;
  instance.auth().createUserWithEmailAndPassword(user.email, user.password).then(() => {
    user.address = `${user.number} ${user.street} ${user.city} ${user.postal}`;
    const pattern = / /gi;
    const safeAddress = user.address.replace(pattern, '%20');
    const res = `https://api.mapbox.com/geocoding/v5/mapbox.places/${safeAddress}.json?types=address&access_token=pk.eyJ1IjoiYnJlYWtpbmcyNjIiLCJhIjoiY2puOWF4d2huMDRtMTNycDg5eTBkaWw2aSJ9.L5hwBhfK_8aFPp6nTCruwQ`;
    console.log(res);
    fetch(res).then(response => response.json()).then((data) => {
      console.log(data);
      user.longitude = data.features[0].center[0];
      user.latitude = data.features[0].center[1];
      instance.database().ref(`users/${user.first}_${user.last}`).set({
        user,
      });
      localNotification('Signed up successfully');
    });
  }).catch((error) => {
    localNotification(error.message);
  });
}

function compileAuthForm(type, typeCase, alt, altCase) {
  const showSelect = (type === 'signup');
  const compiledForm = compile(form)({
    type, typeCase, alt, altCase, showSelect,
  });
  document.querySelector('.form-space').innerHTML = compiledForm;
  document.querySelector('.auth-submit').addEventListener('click', () => {
    const user = {
      first: document.querySelector('.auth-first').value,
      last: document.querySelector('.auth-last').value,
      street: document.querySelector('.auth-street').value,
      number: document.querySelector('.auth-number').value,
      city: document.querySelector('.auth-city').value,
      postal: document.querySelector('.auth-postal').value,
      phone: document.querySelector('.auth-phone').value,
      school: document.querySelector('.auth-school').value,
      email: document.querySelector('.auth-email').value,
      password: document.querySelector('.auth-password').value,
      userType: document.querySelector('.signup-type').value,
    };
    if (type === 'signin') {
      SignIn(user);
    } else if (type === 'signup') {
      SignUp(user);
    }
  });
  document.querySelector(`.${alt}-switch`).addEventListener('click', () => {
    compileAuthForm(alt, altCase, type, typeCase);
  });
}

function buildMenu() {
  // Menu button
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
    } else {
      document.querySelector('.signout').addEventListener('click', () => {
        instance.auth().signOut();
        buildMenu();
      });
    }
  });
}

function firebaseRead() {
  const kotList = document.querySelector('.kotlist');
  if (kotList) {
    kotList.innerHTML = '';
    const leadsRef = instance.database().ref(('kots'));
    leadsRef.on('value', (snapshot) => {
      const compiledTemplate = handlebars.compile(kotListTemplate)(snapshot.val());
      kotList.innerHTML = compiledTemplate;
      addDetailClickEvents();
      setTimeout(() => {
        document.querySelector('.splash').style.display = 'none';
      }, 1000);
    });
  }
}

function getCoordinates(address) {

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

function addDetailClickEvents() {
  const detailButtons = document.querySelectorAll('.go-to-detail');
  detailButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      localStorage.setItem('clickedKotKey', event.target.id);
      window.location.href = '/#/detail';
    });
  });
}

export { buildMenu, currentUser, localNotification };
