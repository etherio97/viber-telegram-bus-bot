const express = require('express');
const {
  toBurmeseNumber,
  calculateDistance,
  getRadius,
} = require('../src/utils');
const { LINE_TYPES, findLinesByStop, findNearestStops } = require('../src/bus');
const {
  STICKERS_ID,
  deleteMessage,
  reportToAdmin,
  sendLocation,
  sendMessage,
  sendSticker,
} = require('../src/telegram');

const handleOnMessage = async (message) => {
  let user = message.chat || message.from;

  if (message.text === '/start') {
    await sendSticker(user.id, STICKERS_ID.DUCK_WAVING);

    await sendMessage(user.id, {
      text:
        'ရန်ကုန်မြို့ရှိ ဘက်စ်ကားမှတ်တိုင်များကို စတင်ရှာဖွေရန် တည်နေရာပို့ပေးပါ...',
      reply_markup: {
        keyboard: [[{ text: 'Send your location', request_location: true }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
  } else if (message.location) {
    let coords = message.location;
    let params = getRadius(1200, coords);
    let results = await findNearestStops(params);

    results = results
      .map((result) => ({
        ...result,
        distance: calculateDistance(result, coords),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);

    console.log(
      'lat:%s, lng:%s (%d) stops',
      coords.latitude,
      coords.latitude,
      results.length
    );

    if (results.length) {
      let _kbd = [];
      let inline_keyboard = [];
      let text = `မှတ်တိုင် ${toBurmeseNumber(
        results.length
      )} ခု ရှာတွေ့ပါတယ်။\n\n`;

      text += results
        .map(({ name, distance }, i) => {
          let unit = 'မီတာ';
          if (distance > 999) {
            distance = distance / 1000;
            unit = 'ကီလိုမီတာ';
          }
          return `${toBurmeseNumber(
            1 + i
          )}။ *${name}*   _${unit} ${toBurmeseNumber(
            distance.toFixed(0)
          )} အကွာ_`;
        })
        .join('\n');

      results.forEach(({ name, id }) => {
        _kbd.push({ text: name, callback_data: `STOP:${id}` });
        if (_kbd.length >= 2) {
          inline_keyboard.push(_kbd);
          _kbd = [];
        }
      });

      if (_kbd.length) {
        inline_keyboard.push(_kbd);
      }

      await sendMessage(user.id, {
        text,
        parse_mode: 'markdown',
        reply_markup: {
          inline_keyboard,
        },
      });
    } else {
      let text = 'အနီးအနားတဝိုက်တွင် မှတ်တိုင်များရှာမတွေ့ပါ။';

      await sendSticker(user.id, STICKERS_ID.DUCK_CRYING);

      await sendMessage(user.id, {
        text,
        parse_mode: 'markdown',
        reply_markup: {
          keyboard: [[{ text: 'Send Location', request_location: true }]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      });
    }
  } else {
    await sendSticker(user.id, STICKERS_ID.DUCK_EXPLODE);
    await sendMessage(user.id, { text: 'နားမလည်ဘူးဗျ...' });
  }
};

const handleOnCallback = async ({ from, data }) => {
  let [mode, id] = data.split(':');

  console.log('handle:callback#', data);

  let {
    result: { message_id },
  } = await sendSticker(from.id, STICKERS_ID.DUCK_LOADING);

  switch (mode) {
    case 'STOP':
      let groups = {};
      let results = await findLinesByStop(id);

      if (!results || !results.length) {
        await deleteMessage(from.id, message_id);

        await sendSticker(from.id, STICKERS_ID.DUCK_CRYING);

        return sendMessage(from.id, { text: 'တစ်ခုခုမှားယွင်းနေပါတယ်...' });
      }

      results.forEach(({ line_id, line_type, stop_name, stop_id }) => {
        if (!(line_type in groups)) {
          groups[line_type] = [];
        }
        let line = LINE_TYPES[line_type] || {};
        groups[line_type].push({
          line_id,
          line_type,
          stop_name,
          stop_id,
          ...line,
        });
      });

      await deleteMessage(from.id, message_id);

      await sendLocation(from.id, results[0]);

      let text = `*${results[0].stop_name}* သို့ရောက်ရှိသောယာဥ်လိုင်းများ\n`;

      for (let busLines of Object.values(groups)) {
        let txt = `\\[${busLines[0].line_color}ရောင်] ယာဥ်လိုင်းအမှတ်: *`;
        text +=
          txt +
          busLines.map((m) => `${toBurmeseNumber(m.line_id)}`).join('*, *') +
          '*\n';
      }

      await sendMessage(from.id, {
        text,
        parse_mode: 'markdown',
      });
      break;
    default:
      console.log(from, data);
  }
};

const app = express();

app.post('/api', express.json(), async (req, res) => {
  let { message, callback_query } = req.body;

  reportToAdmin(req.body).catch((e) =>
    console.error(e, '--------error-on-report--------')
  );

  try {
    res.status(200);
    if (callback_query) {
      await handleOnCallback(callback_query);
    } else if (message) {
      await handleOnMessage(message);
    }
  } catch (e) {
    console.log(req.body);
    console.error(e);
  }
  res.end();
});

module.exports = app;
