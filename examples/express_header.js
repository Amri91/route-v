'use strict';

const express = require('express');
const routeV = require('../index');

const {valid} = require('semver');
const versionPath = ['0', 'headers'];
const versionExtractor = headers => valid(headers['x-api-version']);
const {v, versionChecker} = routeV({versionPath, versionExtractor});

const vChecker = versionChecker((isSatisfied, {userVersion, predicate, range}) =>
  (req, res, next) => {
    if(!isSatisfied) {
      return next(`Version ${userVersion} is not ${predicate} range ${range}`);
    }
    return next();
  });

exports.app = express();
exports.app
.use(vChecker('<5.x'))
.get('/greetings', v({
  '<1.x': (req, res) => res.send('hello'),
  '^1.0.0': (req, res) => res.send('hola'),
  // Matches any other valid version
  '*': (req, res) => res.send('hi')
}))
.use((err, req, res, next) => {
  // Just an example, please use a better error handler :)
  res.status(400);
  return res.send({error: err});
});
