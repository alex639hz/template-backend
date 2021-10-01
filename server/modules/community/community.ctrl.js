const request = require('request');
const extend = require('lodash/extend');
const config = require('../../config/config');
const { Community } = require('./community.model');
const errorHandler = require('../../helpers/dbErrorHandler');

const create = async (req, res) => {
  const community = new Community(req.body)
  try {
    await community.save()
    return res.status(201).json({
      message: "Successfully signed up!"
    })
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

/** inject community document into req.community
 * 
 */
const communityByTitle = async (req, res, next, title) => {
  try {
    req.community = await Community.findOne({ title })
    if (!req.community)
      return res.status('400').json({
        error: "Community not found"
      })
    next()
  } catch (err) {
    return res.status('400').json({
      error: "Could not retrieve community"
    })
  }
}

const read = (req, res) => {
  req.profile.hashed_password = undefined
  req.profile.salt = undefined
  return res.json(req.profile)
}

const list = async (req, res) => {
  try {
    let communities = await Community.find().select('title')
    res.json(communities)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const update = async (req, res) => {
  try {
    let community = req.profile
    community = extend(community, req.body)
    community.updated = Date.now()
    await community.save()
    community.hashed_password = undefined
    community.salt = undefined
    res.json(community)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const remove = async (req, res) => {
  try {
    let community = req.profile
    let deletedCommunity = await community.remove()
    deletedCommunity.hashed_password = undefined
    deletedCommunity.salt = undefined
    res.json(deletedCommunity)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}



const membershipRequest = async (req, res) => {
  try {
    let communities = await Community.find().select('title')
    res.json(communities)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const approveMembershipRequest = async (req, res) => {
  try {
    let communities = await Community.find().select('title')
    res.json(communities)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}


module.exports = {
  create,
  communityByTitle,
  read,
  list,
  remove,
  update,
  membershipRequest,
  approveMembershipRequest,
}
