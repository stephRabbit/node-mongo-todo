const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const R = require('ramda')

/**
 *  {
 *    email: 'user@user.com',
 *    password: '27293b8c72934729fhfhjwkfhry239',
 *    tokens: [{
 *      access: 'auth',
 *      token: '2i0f2032039jf2309fu2903f0j203j'
 *    }]
 *  }
 */

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
})

// Instance methods
UserSchema.methods.toJSON = function() {
  const user = this
  const userObject = user.toObject()
  return R.pick(['_id', 'email'], userObject)
}

UserSchema.methods.generateAuthToken = function() {
  var user = this
  var access = 'auth'
  var token = jwt.sign({ _id: user._id.toHexString(), access }, 'abc123').toString()

  user.tokens.push({ access, token })

  return user.save().then(() => {
    return token
  })
}


/**
 * User
 * @property { email } @type String
 * @property { password } @type String
 * @property { token } @type Array
 */
var User = mongoose.model('User', UserSchema);

module.exports = { User }
