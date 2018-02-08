'use strict';

const Koa = require('koa');
const Router = require('koa-router');
const {valid} = require('semver');
const routeV = require('../index');

const versionPath = ['0', 'headers'];
const versionExtractor = headers => valid(headers['x-api-version']);

const {v, versionChecker} = routeV({versionPath, versionExtractor});

/** V from Header */
const headerVChecker = versionChecker((isSatisfied, {userVersion, predicate, range}) =>
  (ctx, next) => {
    if(!isSatisfied) {
      ctx.throw(400, `Version ${userVersion} is not ${predicate} range ${range}`);
    }
    return next();
  });

const router = new Router({
  prefix: `/greetings`
});

router
.use(headerVChecker('<5.x'))
.get('/', v({
  '<1.x': ctx => ctx.body = 'hello',
  '^1.0.0': ctx => ctx.body = 'ola',
  // Matches any other valid version
  '*': ctx => ctx.body = 'hi'
}));

exports.app = new Koa();
exports.app
.use(router.allowedMethods({throw: true}))
.use(router.routes());
