var express = require('express');
var postCtrl = require('./post.ctrl');
var authCtrl = require('../auth/auth.ctrl');
var userCtrl = require('../user/user.ctrl');
var commCtrl = require('../community/community.ctrl');

const router = express.Router()

router.param('userId', userCtrl.userByID) //inject object into req.profile
router.param('community', commCtrl.communityByTitle) //inject title string into req.community
router.param('postId', postCtrl.postByID) //inject title string into req.community

router.route('')
  .get(
    authCtrl.requireSignin,
    authCtrl.injectUserProfile,//    function (req, res, next) { userCtrl.userByID(req, res, next, req.auth._id) },
    postCtrl.listFeed)

router.route('') // TODO
  .post(
    authCtrl.requireSignin,
    authCtrl.injectUserProfile,   // function (req, res, next) { userCtrl.userByID(req, res, next, req.auth._id) },  // injecting req.profiles
    //TODO replace temprary API middlewares 
    function (req, res, next) { commCtrl.isMember(req, res, next, req.body.post.community) },  // injecting req.profile
    postCtrl.create
  )
//TODO optional enable listByCommunity
// .get(enable 
//   authCtrl.requireSignin,
//   function (req, res, next) { userCtrl.userByID(req, res, next, req.auth._id) },
//   postCtrl.listByCommunity)

router.route('/:postId/approve')
  .patch(
    authCtrl.requireSignin,
    authCtrl.injectUserProfile,
    authCtrl.isModerator,
    postCtrl.approvePost)


module.exports = router;
