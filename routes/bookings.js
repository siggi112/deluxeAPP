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
const postmark = require("postmark");
const mail = require('../services/mail');
const fs = require('file-system');
const fileUpload = require('express-fileupload');
const PDFDocument = require('pdfkit');
const blobStream  = require('blob-stream');
const Detail = require('../models/detail');
const crypto = require('crypto-js');


createRefNumber = function (start, range){

  var getRef = Math.floor((Math.random() * range) + start);

  while (getRef > range) {

    getRef = Math.floor((Math.random() * range) + start);

  }

  return getRef;

}


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



router.use(function(req, res, next) {

  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});


/* GET home page. */
router.get('/new',mid.requiresLogin, function(req, res, next) {
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



// Get Lead
router.get('/confirm-booking/:lead_id',  function (req, res) {

  Lead.findById(req.params.lead_id, function(err, lead) {
            console.log(err);

            if (lead.status == 'Waiting for confirmation') {



                  Transaction.find({bookingId: lead._id}).sort([['date', 'ascending']]).exec(function(err, payments) {

                  var totalPayment = 0;
                  var totalPaid = 0;
                  var totalUnpaid = 0;
                  var payNow = 0;
                  var firstPayment = 0;
                  var firstPaymentId = "";
                      for (var i = 0; i < payments.length; i++) {

                        if (payments[i].status === "Paid"){
                          totalPaid += payments[i].amount;

                        }

                        if (payments[i].status === "Unpaid"){

                          totalUnpaid += payments[i].amount;

                        }

                        if(firstPayment === 0 && payments[i].status === "Unpaid"){

                          payNow += payments[i].amount;
                          firstPayment = 1;
                          firstPaymentId = payments[i]._id;
                          console.log("First Payment:" + payNow);

                        }


                        totalPayment += payments[i].amount;



                      }

                      var message = req.query.message;


                      var secret_key = 'a1b90991942a4ffc8c1fe72deadbbefa';
                      var message = '9000060|http://dashboard.deluxeiceland.is/bookings/payment-received/|http://dashboard.deluxeiceland.is/bookings/payment-server/|'+ lead.referencenumber + '|'+ payNow +'|ISK';

                      var OrderHashMessage = lead.referencenumber + '|' + payNow + '|ISK';
                      var orderHash_data = crypto.HmacSHA256(OrderHashMessage, secret_key);
                      var orderHash = crypto.enc.Hex.stringify(orderHash_data);

                      var checkhash_data = crypto.HmacSHA256(message, secret_key);
                      var checkhash = crypto.enc.Hex.stringify(checkhash_data);
                      var itemDec = "Trip to Iceland";
                      console.log("First Payment"+ firstPaymentId)
                      Transaction.findOneAndUpdate({ _id: firstPaymentId }, { $set: {orderhash: orderHash,  } }, function(err, doc) {});
                      Detail.find({bookingnumber: lead.referencenumber }, function(error, detail) {
                      Traveller.find({ 'bookingid': lead.referencenumber }, function (err, travellers) {

                        if (!detail) {

                        }

                return res.render('pages/details/confirm', {lead: lead, travellers:  travellers, message: message, moment: moment, checkhash: checkhash, itemDec: itemDec, payments: payments, numeral: numeral, totalPayment: totalPayment, totalPaid: totalPaid, totalUnpaid: totalUnpaid, payNow: payNow, detail: detail[0]});
          });
                                  });
                  });




            } else {
              res.send("Sorry, we could not find what you are looking for!")
            }
    })
});



// Get Lead
router.get('/final-payment/:booking_id',  function (req, res) {

  Booking.findById(req.params.booking_id, function(err, booking) {
            console.log(err);

            if (booking.status == 'Confirmed' || booking.status == 'In Progress' || booking.status == 'Completed') {


                Transaction.find({ $or:[ { 'bookingId': req.params.booking_id } , {'referencenumber': booking.bookingnumber}] }).sort([['date', 'ascending']]).exec(function(err, payments) {

                  var totalPayment = 0;
                  var totalPaid = 0;
                  var totalUnpaid = 0;
                  var payNow = 0;
                  var firstPayment = 0;
                  var firstPaymentId = "";

                      for (var i = 0; i < payments.length; i++) {

                        if (payments[i].status === "Paid"){
                          totalPaid += payments[i].amount;

                        }

                        if (payments[i].status === "Unpaid"){

                          totalUnpaid += payments[i].amount;

                        }

                        if(firstPayment === 0 && payments[i].status === "Unpaid"){

                          payNow += payments[i].amount;
                          firstPayment = 1;
                          firstPaymentId = payments[i]._id;


                        }


                        totalPayment += payments[i].amount;



                      }

                      var message = req.query.message;

                      console.log("PayNow: "+ payNow)
                      console.log("Booking Number: "+ booking.bookingnumber)
                      var secret_key = 'a1b90991942a4ffc8c1fe72deadbbefa';
                      var message = '9000060|http://dashboard.deluxeiceland.is/bookings/payment-received/|http://dashboard.deluxeiceland.is/bookings/payment-server/|'+ booking.bookingnumber + '|'+ payNow +'|ISK';


                      var OrderHashMessage = booking.bookingnumber + '|' + payNow + '|ISK';
                      var orderHash_data = crypto.HmacSHA256(OrderHashMessage, secret_key);
                      var orderHash = crypto.enc.Hex.stringify(orderHash_data);


                      var checkhash_data = crypto.HmacSHA256(message, secret_key);
                      var checkhash = crypto.enc.Hex.stringify(checkhash_data);
                      var itemDec = "Trip to Iceland - Final Payment";
                      Transaction.findOneAndUpdate({ _id: firstPaymentId }, { $set: {orderhash: orderHash,  } }, function(err, doc) {});

                        Detail.find({bookingnumber: booking.bookingnumber }, function(error, detail) {
                          console.log("checkhash: " + checkhash)

                          return res.render('pages/details/final-payment', {booking: booking, message: message, moment: moment, checkhash: checkhash, itemDec: itemDec, payments: payments, numeral: numeral, totalPayment: totalPayment, totalPaid: totalPaid, totalUnpaid: totalUnpaid, payNow: payNow, detail: detail[0]});
                      });
                  });




            } else {
              res.send("Sorry, we could not find what you are looking for!")
            }
    })
});

router.get('/send-final-payment/:booking_id', mid.requiresLogin,  function(req, res, next) {

  Booking.findById(req.params.booking_id, function(err, booking) {
  var BookingID = req.params.booking_id;
  mail.sendFinalPayment(BookingID);
  res.redirect('/bookings/'+ req.params.booking_id +'?message=Emailsent');

  })

});


router.get('/look-up/:booking_id',  mid.requiresLogin, function(req, res, next) {


  Booking.find({"bookingnumber" : req.params.booking_id}, function(err, booking) {

  console.log(booking);

  res.send(booking);

});

});

router.get('/send-feedback/:booking_id', mid.requiresLogin,  function(req, res, next) {

  Booking.findById(req.params.booking_id, function(err, booking) {
  var BookingID = req.params.booking_id;
  console.log(booking);
  mail.sendFeedback(BookingID);
  res.redirect('/bookings/'+ req.params.booking_id +'?message=Emailsent');

  })

});




router.get('/send-final-payment-reminder/:booking_id', mid.requiresLogin,  function(req, res, next) {

  Booking.findById(req.params.booking_id, function(err, booking) {
  var BookingID = req.params.booking_id;
  mail.sendFinalPaymentReminder(BookingID);
  res.redirect('/bookings/'+ req.params.booking_id +'?message=Emailsent');

  })

});

// POST / resister new client
router.post('/new-message',   mid.requiresLogin, function(req, res, next) {
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
router.post('/new-day',   mid.requiresLogin, function(req, res, next) {
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


// POST / create traveller
router.post('/payment-server/',   function(req, res, next) {

var orderId = req.param('orderid');
var orderHash = req.param('orderhash');


  if(orderHash) {

      console.log("OrderHash "+ orderHash);

      Transaction.findOneAndUpdate({ 'orderhash': orderHash }, { $set: {status: "Paid",  } }, function(err, payment) {

        Lead.findOneAndUpdate({ _id: payment.bookingId }, { $set: {status: "Sold",  } }, function(err, lead) {

          if(!lead) {

            res.status(404).send("Lead not found!");

          } else {


            var bookingData = {

              firstname: lead.firstname,
              email: lead.email,
              finalprice: lead.total,
              bookingnumber: lead.referencenumber,

            };


            Booking.create(bookingData, function (error, user) {
              if (error) {
                return next(error);
              } else {
                mail.sendDepositConfirmation(lead._id);
                res.status(200).send("Worked!");
              }
            });

          }


        });

      });




  } else {

    res.status(404).send("Payment not found!");

  }


});


// POST / create traveller
router.get('/payment-received/',   function(req, res, next) {

  console.log("Request: "+ req);
  console.log("Request status: "+ req.query.status);
  console.log("Request orderHash: "+ req.query.orderhash);
  var orderHash = req.query.orderhash;
  var Status = req.query.status;

  return res.render('pages/details/completed', {orderHash: orderHash, Status: Status});


});

// POST / resister new client
router.post('/new-transfer', mid.requiresLogin, function(req, res, next) {
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
router.post('/request', mid.requiresLogin, function(req, res, next) {
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
router.post('/update-status/:Booking_id',  mid.requiresLogin, function (req, res) {
  Booking.findById(req.params.Booking_id, function(err, booking) {
        if (err)
          res.send(err);
          booking.status = sanitize(req.body.status),
          booking.save(function(err) {
              if (err)
              res.send(err);
              res.redirect('/bookings/'+ req.params.Booking_id);
      })


  })
});

/* GET users listing. */
router.get('/search',  mid.requiresLogin, function(req, res, next) {
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

router.get('/',  mid.requiresLogin, function(req, res, next) {
  var noMatch = null;
  var status = req.query.status;
  var firstName = req.query.firstname;

  if(status) {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Booking.find({status: status}).sort([['firstname', 'ascending']]).exec(function(err, bookings) {
         if(err){
             console.log(err);
         } else {
            if(bookings.length < 1) {
                noMatch = "Sorry we found no bookings....";
            }
            return res.render('pages/bookings', { title: 'Bookings', moment: moment, bookings: bookings, status: status, firstName: firstName});
         }
      });
  } else if (firstName){
        Booking.find({firstname: firstName}).sort([['firstname', 'ascending']]).exec(function(err, bookings) {
         if(err){
             console.log(err);
         } else {
              return res.render('pages/bookings', { title: 'Bookings', moment: moment, bookings: bookings, status: status, firstName: firstName});
         }
      });
  }  else {
        Booking.find({}).sort([['firstname', 'ascending']]).exec(function(err, bookings) {
         if(err){
             console.log(err);
         } else {
              return res.render('pages/bookings', { title: 'Bookings', moment: moment, bookings: bookings, status: status, firstName: firstName});
         }
      });
  }

});



// GET /single client
router.get('/edit/:booking_id', mid.requiresLogin, function(req, res, next) {
          Booking.findById(req.params.booking_id, function(err, booking) {
              return res.render('bookings/edit', {title: 'Booking - '+ booking.firstname + ' '+ booking.lastname, booking: booking, moment: moment});
    });
});



router.get('/create-card/:booking_id',  function(req, res, next) {
  Booking.findById(req.params.booking_id, function(err, booking) {
    // create a document and pipe to a blob
    var doc = new PDFDocument({layout: 'landscape'});
    var stream = doc.pipe(blobStream());

    // draw some text
    doc.fontSize(50);
    doc.text(booking.firstname,  100, 250, {
      align: 'center'
    });


    doc.image('./Bakendi/public/img/main-logo.png', 300, 550, {fit: [200, 200]})
    doc.pipe(fs.createWriteStream('./Bakendi/public/cards/arrival-card.pdf'));
    doc.end();

    if (err)
    res.send(err);

    setTimeout(function () {

       res.redirect("/cards/arrival-card.pdf");
     }, 1500)



    });
});




// GET /single client
router.get('/:booking_id',   mid.requiresLogin, function(req, res, next) {
          Booking.findById(req.params.booking_id, function(err, booking) {
          Supplier.find({'type': 'Hotel'}).exec(function(err, hotels) {

              Transfer.find({ 'bookingid': req.params.booking_id }, function (err, transfers) {
              Traveller.find({ 'bookingid': booking.bookingnumber }, function (err, travellers) {
                console.log(transfers);
                Transaction.find({ $or:[ { 'bookingId': req.params.booking_id } , {'referencenumber': booking.bookingnumber}]}, function (err, payments) {

                      var totalPaid = 0;
                      var totalRefunded = 0;
                      Driver.find({}, function (err, drivers) {
                          for (var i = 0; i < payments.length; i++) {

                            if (payments[i].status === "Paid"){
                              totalPaid += payments[i].amount;

                            }

                            if (payments[i].method === "Refund") {
                              totalRefunded += payments[i].amount;
                            }

                          }

                    var outstanding = booking.finalprice - totalPaid;





                    Detail.find({bookingnumber: booking.bookingnumber }, function(error, detail) {

                    const serverToken = "06e91cdb-7bf5-4b2d-9b96-fd201221dbdd"
                    let client = new postmark.ServerClient(serverToken);

                    let recrecipientEmailipient = "";

                    console.log(recrecipientEmailipient);

                    if (!detail[0]) {

                        recrecipientEmailipient = booking.email;

                    } else {

                        recrecipientEmailipient = detail[0].email;

                    }

                      console.log(recrecipientEmailipient);

                      client.getOutboundMessages({count:500, offset:0, recipient: recrecipientEmailipient}).then(result => {
                      var emails = result.Messages
                      var durationDetails;
                      if (1 <= detail.length) {
                        var arrivalDate = moment(detail[0].arrivaldate);
                        var departureDate = moment(detail[0].departuredate);
                        var totalDuration = departureDate.diff(arrivalDate, 'days');
                        var totalDays = totalDuration + 1;
                        durationDetails = totalDays + " Days / " + totalDuration + " Nights";
                      } else {
                        durationDetails = "";
                      }
                      var message = req.query.message;
                      return res.render('pages/bookings/single', {title: 'Booking - '+ booking.firstname, totalRefunded: totalRefunded, totalDuration: durationDetails, detail: detail[0], drivers: drivers, moment: moment, transfers: transfers, booking: booking, hotels: hotels, payments: payments, numeral: numeral, outstanding: outstanding, totalPaid: totalPaid, travellers: travellers, emails: emails, message: message });

                      });
                    });
      })
        })
            })
                    });
                        });
                  });
});


// POST / update single item
router.post('/upload-itinerary/:Booking_id/:Booking_number', mid.requiresLogin, function (req, res) {
  Detail.findOne({ bookingnumber: req.params.Booking_number }, function(err, detail) {
    console.log("Detai found: "+ detail);
      let mainItineraryName = sanitize(req.params.Booking_id) + '.pdf';
      let mainItinerary = sanitize(req.files.itinerary);
        if (err)
          res.send(err);
          detail.itinerary = '/itineraries/'+ req.params.Booking_number +'.pdf'
          mainItinerary.mv('./Bakendi/public/'+ detail.itinerary, function(err) {
          detail.save(function(err) {
            if (err)
              return res.status(500).send(err);
          res.redirect('/bookings/'+ req.params.Booking_id);
      });
    })
  })
});




router.post('/update/:Booking_id',  function (req, res, next) {


  if (req.body.phonenumber) {

    var phoneNumber = req.body.phonenumber;


      var detailData = {

            phonenumber: sanitize(req.body.phonenumber),
            email: sanitize(req.body.email),
            address: sanitize(req.body.address),
            zip: sanitize(req.body.zip),
            city: sanitize(req.body.city),
            country: sanitize(req.body.country),
            arrivaldate: sanitize(req.body.arrivaldate),
            departuredate: sanitize(req.body.departuredate),
            bookingnumber: sanitize(req.body.bookingnumber),
            arrivalflight: sanitize(req.body.arrivalflight),
            departureflight: sanitize(req.body.departureflight),
            pax: sanitize(req.body.pax),
            specialrequest: sanitize(req.body.sepecialdetails)


          };

          Booking.findOneAndUpdate({ bookingnumber: req.body.bookingnumber }, { $set: { firstname: sanitize(req.body.name), finalprice: sanitize(req.body.totalamount), email: sanitize(req.body.email) } }, function(err, book) {});

          Detail.find({bookingnumber: req.body.bookingnumber}, function(err, detail){
               if(err){
                   console.log(err);
               } else {
                  if(detail.length < 1) {
                    Detail.create(detailData, function (error, user) {
                      if (error) {
                        return next(error);
                      } else {
                          res.redirect('/bookings/'+ req.params.Booking_id +'?message=updated');
                      }
                    });
                  } else {
                    Detail.findOneAndUpdate({ bookingnumber: req.body.bookingnumber }, { $set: {

                      phonenumber: sanitize(req.body.phonenumber),
                      pax: sanitize(req.body.pax),
                      email: sanitize(req.body.email),
                      address: sanitize(req.body.address),
                      zip: sanitize(req.body.zip),
                      city: sanitize(req.body.city),
                      country: sanitize(req.body.country),
                      arrivaldate: sanitize(req.body.arrivaldate),
                      departuredate: sanitize(req.body.departuredate),
                      arrivalflight: sanitize(req.body.arrivalflight),
                      departureflight: sanitize(req.body.departureflight),
                      specialrequest: sanitize(req.body.sepecialdetails)


                    } }, function(err, doc) {

                      res.redirect('/bookings/'+ req.params.Booking_id +'?message=updated');

                    })

                  }
               }
            });


  } else {

    res.redirect('/bookings/'+ req.params.Booking_id +'?message=updated');

  }




});




router.post('/confirm/:Transfer_id', mid.requiresLogin, function (req, res) {
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

router.post('/cancel/:Transfer_id', mid.requiresLogin, function (req, res) {
  Transfer.findById(req.params.Transfer_id, function(err, transfer) {
      if (err)
        res.send(err);
        transfer.status = "Cancelled",
        transfer.save(function(err) {
          res.redirect('/bookings/'+ transfer.bookingid +'?message=updated');
    })
  })
});


router.post('/delete/:Transfer_id', mid.requiresLogin, function (req, res) {
  Transfer.remove({
        _id: sanitize(req.params.Transfer_id)
    }, function(err, item) {
        if (err) {
          return next(err);
        } else
          res.redirect('/bookings/'+ req.body.bookingID +'?message=updated');
    })
});

router.post('/delete/:Day_id',  mid.requiresLogin, function(req, res, next) {
  Day.remove({
        _id: sanitize(req.params.Day_id)
    }, function(err, item) {
        if (err) {
          return next(err);
        } else
        res.redirect('/bookings/'+ req.body.bookingID +'?message=deleted');
    })
});

router.post('/request/:Requst_id',  mid.requiresLogin, function(req, res, next) {
  Request.remove({
        _id: sanitize(req.params.Requst_id)
    }, function(err, item) {
        if (err) {
          return next(err);
        } else
        res.redirect('/bookings/'+ req.body.bookingID +'?message=deleted');
    })
});


router.post('/remove/payments/:Payment_id',  mid.requiresLogin, function(req, res, next) {
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
router.post('/traveller',   mid.requiresLogin, function(req, res, next) {
  if (req.body.name) {


      var travellerData = {

        bookingid: sanitize(req.body.bookingid),
        name: sanitize(req.body.name),
        age: sanitize(req.body.age),
        weight: sanitize(req.body.weight),
        gender: sanitize(req.body.gender),
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
router.post('/traveller/update', mid.requiresLogin, mid.requiresLogin, function (req, res) {
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
router.post('/payment',   mid.requiresLogin, function(req, res, next) {
  if (req.body.amount) {
    var totalAmount = String(req.body.amount).split('.').join("");
    Booking.findById(req.body.bookingid, function(err, booking) {

      if (req.body.method == "Refund") {
        totalAmount =  -Math.abs(totalAmount)
        console.log(totalAmount);
      }

      if (!booking.bookingnumber) {
        booking.bookingnumber = "DI-"+ createRefNumber(10, 90) + createRefNumber(1, 9) + createRefNumber(1000, 9999) + createRefNumber(100, 900)
      }

      var transactionData = {

        bookingId: sanitize(req.body.bookingid),
        amount: sanitize(totalAmount),
        referencenumber: booking.bookingnumber,
        bookingname: sanitize(req.body.bookingname),
        status: sanitize(req.body.status),
        method: sanitize(req.body.method),
        reason: sanitize(req.body.description),
        date: sanitize(req.body.date)

      };

      Transaction.create(transactionData, function (error, user) {
        if (error) {
          return next(error);
        } else {
          return res.redirect('/bookings/'+ req.body.bookingid);
        }
      });


      });


    } else {
      var err = new Error('All fields required.');
      err.status = 400;
      return next(err);
    }
});

// POST / resister new client
router.post('/new',   mid.requiresLogin, function(req, res, next) {
  if (req.body.email) {
      var totalAmount = String(req.body.finalprice).split('.').join("");
      var bookingData = {

        firstname: sanitize(req.body.name),
        email: sanitize(req.body.email),
        phonenumber: sanitize(req.body.phone),
        address: sanitize(req.body.address),
        zip: sanitize(req.body.zip),
        city: sanitize(req.body.city),
        country: sanitize(req.body.country),
        arrivaldate: sanitize(req.body.arrivaldate),
        departuredate: sanitize(req.body.departuredate),
        arrivalflight: sanitize(req.body.arrivalflight),
        departureflight: sanitize(req.body.departureflight),
        specialrequest: sanitize(req.body.specialdetail),
        finalprice: sanitize(totalAmount),
        bookingnumber: "DI-"+ createRefNumber(1, 99999),

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



// GET /get prices for every room
router.get('/get-rooms/:supplier_id', mid.requiresLogin, function(req, res, next) {


  Room.find({ 'supplier': req.params.supplier_id }, function (err, rooms) {

      res.send(rooms);

  });

});




module.exports = router;
