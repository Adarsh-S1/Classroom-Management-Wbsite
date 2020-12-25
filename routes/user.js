var express = require('express');
const studentHelpers = require('../helpers/studentHelpers');
var router = express.Router();
var request = require('request');
const userHelpers = require('../helpers/studentHelpers');
const tutorHelpers = require('../helpers/tutorHelpers');
const { response } = require('express');
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
router.get('/student', studentLogin, async(req, res) => {
  let attendance=await studentHelpers.attendhome(req.session.student._id)
  let stud=req.session.student
  let studo=req.session.phone
  tutorHelpers.getEvents().then((events) => {
    res.render('Student/Stud-home',{stud,studo,events,attendance})
  })
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
      var status = response.body.substring(11, 17);
      if(status=="failed")
      {
        req.session.studentOtpInvalid = "Invalid OTP"
        res.redirect('/otplogin')
      }else{
        req.session.loggedstudentIn = true
        res.redirect('/student')
      }
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
router.get('/notes', studentLogin, (req, res) => {
  studentHelpers.Notes().then((doc)=>{
    res.render('Student/notes',{student:true,doc})
    })
})
router.get('/video', studentLogin, (req, res) => {
    studentHelpers.videoNotes().then((video)=>{
      res.render('Student/video',{student:true,video,stud:req.session.student})
    })
})
router.get('/uvideo', studentLogin, (req, res) => {
  studentHelpers.utubeNotes().then((uvideo)=>{
    res.render('Student/Utubevid',{student:true,uvideo})
  })
})
router.get('/assignments', studentLogin, (req, res) => {
  studentHelpers.viewAssign().then((assign)=>{
    res.render('Student/assignments',{student:true,assign})
  })
})
router.get('/assignments/:id',studentLogin,(req,res)=>{
  let assignId=req.params.id
  studentHelpers.subAssign(assignId).then((response)=>{
    res.render('Student/subassign',{student:true,assignId})
  })
  }),
  router.post('/assignments/:id',(req,res)=>{
    studentHelpers.submitAssignment(req.params.id,req.session.student._id).then((response)=>{
      let file=req.files.file
      file.mv('./public/studentAssignment/'+response+'.pdf',(err)=>{
      if(!err){
        res.redirect('/assignments')
       }else{
         console.log(err);
       }
     })
    })
  }),
  router.post('/attendvideo',studentLogin,(req,res)=>{
  studentHelpers.attendance(req.body,req.session.student._id).then((response)=>{
res.json({status:true})
  })
  })
  router.get('/attendance',studentLogin,async(req,res)=>{
    let attendance = await studentHelpers.getfullAttendance(req.session.student._id)
    res.render("Student/attendance",{student:true,attendance})
  })
  router.get('/announcement',studentLogin,(req,res)=>{
    tutorHelpers.getAnnouncements().then((announcement) => {
    res.render("Student/announcement",{student:true,announcement})
    })
  })
  router.get('/announcement/:id',studentLogin,(req,res)=>{
    studentHelpers.getAnnounceDetails(req.params.id).then((announcement) => {
      const fs = require('fs')

      let path = './public/Announcements/pdf/'+announcement._id+".pdf"
      let path1 = './public/Announcements/photo/'+announcement._id+".jpg"
        if (fs.existsSync(path) && fs.existsSync(path1)) {
          let pathimg="../Announcements/photo/"+announcement._id+".jpg"
          let pathpdf="../Notes/open-document.png"
          res.render("Student/announcedetails",{student:true,announcement,pathimg,pathpdf})
        }else if(fs.existsSync(path) && !fs.existsSync(path1)){
          let pathpdf="../Notes/open-document.png"
          res.render("Student/announcedetails",{student:true,announcement,pathpdf})
        }else if(!fs.existsSync(path) && fs.existsSync(path1)){
          let pathimg="../Announcements/photo/"+announcement._id+".jpg"
          res.render("Student/announcedetails",{student:true,announcement,pathimg})
        }else if(!fs.existsSync(path) && !fs.existsSync(path1)){
          res.render("Student/announcedetails",{student:true,announcement})
        }
    })
  })
  router.get('/gallery',studentLogin,(req,res)=>{
    studentHelpers.getPhotos().then((photos) => {
      res.render("Student/gallery",{student:true,photos})
    })
  })
  router.get('/event/:id',studentLogin,(req,res)=>{
    studentHelpers.getEventDetails(req.params.id,req.session.student._id).then((event) => {
      const fs = require('fs')
      let path = './public/Events/pdf/'+event._id+".pdf"
      let path1 = './public/Events/photo/'+event._id+".jpg"
      if(event.Type=="Free"){
        if (fs.existsSync(path) && fs.existsSync(path1)) {
          let pathimg="/Events/photo/"+event._id+".jpg"
          let pathpdf="/Notes/open-document.png"
          res.render("Student/eventfree",{student:true,event,pathimg,pathpdf})
        }else if(fs.existsSync(path) && !fs.existsSync(path1)){
          let pathpdf="/Notes/open-document.png"
          res.render("Student/eventfree",{student:true,event,pathpdf})
        }else if(!fs.existsSync(path) && fs.existsSync(path1)){
          let pathimg="/Events/photo/"+event._id+".jpg"
          res.render("Student/eventfree",{student:true,event,pathimg})
        }else if(!fs.existsSync(path) && !fs.existsSync(path1)){
          res.render("Student/eventfree",{student:true,event})
        }
      }else if(event.Type=="Paid"){
        if (fs.existsSync(path) && fs.existsSync(path1)) {
          let pathimg="/Events/photo/"+event._id+".jpg"
          let pathpdf="/Notes/open-document.png"
          res.render("Student/eventpaid",{student:true,event,pathimg,pathpdf,stud:req.session.student})
        }else if(fs.existsSync(path) && !fs.existsSync(path1)){
          let pathpdf="/Notes/open-document.png"
          res.render("Student/eventpaid",{student:true,event,pathpdf,stud:req.session.student})
        }else if(!fs.existsSync(path) && fs.existsSync(path1)){
          let pathimg="/Events/photo/"+event._id+".jpg"
          res.render("Student/eventpaid",{student:true,event,pathimg,stud:req.session.student})
        }else if(!fs.existsSync(path) && !fs.existsSync(path1)){
          res.render("Student/eventpaid",{student:true,event,stud:req.session.student})
        }
      }
    })
  })
  router.get('/success',studentLogin,(req,res)=>{
      res.render("Student/success",{student:true})
  })
  router.post('/payevent',studentLogin,(req,res)=>{
   studentHelpers.generateRazorPay(req.body,req.body.amount).then((response)=>{
    res.json(response)
   })
  })
  router.post('/verify-payment',(req,res)=>{
    console.log(req.body);
    userHelpers.verifyPayment(req.body).then(()=>{
      userHelpers.eventBook(req.body['order[receipt]'],req.session.student._id).then(()=>{
        console.log("Payment Success");
        res.json({status:true})
      })
    }).catch((err)=>{
      console.log(err);
      res.json({status:false,errMsg:''})
    })
  })
module.exports = router;
