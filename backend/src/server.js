const app = require('./app');
const { port } = require('./config/runtime');
const { sequelize } = require('../models');

const prepareDatabase = async () => {
  await sequelize.authenticate();
  console.log('Database connection established');
};

const startServer = async () => {
  await prepareDatabase();
  return app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

module.exports = { prepareDatabase, startServer };
