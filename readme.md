<img src="logo.png" alt="Route-v-logo" />

[![npm version](https://badge.fury.io/js/route-v.svg)](https://badge.fury.io/js/route-v)
[![Maintainability](https://api.codeclimate.com/v1/badges/4959c1679a6b68990e8b/maintainability)](https://codeclimate.com/github/Amri91/route-v/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/4959c1679a6b68990e8b/test_coverage)](https://codeclimate.com/github/Amri91/route-v/test_coverage)
[![Greenkeeper badge](https://badges.greenkeeper.io/Amri91/route-v.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/Amri91/route-v.svg?branch=master)](https://travis-ci.org/Amri91/route-v)
[![dependencies Status](https://david-dm.org/amri91/route-v/status.svg)](https://david-dm.org/Amri91/route-v)
[![devDependencies Status](https://david-dm.org/amri91/route-v/dev-status.svg)](https://david-dm.org/Amri91/route-v?type=dev)

> A tiny route/api semantic versioning library for Koa and Express.

## Installation
```
npm install route-v
```

## Default Behavior
Gets the version from the URL (originalUrl) and expects Routes/APIs to look like Koa or Express middleware.

## Features
- Supports all semver ranges E.g. <2.x, *, ~1.0.0.
- Supports Koa and Express by default.
- Easily change the version source E.g, from URL to headers or both.
- Can be used to version any function (May require some configurations).

## Migration from version 2 to 3 notes:
1. Removed the deprecated property register returned by the function constructor, use v instead.
1. Removed the deprecated property version returned by the function versionChecker, use range instead.
1. versionExtractor now takes exactly the same arguments as your versioned routes (functions)

## Usage

### Registering routes
```javascript
const Koa = require('koa');
const Router = require('koa-router');
const {v} = require('route-v')();

// This regex will check if the url has a version number in it.
const baseUrl = '/(v\\d+.\\d+.\\d+)';
const router = new Router({
  prefix: `${baseUrl}/greetings`
});

router
.get('/', v({
  // Note that the order matters
  // Key: any range accepted by semver
  // value: any function
  '<1.x': ctx => ctx.body = 'hello', // if <1.x
  '^1.0.0': ctx => ctx.body = 'hola', // else if ^1.0.0
  // Matches any other valid version
  '*': ctx => ctx.body = 'hi'        // else
}));

const app = new Koa();
app
.use(router.allowedMethods({throw: true}))
.use(router.routes())
.listen(3000);
```
**Behavior:**
```
curl localhost:3000/v0.0.0/greetings // hello
curl localhost:3000/v1.0.0/greetings // hola
curl localhost:3000/v2.0.0/greetings // hi
```

### Global version check
```javascript
// ... some omitted setup code

const {versionChecker} = require('route-v')();

const vChecker = versionChecker((isSatisfied, {userVersion, predicate, range}) =>
  (ctx, next) => {
    if(!isSatisfied) {
      ctx.throw(400, `Version ${userVersion} is not ${predicate} range ${range}`);
    }
    return next();
  });

router
.use(vChecker('<5.x'));

exports.app = new Koa();
exports.app
.use(router.allowedMethods({throw: true}))
.use(router.routes())
.listen(3000);
```
**Behavior:**
```
curl localhost:3000/v6.0.0/greetings // Version 6.0.0 is not compliant with version <5.x
```

## Config

### Change extractor and path
If you want to use the header instead of the url.
```javascript
const {valid} = require('semver');
// Points to the object "headers" from the first argument of your function (ctx in koa, req in express)
// and returns the value of the key x-api-version
const versionExtractor = ctxOrReq => valid(ctxOrReq.headers['x-api-version']);
const {v} = routeV({versionExtractor});
```

### Add a custom versionNotFoundErrorHandler
By default, an error will be thrown if the version requested was not found.
```javascript
// This is for Koa, for express, a similar middleware can be passed
const versionNotFoundErrorHandler = ctx => ctx.throw(400, 'Version not found');
const {v} = routeV({versionNotFoundErrorHandler});
```

## Examples
[Examples](/examples)

## Test
```
npm test
```

## Known issues
Since the insertion order matters but it is not guaranteed for integers, the library assumes you
know what you are doing when using integers as ranges.
https://bugs.chromium.org/p/v8/issues/detail?id=164


Credits:
Kudus to [Avaq](https://github.com/Avaq), his expertise have been extremely helpful.
