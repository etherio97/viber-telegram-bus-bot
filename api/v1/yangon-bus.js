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
  if (radius && radius > 5000) {
    return res.status(404).send('invalid argument: radius must be under 5000 meters');
  }
  let params = getRadius(radius || 1000, { latitude, longitude });
  let results = (await findNearestStops(params))
    .map((result) => ({
      ...result,
      distance: calculateDistance(result, { latitude, longitude }),
    }))
    .sort((a, b) => a.distance - b.distance);
  res.json(results);
});

router.get('/lines', async (req, res) => {
  let results = (await getBusLines())
    .map((value) => ({
      ...value,
      line: LINE_TYPES[value.line_type],
      line_type: undefined,
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
      line: LINE_TYPES[value.line_type],
      line_type: undefined,
    }));
  res.json(results);
})

router.get('/:line_id/stops', async (req, res) => {
  let { line_id } = req.params;
  let results = (await findStopsByLine(line_id))
    .map((value) => ({
      ...value,
      line: LINE_TYPES[value.line_type],
      line_type: undefined,
    }));
  res.json(results);
})

module.exports = app;