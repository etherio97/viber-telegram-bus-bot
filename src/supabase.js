const { env } = require('process');
const { default: axios } = require('axios');

const qs = (params) =>
   new URLSearchParams(params).toString();

const request = (method, path, params = {}, data = null, headers = {}) =>
  axios({
    method,
    url: `${env.SUPABASE_URL}/rest/v1/${path}?${qs(params)}`,
    headers: {
      Authorization: `Bearer ${env.SUPABASE_SECRET}`,
      apikey: env.SUPABASE_SECRET,
      ...headers,
    },
    data,
  })
  .then(({ data }) => data);

const rpc = (fn, data) =>
  request('POST', ['rpc', fn].join('/'), {}, data);

module.exports = {
  rpc,
  request,
};
