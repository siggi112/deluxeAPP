const express = require('express');
const router = express.Router();
const mid = require('../middleware');
const sanitize = require('mongo-sanitize');
const moment = require('moment');
const numeral = require('numeral');

// Get models




// Get bookings on Northern Lights watching list


router.get('/', function(req, res, next) {

    var message = req.query.message;
    return res.render('pages/watch', { title: 'Northern Lights Watching List', moment: moment});


});

// northern-lights { 

  // 1 . First, Last name
  // 2. Arrival Date / Start
  // 3. Departure Date / End
  // 5. Pick-up Location
  // 6. Start Time
  // 7. Passenger Number
  // 4. Status (Confirmed, Completed, Payment Pending, In Progress)
  // 5. View More (Modal / Message / If they have gone on a hunt before) / Click to view booking details


// }

// Action / Cancelled - Confirmed


// Daily reminder for Northern Lights Alert // Email

// 1. Send out a reminder for admin to remebember to notify (Email, Alert in Dashboard)
// 2. Send out payment link and information once tour is confirmed (Email)
