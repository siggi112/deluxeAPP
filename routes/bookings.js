var express = require('express');
var router = express.Router();
const mid = require('../middleware');
const Item = require('../models/item');
const Booking = require('../models/booking');
const Day = require('../models/day');
const Transaction = require('../models/transaction');
const Request = require('../models/request');
const Partner = require('../models/partner');
const sanitize = require('mongo-sanitize');
const moment = require('moment');
const numeral = require('numeral');
const Message = require('../models/message');
const Lead = require('../models/lead');

// load a language
numeral.register('locale', 'is', {
    delimiters: {
        thousands: '.',
        decimal: '.'
    },
    abbreviations: {
        thousand: 'k',
        million: 'm',
        billion: 'b',
        trillion: 't'
    },
    ordinal : function (number) {
        return number === 1 ? 'er' : 'ème';
    },
    currency: {
        symbol: 'ISK'
    }
});

numeral.locale('is');


/* GET home page. */
router.get('/new', mid.requiresLogin, function(req, res, next) {
  res.render('pages/bookings/new', { title: 'New Booking', moment: moment});
});

/* GET home page. */
router.get('/new-day', mid.requiresLogin, function(req, res, next) {
  Booking.find(function(err, bookings){
        if(err){
            console.log(err);
          } else {
              var message = req.query.message;
                res.render('bookings/day-new', { title: 'Add new day', bookings: bookings, message: message});
        }
  });
});

// POST / resister new client
router.post('/new-message',  mid.requiresLogin, function(req, res, next) {
  if (req.body.message) {



      var messageData = {
        text: sanitize(req.body.message),
        owner: sanitize(req.body.owner),
      };

      Message.create(messageData, function (error, user) {
        if (error) {
          return next(error);
        } else {
          return res.redirect('/bookings/'+ req.body.owner +'?message=newMessage');
        }
      });

    } else {
      var err = new Error('All fields required.');
      err.status = 400;
      return next(err);
    }
});


// POST / resister new client
router.post('/new-day',  mid.requiresLogin, function(req, res, next) {
  if (req.body.name &&
    req.body.date) {



      var dayData = {
        name: sanitize(req.body.name),
        date: sanitize(req.body.date),
        accommodation: sanitize(req.body.accommodation),
        driver: sanitize(req.body.driver),
        booking: sanitize(req.body.booking),
      };

      Day.create(dayData, function (error, user) {
        if (error) {
          return next(error);
        } else {
          return res.redirect('/bookings/'+ req.body.booking +'?message=newDay');
        }
      });

    } else {
      var err = new Error('All fields required.');
      err.status = 400;
      return next(err);
    }
});


// POST / resister new client
router.post('/request',  mid.requiresLogin, function(req, res, next) {
  if (req.body.item &&
    req.body.date) {



      var requestData = {
        item: sanitize(req.body.item),
        debt: sanitize(req.body.debt),
        sale: sanitize(req.body.sale),
        date: sanitize(req.body.date),
        suppliername: sanitize(req.body.suppliername),
        supplier: sanitize(req.body.supplierid),
        status: sanitize(req.body.status),
        booking: sanitize(req.body.booking),
      };

      Request.create(requestData, function (error, user) {
        if (error) {
          return next(error);
        } else {
          return res.redirect('/bookings/'+ req.body.booking +'?message=newRequest');
        }
      });

    } else {
      var err = new Error('All fields required.');
      err.status = 400;
      return next(err);
    }
});

// POST / update single item
router.post('/update-status/:Booking_id', mid.requiresLogin, function (req, res) {
  Booking.findById(req.params.Booking_id, function(err, booking) {
    if(req.files.itinerary) {
      let mainItineraryName = sanitize(req.params.Booking_id) + '.pdf';
      let mainItinerary = sanitize(req.files.itinerary);
        if (err)
          res.send(err);
          booking.status = sanitize(req.body.status),
          booking.paymentstatus = sanitize(req.body.paymentstatus),
          booking.itinerary = '/itineraries/'+ mainItineraryName,


          mainItinerary.mv('./public/itineraries/'+ mainItineraryName, function(err) {
          booking.save(function(err) {
              if (err)
              res.send(err);
              res.redirect('/bookings/'+ req.params.Booking_id);
      })
    })
  } else {
      if (err)
        res.send(err);
        booking.status = sanitize(req.body.status),
        booking.paymentstatus = sanitize(req.body.paymentstatus),
        booking.save(function(err) {
            if (err)
            res.send(err);
            res.redirect('/bookings/'+ req.params.Booking_id);
    })
  }
  })
});

