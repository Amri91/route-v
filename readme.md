

# Route V

[![npm version](https://badge.fury.io/js/route-v.svg)](https://badge.fury.io/js/route-v)
[![Maintainability](https://api.codeclimate.com/v1/badges/4959c1679a6b68990e8b/maintainability)](https://codeclimate.com/github/Amri91/route-v/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/4959c1679a6b68990e8b/test_coverage)](https://codeclimate.com/github/Amri91/route-v/test_coverage)
[![Greenkeeper badge](https://badges.greenkeeper.io/Amri91/route-v.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/Amri91/route-v.svg?branch=master)](https://travis-ci.org/Amri91/route-v)
[![dependencies Status](https://david-dm.org/amri91/route-v/status.svg)](https://david-dm.org/Amri91/route-v)
[![devDependencies Status](https://david-dm.org/amri91/route-v/dev-status.svg)](https://david-dm.org/Amri91/route-v?type=dev)

## Installation
```
npm install route-v
```

## Description
A tiny route semantic versioning library for Koa and Express.

## Default behavior
Gets the version from the URL (or header) and expects functions to look like Koa, or Express middlewares. Check the config section below to change this behavior.

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
  '<1.x': ctx => ctx.body = 'hello',
  '^1.0.0': ctx => ctx.body = 'ola',
  // Matches any other valid version
  '*': ctx => ctx.body = 'hi'
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
curl localhost:3000/v1.0.0/greetings // ola
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
```javascript
// If you want to use the header instead of the url
const {valid} = require('semver');
// Takes the object "headers" from the first argument of your function (ctx in koa, req in express)
const versionPath = ['0', 'headers'];
// Returns the value of the key x-api-version
// The valid is a semver function that converts the value to a valid version
const versionExtractor = headers => valid(headers['x-api-version']);
const {v, versionChecker} = routeV({versionPath, versionExtractor});

// This would work for express and koa
// The rest is the same, enjoy
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
