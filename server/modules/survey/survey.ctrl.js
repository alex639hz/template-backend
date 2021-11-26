const extend = require('lodash/extend');
const { SurveyCollection } = require('./survey.model');
const errorHandler = require('../../helpers/dbErrorHandler');

const create = async (req, res) => {
  // TODO scheme check 
  const survey = new SurveyCollection(req.body)
  try {
    await survey.save()
    return res.status(201).json({
      surveyId: survey.surveyId,
      message: "Successfully signed up!",
    })
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

/** inject survey document into req.community
 * 
 */
const surveyByID = async (req, res, next, id) => {
  try {
    let survey = await SurveyCollection.findById(id).lean()
    if (!survey)
      return res.status('400').json({
        error: "survey not found"
      })
    req.profile = { ...survey }
    next()
    return { ...req.profile }
  } catch (err) {
    return res.status('400').json({
      error: "Could not retrieve survey"
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
    let surveys = await SurveyCollection.find().select('email groups')
    res.json(surveys)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const update = async (req, res) => {
  try {
    let survey = req.profile
    survey = extend(survey, req.body)
    survey.updated = Date.now()
    await survey.save()
    survey.hashed_password = undefined
    survey.salt = undefined
    res.json(survey)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const remove = async (req, res) => {
  try {
    let survey = req.profile
    let deletedsurvey = await survey.remove()
    deletedsurvey.hashed_password = undefined
    deletedsurvey.salt = undefined
    res.json(deletedsurvey)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}


const answer = async (req, res) => {
  const survey = new SurveyCollection(req.body)
  try {
    await survey.save()
    return res.status(201).json({
      _id: survey._id,
      message: "Successfully signed up!",
    })
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

module.exports = {
  answer,
  create,
  surveyByID: surveyByID,
  read,
  list,
  remove,
  update,
}
