var express = require('express');
var authCtrl = require('./auth.ctrl');
// var url = require('url');
// var authCtrl = express.Router();

// import express from 'express'
// import authCtrl from '../ctrl/auth.ctrl'

const router = express.Router()

router.route('/secured-api-example')
  .get(authCtrl.requireSignin, (req, res) => {
    res.json({
      auth: req.auth,
      profile: req.profile
    })
  })

router.route('/signin')
  .post(authCtrl.signin)

router.route('/signout')
  .get(authCtrl.signout)

module.exports = router;
