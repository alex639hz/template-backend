var express = require('express');
var postCtrl = require('./post.ctrl');
var authCtrl = require('../auth/auth.ctrl');
var userCtrl = require('../user/user.ctrl');
var commCtrl = require('../community/community.ctrl');

const router = express.Router()

router.param('userId', userCtrl.userByID) //inject object into req.profile
router.param('community', commCtrl.communityByTitle) //inject title string into req.community

router.route('')
  .get(
    authCtrl.requireSignin,
    function (req, res, next) { userCtrl.userByID(req, res, next, req.auth._id) },
    postCtrl.listFeed)

router.route('/:community')
  .post(
    authCtrl.requireSignin,
    function (req, res, next) { userCtrl.userByID(req, res, next, req.auth._id) },  // injecting req.profile
    function (req, res, next) { commCtrl.isMember(req, res, next, req.community.title) },  // injecting req.profile
    //authCtrl.authorizedToPost, // validate user is a member of a community
    postCtrl.create)
  .get(
    authCtrl.requireSignin,
    function (req, res, next) { userCtrl.userByID(req, res, next, req.auth._id) },
    postCtrl.listByCommunity)

module.exports = router;
