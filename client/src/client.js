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

    this.findMatchButton = document.querySelector('#findMatch');
    this.hangUpButton = document.querySelector('#disconnectMatch');

    this.hideElement(this.hangUpButton);
  }

  findMatch() {
    if (this.state !== 'disconnected' || !this.stream) {
      return;
    }

    this.setState('matching');
    console.log(`State: ${this.state}`);

    this.ws = new WebSocket('ws://localhost:8000');

    this.ws.onopen = this.handleOpen.bind(this);
    this.ws.onmessage = this.handleMessage.bind(this);
    this.ws.onclose = this.handleClose.bind(this);
  }

  disconnectMatch() {
    this.setState('disconnected');
    console.log(`State: ${this.state}`);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }

    if (this.peer) {
      this.peer.destroy();
    }

    this.hideElement(this.hangUpButton);
    this.showElement(this.findMatchButton);

    this.peer = null;
    this.ws = null;
  }

  handleOpen() {
    console.log('WebSocket open');
  }

  handleMessage(data) {
    const message = JSON.parse(data.data);
    switch (message.type) {
      case 'matched':
        this.peer = this.getPeer(message.offer);
        this.hideElement(this.findMatchButton);
        this.showElement(this.hangUpButton);
        break;
      case 'peer-left':
        this.disconnectMatch();
        break;
      case 'offer':
      case 'answer':
        this.setState('calling');
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

    peer.on('close', () => {
      this.stopStreamedAudio();
      peer.destroy();
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

  hideElement(element) {
    element.style.display = 'none';
  }

  showElement(element) {
    element.style.display = 'block';
  }

  setState(state) {
    this.state = state;
    document.querySelector('#status').innerText = state;
  }
}
