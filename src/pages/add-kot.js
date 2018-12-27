/* eslint-disable no-use-before-define */
// Only import the compile function from handlebars instead of the entire library
import { compile } from 'handlebars';
import { buildMenu, currentUser } from './home';
import update from '../helpers/update';
import { getInstance } from '../firebase/firebase';

// Import the template to use
const addKotTemplate = require('../templates/add-kot.handlebars');

export default () => {
  // Data to be passed to the template

  // Return the compiled template to the router
  update(compile(addKotTemplate)());

  // wait for compilation
  buildMenu();
};



// const instance = getInstance();
//
// const fileUpload = document.querySelector('.file-input');
//
// let fileName;
// let storageRef;
// if (instance) {
//   fileUpload.addEventListener('change', (evt) => {
//     if (fileUpload.value !== '') {
//       fileName = evt.target.files[0].name.replace(/\s+/g, '-').toLowerCase();
//       storageRef = instance.storage().ref(`kot-images/${fileName}`);
//
//       storageRef.put(evt.target.files[0]);
//     }
//   });
// }
// document.querySelector('.add-kot-submit').addEventListener('click', () => {
//   const kotTitle = document.querySelector('.add-kot-title').value;
//   const kotDescription = document.querySelector('.add-kot-description').value;
//   const kotAddress = document.querySelector('.add-kot-address').value;
//   instance.database().ref('kots').push({
//     title: kotTitle,
//     description: kotDescription,
//     address: kotAddress,
//     image: fileName,
//     owner: currentUser.email,
//   });
// });
