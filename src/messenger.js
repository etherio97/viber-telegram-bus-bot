const { env } = require('process');
const { default: axios } = require('axios');

const requestApi = (path, data) => 
  axios
    .post(`https://graph.facebook.com/v13.0/me/${path}?access_token=${env.FACEBOOK_PAGE_TOKEN}`, data)
    .then((result) => result.data);

const sendMessage = (id, text) =>
  requestApi('message', {
    recipient: { id },
    message: { text },
  });

module.exports = {
  sendMessage,
};