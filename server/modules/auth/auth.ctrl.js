const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const config = require('../../config/config');
const { User } = require('../user/user.model');
const { Community } = require('../community/community.model');
// const Acc = require('../models/account.model');

const signin = async (req, res) => {

  try {
    let user = await User.findOne({
      "email": req.body.email
    })

    if (!user)
      return res.status('401').json({
        error: "User not found"
      })

    if (!user.authenticate(req.body.password)) {
      return res.status('401').send({
        error: "Email and password don't match."
      })
    }
    /**
     * 'payload' injected into Bearer header 
     *  cookie is injected into req.auth by requireSignin middleware
     */
    const payload = {
      _id: user._id
    }
    const token = jwt.sign(payload, config.jwtSecret)

    res.cookie("t", token, {
      expire: new Date() + 9999
    })

    return res.status('200').json({
      token,
      _id: user._id
    })
  } catch (err) {
    return res.status('401').json({
      error: "Could not sign in because " + err.message
    })
  }
}

const signout = (req, res) => {
  const cookie = req.headers.cookie || 'No Cookie Was Found'

  res.clearCookie("t")
  return res.status('200').json({
    message: "signed out",
    cookie
  })
}

/**
 * compare Bearer Token to jwt-secret 
 * and inject the payload object into req.auth  
 */
const requireSignin = expressJwt({
  secret: config.jwtSecret,
  algorithms: ['HS256'],
  userProperty: 'auth'
})

const authorizedToUpdateProfile = (req, res, next) => {
  const authorized = req.profile && req.auth && req.profile._id == req.auth._id
  if (!(authorized)) {
    return res.status('403').json({
      error: "User is not authorized"
    })
  }
  next()
}

const authorizedToPost = async (req, res, next) => {

  const members = req.community.members
  const authorized = members.indexOf(req.body.post.community) >= 0

  if (!(authorized)) {
    return res.status('403').json({
      error: "User not authorized to post: must be a community member."

    })
  }
  next()

}

const authorizedToPost = async (req, res, next) => {
  next()
}

module.exports = {
  signin,
  signout,
  requireSignin,
  authorizedToUpdateProfile,
  authorizedToPost,
  isModerator,
  // userByAuth,
}
