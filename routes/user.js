var express = require('express');
const studentHelpers = require('../helpers/studentHelpers');
var router = express.Router();
const userHelpers = require('../helpers/studentHelpers');
const tutorHelpers = require('../helpers/tutorHelpers');
const studentLogin = (req, res, next) => {
  if (req.session.loggedstudentIn) {
    next()
  } else {
    res.redirect('/login')
  }
}

router.get('/',(req,res)=>{
  res.render('home')
});
router.get('/student', studentLogin, (req, res) => {
  res.render('Student/Stud-home')
})
router.get('/login', (req, res) => {
  if (req.session.loggedstudentIn) {
    res.redirect('/')
  }
  else {
    res.render('Student/login',{"loginErr":req.session.studentLoginErr})
    req.session.studentLoginErr=false
  }
});
 

router.get('/otplogin', (req, res) => {
  res.render('Student/otp-login')
})
router.get('/otpnumber', (req, res) => {
  res.render('Student/otp-number')
})

router.post('/login', (req, res) => {
  studentHelpers.doStudentLogin(req.body).then((response) => {
    if (response.status) {
      req.session.student = response.student
      req.session.loggedstudentIn = true
      res.redirect('/student')
    } else {
      req.session.studentLoginErr="Invalid Username or Password"
      res.redirect('/login')  
    }
  })
});
router.get('/studentout', function (req, res) {
  req.session.destroy()
  res.redirect('/login')
})
module.exports = router;
