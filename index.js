const { app } = require('./app');
const { initDb, closeDb } = require('./db');

const port = 8000;

initDb((err) => {
  if (err) {
    process.exit(1);
    return;
  }
  app.listen(port, () => {
    console.log(`running on port http://localhost:${port}`);
  });
});

process.on('SIGINT', () => {
  closeDb();
});
