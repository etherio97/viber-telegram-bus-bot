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
    res.send('invalid mode or token');
    res.end();
    return;
  }
  res.status(200).send(challenge);
  res.end();
});

app.post('/messenger/webhook', express.json(), async (req, res) => {
  const { object, entry } = req.body;
  if (object !== 'page') {
    return res.status(400).json({
      error: 'invalid webhook object',
    })
  }
  res.status(204).end();
  for (let payload of entry) {
    const { messaging } = payload;
    console.log(...messaging);
  }
});

module.exports = app;