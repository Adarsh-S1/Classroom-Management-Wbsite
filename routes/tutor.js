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
  tutorHelpers.tutorProfileDetails().then((teacher) => {
    tutorHelpers.getAnnouncements().then((announcement) => {
      res.render('Tutor/tutor-home', { teacher, announcement })
    })
  })
});
router.get('/login', (req, res) => {
  if (req.session.loggedTutorIn) {
    res.redirect('/')
  }
  else {
    res.render('Tutor/tutorlogin', { "loginErr": req.session.tutorLoginErr })
    req.session.tutorLoginErr = false

  }

});
router.post('/login', (req, res) => {
  tutorHelpers.doTutorLogin(req.body).then((response) => {
    if (response.status) {
      req.session.tutor = response.tutor
      req.session.loggedTutorIn = true
      res.redirect('/tutor')
    } else {
      req.session.tutorLoginErr = "Invalid Username or Password"
      res.redirect('/tutor/login')
    }
  })
});
router.get('/tutorout', function (req, res) {
  req.session.destroy()
  res.redirect('/tutor/login')
})
router.get('/students', tutorLogin, function (req, res) {
  tutorHelpers.getAllStudents().then((students) => {
    res.render('Tutor/studtable', { tutor: true, students })
  })
})
router.get('/profile', tutorLogin, function (req, res) {
  tutorHelpers.tutorProfileDetails().then((teacher) => {
    console.log(teacher);
    res.render('Tutor/profile', { tutor: true, teacher })
  })
})
router.post('/profile', (req, res) => {
  tutorHelpers.tutorProfile(req.body, (id) => {
    let image = req.files.Tutimage
    image.mv('./public/Tutor-image/' + id + '.jpg', (err) => {
      if (!err) {
        res.redirect('/tutor/profile')
      } else {
        console.log(err);
      }
    })
  })
})
router.post('/editutor/:id', tutorLogin, (req, res) => {
  let id = req.params.id
  tutorHelpers.updateTutDetails(req.params.id, req.body).then(() => {
    res.redirect('/tutor/profile')
    if (req.files.Tutimage) {
      let image = req.files.Tutimage
      image.mv('./public/Tutor-image/' + id + '.jpg')
    }
  })
})
router.get('/attendance', tutorLogin, async (req, res) => {
  let datecheck = new Date().getDate() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getFullYear()
  let attendance = await tutorHelpers.getAttendance()
  res.render('Tutor/Attendance', { tutor: true, attendance, datecheck })
})
router.get('/attendate/:id', tutorLogin, async (req, res) => {
  console.log(req.params.id,"________________________________________");
  let attendance = await tutorHelpers.getAttendDate(req.params.id)
  let date=req.params.id
  res.render('Tutor/attend-date', { tutor: true, attendance,date})
})
router.get('/assignments', tutorLogin, (req, res) => {
  tutorHelpers.viewAssign().then((assign) => {
    res.render('Tutor/assignment', { tutor: true, assign })
  })
})
router.post('/assignments', (req, res) => {
  tutorHelpers.addAssign(req.body).then((response) => {
    let file = req.files.file
    file.mv('./public/Assignments/' + response + '.pdf', (err) => {
      if (!err) {
        res.redirect('/tutor/assignments')
      } else {
        console.log(err);
      }
    })
  })
})
router.get('/delete-assign/:id', tutorLogin, (req, res) => {
  let assignId = req.params.id
  tutorHelpers.deleteAssign(assignId).then((response) => {
    res.redirect('/tutor/assignments')
  })
})
router.get('/notes', tutorLogin, (req, res) => {
  res.render('Tutor/notes', { tutor: true })
})
router.get('/announcement', tutorLogin, (req, res) => {
  res.render('Tutor/announcement', { tutor: true })
})
router.post('/announcement', (req, res) => {
  var ext
  if(req.body.im==""){
  ext = req.files.file.name.substring(req.files.file.name.length - 3, req.files.file.name.length);
}else{
  ext=""
}
  tutorHelpers.addAnnouncement(ext, req.body, (id) => {
    var filetype = req.files.file.name.substring(req.files.file.name.length - 3, req.files.file.name.length);
    if (filetype == "jpg") {
      let image = req.files.file
      image.mv('./public/Announcements/' + id + '.jpg', (err) => {
        if (!err) {
          res.redirect('/tutor/announcement')
        } else {
          console.log(err);
        }
      })
    }
    if (filetype == "pdf") {
      let image = req.files.file
      image.mv('./public/Announcements/' + id + '.pdf', (err) => {
        if (!err) {
          res.redirect('/tutor/announcement')
        } else {
          console.log(err);
        }
      })
    }
    if (filetype == "mp4") {
      let image = req.files.file
      image.mv('./public/Announcements/' + id + '.mp4', (err) => {
        if (!err) {
          res.redirect('/tutor/announcement')
        } else {
          console.log(err);
        }
      })
    }
  })
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
router.post('/addstudent', (req, res) => {
  tutorHelpers.addStudent(req.body, (id) => {
    let image = req.files.Image
    image.mv('./public/student-images/' + id + '.jpg', (err) => {
      if (!err) {
        res.redirect('/tutor/addstudent')
      } else {
        console.log(err);
      }
    })
  })
})
router.get('/quiz', tutorLogin, (req, res) => {
  res.render('Tutor/Quiz', { tutor: true })
})
router.get('/studetails/:id', tutorLogin, async (req, res) => {
  let attendance = await tutorHelpers.getstudAttend(req.params.id)
  let assignments = await tutorHelpers.getAssignments(req.params.id)
  res.render('Tutor/studetails', { assignments, tutor: true, attendance })
})
router.get('/editstud/:id', tutorLogin, async (req, res) => {
  let student = await tutorHelpers.getStudentDetails(req.params.id)
  res.render('Tutor/Edit-Student', { tutor: true, student })
})
router.post('/editstud/:id', tutorLogin, (req, res) => {
  let id = req.params.id
  tutorHelpers.updateStudDetails(req.params.id, req.body).then(() => {
    res.redirect('/tutor/students')
    if (req.files.Image) {
      let image = req.files.Image
      image.mv('./public/student-images/' + id + '.jpg')
    }
  })
})
router.get('/delete-student/:id', tutorLogin, (req, res) => {
  let studId = req.params.id
  tutorHelpers.deleteStudent(studId).then((response) => {
    res.redirect('/tutor/students')
  })
})
router.get('/doc', tutorLogin, (req, res) => {
  res.render('Tutor/doc', { tutor: true })
})
router.post('/doc', (req, res) => {
  tutorHelpers.docNotes(req.body, (id) => {
    console.log(req.body);
    let image = req.files.file
    image.mv('./public/Notes/doc/' + id + '.pdf', (err) => {
      if (!err) {
        res.redirect('/tutor/notes')
      } else {
        console.log(err);
      }
    })
  })
})
router.get('/vid', tutorLogin, (req, res) => {
  let date= new Date().getDate() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getFullYear()
  res.render('Tutor/video', { tutor: true ,date})
})
router.post('/vid', (req, res) => {
  tutorHelpers.vidNotes(req.body, (id) => {
    console.log(req.body);
    let video = req.files.file
    video.mv('./public/Notes/videos/' + id + '.mp4', (err) => {
      if (!err) {
        res.redirect('/tutor/notes')
      } else {
        console.log(err);
      }
    })
  })
})
router.get('/uvid', tutorLogin, (req, res) => {
  res.render('Tutor/Utubevid', { tutor: true })
})
router.post('/uvid', (req, res) => {
  tutorHelpers.uvidNotes(req.body).then((response) => {
    res.redirect('/tutor/notes')
  })
})
router.post('/test', (req, res) => {
})
module.exports = router;
