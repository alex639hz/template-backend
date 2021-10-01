
const swaggerJsdoc = require('swagger-jsdoc');
const config = require('../config/config')
const authDoc = require('./doc.auth');
const userDoc = require('./doc.user');
const componentsDoc = require('./doc.components');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Enso Exam',
      description: 'OK',
      version: '1.0.0'
    },
    servers: [
      {
        url: `http://localhost:${config.port}/`, // url
        description: "Local server", // name
      },
    ],
    tags: [
      { name: "user CRUD", },
      { name: "auth CRUD", },
    ],
    components: componentsDoc,
    paths: {
      ...authDoc,
      ...userDoc,
    },
  },
  apis: [
    './example/routes*.js',
    './example/parameters.yaml'
  ],
}

module.exports = swaggerJsdoc(options);
