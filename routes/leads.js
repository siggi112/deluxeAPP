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

/* GET users listing. */
router.get('/',  function(req, res, next) {
  Lead.find({}).sort([['created', 'descending']]).exec(function(err, leads) {
        if(err){
            console.log(err);
          } else {
              var message = req.query.message;
              return res.render('pages/leads', { title: 'Leads', moment: moment, leads: leads, message: message});

        }
  });
});

/* GET users listing. */
router.get('/new',  function(req, res, next) {
              return res.render('pages/leads/new', { title: 'Leads', moment: moment});

});

/* GET users listing. */
router.get('/sales-dashboard',function(req, res, next) {
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
router.post('/update-status/:Lead_id',  function (req, res) {
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

// POST / update lead status
router.post('/mark-sold/:Lead_id',  function (req, res) {
  Lead.findById(req.params.Lead_id, function(err, lead) {
  lead.total = sanitize(req.body.total),
  lead.status = "Sold",
  lead.save(function(err) {
      if (err) {
        console.log(err);
      } else { 


    var bookingData = {

      firstname: sanitize(req.body.firstname),
      email: sanitize(req.body.email),
      phonenumber: sanitize(req.body.phonenumber),
      arrivaldate: sanitize(req.body.arrivaldate),
      departuredate: sanitize(req.body.departuredate),
      finalprice: sanitize(req.body.total),

    };

    Booking.create(bookingData, function (error, user) {
      if (error) {
        return next(error);
      } else {
        res.redirect('/leads/'+ req.params.Lead_id);
      }
    });
      }
    })
  })
});


// POST / resister new client
router.post('/new-message',   function(req, res, next) {
  if (req.body.message) {



      var messageData = {
        text: sanitize(req.body.message),
        owner: sanitize(req.body.owner),
        type: sanitize(req.body.type),
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
router.get('/:lead_id',  function(req, res, next) {
  Lead.findById(req.params.lead_id, function(err, lead) {
          if (err) {
            console.log(err);
          } else {
            Message.find({ 'owner': req.params.lead_id, }).sort([['created', 'descending']]).exec(function(err, messages) {
                  if (err) return handleError(err);
            var message = req.query.message;
            console.log(messages);
            return res.render('pages/leads/single', {title: 'View Lead - ' + lead.firstname, lead: lead, message: message, moment: moment, messages: messages});
          });
  }
  });
});







module.exports = router;
