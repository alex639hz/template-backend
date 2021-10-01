const Redis = require('ioredis')
const config = require('../config/config')
const { User } = require('../modules/user/user.model');



const redisSub = new Redis()
redisSub.subscribe(config.topicsNames.keywordAlertTopic)
redisSub.on('message', async (channel, msg) => {
  // const users = await User.find({ role: { $in: ['moderator', 'super'] } }, 'email')

  console.log(`email::---- channel:${channel} keywords:${msg}`)
  // const moderators = await User.find({}).select("email").exec().catch(err => console.log('err:', err))

  // let users = await User.find().select('name email groups')
  // const users = await User.find().select("email")
  // let users = await User.find().exec;
  // console.log('users: ', users[0])
  // console.log(`email::${elem} channel:${channel} keyword:${msg}`)
  // moderators.map(moderator =>
  //   console.log(moderator.email)
  // )

})

// function sendEmail(to = [], subject = '', body = '',) {
//   to.map(destination => console.log(`email ${channel}: ${msg}`))
// }