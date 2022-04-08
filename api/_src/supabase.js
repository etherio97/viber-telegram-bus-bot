import { env } from 'process';

export const rpc = (fn, data) =>
  axios
    .post(`${env.SUPABASE_URL}/rest/v1/rpc/${fn}`, data, {
      headers: {
        Authorization: `Bearer ${env.SUPABASE_SECRET}`,
        apikey: env.SUPABASE_SECRET,
      },
    })
    .then(({ data }) => data);
