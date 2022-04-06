import { env } from 'process';
import axios from 'axios';
import express, { json } from 'express';

const R = 6371e3; // earth's mean radius in metres
const BURMESE_NUBMERS = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'];
const STICKERS_ID = {
  DUCK_CRYING: "CAACAgIAAxkBAAPaYk0r7UYBCfU_1-e6WwABgCRqMdKgAALzAANWnb0KahvrxMf6lv4jBA",
  DUCK_WAVING: 'CAACAgIAAxkBAAPbYk0sQig1xFTyghrsLzXh7a1IzmkAAgEBAAJWnb0KIr6fDrjC5jQjBA',
  DUCK_LOADING: 'CAACAgIAAxkBAAPdYk0sd33wiWhxWgOyfb2ztw7Rsm4AAgIBAAJWnb0KTuJsgctA5P8jBA',
  DUCK_EXPLODE: 'CAACAgIAAxkBAAPeYk0smk3_5KODyuODCLHXqxlxeiEAAgsBAAJWnb0KTrHnpgj77UkjBA',
}
const LINE_TYPES = [
  {
    line_color: 'အပြာ',
    line_name: "မြောက်ပိုင်းခရိုင် အခြေပြု ယာဉ်လိုင်းများ"
  },
  {
    line_color: 'အနီ',
    line_name: 'အရှေ့ပိုင်းရိုင် အခြေပြု ယာဉ်လိုင်းများ'
  },
  {
    line_color: 'ခရမ်း',
    line_name: 'တောင်ပိုင်းခရိုင် အခြေပြု ယာဉ်လိုင်းများ'
  },
  {
    line_color: 'အစိမ်း',
    line_name: 'ပင်မလမ်းနဲ့ ချိတ်ဆက်သည့် ယာဉ်လိုင်းများ'
  }, {
    line_color: 'အညို',
    line_name: 'မြို့တွင်းပတ်လိုင်းများ'
  }
];
const { SUPABASE_URL, SUPABASE_SECRET, TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN } = env;

const app = express();

const toBurmeseNumber = (value) => value.toString().split('').map(n => BURMESE_NUBMERS[parseInt(n)]).join('');

const calculateDistance = (a, b) =>
  Math.acos(
    Math.sin(a.latitude * Math.PI / 180) *
    Math.sin(b.latitude * Math.PI / 180) +
    Math.cos(a.latitude * Math.PI / 180) *
    Math.cos(b.latitude * Math.PI / 180) *
    Math.cos(a.longitude * Math.PI / 180 - b.longitude * Math.PI / 180)
  ) * R;

const getRadius = (radius, { latitude, longitude }) => ({
  min_lat: latitude - radius / R * 180 / Math.PI,
  max_lat: latitude + radius / R * 180 / Math.PI,
  min_lng: longitude - radius / R * 180 / Math.PI / Math.cos(latitude * Math.PI / 180),
  max_lng: longitude + radius / R * 180 / Math.PI / Math.cos(latitude * Math.PI / 180),
});

const findNearestStops = (params) =>
  axios
    .post(`${SUPABASE_URL}/rest/v1/rpc/find_nearest_stops`, params, {
      headers: {
        Authorization: `Bearer ${SUPABASE_SECRET}`,
        apikey: SUPABASE_SECRET
      }
    })
    .then(({ data }) => data);

const findLinesByStop = (stop_id_input) =>
  axios
    .post(`${SUPABASE_URL}/rest/v1/rpc/find_lines_by_stop`, { stop_id_input }, {
      headers: {
        Authorization: `Bearer ${SUPABASE_SECRET}`,
        apikey: SUPABASE_SECRET
      }
    })
    .then(({ data }) => data);

const sendMessage = (chat_id, payload = {}) =>
  axios
    .post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id,
      ...payload
    })
    .then(({ data }) => data);

const sendSticker = (chat_id, sticker, disable_notification = true) =>
  axios
    .post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendSticker`, {
      chat_id,
      sticker,
      disable_notification,
    })
    .then(({ data }) => data);

const sendLocation = (chat_id, { latitude, longitude }, disable_notification = true) =>
  axios
    .post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendLocation`, {
      chat_id,
      latitude,
      longitude,
      disable_notification,
    })
    .then(({ data }) => data);

