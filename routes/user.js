var express = require('express');
var router = express.Router();

router.get('/',(req,res)=>{
  res.render('home')
});
router.get('/login', (req, res) => {
  res.render('Student/login')
})
router.get('/student', (req, res) => {

})

module.exports = router;
