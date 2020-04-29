import * as WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';

export default class Matcher {
  constructor() {
    this.sessions = {};
    this.unmatched = [];
  }

  register(ws) {
    const id = uuidv4();
    const session = { id, ws };

    this.sessions[id] = session;
    this.tryMatch(session);

    ws.on('close', () => this.unregister(id));
    ws.on('error', () => this.unregister(id));
    ws.on('message', (data) => this.handleMessage(id, data.toString()));
  }

  tryMatch(session) {
    if (this.unmatched.length > 0) {
      const other = this.sessions[this.unmatched.shift()];

      if (other) {
        session.peer = other.id;
        other.peer = session.id;

        this.send(session, {type: 'matched', match: other.id, offer: true});
        this.send(other, {type: 'matched', match: session.id, offer: false});

        console.log(`Matching ${session.id} with ${other.id}`);
      }
    } else {
      this.unmatched.push(session.id);
    }
  }

  handleMessage(id, data) {
    const session = this.sessions[id];

    if (!session) {
      return console.error(`Can't find session for ${id}`);
    }

    const peer = this.sessions[session.peer];

    if (!peer) {
      return console.error(`Can't find session for peer of ${id}`);
    }

    const message = JSON.parse(data);

    this.send(peer, message);
  }

  unregister(id) {
    this.unmatched = this.unmatched.filter(other => id !== other);
    delete this.sessions[id];
  }

  send(session, payload) {
    try {
      if (session.ws.readyState === WebSocket.OPEN) {
        session.ws.send(JSON.stringify(payload));
      }
    } catch (error) {
      console.error(`Error sending to ${session.id}`);
    }
  }
}
