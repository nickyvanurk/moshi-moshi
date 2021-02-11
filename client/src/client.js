import Peer from 'simple-peer';
import AudioVisualizer from './audio-visualizer';

const state = {
  disconnected: 'disconnected',
  matching: 'connecting',
  calling: 'calling'
};

export default class Client {
  constructor(audioStreamTarget) {
    this.audioStreamTarget = audioStreamTarget;
    this.stream = null;
    this.peer = null;
    this.ws = null;
    this.state = state.disconnected;

    this.audioVisualizer = new AudioVisualizer({
      parentElem: document.getElementById('audio-visualizer'),
      frequencyBarMaxHeight: 150
    });

    this.findMatchButton = document.querySelector('#findMatch');
    this.hangUpButton = document.querySelector('#disconnectMatch');
  }

  findMatch() {
    if (this.state !== state.disconnected || !this.stream) {
      return;
    }

    this.setState(state.matching);

    const host = location.origin.replace(/^http/, 'ws');
    this.ws = new WebSocket(host);
    this.ws.onmessage = this.handleMessage.bind(this);
  }

  disconnectMatch() {
    this.setState(state.disconnected);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }

    if (this.peer) {
      this.peer.destroy();
    }

    this.peer = null;
    this.ws = null;

    if (this.handleDisconnect) {
      this.handleDisconnect();
    }
  }

  handleMessage(data) {
    const message = JSON.parse(data.data);
    switch (message.type) {
      case 'matched':
        this.peer = this.getPeer(message.offer);

        if (this.handleMatch) {
          this.handleMatch();
        }
        break;
      case 'peer-left':
        this.disconnectMatch();
        break;
      case 'offer':
      case 'answer':
        this.setState(state.calling);
      default:
        this.peer.signal(message);
        break;
    }
  }

  handleMediaStream(stream) {
    this.stream = stream;
  }

  handleMediaError(error) {
    document.querySelector('#status').innerText = error;
  }

  onMatch(callback) {
    this.handleMatch = callback;
  }

  onDisconnect(callback) {
    this.handleDisconnect = callback;
  }

  getPeer(offer) {
    const peer = new Peer({initiator: offer, stream: this.stream});

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

  setState(state) {
    this.state = state;
    document.querySelector('#status').innerText = state;
  }
}
