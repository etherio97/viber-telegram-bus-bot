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
    return res.status(400);
  }
  if (!(mode === 'subscribe' && token === 'secret')) {
    return res.setatus(403);
  }
  res.status(200).send(challenge);
});

app.post('/messenger/webhook', express.json(), async (req, res) => {
   console.log(req.body);
  res.status(204);
  res.end();
});

module.exports = app;