const mongoose = require('mongoose');
const crypto = require('crypto');
const config = require('../../config/config');

const AnswerSchema = new mongoose.Schema({

  questionId: { type: mongoose.Schema.ObjectId, ref: 'Question' },

  answer: {
    type: "", // type of the answer i.e. text, number, single-options, multi-option, email etc.
    content: {}
  },

}, { timestamps: true })


const QuestionSchema = new mongoose.Schema({

  bodyType: { // question content view - how the question should be displayed to user
    type: String,
    enum: [
      'texts',
      'images',
      'videos',
    ],
    default: 'texts'
  },

  bodyContent: {}, // question content to display to user

  answerType: { // answers type - how the question should be displayed to user
    type: String,
    enum: [
      'numeric',
      'text',
      'single-option',
      'multi-option',
    ],
    default: 'texts'
  },

  answersContent: {}, //answers content to display to user

}, { timestamps: true })


const SurveySchema = new mongoose.Schema({

  questions: [QuestionSchema],
  activateAt: Date, // absolute timestamp when survey is voteable when first question answered
  disactivateAt: Date, // absolute timestamp set when last question answered
  surveyId: String,
  ownerId: String,

}, { timestamps: true })

module.exports = {
  SurveySchema,
  SurveyCollection: mongoose.model('Survey', SurveySchema)
}