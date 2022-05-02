const {
  app,
  createRouter,
} = require('../../src/app');

const {
  calculateDistance,
  getRadius,
} = require('../../src/utils');

const {
  LINE_TYPES,
  findLinesByStop,
  findNearestStops,
  findStopsByLine,
  getBusStops,
  getBusLines,
} = require('../../src/bus');

const router = createRouter('/v1/yangon-bus');

router.get('/near-me', async (req, res) => {
  let { latitude, longitude, radius } = req.query;
  if (!(latitude && longitude)) {
    return res.status(404).send('required arguments: latitude, longitude');
  }
  let coords = {
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
  };
  let params = getRadius(parseInt(radius) || 1000, coords);
  let results = (await findNearestStops(params))
    .map((result) => ({
      ...result,
      distance: calculateDistance(result, coords),
    }))
    .sort((a, b) => a.distance - b.distance);
  res.json(results);
});

router.get('/lines', async (req, res) => {
  let results = (await getBusLines())
    .map((value) => ({
      ...value,
      ...(LINE_TYPES[value.type] || {}),
    }));
  res.json(results);
});

router.get('/stops', async (req, res) => {
  let results = await getBusStops();
  res.json(results);
});

router.get('/:stop_id/lines', async (req, res) => {
  let { stop_id } = req.params;
  let results = (await findLinesByStop(stop_id))
    .map((value) => ({
      ...value,
      ...(LINE_TYPES[value.line_type] || {}),
    }));
  res.json(results);
})

router.get('/:line_id/stops', async (req, res) => {
  let { line_id } = req.params;
  let results = (await findStopsByLine(line_id))
    .map((value) => ({
      ...value,
      ...(LINE_TYPES[value.line_type] || {}),
    }));
  res.json(results);
})

module.exports = app;