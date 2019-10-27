var express = require('express');
var router = express.Router();
const moment = require('moment');
const numeral = require('numeral');
const Car = require('../models/car');
const mid = require('../middleware');

router.get('/dashboard', mid.requiresLogin, function(req, res, next) {
  Car.find({}).exec(function(err, cars) {
        if(err){
            console.log(err);
          } else {
              var message = req.query.message;
                res.render('pages/driver/dashboard', { title: 'Driver Dashboard', moment: moment, message: message, cars: cars});

        }
  });


});





module.exports = router;
