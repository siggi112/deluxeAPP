var express = require('express');
var router = express.Router();
const Item = require('../models/item');
const Partner = require('../models/partner');
const Lead = require('../models/lead');
const sanitize = require('mongo-sanitize');
const numeral = require('numeral');
const Booking = require('../models/booking');
const Message = require('../models/message');
const Transaction = require('../models/transaction');
const fs = require('fs');
const mail = require('../services/mail');
const pdf = require('html-pdf');
var options = { format: 'Letter' };
let moment = require('moment');



router.get('/create-quote',  function(req, res, next) {
  Partner.find(function(err, partners){
        if(err){
            console.log(err);
          } else {
              var message = req.query.message;
              res.render('quote/create', { title: 'New Price Quote', partners: partners});
        }
  });
});


// POST / resister new lead
router.post('/new-lead',  function(req, res, next) {
  if (req.body.email) {

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




router.get('/partnerList/:partner_id', function(req, res, next) {
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


router.post('/create-quote', function(req, res, next) {

  pdf.create(priceQuote, options).toFile('./pdf/'+ req.body.name +'.pdf', function(err, res) {
    if (err) return console.log(err);
    console.log(res); // { filename: '/app/businesscard.pdf' }
});

});



/* GET home page. */
router.get('/', function(req, res, next) {
    var message = req.query.message;

    res.render('index', { title: 'Deluxe Iceland', message: message });
});

// Get booking details and instert for client
router.get('/finnish-booking', function(req, res, next) {

    res.render('pages/bookings/finnish', { title: 'Finnish your booking'});


});





/* GET settings */
router.get('/settings',  function(req, res, next) {
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
router.post('/settings/:User_id',  function (req, res) {
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
router.get('/dashboard',  function(req, res, next) {
        Booking.count({}, function (err, totalBookings) {
        Booking.count({status: 'Completed'}, function (err, totalCompleted) {
        Booking.count({status: 'Confirmed'}, function (err, totalConfirmed) {
          Booking.find({"status": "Pending"}).sort({arrivaldate: 'asc'}).exec(function(err, bookings) {
          Lead.find({"status": "New"}).sort({arrivaldate: 'asc'}).exec(function(err, leads) {
            res.render('pages/dashboard', { title: 'Dashboard', moment: moment, totalBookings: totalBookings, leads: leads, totalCompleted: totalCompleted, totalConfirmed: totalConfirmed, bookings: bookings});
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
        return res.redirect('/dashboard');
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
router.get('/new-admin',  function(req, res, next) {
  res.render('new-user', { title: 'Dashboard' });
});




// POST / resister new partner
router.post('/add/new-user',  function(req, res, next) {
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
