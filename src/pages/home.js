/* eslint-disable no-use-before-define */
// Only import the compile function from handlebars instead of the entire library
import { compile } from 'handlebars';
import handlebars from 'handlebars';
import mapboxgl from 'mapbox-gl';
import update from '../helpers/update';
import { getInstance } from '../firebase/firebase';
import config from '../config';

// Import the template to use
const homeTemplate = require('../templates/home.handlebars');
const form = require('../partials/form.handlebars');
const kotListTemplate = require('../partials/kotlistteplate.handlebars');
const kotSwiperTemplate = require('../partials/kotswipertemplate.handlebars');
const kotMapTemplate = require('../partials/kotmaptemplate.handlebars');
const menuTemplate = require('../partials/menu.handlebars');

const instance = getInstance();

// window.location.href = '/#/messages';

let currentUser;

export default () => {
  // Return the compiled template to the router
  update(compile(homeTemplate)());

  // wait for compilation
  checkLoggedIn();
  buildMenu();
};

function checkLoggedIn(signin) {
  instance.auth().onAuthStateChanged((user) => {
    console.log('oi?');
    if (user) {
      if (document.querySelector('.view-icon-container')) {
        document.querySelector('.view-icon-container').style.display = 'block';
        const vics = document.querySelectorAll('.view-icon');
        document.querySelector('.fa-list-ul').addEventListener('click', (e) => {
          firebaseRead('list');
          vics.forEach((vic) => {
            vic.classList.remove('active');
          });
          e.target.classList.add('active');
        });
        document.querySelector('.fa-map-marker-alt').addEventListener('click', (e) => {
          firebaseRead('map');
          vics.forEach((vic) => {
            vic.classList.remove('active');
          });
          e.target.classList.add('active');
        });
        document.querySelector('.fa-arrows-alt-h').addEventListener('click', (e) => {
          firebaseRead('swiper');
          vics.forEach((vic) => {
            vic.classList.remove('active');
          });
          e.target.classList.add('active');
        });
      }
      const users = instance.database().ref('users');
      const query = users.orderByChild('email').equalTo(user.email).limitToFirst(1);
      query.on('value', (snap) => {
        snap.forEach((child) => {
          currentUser = child.val();
          console.log(currentUser);
          localNotification(currentUser.email);
          firebaseRead('list');
        });
      });
      if (signin && document.querySelector('.form-signin')) {
        document.querySelector('.form-signin').remove();
      }
    } else {
      currentUser = 'none';
      console.log('Not logged In');
    }
    buildMenu();
  });
}

function SignIn(user) {
  instance.auth().signInWithEmailAndPassword(user.email, user.password).then(() => {
    localNotification('Successvol ingelogd');
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
      instance.database().ref('users').push({
        first: user.first,
        last: user.last,
        email: user.email,
        password: user.password,
        street: user.street,
        number: user.number,
        city: user.city,
        postal: user.postal,
        school: user.school,
        userType: user.userType,
      });
      localNotification('Succesvol geregistreerd');
      document.querySelector('.form-signup').remove();
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
    if (type === 'signin') {
      const user = {
        email: document.querySelector('.auth-email').value,
        password: document.querySelector('.auth-password').value,
      };
      SignIn(user);
    } else if (type === 'signup') {
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
      SignUp(user);
    }
  });
  document.querySelector(`.${alt}-switch`).addEventListener('click', () => {
    compileAuthForm(alt, altCase, type, typeCase);
  });
}

function buildMenu() {
  const menu = document.querySelector('.menu');
  document.querySelector('.menu-icon').addEventListener('click', () => {
    // localNotification('eeeeeeeeeeeee: ');
    checkLoggedIn();
    console.log(currentUser.email);
    const isOwner = (currentUser.userType === 'owner');
    const email = currentUser.email;

    const compiledMenu = compile(menuTemplate)({
      email,
      owner: isOwner,
    });
    // const compiledMenu = compile(menuTemplate)({
    //   email: 'stasseynsjonas@gmail.com',
    //   owner: (currentUser.userType === 'owner'),
    // });
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
        checkLoggedIn();
        menu.style.display = 'none';
        localNotification('Uitgelogd');
      });
    }
  });
}

