'use strict';

/** V from URL (Default) */
const Koa = require('koa');
const Router = require('koa-router');
const routeV = require('../index');

// If you want to handle all not found errors in the same way
const versionNotFoundErrorHandler = ctx => ctx.throw(400, 'Version not found');

const {v, versionChecker} = routeV({versionNotFoundErrorHandler});

const vChecker = versionChecker((isSatisfied, {userVersion, predicate, range}) =>
  (ctx, next) => {
    if(!isSatisfied) {
      ctx.throw(400, `Version ${userVersion} is not ${predicate} range ${range}`);
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
  '^1.0.0': ctx => ctx.body = 'hola',
  // Matches any other valid version
  // If you need a fallback
  //'*': ctx => ctx.body = 'hi'
}));

exports.app = new Koa();
exports.app
.use(router.allowedMethods({throw: true}))
.use(router.routes());
