var express = require('express');
var router = express.Router();
const tutorHelpers = require('../helpers/tutorHelpers');
router.get('/', (req, res) => {
    res.render('Tutor/tutorlogin')
});
router.post('/tutor', (req, res) => {
    tutorHelpers.doSignup(req.body).then((response) => {
        console.log(response,"----------------------");
        res.redirect('/tutorhome')
    })
})
router.get('/tutorhome', (req, res) => {
    res.render('Tutor/tutor-home')
});
module.exports = router;
