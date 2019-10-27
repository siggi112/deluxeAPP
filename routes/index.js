var express = require('express');
var router = express.Router();
const Item = require('../models/item');
const Detail = require('../models/detail');
const Partner = require('../models/partner');
const Lead = require('../models/lead');
const sanitize = require('mongo-sanitize');
const numeral = require('numeral');
const Booking = require('../models/booking');
const User = require('../models/user');
const Message = require('../models/message');
const Transaction = require('../models/transaction');
const fs = require('fs');
const mail = require('../services/mail');
const pdf = require('html-pdf');
const mid = require('../middleware');
const nodemailer = require('nodemailer');
const async = require("async");
var options = { format: 'Letter' };
let moment = require('moment');







router.get('/create-quote',  mid.requiresLogin, function(req, res, next) {
  Partner.find(function(err, partners){
        if(err){
            console.log(err);
          } else {
              var message = req.query.message;
              res.render('quote/create', { title: 'New Price Quote', partners: partners});
        }
  });
});


createRefNumber = function (start, range){

  var getRef = Math.floor((Math.random() * range) + start);

  while (getRef > range) {

    getRef = Math.floor((Math.random() * range) + start);

  }

  return getRef;

}



// POST / resister new lead
router.post('/new-lead',  function(req, res, next) {
  if (req.body.email) {

    createRefNumber = function (start, range){

      var getRef = Math.floor((Math.random() * range) + start);

      while (getRef > range) {

        getRef = Math.floor((Math.random() * range) + start);

      }

      return getRef;

    }

      var leadData = {
        firstname: sanitize(req.body.firstname),
        lastname: sanitize(req.body.lastname),
        email: sanitize(req.body.email),
        contact: sanitize(req.body.contact),
        travellers: sanitize(req.body.travellers),
        phone: sanitize(req.body.phone),
        startdate: sanitize(req.body.startdate),
        budget: sanitize(req.body.budget),
        trip: sanitize(req.body.trip),
        notes: sanitize(req.body.notes),
        country: sanitize(req.body.country),
        referencenumber: "DI-"+ createRefNumber(1, 99999),
      };

      Lead.create(leadData, function (error, lead) {
        if (error) {
          return next(error);
        } else {

          mail.newLeadMail(leadData.firstname, leadData.travellers, leadData.startdate, leadData.budget);
          var leadID = lead._id;
          if (leadData.notes) {

            var messageData = {
              text: sanitize(leadData.notes),
              type: "Additional information",
              by: sanitize("Client"),
              owner: leadID,
            };

            Message.create(messageData, function (error, user) {
              if (error) {return next(error)}
            })
          }
          res.send("Worked!");
        }
      });

    } else {
      var err = new Error('All fields required.');
      err.status = 400;
      return next(err);
    }
});




router.get('/partnerList/:partner_id', mid.requiresLogin, function(req, res, next) {
  Partner.findById(req.params.partner_id, function(err, partner) {
          if (err) {
            console.log(err);
          } else {
            Item.find({ 'partner': req.params.partner_id }, function (err, items) {
                if (err) return handleError(err);
            res.json(items);
          });
        }
});
});


router.post('/create-quote', mid.requiresLogin, function(req, res, next) {

  pdf.create(priceQuote, options).toFile('./pdf/'+ req.body.name +'.pdf', function(err, res) {
    if (err) return console.log(err);
    console.log(res); // { filename: '/app/businesscard.pdf' }
});

});



/* GET home page. */
router.get('/login', function(req, res, next) {
    var message = req.query.message;

    res.render('index', { title: 'Deluxe Iceland', message: message });



});


/* GET home page. */
router.get('/posi', function(req, res, next) {

  var message = req.query.message;
  res.render('posi', { title: 'Deluxe Iceland - Posi'});


});


/* GET home page. */
router.post('/posi', function(req, res, next) {

  var totalAmount = req.body.totalisk;
  var bookingNumber = req.body.bookingnumber;
  var strippedAmount = String(totalAmount).split('.').join("")

  Booking.findOne({bookingnumber: bookingNumber}, function(err, booking) {

    if (err) {
      console.error(err)
      return reject(err);
   }

    var bookingnumber = "";
    bookingnumber = booking.bookingnumber;

    if (bookingnumber = "") {
            res.send("Found")

    } else {


      res.send("Found")

    }



  });

  console.log(strippedAmount);
  console.log(bookingNumber);
});

/* GET home page. */
router.get('/forgot-password', function(req, res, next) {
    var message = req.query.message;

    res.render('reset', { title: 'Deluxe Iceland', message: message });
});


