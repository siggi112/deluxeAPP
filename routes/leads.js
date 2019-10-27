var express = require('express');
var router = express.Router();
const mid = require('../middleware');
const Lead = require('../models/lead');
const Item = require('../models/item');
const Message = require('../models/message');
const Booking = require('../models/booking');
const sanitize = require('mongo-sanitize');
const moment = require('moment');
const numeral = require('numeral');
const mail = require('../services/mail');
const Transaction = require('../models/transaction');
const crypto = require("crypto");
const postmark = require("postmark");

escapeRegex = function (str) {
  return (str+'').replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
};

router.post('/delete/:Lead_id', mid.requiresLogin, function(req, res, next) {
  Message.remove({
        _id: sanitize(req.body.messageID)
    }, function(err, item) {
        if (err) {
          return next(err);
        } else
        res.redirect('/leads/'+ req.params.Lead_id +'?message=deleted');
    });
});

router.post('/delete-lead', mid.requiresLogin, function(req, res, next) {
  Lead.remove({
        _id: sanitize(req.body.thisLead)
    }, function(err, item) {
        if (err) {
          return next(err);
        } else
        Transaction.remove({
              bookingId: sanitize(req.body.thisLead)
          }, function(err, item) {
              if (err) {
                return next(err);
              } else
              res.redirect('/leads');
          });
    });
});





router.get('/', mid.requiresLogin, function(req, res, next) {
    var message = req.query.message;
    Lead.find({}).sort([['created', 'descending']]).exec(function(err, leads) {
          if(err){
              console.log(err);
            } else {
            var message = req.query.message;
            return res.render('pages/leads', { title: 'Leads', leads: leads, moment: moment});
          }
    });
});




/* GET users listing. */
router.get('/search', mid.requiresLogin,  function(req, res, next) {
  var noMatch = null;
  if(req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Lead.find({firstname: regex}, function(err, leads){
         if(err){
             console.log(err);
         } else {
            if(leads.length < 1) {
                noMatch = "Sorry we found no leads....";
            }
          res.send(leads);
         }
      });
  } else {
      Lead.find({}, function(err, leads){
         if(err){
             console.log(err);
         } else {
            res.send(leads);
         }
      });
  }
});

/* GET users listing. */
router.get('/new',  mid.requiresLogin, function(req, res, next) {
              return res.render('pages/leads/new', { title: 'Leads', moment: moment});

});

/* GET users listing. */
router.get('/sales-dashboard', mid.requiresLogin, function(req, res, next) {
  var begin = moment().startOf('month').format("YYYY-MM-DD");
  var end = moment().endOf('month').format("YYYY-MM-DD");
  console.log("Start "+ begin);
  console.log("End "+ end);
  Lead.find({created: {
        $gte: begin,
        $lt: end
    }}).sort([['created', 'descending']]).exec(function(err, leadsThisWeek) {
        if(err){
            console.log(err);
          } else {
              var message = req.query.message;
                            console.log(leadsThisWeek);
              return res.render('pages/leads/sales-dashboard', { title: 'Sales Dashboard', moment: moment, leads: leadsThisWeek, message: message});


        }
  });
});

// POST / update lead status
router.post('/update-status/:Lead_id', mid.requiresLogin,  function (req, res) {
  Lead.findById(req.params.Lead_id, function(err, lead) {

  lead.firstname = sanitize(req.body.firstname),
  lead.phone = sanitize(req.body.phone),
  lead.email = sanitize(req.body.email),
  lead.travellers = sanitize(req.body.travellers),
  lead.budget = sanitize(req.body.budget),
  lead.startdate = sanitize(req.body.startdate),
  lead.status = sanitize(req.body.status),
  lead.save(function(err) {
      if (err)
      res.send(err);
      res.redirect('/leads/'+ req.params.Lead_id);
    })
  })
});


// POST / assign
router.post('/assign/:Lead_id', mid.requiresLogin,  function (req, res) {
  Lead.findById(req.params.Lead_id, function(err, lead) {
  lead.assignedId = sanitize(req.body.assignedId),
  lead.assignedName = sanitize(req.body.assignedName),
  lead.save(function(err) {
      if (err)
      res.send(err);
      res.redirect('/leads/'+ req.params.Lead_id);
    })
  })
});

