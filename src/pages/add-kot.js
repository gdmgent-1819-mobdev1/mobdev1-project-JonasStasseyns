/* eslint-disable no-use-before-define */
// Only import the compile function from handlebars instead of the entire library
import { compile } from 'handlebars';
import {buildMenu, currentUser, localNotification} from './home';
import update from '../helpers/update';
import { getInstance } from '../firebase/firebase';

// Import the template to use
const addKotTemplate = require('../templates/add-kot.handlebars');

const instance = getInstance();

export default () => {
  // Data to be passed to the template

  // Return the compiled template to the router
  update(compile(addKotTemplate)());

  // wait for compilation
  buildMenu();
  addEventListeners();
};

function addEventListeners() {
  const fileUpload = document.querySelector('.file-input');

  let fileName;
  let storageRef;
  if (instance) {
    fileUpload.addEventListener('change', (evt) => {
      if (fileUpload.value !== '') {
        fileName = evt.target.files[0].name.replace(/\s+/g, '-').toLowerCase();
        storageRef = instance.storage().ref(`kot-images/${fileName}`);

        storageRef.put(evt.target.files[0]);
      }
    });
  }
  document.querySelector('.add-kot-submit').addEventListener('click', (e) => {
    e.preventDefault();
    const title = document.querySelector('.add-kot-title').value;
    const rent = document.querySelector('.add-kot-rent').value;
    const type = document.querySelector('.add-kot-type').value;
    const surface = document.querySelector('.add-kot-surface').value;
    const floor = document.querySelector('.add-kot-floor').value;
    const residents = document.querySelector('.add-kot-residents').value;
    const toilet = document.querySelector('.add-kot-toilet').value;
    const shower = document.querySelector('.add-kot-shower').value;
    const bath = document.querySelector('.add-kot-bath').value;
    const kitchen = document.querySelector('.add-kot-kitchen').value;
    const furnished = document.querySelector('.add-kot-furnished').value;
    const kotcount = document.querySelector('.add-kot-kotcount').value;
    const description = document.querySelector('.add-kot-description').value;
    const address = document.querySelector('.add-kot-address').value;
    instance.database().ref('kots').push({
      title,
      rent,
      type,
      surface,
      floor,
      residents,
      toilet,
      shower,
      bath,
      kitchen,
      furnished,
      kotcount,
      description,
      address,
      owner: currentUser.email,
    });
    localNotification('Uw kot werd succesvol toegevoegd');
    document.querySelector('.add-kot-form').reset();
  });
}
