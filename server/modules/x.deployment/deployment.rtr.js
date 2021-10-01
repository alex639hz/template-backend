let express = require('express');
let deploymentCtrl = require('./deployment.ctrl');
let { imageByID } = require('../image/image.ctrl');
let authCtrl = require('../auth/auth.ctrl');

const router = express.Router()

router.param('imageId', imageByID)

router.route('')
  .get(authCtrl.requireSignin, deploymentCtrl.list)

router.route('/:imageId')
  .post(authCtrl.requireSignin, deploymentCtrl.create)


router.route('/count')
  .get(authCtrl.requireSignin, deploymentCtrl.count)

router.route('/combi')
  .get(authCtrl.requireSignin, deploymentCtrl.combi)


module.exports = router;
