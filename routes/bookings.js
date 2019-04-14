var express = require('express');
var router = express.Router();
const mid = require('../middleware');
const Item = require('../models/item');
const Booking = require('../models/booking');
const Day = require('../models/day');
const Transaction = require('../models/transaction');
const Request = require('../models/request');
const Supplier = require('../models/supplier');
const Partner = require('../models/partner');
const Driver = require('../models/driver');
const Season = require('../models/season');
const Price = require('../models/price');
const Room = require('../models/room');
const Transfer = require('../models/transfer');
const Traveller = require('../models/traveller');
const sanitize = require('mongo-sanitize');
const moment = require('moment');
const numeral = require('numeral');
const Message = require('../models/message');
const Lead = require('../models/lead');
const http = require('http');
const request = require('request');

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
router.get('/new',function(req, res, next) {
  res.render('pages/bookings/new', { title: 'New Booking', moment: moment});
});

/* GET home page. */
router.get('/new-day', function(req, res, next) {
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
router.post('/new-message',   function(req, res, next) {
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
router.post('/new-day',   function(req, res, next) {
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
router.post('/new-transfer', function(req, res, next) {
  if (req.body.date) {


      var Data = {
        type: sanitize(req.body.type),
        date: sanitize(req.body.date),
        flightnumber: sanitize(req.body.flightnumber),
        flighttime: sanitize(req.body.flighttime),
        pickuptime: sanitize(req.body.pickuptime),
        location: sanitize(req.body.location),
        people: sanitize(req.body.people),
        extraInfo: sanitize(req.body.extraInfo),
        bookingid: sanitize(req.body.bookingid),
        bookingname: sanitize(req.body.bookingname),
      };

      Transfer.create(Data, function (error, user) {
        if (error) {
          return next(error);
        } else {
          return res.redirect('/bookings/'+ req.body.bookingid +'?message=newTransfer');
        }
      });

    } else {
      var err = new Error('All fields required.');
      err.status = 400;
      return next(err);
    }
});


// POST / resister new client
router.post('/request', function(req, res, next) {
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
router.post('/update-status/:Booking_id',  function (req, res) {
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
router.get('/search',  function(req, res, next) {
  var noMatch = null;
  var status = req.query.status;

  console.log(status);

  if(req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    console.log(req.query.search);
    Booking.find({firstname: regex, status: "On-Hold"}, function(err, bookings){
         if(err){
             console.log(err);
         } else {
            if(bookings.length < 1) {
                noMatch = "Sorry we found no bookings....";
            }
          res.send(bookings);
         }
      });
  } else {
      Booking.find({}, function(err, bookings){
         if(err){
             console.log(err);
         } else {
            res.send(bookings);
         }
      });
  }
});

/* GET users listing. */
router.get('/',  function(req, res, next) {
  Booking.find({}).sort([['arrivaldate', 'descending']]).exec(function(err, bookings) {
        if(err){
            console.log(err);
          } else {
              var message = req.query.message;
              return res.render('pages/bookings', { title: 'Bookings', moment: moment, bookings: bookings, message: message});

        }
  });
});



// GET /single client
router.get('/edit/:booking_id', function(req, res, next) {
          Booking.findById(req.params.booking_id, function(err, booking) {
              return res.render('bookings/edit', {title: 'Booking - '+ booking.firstname + ' '+ booking.lastname, booking: booking, moment: moment});
    });
});


// GET /single client
router.get('/:booking_id', function(req, res, next) {
          Booking.findById(req.params.booking_id, function(err, booking) {
          Supplier.find({'type': 'Hotel'}).exec(function(err, hotels) {


              Transfer.find({ 'bookingid': req.params.booking_id }, function (err, transfers) {
                Traveller.find({ 'bookingid': req.params.booking_id }, function (err, travellers) {
                console.log(transfers);
                Transaction.find({ 'bookingId': req.params.booking_id }, function (err, payments) {

                      var totalPaid = 0;

                      Driver.find({}, function (err, drivers) {
                          for (var i = 0; i < payments.length; i++) {

                            if (payments[i].status === "Paid"){
                              totalPaid += payments[i].amount;

                            }

                          }

                    var outstanding = booking.finalprice - totalPaid;


                    return res.render('pages/bookings/single', {title: 'Booking - '+ booking.firstname +" "+ booking.lastname, drivers: drivers, moment: moment, transfers: transfers, booking: booking, hotels: hotels, payments: payments, numeral: numeral, outstanding: outstanding, totalPaid: totalPaid, travellers: travellers});
      })
        })
            })
                    });
                        });
                  });
});


// POST / update single item
router.post('/update/:Booking_id', function (req, res) {
  Booking.findById(req.params.Booking_id, function(err, booking) {
      if (req.body.bookingconfirmed){
        var status = "Confirmed";
      } else {
        var status = "On-Hold";
      }
          if(req.files.itinerary) {
              let mainItineraryName = sanitize(req.params.Booking_id) + '.pdf';
              let mainItinerary = sanitize(req.files.itinerary);
                if (err)
                  res.send(err);
                  booking.itinerary = '/itineraries/'+ mainItineraryName,
                  booking.status = status,
                  mainItinerary.mv('./public/itineraries/'+ mainItineraryName, function(err) {
                  booking.firstname = sanitize(req.body.firstname),
                  booking.lastname = sanitize(req.body.lastname),
                  booking.email = sanitize(req.body.email),
                  booking.phonenumber = sanitize(req.body.phonenumber),
                  booking.address = sanitize(req.body.address),
                  booking.zip = sanitize(req.body.zip),
                  booking.city = sanitize(req.body.city),
                  booking.country = sanitize(req.body.country),
                  booking.save(function(err) {
                      if (err)
                      res.send(err);
                      res.redirect('/bookings/'+ req.params.Booking_id);
              })
            })

          } else {
            booking.firstname = sanitize(req.body.firstname),
            booking.status = status,
            booking.lastname = sanitize(req.body.lastname),
            booking.email = sanitize(req.body.email),
            booking.phonenumber = sanitize(req.body.phonenumber),
            booking.address = sanitize(req.body.address),
            booking.zip = sanitize(req.body.zip),
            booking.city = sanitize(req.body.city),
            booking.country = sanitize(req.body.country),
            booking.save(function(err) {
                if (err)
                res.send(err);
                res.redirect('/bookings/'+ req.params.Booking_id +'?message=updated');
        })
          }
  })
});

router.post('/confirm/:Transfer_id', function (req, res) {
  Transfer.findById(req.params.Transfer_id, function(err, transfer) {
    Driver.findById(req.body.driver, function(err, driver) {
      if (err)
        res.send(err);
        transfer.status = "Confirmed",
        transfer.driverPhone = driver.phone,
        transfer.driver = driver.name,
        transfer.save(function(err) {
          res.redirect('/bookings/'+ transfer.bookingid +'?message=updated');
    })
  })
  })
});

router.post('/cancel/:Transfer_id', function (req, res) {
  Transfer.findById(req.params.Transfer_id, function(err, transfer) {
      if (err)
        res.send(err);
        transfer.status = "Cancelled",
        transfer.save(function(err) {
          res.redirect('/bookings/'+ transfer.bookingid +'?message=updated');
    })
  })
});


router.post('/delete/:Transfer_id', function (req, res) {
  Transfer.remove({
        _id: sanitize(req.params.Transfer_id)
    }, function(err, item) {
        if (err) {
          return next(err);
        } else
          res.redirect('/bookings/'+ req.body.bookingID +'?message=updated');
    })
});

router.post('/delete/:Day_id',  function(req, res, next) {
  Day.remove({
        _id: sanitize(req.params.Day_id)
    }, function(err, item) {
        if (err) {
          return next(err);
        } else
        res.redirect('/bookings/'+ req.body.bookingID +'?message=deleted');
    })
});

router.post('/request/:Requst_id',  function(req, res, next) {
  Request.remove({
        _id: sanitize(req.params.Requst_id)
    }, function(err, item) {
        if (err) {
          return next(err);
        } else
        res.redirect('/bookings/'+ req.body.bookingID +'?message=deleted');
    })
});


router.post('/remove/payments/:Payment_id',  function(req, res, next) {
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
router.post('/traveller',   function(req, res, next) {
  if (req.body.name) {


      var travellerData = {

        bookingid: sanitize(req.body.bookingid),
        name: sanitize(req.body.name),
        age: sanitize(req.body.age),
        weight: sanitize(req.body.weight),
        height: sanitize(req.body.height)

      };

      Traveller.create(travellerData, function (error, user) {
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

// POST / update single item
router.post('/traveller/update', function (req, res) {
  Traveller.findById({ 'bookingid': req.body.bookingid }, function(err, traveller) {
      if (err)
        res.send(err);
        traveller.name = sanitize(req.body.name),
        traveller.age = sanitize(req.body.age),
        traveller.weight = sanitize(req.body.weight),
        traveller.height = sanitize(req.body.height)
        traveller.save(function(err) {
            if (err)
            res.send(err);
            res.send("Updated!");
    })
  })
});



// POST / resister new client
router.post('/payment',   function(req, res, next) {
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
router.post('/new',   function(req, res, next) {
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
router.post('/payment/update-status/:Payment_id', function (req, res) {
  Transaction.findById(req.params.Payment_id, function(err, payment) {
        payment.status = sanitize(req.body.status),
        payment.save(function(err) {
            if (err)
            res.send(err);
            res.redirect('/bookings/'+ req.body.booking);
    })

  })
});



// GET /get prices for every room
router.get('/get-rooms/:supplier_id', function(req, res, next) {


  Room.find({ 'supplier': req.params.supplier_id }, function (err, rooms) {

      res.send(rooms);

  });

});




module.exports = router;
