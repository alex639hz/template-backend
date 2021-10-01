var express = require('express');
var userCtrl = require('../user/user.ctrl');
var authCtrl = require('../auth/auth.ctrl');
var commCtrl = require('../community/community.ctrl');

const router = express.Router()

router.param('userId', userCtrl.userByID)

router.route('')
  .post(
    authCtrl.requireSignin,
    authCtrl.isModerator,
    commCtrl.create) // create new community
  .get(
    authCtrl.requireSignin,
    commCtrl.list) // list communities

router.route('/:community')
  .post(
    authCtrl.requireSignin,
    commCtrl.membershipRequest) // membership request to community
  .patch(
    authCtrl.requireSignin,
    authCtrl.isModerator,
    // function (req, res, next) { userCtrl.userByID(req, res, next, req.auth._id) },
    commCtrl.approveMembershipRequest) // approve membership request to community


// router.route('/:userId')
//   .get(authCtrl.requireSignin, userCtrl.read)
//   .put(authCtrl.requireSignin, authCtrl.authorizedToUpdateProfile, userCtrl.update)
//   .delete(authCtrl.requireSignin, authCtrl.authorizedToUpdateProfile, userCtrl.remove)

module.exports = router;
