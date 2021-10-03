const extend = require('lodash/extend');
const { Post } = require('./post.model');
const { Keyword } = require('../keyword/keyword.model');
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
  req.body.post.country = req.profile.country;

  const post = new Post(req.body.post)

  try { await post.save() }
  catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }

  let content = (post.body + '').split(' ')
  let keywords = []

  try {
    keywords = (await Keyword.find({ keyword: { $in: content } })
      .select("keyword")
      .lean()
    ).map(elem => elem.keyword)

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
 * DONE: A section In the app where the user sees posts which are “recommended” to him. Ranked by “relevance” score - descending 
 * 
 * DONE: The Feed should only include posts which belong to one of the requesting user’s communities
 * 
 * The algorithm for this feature should rank posts where the post author is from the same country first, then based on the following weighted score - 80% “like” count + 20% post length.
 * 
 * Post A author is from the same country as the requesting user, post B isn’t. A is ranked higher then B (returned first in the array) even if B has a higher weighted score
 * Post A and B authors are from the same country as the requesting user. The post with the highest weighted score is returned first
 * Post A and B authors are not from the same country as the requesting user. The post with the highest weighted score is returned first

No posts are found from one of the users communities - the feed is empty (empty array response)

 

 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const list = async (req, res) => {

  const { community } = req;

  // console.log('server->', community)

  try {
    let posts = await Post.find(
      { country: req.profile.country },
      {},
      {},
    )
      .select('title summary body community likes author status')
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
