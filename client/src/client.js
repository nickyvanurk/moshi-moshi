import Peer from 'simple-peer';

export default class Client {
  constructor(audioStreamTarget) {
    this.audioStreamTarget = audioStreamTarget;
    this.stream = null;
    this.peer = null;
    this.ws = null;
  }

  findMatch() {
    if (!this.stream) {
      return;
    }

    if (this.ws) {
      this.ws.close();
    }

    this.ws = new WebSocket('ws://localhost:8000');

    this.ws.onopen = this.handleOpen.bind(this);
    this.ws.onmessage = this.handleMessage.bind(this);
    this.ws.onclose = this.handleClose.bind(this);
  }

  disconnectMatch() {
    if (this.peer) {
      this.peer.destroy();
    }

    if (this.ws) {
      this.ws.close();
    }

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
        break;
      case 'offer':
        this.peer.signal(message);
        break;
      case 'answer':
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
      stream: this.stream,
      trickle: false
    });

    peer.on('signal', (data) => {
      this.ws.send(JSON.stringify(data));
    });

    peer.on('stream', (stream) => {
      this.audioStreamTarget.srcObject = stream;
      this.audioStreamTarget.play();
    });

    peer.on('connect', () => {
      this.ws.close();
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
}
