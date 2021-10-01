
const fs = require('fs');
const mongoose = require('mongoose');
const extend = require('lodash/extend');
const formidable = require('formidable');
const config = require('../../config/config');
const { txLib } = require('../../config/config');
const { Image, VotesColSchema, productDbConnection } = require('./image.model');
const { User } = require('../user/user.model');
const errorHandler = require('../../helpers/dbErrorHandler');


const imageByID = async (req, res, next, id) => {
  try {
    let image = await Image.findById(id)
    if (!image)
      return res.status('400').json({
        error: "Image not found"
      })
    req.image = image
    next()
  } catch (err) {
    return res.status('400').json({
      error: "Could not retrieve image"
    })
  }
}

const create = async (req, res) => {
  try {
    const result = await Image.findOneAndUpdate(
      { name: req.body.name },
      {
        $set: req.body,

      },
      // { $addToSet: { metadata: req.body.metadata } },
      { upsert: true, new: true }
    );
    res.status(200).json(result)
  } catch (err) {
    return res.status(400).json({
      err
      // error: errorHandler.getErrorMessage(err)
    })
  }
}

const list = async (req, res) => {

  const pageIndex = +(req.query.pageIndex);
  const pageSize = +(req.query.pageSize);

  const { orderBy } = req.query;
  const { orderDirection } = req.query;

  try {
    let products = await Image.find({})
      .limit(pageSize || 5)
      .skip(pageSize * pageIndex)
      .lean()
    // .sort({ [orderBy]: orderDirection || 1 })
    res.json(products)
  } catch (err) {
    console.log(err)
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const read = (req, res) => {
  return res.json(req.image)
}



const readCombination = (req, res) => {
  // return res.json(req.image)
  const myArr = ['a', 'b', 'c', 'd', 'e', 'f']
  const combinationSize = 3
  const result = []
  //@ check arr.length > combinationSize 
  if (arr.length < combinationSize) return [] // return error message 
  if (arr.length === combinationSize) return [...myArr] //return a single match

  function first(arr = [], combinationSize) {

    const arr1 = arr.slice()
    const arr2 = []

  }


  function second(arr, combinationSize) {

  }


}

module.exports = {
  create,
  imageByID,
  read,
  readCombination,
  list,
}

