var express = require('express');
var router = express.Router();
const mid = require('../middleware');
const Lead = require('../models/lead');
const Item = require('../models/item');
const Message = require('../models/message');
const Car = require('../models/car');
const User = require('../models/user');
const Maintenance = require('../models/maintenance');
const sanitize = require('mongo-sanitize');
const moment = require('moment');
const numeral = require('numeral');


router.get('/', mid.requiresLogin, function(req, res, next) {
    var message = req.query.message;
    return res.render('pages/operations/overview', { title: 'Operation Overview', moment: moment, message: message});

});


router.get('/users', mid.requiresLogin,function(req, res, next) {
    var message = req.query.message;
    User.find({}).sort([['status', 'descending']]).exec(function(err, users) {
          if(err){
              console.log(err);
            } else {
                var message = req.query.message;
                return res.render('pages/operations', { title: 'Users', moment: moment, users: users, message: message});

          }
    });

});

// POST / register new car
router.post('/users',  mid.requiresLogin, function(req, res, next) {
  if (req.body.name &&
    req.body.phone) {

      var userData = {
        name: sanitize(req.body.name),
        phone: sanitize(req.body.phone),
        email: sanitize(req.body.email),
        type: sanitize(req.body.type),
        password: sanitize(req.body.password),
      };

      User.create(userData, function (error, user) {
        if (error) {
          return next(error);
        } else {
          return res.redirect('/operations/users?message=user');
        }
      });

    } else {
      var err = new Error('All fields required.');
      err.status = 400;
      return next(err);
    }
});



router.get('/fleet', mid.requiresLogin, function(req, res, next) {
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


router.get('/fleet/new', mid.requiresLogin, function(req, res, next) {
    var message = req.query.message;
    return res.render('pages/operations/fleet-new', { title: 'Add to Fleet', moment: moment, message: message});
});

router.post('/fleet/new-history/:Car_id', mid.requiresLogin, function(req, res, next) {

    var totalAmountKM = String(req.body.km).split('.').join("");

    var MaintenanceData = {

      date: sanitize(req.body.date),
      km: sanitize(totalAmountKM),
      note: sanitize(req.body.note),
      car: sanitize(req.params.Car_id),
      service: sanitize(req.body.service)
    };

    Maintenance.create(MaintenanceData, function (error, user) {
      if (error) {
        return next(error);
      } else {
        return res.redirect('/operations/fleet/'+ req.params.Car_id);
      }
    });



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

router.post('/fleet/delete/:Car_id', mid.requiresLogin, function(req, res, next) {
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
router.post('/fleet/update/:Car_id', mid.requiresLogin, function (req, res) {
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


// GET /single client
router.get('/fleet/:car_id',  mid.requiresLogin, function(req, res, next) {
  Car.findById(req.params.car_id, function(err, car) {
      Maintenance.find({ 'car': req.params.car_id }, function (err, history) {
            return res.render('pages/operations/single-car', {title: 'View Car', car: car, history: history, moment: moment, numeral: numeral});
              });
  });
});




module.exports = router;