function firebaseRead(type) {
  const kotList = document.querySelector('.kotlist');
  if (kotList) {
    kotList.innerHTML = '';
    const leadsRef = instance.database().ref('kots');
    leadsRef.on('value', (snapshot) => {
      let compiledTemplate;
      if (type === 'list') {
        compiledTemplate = handlebars.compile(kotListTemplate)(snapshot.val());
      } else if (type === 'swiper') {
        compiledTemplate = handlebars.compile(kotSwiperTemplate)(snapshot.val());
      } else if (type === 'map') {
        compiledTemplate = handlebars.compile(kotMapTemplate)();
      }
      kotList.innerHTML = compiledTemplate;
      // Second if type===map because the partial must be rendered before initializing map
      if (type === 'map') {
        if (config.mapBoxToken) {
          mapboxgl.accessToken = config.mapBoxToken;
          // eslint-disable-next-line no-unused-vars
          const map = new mapboxgl.Map({
            container: 'map',
            center: [3.721866, 51.054118],
            style: 'mapbox://styles/mapbox/streets-v9',
            zoom: 11,
          });
          // SAMPLECODE
          const geojson = snapshot;
          geojson.forEach((marker) => {
            const markerValue = marker.val();
            const coords = {
              lng: markerValue.lon,
              lat: markerValue.lat,
            };
            const el = document.createElement('div');
            el.className = 'marker';
            new mapboxgl.Marker(el).setLngLat(coords).addTo(map)
              .setPopup(new mapboxgl.Popup({ anchor: 'bottom', className: 'popup' })
                .setHTML(`<h3 class="popup-h3">${markerValue.title}</h3><p class="popup-p">${markerValue.description}</p><button class="go-to-detail" id="${marker.key}">Meer info</button>`))
              .addTo(map);
          });
          const markers = document.querySelectorAll('.marker');
          console.log(markers);
          markers.forEach((marker) => {
            console.log(marker);
            marker.addEventListener('click', () => {
              setTimeout(addDetailClickEvents, 200);
            });
          });
        } else {
          console.error('Mapbox will crash the page if no access token is given.');
        }
      }
      addDetailClickEvents();
      if (type === 'swiper') {
        const kotElements = document.querySelectorAll('.kot-swiper-container');
        for (let i = 0; i < kotElements.length; i++) {
          kotElements[i].style.zIndex = (i + 1);
          let favSnap;
          let disFavSnap;
          const favRef = instance.database().ref(`favs/${currentUser.first}_${currentUser.last}`);
          const favRefQuery = favRef.orderByValue().equalTo(kotElements[i].id);
          favRefQuery.on('value', (snapshot) => {
            favSnap = snapshot.val();
          });
          const disFavRef = instance.database().ref(`disfavs/${currentUser.first}_${currentUser.last}`);
          const disFavRefQuery = disFavRef.orderByValue().equalTo(kotElements[i].id);
          favRefQuery.on('value', (snapshot) => {
            disFavSnap = snapshot.val();
          });
          if (!favSnap && !disFavSnap) {
            console.log('Not liked OR disliked');
            kotElements[i].remove();
          }
        }
        if (document.querySelectorAll('.kot-swiper-container').length < 1) {
          // kotList.innerHTML = ''
        }
        const likeButtons = document.querySelectorAll('.fa-thumbs-up');
        likeButtons.forEach((likeBtn) => {
          console.log('poef');
          likeBtn.addEventListener('click', (e) => {
            instance.database().ref(`favs/${currentUser.first}_${currentUser.last}`).push(e.currentTarget.id);
            document.querySelector(`.kot-swiper-container#${e.target.id}`).remove();
          });
        });
      }
      setTimeout(() => {
        document.querySelector('.splash').style.display = 'none';
      }, 1000);
    });
  }
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
  console.log('addde');
  const detailButtons = document.querySelectorAll('.go-to-detail');
  detailButtons.forEach((button) => {
    console.log(button);
    button.addEventListener('click', (event) => {
      localStorage.setItem('clickedKotKey', event.target.id);
      window.location.href = '/#/detail';
    });
  });
}

export { buildMenu, currentUser, localNotification };
