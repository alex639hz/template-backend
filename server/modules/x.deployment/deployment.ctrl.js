
const fs = require('fs');
const mongoose = require('mongoose');
const extend = require('lodash/extend');
const formidable = require('formidable');
const Redis = require('ioredis');

const config = require('../../config/config');
const { txLib } = require('../../config/config');
const { Deployment } = require('./deployment.model');
const { User } = require('../user/user.model');
const errorHandler = require('../../helpers/dbErrorHandler');

const redisPub = new Redis()


const create = async (req, res) => {
  try {
    const result = await Deployment.create({ imageId: req.image._id });
    const count = await Deployment.estimatedDocumentCount();
    redisPub.publish('topic1', `count: ${count}`)

    return res.status(200).json({
      message: "Successfully updated",
      count,
      result
    })
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const list = async (req, res) => {

  const pageIndex = +(req.query.pageIndex);
  const pageSize = +(req.query.pageSize) || 10;

  const { orderBy } = req.query; // Tupdated/created
  const { orderDirection } = req.query;

  try {
    let products = await Deployment.find({})
      .limit(pageSize || 5)
      .skip(pageSize * pageIndex)
      .sort({ [orderBy]: orderDirection || 1 })
    res.json(products)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const count = async (req, res) => {
  try {
    const count = await Deployment.estimatedDocumentCount()
    return res.json({ count })
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const combi = (req, res) => {

  Array.prototype.combine = function combine(k) {
    var toCombine = this;
    var last;
    function combi(n, comb) {
      var combs = [];
      for (var x = 0, y = comb.length; x < y; x++) {
        for (var l = 0, m = toCombine.length; l < m; l++) {
          if (!(comb[x] + '').includes(toCombine[l])) {
            // if (comb[x] !== toCombine[l]) {
            let combination = (comb[x] + toCombine[l] + '') //.sort()
            combs.push(combination);
          }
        }
      }
      if (n < k - 1) {
        n++;
        combi(n, combs);
      } else { last = combs; }
    }
    combi(1, toCombine);
    return last;
  }
  // Example:
  var toCombine = ['a', 'b', 'c', 'd'];
  const size = req.query.size || 1;
  var result = toCombine.combine(size);
  res.json({
    size,
    result
  })
}

module.exports = {
  create,
  list,
  count,
  combi,
}

