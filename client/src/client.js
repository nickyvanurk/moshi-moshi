import Peer from 'simple-peer';
import AudioVisualizer from './audio-visualizer';

export default class Client {
  constructor(audioStreamTarget) {
    this.audioStreamTarget = audioStreamTarget;
    this.stream = null;
    this.peer = null;
    this.ws = null;
    this.state = 'disconnected';

    this.audioVisualizer = new AudioVisualizer({
      parentElem: document.getElementById('audio-visualizer'),
      frequencyBarMaxHeight: 150
    });
  }

  findMatch() {
    if (!this.stream) {
      return;
    }

    if (this.ws) {
      this.ws.close();
    }

    if (this.peer) {
      this.disconnectMatch();
    }

    this.state = 'matching';
    console.log(`State: ${this.state}`);

    this.ws = new WebSocket('wss://localhost:8080');

    this.ws.onopen = this.handleOpen.bind(this);
    this.ws.onmessage = this.handleMessage.bind(this);
    this.ws.onclose = this.handleClose.bind(this);
  }

  disconnectMatch() {
    this.state = 'disconnected';
    console.log(`State: ${this.state}`);

    if (this.peer) {
      this.peer.destroy();
    }

    this.peer = null;
  }

  handleOpen() {
    console.log('WebSocket open');
  }

  handleMessage(data) {
    const message = JSON.parse(data.data);
    switch (message.type) {
      case 'matched':
        this.peer = this.getPeer(message.offer);
        break;
      case 'no-peer':
        console.log('No peer found');
        this.findMatch();
        break;
      case 'offer':
      case 'answer':
        this.state = 'calling';
        console.log(`State: ${this.state}`);
      default:
        this.peer.signal(message);
        break;
    }
  }

  handleClose() {
    console.log('WebSocket closed');
  }

  handleMediaStream(stream) {
    this.stream = stream;
  }

  handleMediaError(error) {
    console.log(error);
  }

  getPeer(offer) {
    const peer = new Peer({
      initiator: offer,
      stream: this.stream
    });

    peer.on('signal', (data) => {
      if (this.ws) {
        this.ws.send(JSON.stringify(data));
      }
    });

    peer.on('stream', (stream) => {
      this.audioStreamTarget.srcObject = stream;
      this.audioStreamTarget.play();
      this.audioVisualizer.init(stream);
    });

    peer.on('connect', () => {
      this.ws.close();
      this.ws = null;
    });

    peer.on('close', () => {
      this.stopStreamedAudio();
      peer.destroy();

      if (this.state === 'calling') {
        this.findMatch();
      }
    });

    return peer;
  }

  stopStreamedAudio() {
    const stream = this.audioStreamTarget.srcObject;

    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      this.audioStreamTarget.srcObject = null;
    }
  }
}
