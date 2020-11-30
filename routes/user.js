var express = require('express');
var router = express.Router();

router.get('/',(req,res)=>{
  res.render('home')
});
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
