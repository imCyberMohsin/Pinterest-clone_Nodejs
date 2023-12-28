var express = require('express');
var router = express.Router();
const userModel = require('./users'); // user Model
const passport = require('passport');
const localStrategy = require('passport-local');
const upload = require('./multer'); // File Upload

passport.use(new localStrategy(userModel.authenticate()));

//? Home Route (Login Page Display) 
router.get('/', function (req, res, next) {
  res.render('index', { error: req.flash('error') });
});


//? Register Route 
router.get('/register', function (req, res, next) {
  res.render('register');
});

router.post('/register', function (req, res, next) {
  const data = new userModel({
    fullname: req.body.fullname,
    username: req.body.username,
    email: req.body.email,
  });
  console.log(data);

  userModel.register(data, req.body.password)
    .then(() => {
      passport.authenticate('local')(req, res, () => {
        res.redirect('/'); // Redirect to login page if register is successful
      })
    })
    .catch(err => {
      res.redirect('/');
    })
});

//? Login Route
router.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/',
  failureFlash: true,
}), (req, res, next) => {
})

//? Profile Route Display
router.get('/profile', isLoggedIn, async(req, res, next) => {
  const user = await userModel.findOne({ username: req.session.passport.user })
  res.render('profile', {user});
})

//? File Upload Route
router.post('/fileUpload', isLoggedIn, upload.single('image'), async function (req, res, next) {
  if (!req.file) {
    return res.status(400).send('No file uploaded')
  }
  const user = await userModel.findOne({ username: req.session.passport.user })
  user.profileImage = req.file.filename;
  await user.save();
  res.redirect('/profile');
});

//? Logout Route
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err) };
    res.redirect('/');  // logout to login page
  });
});

//? Add Post/Create Post Route
router.get('/add', async(req, res, next) => {
  const user = await userModel.findOne({ username: req.session.passport.user })
  res.render('add', {user})
});

//* Login Check Function 
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/');
}

module.exports = router;