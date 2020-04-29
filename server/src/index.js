import { Server } from 'ws';
import Matcher from './matcher';

const wss = new Server({ port: 8000 });
const matcher = new Matcher();

wss.on('connection', ws => {
  matcher.register(ws);
});
