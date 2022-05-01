const { env } = require('process');
const { default: axios } = require('axios');

const qs = (params) =>
   new URLSearchParams(params).toString();

const rpc = (fn, data) =>
  axios
    .post(`${env.SUPABASE_URL}/rest/v1/rpc/${fn}`, data, {
      headers: {
        Authorization: `Bearer ${env.SUPABASE_SECRET}`,
        apikey: env.SUPABASE_SECRET,
      },
    })
    .then(({ data }) => data);

const request = (method, path, params = {}, headers = {}) =>
  axios({
    method,
    url: `${SUPABASE_URL}/rest/v1/${path}?${qs(params)}`,
    headers: {
      Authorization: `Bearer ${env.SUPABASE_SECRET}`,
      apikey: env.SUPABASE_SECRET,
      ...headers,
    },
  })
  .then(({ data }) => data);

module.exports = {
  rpc,
  request,
};
