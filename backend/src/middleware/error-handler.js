const notFoundHandler = (req, res) => {
  res.status(404).json({ message: 'Route not found' });
};

const errorHandler = (err, req, res, next) => {
  console.error(err.stack || err);
  res.status(err.status || 500).json({
    message: err.status ? err.message : 'Something went wrong!',
  });
};

module.exports = { errorHandler, notFoundHandler };
