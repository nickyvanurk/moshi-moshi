import { Server } from 'ws';
import Matcher from './matcher';
const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000;

const wss = new Server({ server: app });
const matcher = new Matcher();

wss.on('connection', ws => {
  matcher.register(ws);
});

if (process.env.PROD) {
  app
    .use(express.static(path.join(__dirname, '../../client/public')))
    .get('*', (_req, res) => res.sendFile(path.join(__dirname, '../../client/public/index.html')))
    .listen(port, () => console.log(`Listening on ${port}`));
}
