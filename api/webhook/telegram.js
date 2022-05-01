const {
  app, 
  createRouter,
} = require('../../src/app');

const {
  handleOnMessage,
  handleOnCallback,
} = require('../../src/handle');

const router = createRouter('/api/webhook/telegram');

router.post('/', async (req, res) => {
  let { message, callback_query } = req.body;
  try {
    res.status(200);
    if (callback_query) {
      await handleOnCallback(callback_query);
    } else if (message) {
      await handleOnMessage(message);
    }
  } catch (e) {
    console.log(req.body);
    console.error(e);
  }
  res.end();
});

module.exports = app;
