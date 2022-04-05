import { env } from 'process';
import axios from 'axios';
import express, { json } from 'express';

const { SUPABASE_URL, SUPABASE_SECRET, TELEGRAM_BOT_TOKEN, VIBER_BOT_TOKEN } = env;

const app = express();

const getRadius = (radius, { latitude, longitude }) => {
    const R = 6371e3; // earth's mean radius in metres

    return {
        min_lat: latitude - radius / R * 180 / Math.PI,
        max_lat: latitude + radius / R * 180 / Math.PI,
        min_lng: longitude - radius / R * 180 / Math.PI / Math.cos(latitude * Math.PI / 180),
        max_lng: longitude + radius / R * 180 / Math.PI / Math.cos(latitude * Math.PI / 180),
    };
};

const findNearestStops = (data) => {
    let url = `${SUPABASE_URL}/rest/v1/rpc/find_nearest_stops`;
    console.log({ url, data });
    return axios
        .post(url, data, {
            headers: {
                Authrization: `Bearer ${SUPABASE_SECRET}`,
                apikey: SUPABASE_SECRET
            }
        })
        .then(({ data }) => data);
}

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
            let params = getRadius(600, message.location);
            let results = await findNearestStops(params);
            if (results.length) {
                let text = results.map(({ name }) => `- ${name}`).join('\n');
                await sendMessage(user.id, {
                    text: `Found ${results.length} stops near your locatoin\n\n${text}`
                });
            } else {
                await sendMessage(user.id, {
                    text: 'No bus stops found near your location'
                });
            }
        }

        res.status(204).end();
    } catch (e) {
        console.error(e);
        res.status(201).end();
    }
});

export default app;