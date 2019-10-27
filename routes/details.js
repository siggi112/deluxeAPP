var express = require('express');
var router = express();
const Lead = require('../models/lead');
const Detail = require('../models/detail');
const crypto = require('crypto-js');
const moment = require('moment');
const Transaction = require('../models/transaction');
const numeral = require('numeral');
const sanitize = require('mongo-sanitize');
const Traveller = require('../models/traveller');
const Booking = require('../models/booking');




// POST / create traveller
router.post('/add/traveller',   function(req, res, next) {

  var travellerData = {

        name: sanitize(req.body.name),
        age: sanitize(req.body.age),
        gender: sanitize(req.body.gender),
        bookingid: sanitize(req.body.bookingid),


  };


  Traveller.findById(req.body.travellerID, function(err, traveller){
       if(err){
           console.log(err);
       } else {
          if(!traveller) {
            Traveller.create(travellerData, function (error, user) {
              if (error) {
                return next(error);
              } else {
                return;
              }
            });
          } else {
            Traveller.findOneAndUpdate({ _id: req.body.travellerID }, { $set: {
              name: sanitize(req.body.name),
              age: sanitize(req.body.age),
              gender: sanitize(req.body.gender),
              bookingid: sanitize(req.body.bookingid),


            } }, function(err, doc) {
                console.log("Updated");
            })

          }
       }
    });

  res.send(travellerData);




});




router.post('/:lead_id',  function (req, res, next) {


  if (req.body.phonenumber) {

    var phoneNumber = req.body.phonenumber;



      var detailData = {

            phonenumber: sanitize(req.body.phonenumber),
            address: sanitize(req.body.address),
            zip: sanitize(req.body.zip),
            city: sanitize(req.body.city),
            country: sanitize(req.body.country),
            arrivaldate: sanitize(req.body.arrivaldate),
            departuredate: sanitize(req.body.departuredate),
            bookingnumber: sanitize(req.body.bookingnumber),
            arrivalflight: sanitize(req.body.arrivalflight),
            departureflight: sanitize(req.body.departureflight),
            email: sanitize(req.body.email),
            pax: sanitize(req.body.pax),
            specialrequest: sanitize(req.body.sepecialdetails)


          };

          Detail.find({bookingnumber: req.body.bookingnumber}, function(err, detail){
               if(err){
                   console.log(err);
               } else {
                  if(detail.length < 1) {
                    Detail.create(detailData, function (error, user) {
                      if (error) {
                        return next(error);
                      } else {
                        return;
                      }
                    });
                  } else {
                    Detail.findOneAndUpdate({ bookingnumber: req.body.bookingnumber }, { $set: {

                      phonenumber: sanitize(req.body.phonenumber),
                      address: sanitize(req.body.address),
                      zip: sanitize(req.body.zip),
                      city: sanitize(req.body.city),
                      country: sanitize(req.body.country),
                      arrivaldate: sanitize(req.body.arrivaldate),
                      departuredate: sanitize(req.body.departuredate),
                      bookingnumber: sanitize(req.body.bookingnumber),
                      arrivalflight: sanitize(req.body.arrivalflight),
                      departureflight: sanitize(req.body.departureflight),
                      specialrequest: sanitize(req.body.sepecialdetails)


                    } }, function(err, doc) {

                    })

                  }
               }
            });


  } else {

    res.send("Provide details please!");

  }




});




module.exports = router;
