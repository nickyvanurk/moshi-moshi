import Client from './client';
import { hideElement, showElement } from './util/dom';

const audio = document.getElementById('audio');
const client = new Client(audio);

navigator.mediaDevices.getUserMedia({ audio: true})
  .then(client.handleMediaStream.bind(client))
  .catch(client.handleMediaError.bind(client));

const findMatchButton = document.getElementById('findMatch');
const hangUpButton = document.getElementById('disconnectMatch');

findMatchButton.onclick = () => {
  client.findMatch();
};

hangUpButton.onclick = () => {
  client.disconnectMatch();
};

client.onMatch(() => {
  hideElement(findMatchButton);
  showElement(hangUpButton);
});

client.onDisconnect(() => {
  hideElement(hangUpButton);
  showElement(findMatchButton);
});
