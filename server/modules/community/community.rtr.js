var express = require('express');
var userCtrl = require('../user/user.ctrl');
var authCtrl = require('../auth/auth.ctrl');
var commCtrl = require('../community/community.ctrl');

const router = express.Router()

router.param('userId', userCtrl.userByID)
router.param('community', commCtrl.communityByTitle) //inject title string into req.community

router.route('')
  .post(
    authCtrl.requireSignin,
    authCtrl.isModerator,
    commCtrl.create) // create new community
  .get(
    authCtrl.requireSignin,
    commCtrl.list) // list communities

router.route('/member-request/:community')
  .patch(
    authCtrl.requireSignin,
    commCtrl.requestMembership) // membership request to community


router.route('/member-approve/:community')
  .patch(
    authCtrl.requireSignin,
    authCtrl.isModerator,
    // function (req, res, next) { userCtrl.userByID(req, res, next, req.auth._id) },
    commCtrl.approveMembership) // approve membership request to community


// router.route('/:userId')
//   .get(authCtrl.requireSignin, userCtrl.read)
//   .put(authCtrl.requireSignin, authCtrl.authorizedToUpdateProfile, userCtrl.update)
//   .delete(authCtrl.requireSignin, authCtrl.authorizedToUpdateProfile, userCtrl.remove)

module.exports = router;
