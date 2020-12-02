var express = require('express');
var router = express.Router();
const studentHelpers = require('../helpers/studentHelpers');
const tutorHelpers = require('../helpers/tutorHelpers');
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
    console.log(req.body);
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
router.get('/students', tutorLogin, function (req, res) {
  tutorHelpers.getAllStudents().then((students)=>{
    res.render('Tutor/studtable', { tutor: true,students })
  })
})
router.get('/profile', tutorLogin, function (req, res) {
  tutorHelpers.tutorProfileDetails().then((teacher)=>{
    res.render('Tutor/profile', { tutor: true,teacher})
  })
})
router.post('/profile',(req,res)=>{
  tutorHelpers.tutorProfile(req.body,(id)=>{
   let image=req.files.Tutimage
    image.mv('./public/Tutor-image/'+id+'.jpg',(err)=>{
    if(!err){
      res.redirect('/tutor/profile')
     }else{
       console.log(err);
     }
   })
  })
}) 
router.post('/editutor/:id',tutorLogin,(req,res)=>{
  let id=req.params.id
  console.log(req.body,"-----------------------------------------------------------------------------------------------");
  tutorHelpers.updateTutDetails(req.params.id,req.body).then(()=>{
    res.redirect('/tutor/profile')
    if(req.files.Image)
    {
    let image=req.files.Image
    image.mv('./public/Tutor-image/'+id+'.jpg')
    }
  })
}) 
router.get('/attendance', tutorLogin, (req, res) => {
  res.render('Tutor/Attendance', { tutor: true })
})
router.get('/assignments', tutorLogin, (req, res) => {
  res.render('Tutor/assignment', { tutor: true })
})
router.get('/notes', tutorLogin, (req, res) => {
  res.render('Tutor/notes', { tutor: true })
})
router.get('/announcement', tutorLogin, (req, res) => {
  res.render('Tutor/announcement', { tutor: true })
})
router.get('/events', tutorLogin, (req, res) => {
  res.render('Tutor/Events', { tutor: true })
})
router.get('/photos', tutorLogin, (req, res) => {
  res.render('Tutor/photos', { tutor: true })
})
router.get('/addstudent', tutorLogin, (req, res) => {
  res.render('Tutor/add-student', { tutor: true })
})
router.post('/addstudent',(req,res)=>{
  tutorHelpers.addStudent(req.body,(id)=>{
   let image=req.files.Image
    image.mv('./public/student-images/'+id+'.jpg',(err)=>{
    if(!err){
      res.redirect('/tutor/addstudent')
     }else{
       console.log(err);
     }
   })
  })
})
router.get('/quiz', tutorLogin, (req, res) => {
  res.render('Tutor/Quiz', { tutor: true })
})
router.get('/studetails', tutorLogin, (req, res) => {
  res.render('Tutor/studetails', { tutor: true })
})
router.get('/editstud/:id', tutorLogin, async(req, res) => {
  let student=await tutorHelpers.getStudentDetails(req.params.id)
  res.render('Tutor/Edit-Student', { tutor: true,student })
})
router.post('/editstud/:id',tutorLogin,(req,res)=>{
  let id=req.params.id
  console.log(req.body);
  tutorHelpers.updateStudDetails(req.params.id,req.body).then(()=>{
    res.redirect('/tutor/students')
    if(req.files.Image)
    {
    let image=req.files.Image
    image.mv('./public/student-images/'+id+'.jpg')
    }
  })
}) 
router.get('/delete-student/:id',tutorLogin,(req,res)=>{
  let studId=req.params.id
  tutorHelpers.deleteStudent(studId).then((response)=>{
    res.redirect('/tutor/students')
  })
  })
module.exports = router;
