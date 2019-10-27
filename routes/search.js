var express = require('express');
var router = express.Router();
const Transfer = require('../models/transfer');
const mid = require('../middleware');



router.get('/transfers/:start_date/:end_date',  mid.requiresLogin, function(req, res, next) {

  Transfer.find({created: {
        $gte: req.params.start_date,
        $lt: req.params.end_date
    }}).sort([['created', 'descending']]).exec(function(err, transfers) {
        if(err){
            console.log(err);
          } else {

              console.log(transfers);
              return res.send(transfers);


        }
  });





});



module.exports = router;
