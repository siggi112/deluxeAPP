#!/usr/bin/env nodejs
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');''
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const mail = require('./services/mail');
const payment = require('./services/payment');
const reminder = require('./services/reminder');
const CronJob = require('cron').CronJob;
const session = require('express-session');

// Routes
const index = require('./routes/index');
const suppliers = require('./routes/suppliers');
const leads = require('./routes/leads');
const itineraries = require('./routes/itineraries');
const operations = require('./routes/operations');
const bookings = require('./routes/bookings');
const search = require('./routes/search');
const details = require('./routes/details');
const finance = require('./routes/finance');
const driver = require('./routes/driver');




// Error System
const Sentry = require('@sentry/node');
Sentry.init({ dsn: 'https://593f0249ded14219895452c873bac263@sentry.io/1455359' });




var app = express();


// use sessions for tracking logins
app.use(session({
  secret: 'Deluxe loves you',
  resave: true,
  saveUninitialized: false
}));


// make user ID available in templates
app.use(function (req, res, next) {
  res.locals.currentUser = req.session.userId;
  res.locals.currentUserName = req.session.userName;
  res.locals.accessControl = req.session.type;
  next();
});




app.use(fileUpload());


// reminder.markCompleted();
//
// reminder.paymentCheck();
//
// reminder.arrivalCheck();


// Check every Friday for bookings next week
const newJob = new CronJob('00 00 00 * * 5', function() {

  const d = new Date();

  console.log("Check every Friday!")

});



// Check every day
const job = new CronJob('00 00 00 * * *', function() {

  const d = new Date();

  reminder.paymentCheck();
  reminder.bookingCheck();

});




job.start();
newJob.start();







// mongodb connection
mongoose.connect('mongodb://ssm:1504942309ssM@ds127864.mlab.com:27864/deluxeiceland', { useNewUrlParser: true });
mongoose.set('useCreateIndex', true);
mongoose.Promise = global.Promise;
var db = mongoose.connection;



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/suppliers', suppliers );
app.use('/leads', leads );
app.use('/itineraries', itineraries );
app.use('/operations', operations );
app.use('/bookings', bookings );
app.use('/search', search );
app.use('/details', details );
app.use('/finance', finance );
app.use('/driver', driver );




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.send("Error!");
  err.status = 404;
  next();
});





// listen on port 3000
app.listen(3000, function () {

  console.log('Express app listening on port 3000');

});



module.exports = app;
