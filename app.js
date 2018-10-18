const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');''
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

// Routes
const index = require('./routes/index');
const suppliers = require('./routes/suppliers');
const leads = require('./routes/leads');
const itineraries = require('./routes/itineraries');
const operations = require('./routes/operations');

var app = express();

app.use(fileUpload());



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


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
