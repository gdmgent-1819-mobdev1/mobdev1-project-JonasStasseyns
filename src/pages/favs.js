/* eslint-disable no-use-before-define */
// Only import the compile function from handlebars instead of the entire library
import handlebars from 'handlebars';
import { compile } from 'handlebars';
import update from '../helpers/update';
import { buildMenu } from './home';
import { getInstance } from '../firebase/firebase';

// Import the template to use
const favTemplate = require('../templates/favtemplate.handlebars');
const favPartial = require('../partials/favpartial.handlebars');

// Get FireBase instance
const firebase = getInstance();

export default () => {
  getFavs();
  // Data to be passed to the template
  // Return the compiled template to the router
  update(compile(favTemplate)());
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
          const favRef = firebase.database().ref(`favs/${myCode}`);
          favRef.on('value', (favSnapShot) => {
            console.log('TWICE YA');
            favSnapShot.forEach((favChild) => {
              const favKey = favChild.val();
              firebase.database().ref(`kots/${favKey}`).on('value', (matchShot) => {
                const data = matchShot.val();
                document.querySelector('.kot-list').innerHTML += handlebars.compile(favPartial)({
                  title: data.title,
                  description: data.description,
                  image: data.image,
                  key: matchShot.key,
                });
              });
            });
          });
        });
        setTimeout(() => {
          console.log('oi');
          const detailButtons = document.querySelectorAll('.go-to-detail');
          detailButtons.forEach((button) => {
            console.log(button);
            button.addEventListener('click', (event) => {
              localStorage.setItem('clickedKotKey', event.target.id);
              window.location.href = '/#/detail';
            });
          });
        }, 500);
      });
    } else {
      window.location.href = '/#/';
    }
  });
}
