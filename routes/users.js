var express = require('express');
var router = express.Router();
const mid = require('../middleware');
/* GET users listing. */
router.get('/', mid.requiresLogin, function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
