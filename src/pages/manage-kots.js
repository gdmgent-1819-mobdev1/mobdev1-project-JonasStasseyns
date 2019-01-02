/* eslint-disable no-use-before-define */
// Only import the compile function from handlebars instead of the entire library
import handlebars from 'handlebars';
import { compile } from 'handlebars';
import update from '../helpers/update';
import { buildMenu } from './home';
import { getInstance } from '../firebase/firebase';

// Import the template to use
const manageTemplate = require('../templates/managetemplate.handlebars');
const favPartial = require('../partials/favpartial.handlebars');

// Get FireBase instance
const firebase = getInstance();

export default () => {
  getFavs();
  // Return the compiled template to the router
  update(compile(manageTemplate)());
  buildMenu();
};

function getFavs() {
  console.log('getFavs');
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      let localUser;
      let myCode;
      const usersRef = firebase.database().ref('users');
      const userQuery = usersRef.orderByChild('email').equalTo(user.email);
      userQuery.on('value', (userSnapshot) => {
        console.log(userSnapshot.val());
        userSnapshot.forEach((userChild) => {
          localUser = userChild.val();
          myCode = `${localUser.first}_${localUser.last}`;
          const myKotsRef = firebase.database().ref('kots');
          const myKotsQuery = myKotsRef.orderByChild('owner').equalTo(localUser.email);
          myKotsQuery.on('value', (kotSnap) => {
            kotSnap.forEach((kot) => {
              const kotData = kot.val();
              document.querySelector('.kot-list').innerHTML += handlebars.compile(favPartial)({
                title: kotData.title,
                description: kotData.description,
                image: kotData.image,
                key: kot.key,
              });
            });
            setTimeout(() => {
              console.log('oi');
              const detailButtons = document.querySelectorAll('.go-to-detail');
              detailButtons.forEach((button) => {
                console.log(button);
                button.addEventListener('click', (event) => {
                  localStorage.setItem('clickedKotKey', '');
                  localStorage.setItem('manageKotKey', event.target.id);
                  window.location.href = '/#/addkot';
                });
              });
            }, 500);
          });
        });
      });
    } else {
      console.log('no login');
      window.location.href = '/#/';
    }
  });
}
