var express = require('express');
const studentHelpers = require('../helpers/studentHelpers');
var router = express.Router();
var request = require('request');
const userHelpers = require('../helpers/studentHelpers');
const tutorHelpers = require('../helpers/tutorHelpers');
var text
const studentLogin = (req, res, next) => {
  if (req.session.loggedstudentIn) {
    next()
  } else {
    res.redirect('/login')
  }
}

router.get('/', (req, res) => {
  res.render('home')
});
router.get('/student', studentLogin, (req, res) => {
  let stud=req.session.student
  let studo=req.session.phone
  console.log(studo,"studo---------------------------------------------------------");
  res.render('Student/Stud-home',{stud,studo})
})
router.get('/login', (req, res) => {
  if (req.session.loggedstudentIn) {
    res.redirect('/student')
  }
  else {
    res.render('Student/login', { "loginErr": req.session.studentLoginErr })
    req.session.studentLoginErr = false
  }
});

router.get('/otpnumber', (req, res) => {
  if (req.session.loggedstudentIn) {
    res.redirect('/student')
  }
  else {
    res.render('Student/otp-number', { "otpErr": req.session.studentNumErr })
    req.session.studentNumErr = false
  }
})
router.post('/otpnumber', (req, res) => {
  studentHelpers.phoneNoCheck(req.body).then((response) => {
    if (response.status == true) {
      req.session.phone = response.phone
      var request = require('request');
      var options = {
        'method': 'POST',
        'url': 'https://d7networks.com/api/verifier/send',
        'headers': {
          'Authorization': 'Token a9a74e9b05a5aeeaf9f3f27e889e48ee0efc5f31'
        },
        formData: {
          'mobile': '91'+req.body.Phone,
          'sender_id': 'D7VERIFY',
          'message': 'Your otp for classroom login is {code}',
          'expiry': '900'
        }
      };
      request(options, function (error, response) {
        if (error) throw new Error(error);
        text = response.body.substring(11, 47);
        console.log(response.body);
      });
      res.redirect('/otplogin')
    } else {
      req.session.studentNumErr = "This number is not registered in a account"
      res.redirect('/otpnumber')
    }
  })
})
router.get('/otplogin', (req, res) => {
  if (req.session.loggedstudentIn) {
    res.redirect('/')
  }
  else {
    res.render('Student/otp-login',{ "otpInvalid": req.session.studentOtpInvalid })
    req.session.studentOtpInvalid = false
  }
})
router.post('/otplogin', (req, res) => {
  studentHelpers.OtpCheck(req.body).then((response) => {
    var options = {
      'method': 'POST',
      'url': 'https://d7networks.com/api/verifier/verify',
      'headers': {
        'Authorization': 'Token a9a74e9b05a5aeeaf9f3f27e889e48ee0efc5f31'
      },
      formData: {
        'otp_id': text,
        'otp_code': req.body.otp
      }
    };
    request(options, function (error, response) {
      if (error) throw new Error(error);
      console.log(response.body);
      var status = response.body.substring(11, 17);
      if(status=="failed")
      {
        req.session.studentOtpInvalid = "Invalid OTP"
        res.redirect('/otplogin')
      }else{
        req.session.loggedstudentIn = true
        res.redirect('/student')
      }
      console.log(status);
    });
  })
})
router.post('/login', (req, res) => {
  studentHelpers.doStudentLogin(req.body).then((response) => {
    if (response.status) {
      req.session.student = response.student
      req.session.loggedstudentIn = true
      res.redirect('/student')
    } else {
      req.session.studentLoginErr = "Invalid Username or Password"
      res.redirect('/login')
    }
  })
});
router.get('/studentout', function (req, res) {
  req.session.destroy()
  res.redirect('/login')
})
module.exports = router;
