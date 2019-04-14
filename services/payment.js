const nodemailer = require('nodemailer');
const Lead = require('../models/lead');
const moment = require('moment');
const cron = require('node-cron');
const Booking = require('../models/booking');
const Transaction = require('../models/transaction');

module.exports = {

// Check for final payments and send out payment reminders
paymentCheck: function () {


  var currentDate = moment();
  var sixWeeks = moment(currentDate).add(6, 'weeks');

  console.log("today "+ moment(currentDate).format("DD-MM-YYYY"));
  console.log("sixWeeks "+ moment(sixWeeks).format("DD-MM-YYYY"));



  Transaction.find({date: { $gte: currentDate, $lte: sixWeeks }, status: "Unpaid"}, function(err, transaction) {

    console.log(transaction);

  });

}

};
