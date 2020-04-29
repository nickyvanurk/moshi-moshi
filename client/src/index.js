import Peer from 'simple-peer';
import Client from './client';

const audio = document.getElementById('audio');
const client = new Client(audio);

navigator.mediaDevices.getUserMedia({ audio: true})
  .then(client.handleMediaStream.bind(client))
  .catch(client.handleMediaError.bind(client));

document.getElementById('findMatch').onclick = client.findMatch.bind(client);
document.getElementById('disconnectMatch').onclick = client.disconnectMatch.bind(client);

// client.disconnectMatch();





// function gotMedia(stream) {
//   const ws = new WebSocket('ws://localhost:8000');
//   let peer = null;

//   function initPeer(isOffer) {
//     const peer = new Peer({initiator: isOffer, stream: stream, trickle: false});

//     peer.on('signal', (data) => {
//       console.log(`Sending ${data}`);
//       ws.send(JSON.stringify(data));
//     });

//     peer.on('stream', function(stream) {
//       audio.srcObject = stream;
//       audio.play();
//     });

//     peer.on('connect', () => {
//       console.log('WebSocket closed');
//       ws.close();
//     });

//     peer.on('close', function() {
//       audio.stop();
//       peer.destroy();
//     });

//     return peer;
//   }

//   ws.onopen = () => {
//     console.log('WebSocket open');
//   };

//   ws.onmessage = (message) => {
//     const data = JSON.parse(message.data);
//     const type = data.type;

//     switch (type) {
//       case 'matched':
//         console.log(data);
//         peer = initPeer(data.offer);
//         break;
//       case 'offer':
//         console.log('Received offer');
//         peer.signal(data);
//         break;
//       case 'answer':
//         console.log('Received answer');
//         peer.signal(data);
//         break;
//     }
//   };
// }
