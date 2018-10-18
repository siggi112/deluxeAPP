const nodemailer = require('nodemailer');
const Lead = require('../models/lead');
const moment = require('moment');



module.exports = {


leadCheck: function () {

  var leadCount = {}

  Lead.count({status: 'New'}, function (err, leadsNew) {
  Lead.count({status: 'Introduction sent: Follow-Up'}, function (err, leadsFollow) {

  leadCount.NewLeads = leadsNew;
  leadCount.followUp = leadsFollow;



    });
  });

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
    subject: 'Lead status Reminder - '+ CurrentDate, // Subject line
    html: '<p>Here is the lead status for '+ CurrentDate +'</p></br><p><strong>New Leads: ' + leadCount.NewLeads + '</strong></p></br><p><strong>Follow-Up Leads: ' + leadCount.followUp + '</strong></p>'// plain text body

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

};

module.exports = {


newLeadMail: function (name, pax, traveldate, budget) {

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

};
