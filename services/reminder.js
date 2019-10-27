const nodemailer = require('nodemailer');
const Lead = require('../models/lead');
const moment = require('moment');
const cron = require('node-cron');
const Booking = require('../models/booking');
const Transfer = require('../models/transfer');
const Transacation = require('../models/transaction');
const Detail = require('../models/detail');
// Require:
const postmark = require("postmark");

// Send an email:
const client = new postmark.ServerClient("06e91cdb-7bf5-4b2d-9b96-fd201221dbdd");

var exports = module.exports = {};



// Check for arrivals tomorrow and send out reminder
exports.arrivalCheck = function () {

  var currentDate = moment();
  var currentTomorrow = moment(currentDate).add(1, 'day');
  var totalTransfers = 0;
  var transfers = [];

  Transfer.find({date: { $gte: moment(currentTomorrow).format("MM-DD-YYYY"), $lte: moment(currentTomorrow).format("MM-DD-YYYY"), }, status: "Confirmed"}, function(err, transfer) {
    for (var i = 0; i < transfer.length; i++) {
      totalTransfers++;
      transfers.push(transfer[i]);


    } checkArrival(0, transfers);

  });


    function checkArrival(i, transfers) {
      if(i < totalTransfers) {

        for (var i = 0; i < transfers.length; i++) {


            if (transfers[i].type === "Arrival Transfer") {
            var OneTransfer = transfers[i];
            Booking.findById(transfers[i].bookingid, function(err, booking) {
              console.log("This is the transfer "+ OneTransfer);
              client.sendEmailWithTemplate({
                "From": "info@deluxeiceland.is",
                "To": "sigurdur@deluxeiceland.is",
                "TemplateAlias": "welcome",
                "TemplateModel": {
                  "date": moment(currentTomorrow).format("LL"),
                  "name": booking.firstname + " "+ booking.lastname,
                  "driver": OneTransfer.driver,
                  "driverphone": OneTransfer.driverPhone,
                  "flightnumber": OneTransfer.flightnumber,
                  "flighttime": OneTransfer.flighttime,
                  "type": "10:00 AM"
                }
              });



            });

            }
              else if (transfers[i].type === "Departure Transfer") {
                var OneTransfer = transfers[i];
                Booking.findById(transfers[i].bookingid, function(err, booking) {

                  client.sendEmailWithTemplate({
                    "From": "info@deluxeiceland.is",
                    "To": "sigurdur@deluxeiceland.is",
                    "TemplateAlias": "welcome-20190212205535",
                    "TemplateModel": {
                      "date": moment(currentTomorrow).format("LL"),
                      "name": booking.firstname + " "+ booking.lastname,
                      "driver": OneTransfer.driver,
                      "driverphone": OneTransfer.driverPhone,
                      "flightnumber": OneTransfer.flightnumber,
                      "flighttime": OneTransfer.flighttime,
                      "pickuplocation": OneTransfer.location,
                      "pickuptime": OneTransfer.pickuptime
                    }
                  });



                });




            }






        }


      } else {



      }
    }

}


// Check for arrivals tomorrow and send out reminder
exports.welcomeCheck = function () {


  var currentDate = moment();
  var totalWelcome = 0;
  var transfers = [];

  Booking.find({arrivaldate: { $gte: moment(currentDate).format("MM-DD-YYYY"), $lte: moment(currentDate).format("MM-DD-YYYY"), }, status: "Confirmed"}, function(err, transfer) {
    for (var i = 0; i < transfer.length; i++) {
      totalWelcome++;
      transfers.push(transfer[i]);
    } checkArrival(0, transfers);

  });


    function checkArrival(i, transfers) {
      if(i < totalWelcome) {

        for (var i = 0; i < transfers.length; i++) {

          Booking.findById(transfers[i].bookingid, function(err, booking) {

            client.sendEmail({
              "From": "info@deluxeiceland.is",
              "To": "sigurdur@ssm.is",
              "Subject": "Arrival in Iceland Tomorrow - "+ booking.firstname + " "+ booking.lastname,
              "TextBody": "Hello from Postmark!"
              });

              console.log("Sent!");


          });

        }


      } else {



      }
    }

}



// Check for payments that are overdue
exports.paymentCheck = function () {

  var currentDate = moment();
  var totalTransfers = 0;
  var transfers = [];

  Transacation.find({date: {  $lte: moment(currentDate).format("MM-DD-YYYY")}, status: "Unpaid"}, function(err, transfer) {

    for (var i = 0; i < transfer.length; i++) {
      totalTransfers++;
      transfers.push(transfer[i]);


    } checkArrival(0, transfers);

  });

    function checkArrival(i, transfers) {


        if(transfers.length > 0) {

          client.sendEmail({
            "From": "info@deluxeiceland.is",
            "To": "sigurdur@deluxeiceland.is",
            "Subject": "Payment Reminder - There is an outstanding payment",
            "TextBody": "There is an outstanding payment"
            });

            console.log("Sent!");


        } else {
          console.log("There is no outstanding!")
        }

    }

}


// Check for bookings that are in progress
exports.bookingCheck = function () {

  var currentDate = moment();

  console.log(currentDate);

  Detail.find({arrivaldate: {  $lte: currentDate } }, function(err, detail) {

  for (var i = 0; i < detail.length; i++) {

    Booking.findOneAndUpdate({ bookingnumber: detail[i].bookingnumber, status: "Confirmed" }, { $set: {status: "In Progress",  } }, function(err, booking) {

    if(!booking) {

    } else {
                console.log(booking)
    }

      });

  }


  });

  
    Detail.find({departuredate: {  $lt: currentDate } }, function(err, detail) {


      for (var i = 0; i < detail.length; i++) {


        Booking.findOneAndUpdate({ bookingnumber: detail[i].bookingnumber, status: "In Progress" }, { $set: {status: "Completed",  } }, function(err, bookingNew) {


        if(!bookingNew) {

        } else {
                    console.log(bookingNew)
        }

          });

      }



    });

}
