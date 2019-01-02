/* eslint-disable no-use-before-define */
// Only import the compile function from handlebars instead of the entire library
import {compile} from 'handlebars';
import update from '../helpers/update';
import {buildMenu} from './home';
import {getInstance} from '../firebase/firebase';

// Import the template to use
const messagesTemplate = require('../templates/messages.handlebars');
const messagePartial = require('../partials/messagepartial.handlebars');
const composePartial = require('../partials/composemessage.handlebars');

// Get FireBase instance
const firebase = getInstance();

let currentUser;
let contact;

export default () => {
  // Data to be passed to the template
  // Return the compiled template to the router
  update(compile(messagesTemplate)());
  getMessages();
  buildMenu();
};

function getMessages() {
  // Eventlistener for new message
  document.querySelector('.new-message').addEventListener('click', () => {
    document.querySelector('.message-list').innerHTML = '';
    document.querySelector('.message-list').innerHTML = compile(composePartial)({
      newmessage: true,
    });
    document.querySelector('.towhom').addEventListener('input', () => {
      const myCode = `${currentUser.first}_${currentUser.last}`;

      document.querySelector('.foundrecipcontainer').innerHTML = '';
      if (document.querySelector('.towhom').value !== '') {
        const recipQuery = firebase.database().ref('users').orderByChild('first');
        recipQuery.on('value', (snapshot) => {
          snapshot.forEach((result) => {
            const recip = result.val();
            const recipName = `${recip.first} ${recip.last}`;
            const recipCode = `${recip.first}_${recip.last}`
            // console.log(result.val());
            if (recipName.toLowerCase().includes(document.querySelector('.towhom').value.toLowerCase())) {
              document.querySelector('.foundrecipcontainer').innerHTML += '<p class="found-recip" id="' + recipCode + '">' + recipName + '</p>';
            }
          });
          const foundRecipElements = document.querySelectorAll('.found-recip');
          foundRecipElements.forEach((recipElement) => {
            recipElement.addEventListener('click', (e) => {
              document.querySelector('.selected-recip').innerHTML = e.target.innerText;
              document.querySelector('.foundrecipcontainer').innerHTML = '';
              document.querySelector('.send-message-new').addEventListener('click', () => {
                firebase.database().ref(`messages/${e.target.id}`).update({
                  [myCode]: document.querySelector('.compose-textarea').value,
                });
                firebase.database().ref(`messages/${myCode}`).update({
                  [e.target.id]: 'You: ' + document.querySelector('.compose-textarea').value,
                });
              });
            });
          });
        });
      }
    });
  });
  // Actual messages fetching
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      const users = firebase.database().ref('users');
      const query = users.orderByChild('email').equalTo(user.email).limitToFirst(1);
      query.on('value', (snap) => {
        snap.forEach((child) => {
          currentUser = child.val();
          if (currentUser.userType === 'student') {
            document.querySelector('.new-message').style.display = 'block';
          }
          const nameKey = `${currentUser.first}_${currentUser.last}`;
          console.log(nameKey);
          if (localStorage.getItem('contactWhom')) {
            const contactRef = firebase.database().ref('users').orderByChild('email').equalTo(localStorage.getItem('contactWhom'));
            contactRef.on('value', (conSnap) => {
              conSnap.forEach((con) => {
                contact = `${con.val().first}_${con.val().last}`;
                document.querySelector('.message-list').innerHTML = compile(composePartial)({
                  newmessage: true,
                  contact,
                });
                document.querySelector('.send-message-new').addEventListener('click', () => {
                  const me = `${currentUser.first}_${currentUser.last}`;
                  firebase.database().ref(`messages/${contact}`).update({
                    [me]: document.querySelector('.compose-textarea').value,
                  });
                  firebase.database().ref(`messages/${me}`).update({
                    [contact]: 'You: ' + document.querySelector('.compose-textarea').value,
                  });
                  localStorage.setItem('contactWhom', '');
                  window.location.href = '/#/detail';
                });
              });
            });
          } else {
            const qry = firebase.database().ref(`messages/${nameKey}`).orderByKey();
            qry.on('value', (snapshot) => {
              document.querySelector('.message-list').innerHTML = '';
              snapshot.forEach((message) => {
                console.log(`Raw: ${message.val()}`);
                const compiledMessages = compile(messagePartial)({
                  fromto: message.key,
                  message: message.val(),
                });
                document.querySelector('.message-list').innerHTML += compiledMessages;
                const messageElements = document.querySelectorAll('.message');
                messageElements.forEach((messageElement) => {
                  messageElement.addEventListener('click', (e) => {
                    const fromName = e.currentTarget.id;
                    console.log('messageClick');
                    if (document.querySelector('.message-list')) {
                      document.querySelector('.message-list').innerHTML = '';
                      const composeQuery = firebase.database().ref(`messages/${nameKey}/${fromName}`);
                      composeQuery.on('value', (snapshot) => {
                        console.log(`data: ${fromName}`);
                        let cleanStr = snapshot.val();
                        if (cleanStr.includes('You: ')) {
                          cleanStr = cleanStr.split('You: ').pop();
                          document.querySelector('.message-list').innerHTML = compile(composePartial)({
                            from: snapshot.key,
                            mess: cleanStr,
                            fromyou: true,
                            newmessage: false,
                          });
                        } else {
                          document.querySelector('.message-list').innerHTML = compile(composePartial)({
                            from: snapshot.key,
                            mess: snapshot.val(),
                            fromyou: false,
                            newmessage: false,
                          });
                        }
                        document.querySelector('.send-message').addEventListener('click', () => {
                          const to = snapshot.key;
                          const sendContent = document.querySelector('.compose-textarea').value;
                          firebase.database().ref(`messages/${to}`).update({
                            [nameKey]: sendContent,
                          });
                          firebase.database().ref(`messages/${nameKey}`).update({
                            [to]: `You: ${sendContent}`,
                          });
                        });
                      });
                    }
                  });
                });
              });
            });
          }
        });
      });
    } else {
      window.location.href = '/';
    }
  });
}
