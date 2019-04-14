const nodemailer = require('nodemailer');
const Lead = require('../models/lead');
const moment = require('moment');
const cron = require('node-cron');
const Booking = require('../models/booking');
const postmark = require("postmark");



var exports = module.exports = {};


exports.newLeadMail = function (name, pax, traveldate, budget) {

  var CurrentDate = moment().format("dddd, MMMM Do YYYY");

  nodemailer.createTestAccount((err, account) => {
    // create reusable transporter object using the default SMTP transport
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'info@deluxeiceland.is',
        pass: 'Iceland230@ssM'
    }
  });


  const mailOptions = {

    from: 'info@deluxeiceland.is', // sender address
    to: 'sigurdur@deluxeiceland.is', // list of receivers
    subject: 'New Lead for '+ name, // Subject line
    html: '<p>New lead submitted by '+ name +' for '+ pax +' Travellers, desired travel month: '+ traveldate +' with the budget per person '+ budget +'.</p>'// plain text body

  };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    });
  });

}




// Send booking details email to client
exports.sendDetails = function (leadID) {


  Lead.findById(leadID, function(err, lead) {

    // Send an email:
var client = new postmark.ServerClient("06e91cdb-7bf5-4b2d-9b96-fd201221dbdd");

client.sendEmailWithTemplate({
  "From": "info@deluxeiceland.is",
  "To": lead.email,
  "TemplateAlias": "welcome-20190411115353",
  "TemplateModel": {
    "name": lead.firstname,
    "booking_url": "http:localhost:3000/details/"+ lead._id,
  }
});


  })








}
