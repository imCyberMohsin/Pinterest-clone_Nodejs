var express = require('express');
var router = express.Router();
const userModel = require('./users'); // user Model
const postModel = require('./posts'); // post Model
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

//? Profile Display
router.get('/profile', isLoggedIn, async (req, res, next) => {
  const user =
    await userModel
      .findOne({ username: req.session.passport.user })
      .populate('posts')
  res.render('profile', { user });
})

//? Show Pins 
router.get('/show/posts', isLoggedIn, async (req, res, next) => {
  const user =
    await userModel
      .findOne({ username: req.session.passport.user })
      .populate('posts')
  res.render('show', { user });
})

//? Feed - Display All Posts 
router.get('/feed', isLoggedIn, async (req, res, next) => {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const posts = await postModel.find().populate('user');
  
  res.render('feed', { user, posts });
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
router.get('/add', isLoggedIn, async (req, res, next) => {
  const user = await userModel.findOne({ username: req.session.passport.user })
  res.render('add', { user });
});

router.post('/createPost', isLoggedIn, upload.single('postimage'), async (req, res, next) => {
  const user = await userModel.findOne({ username: req.session.passport.user })
  const post = await postModel.create({
    user: user._id,
    title: req.body.title,
    description: req.body.description,
    image: req.file.filename,
  })
  // console.log(post);
  user.posts.push(post._id);
  await user.save();
  res.redirect('/profile');
});

//* Login Check Function 
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/');
}

module.exports = router;