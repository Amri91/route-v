

# Route versioning

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
This package lets you version your functions (e.g. middlewares). Tested on Koa but should work for Express and other frameworks.

## Default behavior
Uses the regex v(\d+.\d+.\d+) to get the version from the url and expects functions to look like Koa or Express middlewares.
Check the config section below to change this behavior.

## Usage

### Registering routes
```javascript
const V = require('route-v');
const v = new V();
router.get('/', v.register({
    // Semver range: function
    '<1.0.0': oldestGetter,
    '^1.0.0': newestGetter,
    // Matches any other valid version
    '*': defaultGetter // Can also pass error handler middleware
}));
```

### Global version check (Optional)
```javascript
// Example using koa, but you can apply any other functions.
const V = require('route-v');
const v = new V();
const vChecker = v.versionChecker((isSatisfied, {version, userVersion, predicate}) =>
(ctx, next) => {
    if(!isSatisfied) {
	    // Message example: Version 1.0.0 is not compliant with version <=2.x.
        return ctx.throw(400, `Version ${userVersion} is not ${predicate} version ${version}`);
    }
    return next();
});

app
.use(vChecker('<=2.x'))
```

## Config
### Change extractor and path
```javascript
const V = require('route-v');

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

const v = new V({versionExtractor, versionPath});

// Enjoy
```

## Test
```
npm test
```

Credits:
Kudus to [Avaq](https://github.com/Avaq), his expertise have been extremely helpful.
