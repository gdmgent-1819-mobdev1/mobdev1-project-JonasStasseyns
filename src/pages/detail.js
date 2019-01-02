/* eslint-disable no-use-before-define */
// Only import the compile function from handlebars instead of the entire library
import { compile } from 'handlebars';
import { buildMenu } from './home';
import update from '../helpers/update';
import { getInstance } from '../firebase/firebase';

// Import the template to use
const detailTemplate = require('../templates/detail.handlebars');
const detailPartial = require('../partials/kotdetail.handlebars');

const instance = getInstance();

export default () => {
  // Return the compiled template to the router
  update(compile(detailTemplate)());
  readKot();
};

function readKot() {
  instance.auth().onAuthStateChanged((user) => {
    const email = (user) ? user.email : false;
    const currentKey = localStorage.getItem('clickedKotKey');
    const reference = instance.database().ref(`kots/${currentKey}`);
    reference.on('value', (data) => {
      const compiledDetails = compile(detailPartial)({
        data: data.val(),
        email,
      });
      document.querySelector('.kotdetailcontainer').innerHTML = compiledDetails;
      buildMenu();
      document.querySelector('.contact').addEventListener('click', (e) => {
        localStorage.setItem('contactWhom', e.target.id);
        window.location.href = '/#/messages';
      });
      const url = 'http://stasseynsjonas.be/kotfindr';
      document.querySelector('.share').addEventListener('click', () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`,
          'facebook-share-dialog',
          'width=800,height=600');
      });
    });
  });
}
