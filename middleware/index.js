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
module.exports.loggedOut = loggedOut;
module.exports.requiresLogin = requiresLogin;
