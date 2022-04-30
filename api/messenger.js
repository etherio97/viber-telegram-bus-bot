const express = require('express');
const {
  toBurmeseNumber,
  calculateDistance,
  getRadius,
} = require('../src/utils');
const { LINE_TYPES, findLinesByStop, findNearestStops } = require('../src/bus');
const { sendTextMessage, sendQuickReply, QuickReply } = require('../src/messenger');

const handleOnPostback = async (sender, { payload }) => {
  switch(payload) {
    case 'START':
      await sendTextMessage(sender.id, 'ရန်ကုန်မြို့ရှိ ဘက်စ်ကားမှတ်တိုင်များကို ရှာဖွေပါ...');
      break;
    default:
      console.log({ postback: { payload }});
  }
  //--- end ---
};

const handleOnMessage = async (sender, { text }) => {
  
  //--- end ---
};

const app = express();

app.post('/messenger/webhook', express.json(), async (req, res) => {
  const { object, entry } = req.body;
  if (object !== 'page') {
    return res.status(400).json({
      error: 'invalid webhook object',
    })
  }
  res.status(204).end();

  for (let payload of entry) {
    const data = payload.messaging[0];
    if ('postback' in data) {
      await handleOnPostback(data.sender, data.postback);
    } else {
      await handleOnMessage(data.sender, data.message);
    }
  }
});

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

module.exports = app;