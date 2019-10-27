var express = require('express');
var router = express.Router();
const mid = require('../middleware');
const Partner = require('../models/partner');
const Request = require('../models/request');
const Transaction = require('../models/transaction');
const sanitize = require('mongo-sanitize');
const moment = require('moment');
const numeral = require('numeral');
const fs = require('fs');




router.get(['/payments', '/payments/:period'], mid.requiresLogin, function(req, res, next) {

    var Period = req.params.period;
    var date = new Date(), y = date.getFullYear(), m = date.getMonth();

    var start = moment().startOf('year').format();
    var end   = moment().endOf('year').format();

    var startYear = moment().startOf('year').format();
    var endYear   = moment().endOf('year').format();

    var timeView = moment(start).format('YYYY');

  if (req.query.selectedDateView) {

    start = moment(req.query.selectedDateView).startOf('month').format();
    end = moment(start).endOf('month').format();

    timeView = moment(start).format('MMMM');


  }





  Transaction.find({date: {
    $gte: start,
    $lt: end
  }}).sort({date: 'ascending'}).exec(function(err, payments) {
        if(err){
            console.log(err);
          } else {
            var message = req.query.message;
            var totalAmount = 0;
            var totalPaid = 0;
            var totalInvoice = 0;


                for (var i = 0; i < payments.length; i++) {
                  totalAmount += payments[i].amount;


                  if (payments[i].status === "Paid"){
                    totalPaid += payments[i].amount;

                  }

                  totalInvoice += +1;
                }

                var totalOutstanding = totalAmount - totalPaid;

            res.render('pages/finance/payments', { title: 'Payment Overview', totalPaid: totalPaid, totalOutstanding: totalOutstanding, timeView: timeView, message: message, payments: payments, moment: moment, numeral: numeral, totalAmount: totalAmount, totalInvoices: totalInvoice});

        }
  });
});


router.get(['/reports', '/reports/:period'], mid.requiresLogin, function(req, res, next) {
  var Period = req.params.period;
  var date = new Date(), y = date.getFullYear(), m = date.getMonth();

  var firstDayYear = moment().startOf('year').format();

  var start = moment(firstDayYear).startOf('month').format();
  var end = moment(start).endOf('month').format();
  console.log(start +" - "+ end);

  var timeView = 0;
  Transaction.find({date: {
    $gte: start,
    $lt: end
  }}).exec(function(err, payments) {
        if(err){
            console.log(err);
          } else {
            var message = req.query.message;
            var totalAmount = 0;
            var totalPaid = 0;
            var totalInvoice = 0;
            var monthsAll = [];

                for (var i = 0; i < payments.length; i++) {

                }



                var totalOutstanding = totalAmount - totalPaid;
                var InvoicevsSold = 50000000 - totalAmount;
                var UnpaidInvoiceVsPaid = totalAmount;
            res.render('pages/reports', { title: 'Report Overview', totalPaid: totalPaid, totalOutstanding: totalOutstanding, timeView: timeView, message: message, payments: payments, moment: moment, numeral: numeral, totalAmount: totalAmount, totalInvoices: totalInvoice});
          }
  });
});


// POST / update lead status
router.post('/payment/update-status/:Payment_id', mid.requiresLogin, function (req, res) {
  Transaction.findById(req.params.Payment_id, function(err, payment) {

        payment.status = sanitize(req.body.status),
        payment.save(function(err) {
            if (err)
            res.send(err);
            res.redirect('/finance/payments/');
    })

  })
});

router.post('/payment/remove/:Payment_id',  function(req, res, next) {
  Transaction.remove({
        _id: sanitize(req.params.Payment_id)
    }, function(err, item) {
        if (err) {
          return next(err);
        } else
      res.redirect('/finance/payments/?message=deleted');
    })
});


// POST / update lead status
router.post('/invoices/update-status/:Invoice_id', mid.requiresLogin, function (req, res) {
  Request.findById(req.params.Invoice_id, function(err, request) {

        request.paymentstatus = sanitize(req.body.status),
        request.save(function(err) {
            if (err)
            res.send(err);
            res.redirect('/finance/invoices/');
    })

  })
});




module.exports = router;
