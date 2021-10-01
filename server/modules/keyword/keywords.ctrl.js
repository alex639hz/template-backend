const extend = require('lodash/extend');
// const { Post } = require('./post.model');
const { Keyword } = require('./keyword.model');
const { Community } = require('../community/community.model');
const errorHandler = require('../../helpers/dbErrorHandler');

const create = async (req, res) => {


  const keyword = new Keyword(req.body)

  try {
    await keyword.save()

    return res.status(201).json({
      message: "Keyword created successfully!"
    })

  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }

}


module.exports = {
  create,

}
