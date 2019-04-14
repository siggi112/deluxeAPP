const async = require("async");
const crypto = require("crypto");
const nodemailer = require('nodemailer');
const User = require('../models/user');

function loggedOut(req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/');
  }
  return next();
}
function requiresLogin(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    res.redirect('/?message=pleaselogin')
  }
}


function resetPassword(req, res, next, userEmail) {
  async.waterfall([
  function(done) {
    crypto.randomBytes(20, function(err, buf) {
      var token = buf.toString('hex');
      done(err, token);
    });
  },
  function(token, done) {
    User.findOne({ email: userEmail }, function(err, user) {

      if (!user) {
        return res.redirect('/forgot-password?message=error');
      }

      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

      user.save(function(err) {
        done(err, token, user);
      });
    });
  },
  function(token, user, done) {
    var smtpTransport = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'info@deluxeiceland.is',
        pass: 'Iceland230@ssM'
      }
    });
    var mailOptions = {
      to: user.email,
      from: 'info@deluxeiceland.is',
      subject: 'Deluxe Iceland -  Password Reset',
      text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        'http://' + req.headers.host + '/forgot-password/' + token + '\n\n' +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
    };
    smtpTransport.sendMail(mailOptions, function(err) {
      res.redirect('/forgot-password?message=sent');
      done(err, 'done');
    });
  }
], function(err) {
  if (err) return next(err);
  res.redirect('/forgot-password?message=sent');
});
}


module.exports.resetPassword = resetPassword;
module.exports.loggedOut = loggedOut;
module.exports.requiresLogin = requiresLogin;