/* GET home page. */
router.post('/forgot', function(req, res, next) {

  var userEmail = req.body.email;

  mid.resetPassword(req, res, next, userEmail);

});


router.get('/forgot-password/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
  var message = req.query.message;
  if (!user) {

    return res.redirect('/forgot-password?message=error');

  }

  res.render('reset-password', { token: req.params.token , message: message});

  });
});

router.post('/forgot-password/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {

          return res.redirect('back');

        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save(function(err) {
          res.redirect('/');
          });
        });
      },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'info@deluxeiceland.is',
          pass: 'Iceland230@ssM'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'info@deluxeiceland.is',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/dashboard');
  });
});





/* GET settings */
router.get('/settings', mid.requiresLogin,  function(req, res, next) {
  User.findById(req.session.userId, function (err, user){
    if (err) {
      console.log(err);
    } else {
        var message = req.query.message;
      return res.render('settings', {title: 'Settings', user: user, message: message});
    }
 });
});

// POST / update single item
router.post('/settings/:User_id',  mid.requiresLogin, function (req, res) {
  User.findById(req.params.User_id, function(err, user) {
      if (err)
        res.send(err);
        user.name = sanitize(req.body.name),
        user.email = sanitize(req.body.email),
        user.save(function(err) {
            if (err)
            res.send(err);
            res.redirect('/settings?message=updated');
    })
  })
});



/* GET home page. */
router.get('/',  mid.requiresLogin, function(req, res, next) {

        var monthstart = moment().startOf('month');
        var monthend = moment().endOf('month');
        Detail.find({
  $or: [
    { arrivaldate: { $gte: monthstart, $lt: monthend } },
    { departuredate: { $gte: monthstart, $lt: monthend} }
  ]
}).sort([['arrivaldate', 'ascending']]).exec(function(err, detailsthisWeek) {
        Booking.count({}, function (err, totalBookings) {
        Booking.find({status: 'Pending'}, function (err, totalPending) {
        Booking.count({status: 'Confirmed'}, function (err, totalConfirmed) {
        Lead.find({status: 'New'}, function (err, newLeads) {
        Lead.count({status: 'Follow-up'}, function (err, followLeads) {
        Booking.find({"status": "Pending"}).sort({arrivaldate: 'ascending'}).exec(function(err, bookings) {
        Lead.find({"status": "New"}).sort({arrivaldate: 'asc'}).exec(function(err, leads) {
            res.render('pages/dashboard', { title: 'Dashboard', moment: moment, followLeads: followLeads, newLeads: newLeads, totalBookings: totalBookings, leads: leads, totalPending: totalPending, totalConfirmed: totalConfirmed, bookings: bookings, detailsthisWeek: detailsthisWeek});
          });
              });
        });
        })});
    });
    });
});

});


// POST / login in user
router.post('/login', function(req, res, next) {
  if (req.body.email && req.body.password) {
    userEmail = sanitize(req.body.email);
    userPassword = sanitize(req.body.password);
    User.authenticate(userEmail, userPassword, function (error, user) {
      if (error || !user) {
        res.redirect('/?message=error');
      }  else {
        req.session.userId = user._id;
        req.session.userName = user.name;
        req.session.type = user.type;

        registerLogin(user._id);
        if (user.type == "Admin" || user.type == "Supervisor"){
           return res.redirect('/');
        } else if (user.type == "Driver") {
          return res.redirect('/driver/dashboard');
        }
      }
    });
  } else {
    var err = new Error('Email and password are required.');
    err.status = 401;
    return next(err);
  }
});


// GET /logout
router.get('/logout', function(req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
      if(err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

/* GET home page. */
router.get('/new-admin',  mid.requiresLogin, function(req, res, next) {
  res.render('new-user', { title: 'Dashboard' });
});


registerLogin = function(UserID) {



    User.findById(UserID, function(err, user) {

        if (err)
          res.send(err);
          user.lastlogin = Date.now();
          user.save(function(err) {
          if (err)
          res.send(err);
          return;
      })

    })


}




// POST / resister new partner
router.post('/add/new-user',  mid.requiresLogin, function(req, res, next) {
  if (req.body.email &&
    req.body.name) {

      // create object with form input
      var userData = {
        email: sanitize(req.body.email),
        name: sanitize(req.body.name),
        password: sanitize(req.body.password),
      };

      // use schema's `create` method to insert document into Mongo
      User.create(userData, function (error, user) {
        if (error) {
          return next(error);
        } else {
          return res.redirect('/dashboard?message=success');
        }
      });

    } else {
      var err = new Error('All fields required.');
      err.status = 400;
      return next(err);
    }
});

module.exports = router;
