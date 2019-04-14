var express = require('express');
var router = express.Router();
const Supplier = require('../models/supplier');
const Season = require('../models/season');
const Room = require('../models/room');
const Price = require('../models/price');
const Tour = require('../models/tour');
const sanitize = require('mongo-sanitize');
const moment = require('moment');
const numeral = require('numeral');



router.get('/', function(req, res, next) {
  Supplier.find(function(err, suppliers){
        if(err){
            console.log(err);
          } else {
              var message = req.query.message;
              return res.render('pages/suppliers', { title: 'Suppliers', suppliers: suppliers, message: message});

        }
  });
});


router.get('/new', function(req, res, next) {

              var message = req.query.message;
              return res.render('pages/suppliers/new', { title: 'New Supplier', message: message});


});

router.post('/new-room/:supplier_id',  function(req, res, next) {
  if (req.body.type &&
    req.body.sleeps) {



      var roomData = {
        type: sanitize(req.body.type),
        sleeps: sanitize(req.body.sleeps),
        numberofrooms: sanitize(req.body.numberofrooms),
        supplier: sanitize(req.params.supplier_id),
      };

      Room.create(roomData, function (error, user) {
        if (error) {
          return next(error);
        } else {
          return res.redirect('/suppliers/'+ req.params.supplier_id +'?message=newDay');
        }
      });

    } else {
      var err = new Error('All fields required.');
      err.status = 400;
      return next(err);
    }
});

router.post('/new-tour/:supplier_id', function(req, res, next) {
  if (req.body.name &&
    req.body.duration) {



      var tourData = {
        name: sanitize(req.body.name),
        duration: sanitize(req.body.duration),
        type: sanitize(req.body.type),
        supplier: sanitize(req.params.supplier_id),
      };

      Tour.create(tourData, function (error, user) {
        if (error) {
          return next(error);
        } else {
          return res.redirect('/suppliers/'+ req.params.supplier_id +'?message=newDay');
        }
      });

    } else {
      var err = new Error('All fields required.');
      err.status = 400;
      return next(err);
    }
});

router.post('/new-season/:supplier_id',  function(req, res, next) {

  var dates = [];

  var startDate = moment(req.body.start);
  var endDate = moment(req.body.end);
  var totalDays = endDate.diff(startDate, 'days') + 1;


  function setDays(i) {
    if(i < totalDays) {
      var dayObject = {};

      dayObject = {
        start: startDate,
        supplier: req.params.supplier_id,
        name: req.body.name
      }

      Season.create(dayObject, function (error, user) {
        if (error) {
          return next(error);
        } else {
          startDate.add('days', 1);
          setDays(i + 1);
        }
      });

    } else {
      return res.redirect('/suppliers/'+ req.params.supplier_id +'?message=newDay');
    }
  }

  setDays(0);
});

router.post('/new', function(req, res, next) {
  if (req.body.name &&
    req.body.company) {



      var supplierData = {
        name: sanitize(req.body.name),
        company: sanitize(req.body.company),
        companyid: sanitize(req.body.companyid),
        type: sanitize(req.body.type),
        phone: sanitize(req.body.phone),
        bookingemail: sanitize(req.body.bookingemail),
        invoiceemail: sanitize(req.body.invoiceemail),
        website: sanitize(req.body.website),
        address: sanitize(req.body.address),
        city: sanitize(req.body.city),
        zip: sanitize(req.body.zip),
        country: sanitize(req.body.country),
        note: sanitize(req.body.note),
      };

      Supplier.create(supplierData, function (error, user) {
        if (error) {
          return next(error);
        } else {
          return res.redirect('/suppliers?message=newDay');
        }
      });

    } else {
      var err = new Error('All fields required.');
      err.status = 400;
      return next(err);
    }
});

// POST / update single item
router.post('/update/:supplier_id', function (req, res) {
  Supplier.findById(req.params.supplier_id, function(err, supplier) {
      if (err)
        res.send(err);
        supplier.checkin = sanitize(req.body.checkin),
        supplier.checkout = sanitize(req.body.checkout),
        supplier.save(function(err) {
            if (err)
            res.send(err);
            res.redirect('/suppliers/'+ req.params.supplier_id);
    })
  })
});

router.post('/delete-room/:room_id', function(req, res, next) {
  Room.remove({
        _id: sanitize(req.params.room_id)
    }, function(err, room) {
        if (err) {
          return next(err);
        } else
        res.redirect('/suppliers?message=updated');
    })
});

router.post('/delete-season/:season_id', function(req, res, next) {


          Price.deleteMany({"season": sanitize(req.params.season_id)}, function(err, season) {
                if (err) {
                  return next(err);
                } else {
                Season.remove({
                      _id: sanitize(req.params.season_id)
                  }, function(err, season) {
                      if (err) {
                        return next(err);
                      } else
                      res.redirect('/suppliers/'+ req.body.supplierid +'?message=seasondeleted');
                  })
                }

})




});


router.post('/delete/:supplier_id', function(req, res, next) {


  Supplier.remove({
        _id: sanitize(req.params.supplier_id)
    }, function(err, item) {
        if (err) {
          return next(err);
        } else
        res.redirect('/suppliers?message=updated');
    })
});






