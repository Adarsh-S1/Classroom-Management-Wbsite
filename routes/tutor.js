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
  if (req.session.loggedTutorIn) {
res.redirect('/')  } 
else {
    res.render('Tutor/tutorlogin')  
  }

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
router.get('/tutorout',function(req,res){
  req.session.destroy()
  res.redirect('/tutor/login')
})
router.get('/students',tutorLogin,function(req,res){
  res.render('Tutor/studtable',{tutor:true})
})
router.get('/profile',tutorLogin,function(req,res){
  res.render('Tutor/profile',{tutor:true})
})
router.get('/attendance',tutorLogin,(req,res)=>{
  res.render('Tutor/Attendance',{tutor:true})
})
router.get('/assignments',tutorLogin,(req,res)=>{
  res.render('Tutor/assignment',{tutor:true})
})
router.get('/notes',tutorLogin,(req,res)=>{
  res.render('Tutor/notes',{tutor:true})
})

module.exports = router;
