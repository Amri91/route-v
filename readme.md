
# Route versioning
[![Build Status](https://travis-ci.org/Amri91/route-v.svg?branch=master)](https://travis-ci.org/Amri91/route-v)
[![codecov](https://codecov.io/gh/Amri91/route-v/branch/master/graph/badge.svg)](https://codecov.io/gh/Amri91/route-v)
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
```javascript
const V = require('route-v');
const v = new V();
router.get('/', v.register({
    // Semver range: function
    '<1.0.0': oldestGetter,
    '^1.0.0': newestGetter,
    '*': defaultGetter // matches any other valid version
}));
```

## Global version check
```javascript
// Example using koa, but you can apply any other functions.
const V = require('route-v');
const v = new V();
const vChecker = v.versionChecker((isSatisfied, {version, userVersion, predicate}) =>
(ctx, next) => {
    if(!isSatisfied) {
        return ctx.throw(400, `Version ${userVersion} is not ${predicate} version ${version}`);
    }
    return next();
});

exports.deprecated = exports.v.versionChecker((isSatisfied, {version, userVersion, predicate}) =>
async (ctx, next) => {
    if(!isSatisfied) {
    return next();
    }
    await next();
    // handle deprecated logic
});

app
.use(vChecker('<=2.x'))
.use(deprecated('<=1.0.0'))
```

## Config

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
}

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

## Documentation

## Constants

<dl>
<dt><a href="#defaultVersionPath">defaultVersionPath</a> : <code>Array</code></dt>
<dd><p>Default path to the property passed to the version extractor,
It takes the property &#39;url&#39; of the first parameter of the middleware,
in Koa it is ctx.url, in express, it is req.url</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#getFirstMatch">getFirstMatch(userVersion, versions)</a> ⇒</dt>
<dd><p>Loops through the versions and finds the first match</p>
</dd>
<dt><a href="#defaultVersionExtractor">defaultVersionExtractor(url)</a> ⇒ <code>string</code></dt>
<dd><p>Attempts to get the version number from the url</p>
</dd>
<dt><a href="#defaultVersionNotFoundErrorHandler">defaultVersionNotFoundErrorHandler()</a></dt>
<dd><p>Default version not found error handler.
It throws an error. Override this if you need another behavior.</p>
</dd>
</dl>

<a name="defaultVersionPath"></a>

## defaultVersionPath : <code>Array</code>
Default path to the property passed to the version extractor,
It takes the property 'url' of the first parameter of the middleware,
in Koa it is ctx.url, in express, it is req.url

**Kind**: global constant  
<a name="getFirstMatch"></a>

## getFirstMatch(userVersion, versions) ⇒
Loops through the versions and finds the first match

**Kind**: global function  
**Returns**: one value from the versions array or undefined if none matched  

| Param | Type | Description |
| --- | --- | --- |
| userVersion | <code>String</code> | a valid semver version |
| versions | <code>Array</code> | array of conditions |

<a name="defaultVersionExtractor"></a>

## defaultVersionExtractor(url) ⇒ <code>string</code>
Attempts to get the version number from the url

**Kind**: global function  
**Returns**: <code>string</code> - the version number, e.g. 1.0.0, or undefined  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | e.g. segment/v1.0.0/anotherSegment |

<a name="defaultVersionNotFoundErrorHandler"></a>

## defaultVersionNotFoundErrorHandler()
Default version not found error handler.
It throws an error. Override this if you need another behavior.

**Kind**: global function  
**Params**: args destructed arguments, same ones passed to your functions.  
