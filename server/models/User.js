const mongoose = require('mongoose')

/**
 * User
 * @property { email } @type String
 */
const User = mongoose.model('User', {
  email: {
    type: String,
    reqired: true,
    trim: true,
    minlength: 6
  }
})

module.exports = { User }