router.post('/new-price/:supplier_id',  function(req, res, next) {


  Season.find({'supplier': req.params.supplier_id, 'name': req.body.seasonName, $and:[{start:{$lte: req.body.seasonEnd}},{start:{$gte: req.body.seasonStart}}]}).exec(function(err, days) {
  console.log("Start "+ req.body.seasonStart);
  console.log("End "+ req.body.seasonEnd);
  if(err){
      console.log(err);
  } else {
    var iskTotal = req.body.isk;
    updateSeason(0, iskTotal);
    function updateSeason(i, iskTotal) {
      console.log(days.length);
      if(i < days.length) {
        console.log("Breakfast "+ req.body.breakfast);
        console.log("First "+ days[i].start);
        var totalAmountISK = String(req.body.isk).split('.').join("");
        var priceData = {
          isk: sanitize(totalAmountISK),
          breakfast: sanitize(req.body.breakfast),
          tax: sanitize(req.body.tax),
          use: sanitize(req.body.use),
          season: days[i]._id,
          item: sanitize(req.body.item),
        };


        Price.findOne({season: days[i]._id, item: req.body.item }, {new: true}, function(error, price) {
        console.log("Season "+ days[i]._id);
        console.log("Item "+ req.body.item);
        if (error) {
          console.log(error);
          res.status(500).send();
        } else {
          if (price) {
            price.isk = sanitize(totalAmountISK),
            price.breakfast = sanitize(req.body.breakfast),
            price.tax = sanitize(req.body.tax),
            price.use = sanitize(req.body.use),
            price.season = days[i]._id,
            price.item = sanitize(req.body.item),
            price.save(function(err) {
                if (err) {
                  res.send(err);
                } else {
                  console.log(priceData.isk);
                  updateSeason(i + 1);
                }
            });

          } else {
            Price.create(priceData, function (error, user) {
              if (error) {
                return next(error);
              } else {
                updateSeason(i + 1);

              }
            });
          }

        }


        });


      } else {
        if (err) return handleError(err);
        res.status(200).send();
      }
    }







  }
  });

});



router.post('/update-price/:supplier_id', function(req, res, next) {
  var totalAmountISK = String(req.body.isk).split('.').join("");
  Price.findById(req.body.id, function(err, price) {
      if (err)
        res.send(err);
        price.isk = sanitize(totalAmountISK),
        price.eur = sanitize(req.body.eur),
        price.use = sanitize(req.body.use),
        price.save(function(err) {
            if (err)
            res.send(err);
            res.redirect('/suppliers/'+ req.params.supplier_id);
    })
  })

});

// GET /single partner
router.get('/rooms/:room_id', function(req, res, next) {
          Room.findById(req.params.room_id, function(err, room) {
                  if (err) {
                    console.log(err);
                  } else {
              Price.find({ item: req.params.room_id }, function (err, prices) {
              if (err) {
                console.log(err);
              } else {
                console.log(prices);
                res.send(prices);
              }
          });
    }
});

});






// GET /single partner
router.get('/:supplier_id',  function(req, res, next) {
          Supplier.findById(req.params.supplier_id, function(err, supplier) {
                  if (err) {
                    console.log(err);
                  } else {

              Room.find({ 'supplier': req.params.supplier_id }, function (err, rooms) {
            if (err) return handleError(err);
            Season.find({ 'supplier': req.params.supplier_id }, function (err, seasons) {
            Tour.find({ 'supplier': req.params.supplier_id }, function (err, tours) {

              Season.aggregate([
                { $match : {
                  supplier : req.params.supplier_id
                } },
                { $group: {
                  _id : "$name",
                  firstDate: {$first: "$start"},
                  lastDate: {$last: "$start"},
                  firstID: {$first: "$_id"},
                }
              }
            ], function(err, realSeasons) {
          console.log(realSeasons);
          var message = req.query.message;
          return res.render('pages/suppliers/single', {title: 'View Supplier', supplier: supplier, seasons: realSeasons, rooms: rooms, message: message, tours: tours, moment: moment});
          });
          });
        });
      });
    }
});

});


// GET /single partner
router.get('/ajax/:supplier_id', function(req, res, next) {
          Supplier.findById(req.params.supplier_id, function(err, supplier) {
                  if (err) {
                    console.log(err);
                  } else {

              Room.find({ 'supplier': req.params.supplier_id }, function (err, rooms) {
            if (err) return handleError(err);
            Season.find({ 'supplier': req.params.supplier_id }, function (err, seasons) {
        var message = req.query.message;
          res.json(supplier);
          });
      });
    }
});

});


// // POST / update single item
// router.post('/:supplier_id', mid.requiresLogin, function (req, res) {
//   Supplier.findById(req.params.supplier_id, function(err, supplier) {
//       if (err)
//         res.send(err);
//         supplier.name = sanitize(req.body.name),
//         supplier.company = sanitize(req.body.company),
//         supplier.companyid = sanitize(req.body.companyid),
//         supplier.type = sanitize(req.body.type),
//         supplier.phone = sanitize(req.body.phone),
//         supplier.bookingemail = sanitize(req.body.bookingemail),
//         supplier.invoiceemail = sanitize(req.body.invoiceemail),
//         supplier.website = sanitize(req.body.website),
//         supplier.address = sanitize(req.body.address),
//         supplier.city = sanitize(req.body.city),
//         supplier.zip = sanitize(req.body.zip),
//         supplier.country = sanitize(req.body.country),
//         supplier.note = sanitize(req.body.note),
//         supplier.checkin = sanitize(req.body.note),
//         supplier.checkout = sanitize(req.body.note),
//         supplier.save(function(err) {
//             if (err)
//             res.send(err);
//             res.redirect('/suppliers/'+ req.params.supplier_id);
//     })
//   })
// });








module.exports = router;
