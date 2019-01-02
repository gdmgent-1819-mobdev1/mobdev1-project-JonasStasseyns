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

// window.location.href = '/#/favs';

let currentUser;

export default () => {
  // Return the compiled template to the router
  update(compile(homeTemplate)());

  // wait for compilation
  checkLoggedIn();
  buildMenu(true);
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
        });
      });
      if (signin && document.querySelector('.form-signin')) {
        document.querySelector('.form-signin').remove();
      }
    } else {
      currentUser = 'none';
      console.log('Not logged In');
    }
    firebaseRead('list');
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

function buildMenu(isHome) {
  checkLoggedIn();
  const menu = document.querySelector('.menu');
  document.querySelector('.menu-icon').addEventListener('click', () => {
    console.log(currentUser.email);
    const isOwner = (currentUser.userType === 'owner');
    const email = currentUser.email;
    const compiledMenu = compile(menuTemplate)({
      email,
      owner: isOwner,
      isHome,
    });
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
    } else if (document.querySelector('.signout')) {
      document.querySelector('.signout').addEventListener('click', () => {
        instance.auth().signOut();
        checkLoggedIn();
        menu.style.display = 'none';
        localNotification('Uitgelogd');
      });
    }
  });
}

function firebaseRead(type, filter, search) {
  if (document.querySelector('.fa-filter')) {
    document.querySelector('.fa-filter').style.display = 'none';
  }
  const kotList = document.querySelector('.kotlist');
  if (kotList) {
    kotList.innerHTML = '';
    const leadsRef = instance.database().ref('kots');
    let filterRef = leadsRef;
    if (filter) {
      if (filter.rentLo && filter.rentHi) {
        console.log('FILTER');
        filterRef = leadsRef.orderByChild('rent').startAt(filter.rentLo).endAt(filter.rentHi);
      }
    }
    filterRef.on('value', (snapshot) => {
      let compiledTemplate;
      if (type === 'list') {
        if (document.querySelector('.fa-filter')) {
          document.querySelector('.fa-filter').style.display = 'block';
        }
        if (filter) {
          const filterArray = [];
          snapshot.forEach((child) => {
            if (child.val().type === filter.type && child.val().surface >= filter.surface) {
              filterArray.push(child.val());
            }
          });
          compiledTemplate = handlebars.compile(kotListTemplate)(filterArray);
        } else if (search) {
          const searchArray = [];
          snapshot.forEach((child) => {
            if (child.val().title.toLowerCase().includes(search.toLowerCase()) || child.val().description.toLowerCase().includes(search.toLowerCase())) {
              searchArray.push(child.val());
            }
          });
          compiledTemplate = handlebars.compile(kotListTemplate)(searchArray);
        } else {
          compiledTemplate = handlebars.compile(kotListTemplate)(snapshot.val());
        }
      } else if (type === 'swiper') {
        compiledTemplate = handlebars.compile(kotSwiperTemplate)(snapshot.val());
      } else if (type === 'map') {
        compiledTemplate = handlebars.compile(kotMapTemplate)();
      }
      kotList.innerHTML = compiledTemplate;
      // Second if type===map because the partial must be rendered before initializing the map
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
      addFilterEvents();
      if (type === 'swiper') {
        console.log('YES TYPE IS SWIPER');
        const kotElements = document.querySelectorAll('.kot-swiper-container');
        console.log(kotElements);
        for (let i = 0; i < kotElements.length; i++) {
          kotElements[i].style.zIndex = (i + 1);
          let favSnap;
          let disFavSnap;
          const favRef = instance.database().ref(`favs/${currentUser.first}_${currentUser.last}`);
          const favRefQuery = favRef.orderByValue().equalTo(kotElements[i].id);
          favRefQuery.on('value', (favSnapshot) => {
            favSnap = favSnapshot.val() != null;
            console.log('LIKES');
            const disFavRef = instance.database().ref(`disfavs/${currentUser.first}_${currentUser.last}`);
            const disFavRefQuery = disFavRef.orderByValue().equalTo(kotElements[i].id);
            disFavRefQuery.on('value', (disFavSnapshot) => {
              disFavSnap = disFavSnapshot.val() != null;
              console.log('DISLIKES');
              if (favSnap || disFavSnap) {
                console.log('LIKED OR DISLIKED');
                kotElements[i].remove();
              } else {
                console.log('favSnap && disFavSnap == false');
              }
            });
          });
        }
        const likeButtons = document.querySelectorAll('.fa-thumbs-up');
        likeButtons.forEach((likeBtn) => {
          likeBtn.addEventListener('click', (e) => {
            instance.database().ref(`favs/${currentUser.first}_${currentUser.last}`).push(e.currentTarget.id);
            document.querySelector(`.kot-swiper-container#${e.target.id}`).remove();
          });
        });
        const dislikeButtons = document.querySelectorAll('.fa-thumbs-down');
        dislikeButtons.forEach((dislikeBtn) => {
          dislikeBtn.addEventListener('click', (e) => {
            instance.database().ref(`disfavs/${currentUser.first}_${currentUser.last}`).push(e.currentTarget.id);
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
      localStorage.setItem('manageKotKey', '');
      window.location.href = '/#/detail';
    });
  });
}

function addFilterEvents() {
  document.querySelector('.search-submit').addEventListener('click', () => {
    const searchTerm = document.querySelector('.search-input').value;
    firebaseRead('list', false, searchTerm);
    document.querySelector('.filter').style.display = 'none';
    document.querySelector('.fa-filter').style.display = 'block';
  });
  document.querySelector('.fa-filter').addEventListener('click', (e) => {
    document.querySelector('.filter').style.display = 'block';
    e.currentTarget.style.display = 'none';
  });
  document.querySelector('.filter-clear').addEventListener('click', () => {
    window.location.reload();
  });
  document.querySelector('.filter-button').addEventListener('click', () => {
    const filter = {
      type: document.querySelector('.filter-kot-type').value,
      rentLo: document.querySelector('.filter-rent-lo').value,
      rentHi: document.querySelector('.filter-rent-hi').value,
      surface: document.querySelector('.filter-surface').value,
    };
    firebaseRead('list', filter);
    document.querySelector('.filter').style.display = 'none';
    document.querySelector('.fa-filter').style.display = 'block';
  });
}

export { buildMenu, currentUser, localNotification };
