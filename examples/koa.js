'use strict';

const Koa = require('koa');
const Router = require('koa-router');
const routeV = require('../index');
const {v, versionChecker} = routeV();

const vChecker = versionChecker((isSatisfied, {userVersion, predicate, version}) =>
  (ctx, next) => {
    if(!isSatisfied) {
      ctx.throw(400, `Version ${userVersion} is not ${predicate} version ${version}`);
    }
    return next();
  });

const baseUrl = '/(v\\d+.\\d+.\\d+)';
const router = new Router({
  prefix: `${baseUrl}/greetings`
});

router
.use(vChecker('<5.x'))
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
