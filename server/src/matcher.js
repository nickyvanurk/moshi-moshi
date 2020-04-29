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

    console.log(`Registering ${id}`);

    this.sessions[id] = session;

    ws.on('close', () => this.unregister(id));
    ws.on('error', () => this.unregister(id));
    ws.on('message', (data) => this.handleMessage(id, data.toString()));
  }

  unregister(id) {
    console.log(`Unregistering ${id}`);

    this.unmatched = this.unmatched.filter(other => id !== other);
    delete this.sessions[id];
  }

  handleMessage(id, message) {

  }
}
