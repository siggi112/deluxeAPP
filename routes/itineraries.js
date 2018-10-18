var express = require('express');
var router = express.Router();
const moment = require('moment');
const numeral = require('numeral');
const Supplier = require('../models/supplier');
const Season = require('../models/season');
const Price = require('../models/price');
const Room = require('../models/room');
const mid = require('../middleware');

/* GET users listing. */
router.get('/new',  function(req, res, next) {
  Supplier.find({'type': 'Hotel'}).exec(function(err, hotels) {
        if(err){
            console.log(err);
  } else {
    return res.render('pages/itineraries/new', { title: 'Create a new itinerary', hotels: hotels});
    console.log(hotels);
  }
  });
});


// GET /single partner
router.get('/get-rooms/:supplier_id', function(req, res, next) {

    Room.find({ 'supplier': req.params.supplier_id }, function (err, rooms) {

      if (err) return handleError(err);
      res.send(rooms);
    })
});



// GET /single partner
router.post('/get-room-price/:supplier_id/:room_id', function(req, res, next) {
  var startDate = moment(req.body.startDate);
  var getEnd = moment(req.body.endDate);

  var endDate = getEnd.subtract(1, 'days');

  Season.find({'supplier': req.params.supplier_id, $and:[{start:{$lte: endDate}},{start:{$gte: startDate}}]}).exec(function(err, days) {
  if(err){
      console.log(err);
      return res.send("No price found!");
  } else {
    calculatePrice(0);
    var totalPrice = 0;
    console.log("total loop "+ days.length)
    console.log(days);
    function calculatePrice(i) {
      if(i < days.length) {
        Price.findOne({'season': days[i]._id, 'item': req.params.room_id }, function (err, price) {
          if (err) return handleError(err);
          console.log(price);
          if (price.isk){
            totalPrice += price.isk
            calculatePrice(i + 1);
          } else {
            return res.send("No price found!");
          }
        });


      } else {
        if (err) return handleError(err);
        var totalCal = totalPrice;
        return res.send({totalCal});
      }
    }


  }
  });
});

module.exports = router;
