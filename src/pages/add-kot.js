/* eslint-disable no-use-before-define */
// Only import the compile function from handlebars instead of the entire library
import { compile } from 'handlebars';
import { buildMenu, currentUser, localNotification } from './home';
import update from '../helpers/update';
import { getInstance } from '../firebase/firebase';

// Import the template to use
const addKotTemplate = require('../templates/add-kot.handlebars');

const instance = getInstance();

let manageKotData;

export default () => {
  // Data to be passed to the template

  // Return the compiled template to the router
  if (localStorage.getItem('manageKotKey')) {
    const ref = instance.database().ref(`kots/${localStorage.getItem('manageKotKey')}`);
    ref.on('value', (snapshot) => {
      update(compile(addKotTemplate)({ snapshot: snapshot.val() }));
      manageKotData = snapshot.val();
    });
  } else {
    update(compile(addKotTemplate)());
  }

  // wait for compilation
  addEventListeners();
};

function addEventListeners() {
  setTimeout(() => {
    const fileUpload = document.querySelector('.file-input');

    let fileName;
    let storageRef;
    if (instance) {
      buildMenu();
      if (localStorage.getItem('manageKotKey')) {
        document.querySelector('.add-kot-submit').style.display = 'block';
        document.querySelector('.remove-button').addEventListener('click', () => {
          const delRef = instance.database().ref(`kots/${localStorage.getItem('manageKotKey')}`);
          delRef.remove();
          window.location.href = '/#/manage';
        });
      }
      fileUpload.addEventListener('change', (evt) => {
        if (fileUpload.value !== '') {
          fileName = evt.target.files[0].name.replace(/\s+/g, '-').toLowerCase();
          storageRef = instance.storage().ref(`kot-images/${fileName}`);

          console.log('File Upload Started');

          const task = storageRef.put(evt.target.files[0]);
          task.on('state_changed',
            (snapshot) => {

            },
            (err) => {

            },
            () => {
              console.log('File Uploaded');
              document.querySelector('.add-kot-submit').style.display = 'block';
            });
        }
      });
    }
    document.querySelector('.add-kot-submit').addEventListener('click', (e) => {
      e.preventDefault();
      let image;
      if (!fileName && localStorage.getItem('manageKotKey')) {
        console.log('no file selected');
        image = manageKotData.image;
      } else {
        image = fileName;
      }
      const title = document.querySelector('.add-kot-title').value;
      const rent = document.querySelector('.add-kot-rent').value;
      const prepay = document.querySelector('.add-kot-prepay').value;
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
      const street = document.querySelector('.add-kot-street').value;
      const number = document.querySelector('.add-kot-number').value;
      const address = `${number} ${street} Ghent 9000`;
      const pattern = / /gi;
      const safeAddress = address.replace(pattern, '%20');
      const res = `https://api.mapbox.com/geocoding/v5/mapbox.places/${safeAddress}.json?types=address&access_token=pk.eyJ1IjoiYnJlYWtpbmcyNjIiLCJhIjoiY2puOWF4d2huMDRtMTNycDg5eTBkaWw2aSJ9.L5hwBhfK_8aFPp6nTCruwQ`;
      console.log(res);
      fetch(res).then(response => response.json()).then((data) => {
        if (localStorage.getItem('manageKotKey')) {
          instance.database().ref(`kots/${localStorage.getItem('manageKotKey')}`).update({
            image,
            title,
            rent,
            prepay,
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
            lon: data.features[0].center[0],
            lat: data.features[0].center[1],
            owner: currentUser.email,
          });
        } else {
          instance.database().ref('kots').push({
            image,
            title,
            rent,
            prepay,
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
            lon: data.features[0].center[0],
            lat: data.features[0].center[1],
            owner: currentUser.email,
          });
        }
      });
      if (localStorage.getItem('manageKotKey')) {
        localNotification('Uw kot werd succesvol aangepast');
      } else {
        localNotification('Uw kot werd succesvol toegevoegd');
      }
      document.querySelector('.add-kot-form').reset();
    });
  }, 2000);
}
