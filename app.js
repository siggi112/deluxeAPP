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
  res.locals.accessControl = req.session.access;
  next();
});




app.use(fileUpload());


reminder.paymentCheck();

reminder.arrivalCheck();

// Check Every Day
const job = new CronJob('00 00 08 * * *', function() {

  reminder.arrivalCheck();

});

job.start();





// mongodb connection
mongoose.connect('mongodb://ssm:1504942309ssM@ds127864.mlab.com:27864/deluxeiceland');
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

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// listen on port 3000
app.listen(3006, function () {
  console.log('Express app listening on port 3006');
});


module.exports = app;