/* GET users listing. */
router.get('/', mid.requiresLogin, function(req, res, next) {
  Booking.find({}).sort({'arrivaldate': -1}).exec(function(err, bookings) {
        if(err){
            console.log(err);
          } else {
              var message = req.query.message;
              return res.render('bookings', { title: 'Bookings', moment: moment, bookings: bookings, message: message});

        }
  });
});

// GET /single client
router.get('/edit/:booking_id', mid.requiresLogin, function(req, res, next) {
          Booking.findById(req.params.booking_id, function(err, booking) {
              return res.render('bookings/edit', {title: 'Booking - '+ booking.firstname + ' '+ booking.lastname, booking: booking, moment: moment});
    });
});


// GET /single client
router.get('/:booking_id', mid.requiresLogin, function(req, res, next) {
          Booking.findById(req.params.booking_id, function(err, booking) {
                  if (err) {
                    console.log(err);
                  } else {
                    Day.find({ 'booking': req.params.booking_id }, function (err, days) {
                        if (err) return handleError(err);
                    Request.find({ 'booking': req.params.booking_id }, function (err, requests) {
                          if (err) return handleError(err);
                    var message = req.query.message;
                    var startDate = moment(booking.arrivaldate);
                    var endDate = moment(booking.departuredate);
                    var tripDuration = endDate.diff(startDate, 'days');
                    tripDuration += 1;
                    var arrivalDate = moment(startDate).format('LL');
                    var calOutstanding =  booking.finalprice - booking.paid;
                    var totalOutstanding = numeral(calOutstanding).format('0,0');
                    var Paid = numeral(booking.paid).format('0,0');
                    var Total = numeral(booking.finalprice).format('0,0');
                    var totalPrice = Total.replace(/,/g, '.');
                    Transaction.find({ 'bookingId': req.params.booking_id }, function (err, payments) {

                      var totalPaid = 0;


                          for (var i = 0; i < payments.length; i++) {

                            if (payments[i].status === "Paid"){
                              totalPaid += payments[i].amount;

                            }

                          }

                    var outstanding = booking.finalprice - totalPaid;
                    Partner.find(function(err, partners){
                    Message.find({ 'owner': req.params.booking_id, }, function (err, messages) {
                    return res.render('pages/bookings/single', {title: 'Booking - '+ booking.firstname + ' '+ booking.lastname, partners: partners, payments: payments, numeral: numeral, moment: moment, booking: booking, tripDuration: tripDuration, arrivalDate: arrivalDate, outstanding: outstanding, totalPrice: totalPrice, totalPaid: totalPaid, days: days, message: message, requests: requests, messages: messages});
                            });
                            })
                      });
                      });
                });
          }
    });
});


// POST / update single item
router.post('/update/:Booking_id', mid.requiresLogin, function (req, res) {
  Booking.findById(req.params.Booking_id, function(err, booking) {
      if (err)
        res.send(err);
        booking.firstname = sanitize(req.body.firstname),
        booking.lastname = sanitize(req.body.lastname),
        booking.email = sanitize(req.body.email),
        booking.phonenumber = sanitize(req.body.phonenumber),
        booking.address = sanitize(req.body.address),
        booking.zip = sanitize(req.body.zip),
        booking.city = sanitize(req.body.city),
        booking.country = sanitize(req.body.country),
        booking.arrivaldate = sanitize(req.body.arrivaldate),
        booking.departuredate = sanitize(req.body.departuredate),
        booking.travellers = sanitize(req.body.travellers),
        booking.specialrequest = sanitize(req.body.specialrequest),
        booking.arrivalflight = sanitize(req.body.arrivalflight),
        booking.departureflight = sanitize(req.body.departureflight),
        booking.finalprice = sanitize(req.body.finalprice),
        booking.paid = sanitize(req.body.paid),
        booking.paymentstatus = sanitize(req.body.paymentstatus),
        booking.bookingnumber = sanitize(req.body.bookingnumber),
        booking.save(function(err) {
            if (err)
            res.send(err);
            res.redirect('/bookings/?message=updated');
    })
  })
});

