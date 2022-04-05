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

const findNearestStops = ({ min_lat, max_lat, min_lng, max_lng }) => axios.post(`${SUPABASE_URL}/v1/rest/rpc/find_nearest_stops`, { min_lat, max_lat, min_lng, max_lng }, { headers: { Authrization: `Bearer ${SUPABASE_SECRET}`, apikey: SUPABASE_SECRET } }).then(({ data }) => data);

const sendMessage = (chat_id, payload = {}) => axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, { chat_id, ...payload }).then(({ data }) => data);


app.post('/api', json(), async (req, res) => {
    try {
        const { message } = req.body;

        if (message.location) {
            let params = getRadius(600, message.location);
            let results = await findNearestStops(params);

            if (results.length) {
                let text = results.map(({ name }) => `- ${name}`).join('\n');
                await sendMessage((message.chat || message.from).id, { text: `Found ${results.length} stops near your locatoin\n\n${text}` });
            } else {
                await sendMessage((message.chat || message.from).id, { text: 'No bus stops found near your location' });
            }
        }

        res.status(204).end();
    } catch (e) {
        console.error(e);
        res.status(201).end();
    }
});

export default app;