const cors = require('cors');
const express = require('express');
const { clientOrigin } = require('./config/runtime');
const { errorHandler, notFoundHandler } = require('./middleware/error-handler');
const { registerRoutes } = require('./routes');

const app = express();

app.use(express.json());
app.use(clientOrigin ? cors({ origin: clientOrigin }) : cors());

registerRoutes(app);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
