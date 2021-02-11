import { Server } from 'ws';
import Matcher from './matcher';
const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000;

if (process.env.PROD) {
  app
    .use(express.static(path.join(__dirname, '../../client/public')))
    .get('*', (_req, res) => res.sendFile(path.join(__dirname, '../../client/public/index.html')))
}

const server = app.listen(port, () => console.log(`Listening on ${port}`));

const wss = new Server({ server });
const matcher = new Matcher();

wss.on('connection', ws => {
  matcher.register(ws);
});
