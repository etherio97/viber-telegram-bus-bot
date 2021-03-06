const { env } = require('process');
const { default: axios } = require('axios');

const STICKERS_ID = {
  DUCK_CRYING:
    'CAACAgIAAxkBAAPaYk0r7UYBCfU_1-e6WwABgCRqMdKgAALzAANWnb0KahvrxMf6lv4jBA',
  DUCK_WAVING:
    'CAACAgIAAxkBAAPbYk0sQig1xFTyghrsLzXh7a1IzmkAAgEBAAJWnb0KIr6fDrjC5jQjBA',
  DUCK_LOADING:
    'CAACAgIAAxkBAAPdYk0sd33wiWhxWgOyfb2ztw7Rsm4AAgIBAAJWnb0KTuJsgctA5P8jBA',
  DUCK_EXPLODE:
    'CAACAgIAAxkBAAPeYk0smk3_5KODyuODCLHXqxlxeiEAAgsBAAJWnb0KTrHnpgj77UkjBA',
  DUCK_SEARCHING:
    'CAACAgIAAxkBAAMmYm6zUoAGSTYf7RhAXEp9xmSIDhUAAv0OAAJe-WlLbcX06ezev3skBA',
  DUCK_NOT_UNDERSTAND:
    'CAACAgIAAxkBAAMoYm60UtvIgv5wpdWnAu4gGfgMysIAAvkAA1advQqVZW6rKisbNiQE',
};

const requestApi = (path, data) =>
  axios
    .post(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${path}`, data)
    .then(({ data }) => data);

const sendMessage = (chat_id, payload = {}) =>
  requestApi('sendMessage', { chat_id, ...payload });

const sendSticker = (chat_id, sticker, disable_notification = true) =>
  requestApi('sendSticker', { chat_id, sticker, disable_notification });

const sendLocation = (
  chat_id,
  { latitude, longitude },
  disable_notification = true
) =>
  requestApi('sendLocation', {
    chat_id,
    latitude,
    longitude,
    disable_notification,
  });

const deleteMessage = (chat_id, message_id) =>
  requestApi('deleteMessage', {
    chat_id,
    message_id,
  });

const reportToAdmin = async (payload) => {
  let type = 'unknown',
    user,
    data = '';

  if ('callback_query' in payload) {
    let m = payload.callback_query.message;
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

  return sendMessage(env.TELEGRAM_ADMIN, {
    text: user
      ? `\\[_${type}_] ${user.first_name || ''} ${user.last_name || ''} @\`${
          user.username || user.id
        }\` *${data}*`
      : JSON.stringify(payload),
    parse_mode: 'markdown',
  });
};

module.exports = {
  STICKERS_ID,
  deleteMessage,
  reportToAdmin,
  sendLocation,
  sendMessage,
  sendSticker,
};
