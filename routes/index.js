var express = require('express');
var router = express.Router();

//? Home Route (New User Register Page) 
router.get('/', function(req, res, next) {
  res.render('index');
});

//? Register Route 
router.get('/register', function(req, res, next) {
  res.render('register');
});
router.post('/register', function(req, res, next) {
  res.render('index');
});

module.exports = router;