const deleteMessage = (chat_id, message_id) =>
  axios
    .post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteMessage`, {
      chat_id,
      message_id
    })
    .then(({ data }) => data);

const handleOnMessage = async (message) => {
  let user = message.chat || message.from;

  message.sticker && console.log(message.sticker);

  if (message.text === '/start') {
    await sendSticker(user.id, STICKERS_ID.DUCK_WAVING);

    await sendMessage(user.id, {
      text: 'ရန်ကုန်မြို့ရှိ ဘက်စ်ကားမှတ်တိုင်များကို စတင်ရှာဖွေရန် တည်နေရာ:19ပို့ပေးပါ...',
      reply_markup: {
        keyboard: [
          [
            { text: "Send your location", request_location: true }
          ]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    });
  } else if (message.location) {
    let coords = message.location;
    let params = getRadius(1200, coords);
    let results = await findNearestStops(params);

    results = results.map(result => ({
      ...result,
      distance: calculateDistance(result, coords)
    }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);

    console.log('lat:%s, lng:%s (%d) stops', coords.latitude, coords.latitude, results.length);

    if (results.length) {
      let _kbd = [];
      let inline_keyboard = [];
      let text = `မှတ်တိုင် ${toBurmeseNumber(results.length)} ခု ရှာတွေ့ပါတယ်။\n\n`;

      text += results.map(({ name, distance }, i) => {
        let unit = 'မီတာ';
        if (distance > 999) {
          distance = distance / 1000;
          unit = 'ကီလိုမီတာ'
        }
        return `${toBurmeseNumber(1 + i)}။ *${name}*   _${unit} ${toBurmeseNumber(distance.toFixed(0))} အကွာ_`
      }).join('\n');

      results.forEach(({ name, id }) => {
        _kbd.push({ text: name, callback_data: `STOP:${id}` })
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
        }
      });
    } else {
      let text = 'အနီးအနားတဝိုက်တွင် မှတ်တိုင်များရှာမတွေ့ပါ။';

      await sendSticker(user.id, STICKERS_ID.DUCK_CRYING);

      await sendMessage(user.id, {
        text,
        parse_mode: 'markdown',
        reply_markup: {
          keyboard: [
            [
              { text: "Send Location", request_location: true }
            ]
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
    }
  } else {
    await sendSticker(user.id, STICKERS_ID.DUCK_EXPLODE);
    await sendMessage(user.id, { text: 'နားမလည်ဘူးဗျ...' })
  }
};

const handleOnCallback = async ({ from, data }) => {
  let [mode, id] = data.split(':');

  console.log('handle:callback#', data);

  let { result: { message_id } } = await sendSticker(from.id, STICKERS_ID.DUCK_LOADING);

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
        groups[line_type].push({ line_id, line_type, stop_name, stop_id, ...line });
      });

      await deleteMessage(from.id, message_id);

      await sendLocation(from.id, results[0]);

      let text = `*${results[0].stop_name}* သို့ရောက်ရှိသောယာဥ်လိုင်းများ\n`;

      for (let busLines of Object.values(groups)) {
        let txt = `\\[${busLines[0].line_color}ရောင်] ယာဥ်လိုင်းအမှတ်: *`;
        text += txt + busLines.map(m => `${toBurmeseNumber(m.line_id)}`).join('*, *') + '*\n';
      }

      await sendMessage(from.id, {
        text,
        parse_mode: 'markdown'
      });
      break;
    default:
      console.log(from, data);
  }
};

const reportToAdmin = async (payload) => {
  let type = 'unknown', user, data = '';
  
  if ('callback_data' in payload) {
    let m = payload.callback_data.message;
    user = m.from;
    type = 'callback';
    data = m.data;
  } else if ('message' in payload) {
    let m = payload.message;
    user = m.from || m.chat || {};
    if ('sticker' in m) {
      type = 'sticker';
    } else if ('location' in m) {
      type = 'location';
      data = JSON.stringify(m.location);
    } else if ('text' in m) {
      if (m.text.substr(0, 1) === '/') {
        type = 'command';
      } else {
        type = 'text';
      }
      data = m.text;
    } else {
      data = JSON.stringify(m);
    }
  }
  
  return sendMessage(TELEGRAM_ADMIN, {
    text: `\\[_${type}_] ${user.first_name||''} ${user.last_name||''} @\`${user.username||user.id}\` *${data}*`,
    parse_mode: 'markdown'
  });
};

app.post('/api', json(), async (req, res) => {
  let { message, callback_query } = req.body;
  
  reportToAdmin(req.body).catch(e => console.error(e, '--------error-on-report--------'));
  
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

export default app;