router.post('/delete/:Day_id', mid.requiresLogin, function(req, res, next) {
  Day.remove({
        _id: sanitize(req.params.Day_id)
    }, function(err, item) {
        if (err) {
          return next(err);
        } else
        res.redirect('/bookings/'+ req.body.bookingID +'?message=deleted');
    })
});

router.post('/request/:Requst_id', mid.requiresLogin, function(req, res, next) {
  Request.remove({
        _id: sanitize(req.params.Requst_id)
    }, function(err, item) {
        if (err) {
          return next(err);
        } else
        res.redirect('/bookings/'+ req.body.bookingID +'?message=deleted');
    })
});


router.post('/remove/payments/:Payment_id', mid.requiresLogin, function(req, res, next) {
  Transaction.remove({
        _id: sanitize(req.params.Payment_id)
    }, function(err, item) {
        if (err) {
          return next(err);
        } else
      res.redirect('/bookings/'+ req.body.bookingID +'?message=deleted');
    })
});


// POST / resister new client
router.post('/payment',  mid.requiresLogin, function(req, res, next) {
  if (req.body.amount) {

    console.log("Before format: "+ req.body.amount);
    var totalAmount = String(req.body.amount).split('.').join("");


      var transactionData = {

        bookingId: sanitize(req.body.bookingid),
        amount: sanitize(totalAmount),
        bookingname: sanitize(req.body.bookingname),
        status: sanitize(req.body.status),
        date: sanitize(req.body.date)

      };

      Transaction.create(transactionData, function (error, user) {
        if (error) {
          return next(error);
        } else {
          return res.redirect('/bookings/'+ req.body.bookingid);
        }
      });

    } else {
      var err = new Error('All fields required.');
      err.status = 400;
      return next(err);
    }
});

// POST / resister new client
router.post('/new',  mid.requiresLogin, function(req, res, next) {
  if (req.body.email &&
    req.body.firstname) {



      var bookingData = {

        firstname: sanitize(req.body.firstname),
        lastname: sanitize(req.body.lastname),
        email: sanitize(req.body.email),
        phonenumber: sanitize(req.body.phonenumber),
        address: sanitize(req.body.address),
        zip: sanitize(req.body.zip),
        city: sanitize(req.body.city),
        country: sanitize(req.body.country),
        arrivaldate: sanitize(req.body.arrivaldate),
        departuredate: sanitize(req.body.departuredate),
        travellers: sanitize(req.body.travellers),
        specialrequest: sanitize(req.body.specialrequest),
        arrivalflight: sanitize(req.body.arrivalflight),
        departureflight: sanitize(req.body.departureflight),
        finalprice: sanitize(req.body.finalprice),
        paid: sanitize(req.body.paid),
        paymentstatus: sanitize(req.body.paymentstatus),
        bookingnumber: sanitize(req.body.bookingnumber),

      };

      Booking.create(bookingData, function (error, user) {
        if (error) {
          return next(error);
        } else {
          return res.redirect('/bookings?message=newBooking');
        }
      });

    } else {
      var err = new Error('All fields required.');
      err.status = 400;
      return next(err);
    }
});


// POST / update lead status
router.post('/payment/update-status/:Payment_id', mid.requiresLogin, function (req, res) {
  Transaction.findById(req.params.Payment_id, function(err, payment) {
        payment.status = sanitize(req.body.status),
        payment.save(function(err) {
            if (err)
            res.send(err);
            res.redirect('/bookings/'+ req.body.booking);
    })

  })
});



module.exports = router;
