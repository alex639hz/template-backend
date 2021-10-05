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
  // req.body.post.country = req.profile.country;

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
 * 
 * Post A author is from the same country as the requesting user, post B isn’t. A is ranked higher then B (returned first in the array) even if B has a higher weighted score
 * Post A and B authors are from the same country as the requesting user. The post with the highest weighted score is returned first
 * Post A and B authors are not from the same country as the requesting user. The post with the highest weighted score is returned first 
 * No posts are found from one of the users communities - the feed is empty (empty array response)
 * 
 * query-1 find({community,country})
 * query-1 find({community,country : {$ne: req.profile.country}})

 * @param {*} req 
 * @param {*} res 
 * @returns 
 */


const listByCommunity = async (req, res) => {
  const myArr = await Post.aggregate(
    [
      { $match: { community: req.community.title } },
      { $sort: { "score": -1 } },
      {
        $group: {
          _id: { country: "$country" },
          docs: {
            $push: {
              title: "$title",
              body: "$body",
              score: "$score",
              country: "$country",
              community: req.community.title
            }
          },
        }
      },

    ]
  )

  // {
  //   localPosts: myArr['0'],
  //     nonLocalPosts: myArr['1'],
  // }

  res.json([
    ...myArr['0'].docs,
    ...myArr['1'].docs,
  ])

}

const listFeed = async (req, res) => {

  const result = await Post.aggregate([
    {
      $match: {
        community: { $in: req.profile.communities },
        status: "approved",
      }
    },
    {
      $facet: {
        "local": [
          { $match: { country: req.profile.country } },
          { $sort: { "score": -1 } },
        ],
        "nonLocal": [
          { $match: { country: { $ne: req.profile.country } } },
          { $sort: { "score": -1 } },
        ],
      },
    }
  ])

  res.json(
    [...result[0].local, ...result[0].nonLocal],
  )

}

const listFeed_v1 = async (req, res) => {

  console.log('456456', req.profile.communities)

  const myArr = await Post.aggregate(
    [
      { $match: { community: req.community.title } },
      // { $match: { community: { $in: req.profile.communities } } },
      { $sort: { "score": -1 } },
      {
        $group: {
          _id: { country: "$country" },
          docs: {
            $push: {
              title: "$title",
              body: "$body",
              score: "$score",
              country: "$country",
              community: req.community.title
            }
          },
        }
      },

    ]
  )

  res.json([
    ...myArr['0'].docs,
    ...myArr['1'].docs,
  ])

}


const list_ORG = async (req, res) => {

  const { community } = req;
  let arr = []
  const pageSize = 2;
  const pageIndex = 0;
  // console.log('server->', community)
  arr = await Post.aggregate(
    [
      // { $sort: { country: -1, posts: 1 } }
      { $group: { _id: "$country" } },

    ]
  )

  arr = await Post.aggregate()

  try {
    arr = await Post.find(
      { country: req.profile.country },
      {
        title: true,
        summary: true,
        body: true,
        country: true,
        likes: true
      },
      {
        lean: true,
      },
    )
      .limit(pageSize)
      .skip(pageSize * pageSize)
      .sort({ score: -1 })
      .select('title summary body community likes author status')

    if (!localPosts.length < pageSize) {
      let nonLocalPosts = await Post.find(
        { country: { $ne: req.profile.country } },
        {
          title: true,
          summary: true,
          body: true,
          country: true,
          likes: true
        },
        {
          lean: true,
        },
      )
        .limit(pageSize - localPosts.length)
        .skip(pageSize * pageSize)
        .sort({ score: -1 })
        .select('title summary body community likes author status')

    }
    // else (){}

    arr = [...localPosts, ...nonLocalPosts]

    let nonLocalPosts = await Post.find(
      { country: { $ne: req.profile.country } },
      {
        title: true,
        summary: true,
        body: true,
        country: true,
        likes: true
      },
      { lean: true },
    ).select('title summary body community likes author status')

    // arr = [...localPosts, ...nonLocalPosts]

    // console.log(
    //   '99987-->',
    //   arr
    // )

    res.json({
      community: req.community,
      arr,
    })


  } catch (err) {
    console.log(err)
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
  update,
  remove,
  listByCommunity,
  listFeed,
}
