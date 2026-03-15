const express = require('express');
const healthRouter = require('./routes/health');
const authRouter = require('./routes/auth');
const itemsRouter = require('./routes/items');

const app = express();

app.use(express.json());
app.use((req, res, next) => {
  console.log('Going through this middleware.......');
  next();
});

app.get('/', (req, res) => {
  res.send({ msg: 'working....' });
});

app.use('/db-health', healthRouter);
app.use('/auth', authRouter);
app.use('/items', itemsRouter);

module.exports = { app };
