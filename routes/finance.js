var express = require('express');
var router = express.Router();
const mid = require('../middleware');
const Partner = require('../models/partner');
const Request = require('../models/request');
const Transaction = require('../models/transaction');
const sanitize = require('mongo-sanitize');
const moment = require('moment');
const numeral = require('numeral');
const pdf = require('pdfkit');
const fs = require('fs');




router.post('/upload/:Request_id', mid.requiresLogin, function(req, res, next) {
  Request.findById(req.params.Request_id, function(err, request) {
    console.log(request);
    let mainName = sanitize(req.params.Request_id) + '.pdf';
    let mainInvoice = sanitize(req.files.invoice);
      if (err)
        res.send(err);
        request.file = '/uploads/invoices/'+ mainName,
        mainInvoice.mv('./public/uploads/invoices/'+ mainName, function(err) {
        request.save(function(err) {
            if (err)
            res.send(err);
            res.redirect('/finance/invoices?message=attached');
    })
  })
  })
});



router.get(['/invoices', '/invoices/:period'], mid.requiresLogin, function(req, res, next) {
  var Period = req.params.period;
  var date = new Date(), y = date.getFullYear(), m = date.getMonth();

  var start = moment().startOf('year').format();
  var end   = moment().endOf('year').format();

  var timeView = moment(start).format('YYYY');

  if (req.query.selectedDateView) {

    start = moment(req.query.selectedDateView).startOf('month').format();
    end = moment(start).endOf('month').format();

    timeView = moment(start).format('MMMM');


  }


  Request.find({date: {
    $gte: start,
    $lt: end
  }}).sort({date: 'descending'}).exec(function(err, requests) {
        if(err){
            console.log(err);
          } else {
            var message = req.query.message;
            var getTotalDebt = 0;
            var totalInvoices = 0;

                for (var i = 0; i < requests.length; i++) {

                  if (requests[i].paymentstatus === "Unpaid") {
                      getTotalDebt += requests[i].debt;
                  }

                  totalInvoices += requests[i].debt;

                }

            res.render('pages/invoices', { title: 'Invoice Overview', timeView: timeView, message: message, requests: requests, moment: moment, numeral: numeral, totalDebt: getTotalDebt, totalInvoices: totalInvoices});

        }
  });
});

router.get(['/payments', '/payments/:period'], mid.requiresLogin, function(req, res, next) {

    var Period = req.params.period;
    var date = new Date(), y = date.getFullYear(), m = date.getMonth();

    var start = moment().startOf('year').format();
    var end   = moment().endOf('year').format();

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


router.get(['/reports', '/reports/:period'], function(req, res, next) {
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
