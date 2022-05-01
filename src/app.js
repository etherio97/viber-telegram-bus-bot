const express = require('express');

const app = express();

const createRouter = (route) => {
  const router = express.Router();
  app.use(route, router);
  return router;
};

app.use(express.json());

module.exports = { 
  app, 
  createRouter,
};