// POST / Send Booking info to confirm the booking
router.post('/send-info/:Lead_id',  mid.requiresLogin, function (req, res) {
  Lead.findById(req.params.Lead_id, function(err, lead) {
  var totalAmount = String(req.body.total).split('.').join("");
  var SplitPayment = req.body.splitPayment;
  const formData = req.body;
  var LeadID = lead._id;
  lead.total = sanitize(totalAmount),
  lead.status = "Waiting for confirmation",
  lead.pax = sanitize(req.body.pax)
  lead.arrivaldate = sanitize(req.body.arrival)
  lead.departuredate = sanitize(req.body.departure)


  if(req.body.amountFinal > 0) {

    var totalAmountD = req.body.amountDeposit;
    var totalAmountF = req.body.amountFinal;

    var duedateD = req.body.dueDeposit;
    var duedateF = req.body.dueFinal;



        transactionData = {

          bookingId: sanitize(req.params.Lead_id),
          amount: sanitize(totalAmountD),
          bookingname: sanitize(lead.firstname),
          date: sanitize(duedateD),
          referencenumber: sanitize(lead.referencenumber),
          status: "Unpaid",

        }

        transactionData2 = {

          bookingId: sanitize(req.params.Lead_id),
          amount: sanitize(totalAmountF),
          bookingname: sanitize(lead.firstname),
          date: sanitize(duedateF),
          referencenumber: sanitize(lead.referencenumber),
          status: "Unpaid",

        }

        var transArray = [transactionData, transactionData2];



        Transaction.create(transArray, function (error, user) {
          if (error) {
            return next(error);
          } else {

                    finnishDetails(LeadID);
          }
        });






  } else {

    transactionData = {

      bookingId: sanitize(req.params.Lead_id),
      amount: sanitize(totalAmountD),
      bookingname: sanitize(lead.firstname),
      date: sanitize(duedateD),
      referencenumber: sanitize(lead.referencenumber),
      status: "Unpaid",

    }



            Transaction.create(transactionData, function (error, user) {
              if (error) {
                return next(error);
              } else {

                        finnishDetails(LeadID);
              }
            });



  }



      function finnishDetails(LeadID) {

        res.redirect('/leads/'+ LeadID);

      }


      lead.save(function(err) {
          if (err) {

            console.log(err);

          } else { 

      }


    })
  })
});


// POST / resister new client
router.post('/new-message',   mid.requiresLogin, function(req, res, next) {
  if (req.body.message) {



      var messageData = {
        text: sanitize(req.body.message),
        owner: sanitize(req.body.owner),
        type: sanitize(req.body.type),
        by: sanitize(req.body.by),
      };

      Message.create(messageData, function (error, user) {
        if (error) {
          return next(error);
        } else {
          return res.redirect('/leads/'+ req.body.owner +'?message=newMessage');
        }
      });

    } else {
      var err = new Error('All fields required.');
      err.status = 400;
      return next(err);
    }
});

// GET /single client
router.get('/:lead_id',  mid.requiresLogin, function(req, res, next) {
  Lead.findById(req.params.lead_id, function(err, lead) {
          if (err) {
            console.log(err);
          } else {
            Transaction.find({ 'bookingId': lead._id }, function (err, payments) {
            Message.find({ 'owner': req.params.lead_id, }).sort([['created', 'descending']]).exec(function(err, messages) {
            if (err) return handleError(err);
            var message = req.query.message;
            var startDate = moment(lead.arrivaldate);
            var departureDate = moment(lead.departuredate);
            var tripDuration =  departureDate.diff(startDate, 'days');

            // const serverToken = "06e91cdb-7bf5-4b2d-9b96-fd201221dbdd"
            // let client = new postmark.ServerClient(serverToken);
            //
            //
            // client.getOutboundMessages({count:500, offset:0, recipient: lead.email}).then(result => {

            var emails = [];


            return res.render('pages/leads/single', {title: 'View Lead - ' + lead.firstname, emails: emails, tripDuration: tripDuration, numeral: numeral, lead: lead, message: message, moment: moment, messages: messages, payments: payments});
                      // });
          });
          })
  }
  });
});


router.post('/send-confirmation/:lead_id', mid.requiresLogin,  function(req, res, next) {
  Lead.findById(req.params.lead_id, function(err, lead) {
  var LeadID = req.params.lead_id;
  mail.sendDetails(LeadID);
  res.redirect('/leads/'+ req.params.lead_id +'?message=Emailsent');

  })

});


router.post('/remove/payments/:Payment_id',  mid.requiresLogin, function(req, res, next) {
  Transaction.remove({
        _id: sanitize(req.params.Payment_id)
    }, function(err, item) {
        if (err) {
          return next(err);
        } else
      res.redirect('/leads/'+ req.body.bookingID +'?message=deleted');
    })
});


// POST / update lead status
router.post('/payment/update-status/:Payment_id', mid.requiresLogin, function (req, res) {
  Transaction.findById(req.params.Payment_id, function(err, payment) {
        payment.status = sanitize(req.body.status),
        payment.save(function(err) {
            if (err)
            res.send(err);
            res.redirect('/leads/'+ req.body.lead);
    })

  })
});

// POST / resister new lead
router.post('/new-lead', mid.requiresLogin,  function(req, res, next) {

      var leadData = {
        firstname: sanitize(req.body.firstname),
        email: sanitize(req.body.email),
        travellers: sanitize(req.body.travellers),
        phone: sanitize(req.body.phone),
        startdate: sanitize(req.body.startdate),
        budget: sanitize(req.body.budget),
        trip: sanitize(req.body.trip),
        notes: sanitize(req.body.notes),
        source: sanitize(req.body.source),
      };

      Lead.create(leadData, function (error, lead) {
        if (error) {
          return next(error);
        } else {

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
          res.redirect('/leads');
        }
      });



});







module.exports = router;
