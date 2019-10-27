var express = require('express');
var router = express.Router();
const mid = require('../middleware');
const Booking = require('../models/booking');
const Transaction = require('../models/transaction');
const Transfer = require('../models/transfer');
const Traveller = require('../models/traveller');
const sanitize = require('mongo-sanitize');
const moment = require('moment');
const numeral = require('numeral');
const Message = require('../models/message');
const Lead = require('../models/lead');
const http = require('http');
const request = require('request');






















module.exports = router;
