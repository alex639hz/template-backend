const extend = require('lodash/extend');
const { Post } = require('./post.model');
const { Keyword } = require('../keyword/keyword.model');
const { Community } = require('../community/community.model');
const errorHandler = require('../../helpers/dbErrorHandler');
const Redis = require('ioredis');
const { keywordAlertTopic } = require('../../config/config').topicsNames

const redisPub = new Redis()


const postByID = async (req, res, next, id) => {
  try {
    let post = await Post.findById(id)
    if (!post)
      return res.status('400').json({
        error: "Post not found"
      })
    req.post = post
    next()
  } catch (err) {
    return res.status('400').json({
      error: "Could not retrieve post"
    })
  }
}

const create = async (req, res) => {

  req.body.post.community = req.community.title

  if (!req.body.post.summary) {
    req.body.post.summary = (req.body.post.body + '').substr(0, 5) + '...'
  }

  const post = new Post(req.body.post)

  try {
    await post.save()
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }

  let content = (post.body + '').split(' ')
  let keywords = []

  try {
    keywords = (await Keyword.find({ keyword: { $in: content } }).select("keyword").lean())
      .map(elem => elem.keyword)

    if (keywords.length) redisPub.publish(keywordAlertTopic, `${JSON.stringify(keywords)}`)

  } catch (err) {
    return res.status('400').json({
      error: "Could not retrieve keywords"
    })
  }



  return res.status(201).json({
    message: "Post created successfully!",
    keywords,
    post
  })

}

const read = (req, res) => {
  req.profile.hashed_password = undefined
  req.profile.salt = undefined
  return res.json(req.profile)
}

/** list posts 
 *  
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const list = async (req, res) => {

  const communityTitle = req.community.title
  const communityMembers = req.community.members

  try {
    let posts = await Post.find({}).select('title summary body community likes author status')
    res.json({
      community: req.community,
      posts,
    })
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const update = async (req, res) => {
  try {
    let post = req.profile
    post = extend(post, req.body)
    post.updated = Date.now()
    await post.save()
    post.hashed_password = undefined
    post.salt = undefined
    res.json(post)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const remove = async (req, res) => {
  try {
    let post = req.profile
    let deletedUser = await post.remove()
    deletedUser.hashed_password = undefined
    deletedUser.salt = undefined
    res.json(deletedUser)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}



module.exports = {
  create,
  postByID,
  read,
  list,
  remove,
  update,
}
