import { env } from 'process';
import axios from 'axios';
import express, { json } from 'express';

const R = 6371e3; // earth's mean radius in metres
const BURMESE_NUBMERS = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'];
const { SUPABASE_URL, SUPABASE_SECRET, TELEGRAM_BOT_TOKEN, VIBER_BOT_TOKEN } = env;

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

const sendMessage = (chat_id, payload = {}) =>
  axios
    .post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id,
      ...payload
    })
    .then(({ data }) => data);


app.post('/api', json(), async (req, res) => {
  try {
    const { message } = req.body;
    const user = message.chat || message.from;
    if (message.text === '/start') {
      await sendMessage(user.id, {
        text: 'Send me your location to find nearest bus stops',
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
        let inline_keyboards = [];
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
            inline_keyboards.push(_kbd);
            _kbd = [];
          }
        })

        await sendMessage(user.id, {
          text,
          parse_mode: 'markdown',
          reply_markup: {
            inline_keyboards,
          }
        });
      } else {
        let text = 'အနီးအနားတဝိုက်တွင် မှတ်တိုင်မရှိပါ။';

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
      console.log(req.body);
    }

    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(201).end();
  }
});

export default app;