'use strict';

const express = require('express');
const routeV = require('../index');
const {v, versionChecker} = routeV();

const vChecker = versionChecker((isSatisfied, {userVersion, predicate, range}) =>
  (req, res, next) => {
    if(!isSatisfied) {
      return next(`Version ${userVersion} is not ${predicate} range ${range}`);
    }
    return next();
  });

const baseUrl = new RegExp('/(v\\d+.\\d+.\\d+)/greetings');

exports.app = express();
exports.app
.use(vChecker('<5.x'))
.get(baseUrl, v({
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
