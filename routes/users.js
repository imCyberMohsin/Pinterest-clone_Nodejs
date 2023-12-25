const mongoose = require('mongoose')
const plm = require('passport-local-mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/PinterestCloneDB')

const userSchema = mongoose.Schema({
  fullname: String,
  username: String,
  email: String,
  password: String,
  profileImage: String,
  boards: {
    type: Array,
    default: [],
  }
});

userSchema.plugin(plm);

module.exports = mongoose.model('user', userSchema);