

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
Tiny route versioning library. Tested on Koa and Express.

## Default behavior
Gets the version from the URL and expects functions to look like Koa, or Express middlewares. Check the config section below to change this behavior.

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

### Global version check (Optional)
```javascript
// ... some omitted setup code

const {versionChecker} = require('route-v')();

const vChecker = versionChecker((isSatisfied, {userVersion, predicate, version}) =>
  (ctx, next) => {
    if(!isSatisfied) {
      ctx.throw(400, `Version ${userVersion} is not ${predicate} version ${version}`);
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
curl localhost:3000/v6.0.0/greetings // Version 6.0.0 is not compliant with version <=2.x
```

## Config
### Change extractor and path
```javascript
const routeV = require('route-v');

/**
* Path of what to pass to your extractor. It is [0], so it will just pass the first argument
*/
const versionPath = [0];

// For reference, this is the default, 0 is the first parameter of the middleware (koa, express) and it contains url in them.
const defaultVersionPath = [0, 'url'];

/**
* Function to extract the version from the provided path
*/
const versionExtractor = req => {
    return req.header('api-version');
};

// For reference, here is the default extractor
/**
* Attempts to get the version number from the url
* @param {string} url e.g. segment/v1.0.0/anotherSegment
* @returns {string} the X from vX, or undefined
*/
const defaultVersionExtractor = url => {
    const regexResult = getVersionRegex.exec(url);
    return prop(1, regexResult);
};

const {v} = routeV({versionExtractor, versionPath});

// Enjoy
```

## Examples
[Koa Example](/examples/koa.js)

[Express Example](/examples/express.js)

## Test
```
npm test
```

Credits:
Kudus to [Avaq](https://github.com/Avaq), his expertise have been extremely helpful.
