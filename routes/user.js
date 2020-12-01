var express = require('express');
var router = express.Router();
const userHelpers = require('../helpers/studentHelpers');
const tutorHelpers = require('../helpers/tutorHelpers');
router.get('/',(req,res)=>{
  res.render('home')
});




const tutorLogin = (req, res, next) => {
  if (req.session.loggedTutorIn) {
    next()
  } else {
    res.redirect('/tutor/login')
  }
}

router.get('/', tutorLogin, (req, res) => {
  tutorHelpers.tutorProfileDetails().then((teacher)=>{
  res.render('Tutor/tutor-home',{teacher})
  })
});
router.get('/login', (req, res) => {
  if (req.session.loggedTutorIn) {
    res.redirect('/')
  }
  else {
    res.render('Tutor/tutorlogin',{"loginErr":req.session.tutorLoginErr})
    req.session.tutorLoginErr=false

  }

});
router.post('/login', (req, res) => {
  tutorHelpers.doTutorLogin(req.body).then((response) => {
    if (response.status) {
      req.session.tutor = response.tutor
      req.session.loggedTutorIn = true
      res.redirect('/tutor')
    } else {
      req.session.tutorLoginErr="Invalid Username or Password"
      res.redirect('/tutor/login')  
    }
  })
});
router.get('/tutorout', function (req, res) {
  req.session.destroy()
  res.redirect('/tutor/login')
})







router.get('/login', (req, res) => {
  res.render('Student/login')
})
router.get('/otplogin', (req, res) => {
  res.render('Student/otp-login')
})
router.get('/otpnumber', (req, res) => {
  res.render('Student/otp-number')
})
router.get('/student', (req, res) => {
  res.render('Student/Stud-home')
})
module.exports = router;
