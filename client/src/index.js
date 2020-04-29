import Client from './client';

const audio = document.getElementById('audio');
const client = new Client(audio);

navigator.mediaDevices.getUserMedia({ audio: true})
  .then(client.handleMediaStream.bind(client))
  .catch(client.handleMediaError.bind(client));

document.getElementById('findMatch').onclick = client.findMatch.bind(client);
document.getElementById('disconnectMatch').onclick = client.disconnectMatch.bind(client);
