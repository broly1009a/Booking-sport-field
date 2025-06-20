require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const ErrorHandle = require('./src/middlewares/errorHandle.middleware');
const constants = require('./src/utils/constants');
const routes = require('./src/routes/index');
const app = express();
const mongoose = require('mongoose');
const { registerScheduleCrons } = require('./src/utils/schedule.cron');
registerScheduleCrons();

app.use(cors(
  {
    allowedHeaders: ['Content-Type', 'Authorization'],
  }
));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(routes);
app.use(ErrorHandle.handleError);

app.listen(constants.serverHostPort, async () => {
  try {
    await mongoose.connect(constants.databaseUrl);
    console.log("Cluster database connected!", constants.databaseUrl);
  } catch (err) {
    await mongoose.connect(constants.temporaryDatabaseUrl);
    console.log("Temporary database connected!", constants.temporaryDatabaseUrl);
  }
  console.log(`Server is running on http://localhost:${constants.serverHostPort}`);
});
