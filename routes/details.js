const express = require('express');
const Lead = require('../models/lead');
const router = express();
const crypto = require('crypto-js');
const moment = require('moment');
const Transaction = require('../models/transaction');

// Get Lead
router.get('/:lead_id',  function (req, res) {

  Lead.findById(req.params.lead_id, function(err, lead) {
            console.log(err);

            if (lead.status == 'Waiting for confirmation') {



              Transaction.find({ 'bookingId': req.params.lead_id, 'status' : 'Unpaid' }, function (err, payments) {

                var totalAmount = 0;


                for (var i = 0; i < payments.length; i++) {

                  totalAmount += payments[i].amount;

                }

                if (totalAmount === lead.total) {

                  var itemDec = "Trip to Iceland - Full Payment"

                } else {

                  var itemDec = "Trip to Iceland - 30% Deposit"

                }

                var message = req.query.message;


                var secret_key = 'a1b90991942a4ffc8c1fe72deadbbefa';

                var message = '9000060|http://borgun.is/ReturnPageSuccess|http://borgun.is/ReturnPageSuccessServer|TEST00000001|'+ totalAmount +'|ISK';

                var checkhash_data = crypto.HmacSHA256(message, secret_key);
                var checkhash = crypto.enc.Hex.stringify(checkhash_data);


                return res.render('pages/details/confirm.ejs', {title: 'Deluxe Iceland - ' + lead.firstname + " "+ lead.lastname, lead: lead, message: message, checkhash: checkhash, totalAmount: totalAmount, itemDec: itemDec});


              });



            } else {
              res.send("Sorry, we could not find what you are looking for!")
            }
    })
});



module.exports = router;
