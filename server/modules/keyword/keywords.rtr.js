var express = require('express');
var keywordCtrl = require('./keywords.ctrl');
var authCtrl = require('../auth/auth.ctrl');
var userCtrl = require('../user/user.ctrl');
var commCtrl = require('../community/community.ctrl');

const router = express.Router()

// router.param('userId', userCtrl.userByID)
// router.param('community', commCtrl.communityByTitle)


router.route('')
  .post(
    authCtrl.requireSignin,
    keywordCtrl.create)
// .get(authCtsrl.requireSignin, postCtrl.list)

module.exports = router;
