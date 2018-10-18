var express = require('express');
var router = express.Router();
const mid = require('../middleware');
const Lead = require('../models/lead');
const Item = require('../models/item');
const Message = require('../models/message');
const Car = require('../models/car');
const sanitize = require('mongo-sanitize');
const moment = require('moment');
const numeral = require('numeral');


router.get('/', function(req, res, next) {
    var message = req.query.message;
    return res.render('pages/operations/overview', { title: 'Operation Overview', moment: moment, message: message});

});



router.get('/fleet', function(req, res, next) {
    var message = req.query.message;
    Car.find({}).sort([['status', 'descending']]).exec(function(err, cars) {
          if(err){
              console.log(err);
            } else {
                var message = req.query.message;
                return res.render('pages/operations/fleet', { title: 'Fleet', moment: moment, cars: cars, message: message});

          }
    });
});


router.get('/fleet/new', function(req, res, next) {
    var message = req.query.message;
    return res.render('pages/operations/fleet-new', { title: 'Add to Fleet', moment: moment, message: message});
});

// POST / register new car
router.post('/fleet/new',  function(req, res, next) {
  if (req.body.make &&
    req.body.model) {



      var carData = {
        make: sanitize(req.body.make),
        model: sanitize(req.body.model),
        passengers: sanitize(req.body.passengers),
        number: sanitize(req.body.number),
        year: sanitize(req.body.year),
        drive: sanitize(req.body.drive),
      };

      Car.create(carData, function (error, user) {
        if (error) {
          return next(error);
        } else {
          return res.redirect('/operations/fleet?message=newDay');
        }
      });

    } else {
      var err = new Error('All fields required.');
      err.status = 400;
      return next(err);
    }
});

router.post('/fleet/delete/:Car_id', function(req, res, next) {
  Car.remove({
        _id: sanitize(req.params.Car_id)
    }, function(err, item) {
        if (err) {
          return next(err);
        } else
        res.redirect('/operations/fleet?message=deleted');
    })
});


// POST / update single item
router.post('/fleet/update/:Car_id', function (req, res) {
  Car.findById(req.params.Car_id, function(err, car) {
      if (err)
        res.send(err);
        car.make = sanitize(req.body.make),
        car.model = sanitize(req.body.model),
        car.number = sanitize(req.body.number),
        car.year = sanitize(req.body.year),
        car.drive = sanitize(req.body.drive),
        car.status = sanitize(req.body.status),
        car.save(function(err) {
            if (err)
            res.send(err);
            res.redirect('/operations/fleet?message=updated');
    })
  })
});







module.exports = router;
