require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const ErrorHandle = require('./src/middlewares/errorHandle.middleware');
const routes = require('./src/routes/index');
const app = express();
const mongoose = require('mongoose');
const { registerScheduleCrons } = require('./src/utils/schedule.cron');
const { registerEventCrons } = require('./src/utils/event.cron');
const { registerCancelExpiredBookingsCron } = require('./src/utils/cancelExpiredBookings');

// Đăng ký cron jobs
registerScheduleCrons();
registerEventCrons();
registerCancelExpiredBookingsCron();

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

app.listen(process.env.HOST_PORT, async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("Cluster database connected!", process.env.DB_URI);
  } catch (err) {
    await mongoose.connect(process.env.TEMP_DB_URI);
    console.log("Temporary database connected!", process.env.TEMP_DB_URI);
  }
  console.log(`Server is running on http://localhost:${process.env.HOST_PORT}`);
});
