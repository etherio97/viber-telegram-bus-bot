const express = require('express');
const {
  toBurmeseNumber,
  calculateDistance,
  getRadius,
} = require('../src/utils');
const { LINE_TYPES, findLinesByStop, findNearestStops } = require('../src/bus');

const app = express();

app.get("/messenger/webhook", (req, res) => {
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];
  if (!(mode && token)) {
    res.status(400);
    res.send('required: mode, token');
    res.end();
    return;
  }
  if (!(mode === 'subscribe' && token === 'secret')) {
    res.status(403);
    res.send('invalid mode pr token');
    res.end();
    return;
  }
  res.status(200).send(challenge);
  res.end();
});

app.post('/messenger/webhook', express.json(), async (req, res) => {
  console.log(req.body);
  res.status(204);
  res.end();
});

module.exports = app;