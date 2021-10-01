let express = require('express');
let imageCtrl = require('./image.ctrl');
let authCtrl = require('../auth/auth.ctrl');

const router = express.Router()

router.param('imageId', imageCtrl.imageByID)

router.route('')
  .post(authCtrl.requireSignin, imageCtrl.create)
  .get(authCtrl.requireSignin, imageCtrl.list)

router.route('/:imageId')
  .get(authCtrl.requireSignin, imageCtrl.read)

router.route('/combination')
  .get(authCtrl.requireSignin, imageCtrl.readCombination)

module.exports = router;
