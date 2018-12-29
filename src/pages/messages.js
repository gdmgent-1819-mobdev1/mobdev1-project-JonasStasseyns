/* eslint-disable no-use-before-define */
// Only import the compile function from handlebars instead of the entire library
import { compile } from 'handlebars';
import update from '../helpers/update';
// import { buildMenu } from './home';
import { getInstance } from '../firebase/firebase';

// Import the template to use
const messagesTemplate = require('../templates/messages.handlebars');
const messagePartial = require('../partials/messagepartial.handlebars');
const composePartial = require('../partials/composemessage.handlebars');

// Get FireBase instance
const firebase = getInstance();

let currentUser;

export default () => {
  // Data to be passed to the template
  // Return the compiled template to the router
  update(compile(messagesTemplate)());
  getMessages();
};

function getMessages() {
  // Eventlistener for new message
  document.querySelector('.new-message').addEventListener('click', () => {
    document.querySelector('.message-list').innerHTML = '';
    document.querySelector('.message-list').innerHTML = compile(composePartial)({
      newmessage: true,
    });
    document.querySelector('.towhom').addEventListener('input', () => {
      document.querySelector('.foundrecipcontainer').innerHTML = '';
      if (document.querySelector('.towhom').value !== '') {
        const recipQuery = firebase.database().ref('users').orderByChild('first');
        recipQuery.on('value', (snapshot) => {
          snapshot.forEach((result) => {
            const recip = result.val();
            const recipName = `${recip.first} ${recip.last}`;
            // console.log(result.val());
            if (recipName.toLowerCase().includes(document.querySelector('.towhom').value.toLowerCase())) {
              document.querySelector('.foundrecipcontainer').innerHTML += '<p class="found-recip" id="' + result.key + '">' + recipName + '</p>';
            }
          });
          const foundRecipElements = document.querySelectorAll('.found-recip');
          foundRecipElements.forEach((recipElement) => {
            recipElement.addEventListener('click', (e) => {
              // TODO Display selected recipient
              // TODO Make sure this is where the message is sent
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
          const nameKey = `${currentUser.first}_${currentUser.last}`;
          console.log(nameKey);
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
                      document.querySelector('.send-message').addEventListener('click', (e) => {
                        const to = snapshot.key;
                        const sendContent = document.querySelector('.compose-textarea').value;
                        console.log(to);
                        console.log(sendContent);
                        firebase.database().ref(`messages/${to}`).set({
                          [nameKey]: sendContent,
                        });
                        firebase.database().ref(`messages/${nameKey}`).set({
                          [to]: `You: ${sendContent}`,
                        });
                      });
                    });
                  }
                });
              });
            });
          });
        });
      });
    } else {
      window.location.href = '/';
    }
  });
}
