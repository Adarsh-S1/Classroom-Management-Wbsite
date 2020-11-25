var express = require('express');
var router = express.Router();
const tutorHelpers = require('../helpers/tutorHelpers');
const tutorLogin = (req, res,next) => {
  if (req.session.loggedTutorIn) {
    next()
  } else {
    res.redirect('/tutor/login')
  }
}

router.get('/', tutorLogin, (req, res) => {
  res.render('Tutor/tutor-home')

});
router.get('/login', (req, res) => {
  res.render('Tutor/tutorlogin')
});
router.post('/login', (req, res) => {
  tutorHelpers.doTutorLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedTutorIn = true
      req.session.tutor = response.tutor
      res.redirect('/tutor')
    } else {
      res.redirect('/tutor/login')
    }
  })
});



module.exports = router;
