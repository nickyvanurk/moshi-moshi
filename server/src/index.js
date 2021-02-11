import { Server } from 'ws';
import Matcher from './matcher';

const wss = new Server({ port: process.env.PORT || 8080 });
const matcher = new Matcher();

wss.on('connection', ws => {
  matcher.register(ws);
});

if (process.env.PROD) {
  const express = require('express');
  const app = express();

  app.use(express.static(path.join(__dirname, '../../client/public')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../client/public/index.html'));
  })
}
