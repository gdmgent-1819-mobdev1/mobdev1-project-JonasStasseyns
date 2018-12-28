/* eslint-disable no-use-before-define */
// Only import the compile function from handlebars instead of the entire library
import { compile } from 'handlebars';
import { currentUser, localNotification } from './home';
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
  const currentKey = localStorage.getItem('clickedKotKey');
  const reference = instance.database().ref(`kots/${currentKey}`);
  reference.on('value', (data) => {
    const compiledDetails = compile(detailPartial)(data.val());
    document.querySelector('.kotdetailcontainer').innerHTML = compiledDetails;
  });
}
