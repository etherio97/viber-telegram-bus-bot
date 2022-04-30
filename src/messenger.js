const { env } = require('process');
const { default: axios } = require('axios');

class QuickReply {
  constructor(title, payload) {
    this.content_type = 'text';
    this.title = title;
    this.payload = payload;
  }
  
  static build({ title, payload }) {
    return new this(title, payload);
  }
}

const requestApi = (path, data) => 
  axios
    .post(`https://graph.facebook.com/v13.0/me/${path}?access_token=${env.FACEBOOK_PAGE_TOKEN}`, data)
    .then((result) => result.data);

const sendMessage = (id, message = {}) =>
  requestApi('messages', {
    messaging_type: 'RESPONSE',
    recipient: { id },
    message,
  });
  
const sendTextMessage = (id, text) =>
  sendMessage(id, { text });
  
const sendQuickReply = (id, text, quick_replies = []) =>
  sendMessage(id, {
    text,
    quick_replies,
  });

module.exports = {
  QuickReply,
  sendMessage,
  sendTextMessage,
  sendQuickReply,
};