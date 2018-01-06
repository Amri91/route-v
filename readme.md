# Route version control
[![Build Status](https://travis-ci.org/Amri91/route-vc.svg?branch=master)](https://travis-ci.org/Amri91/route-vc)
[![codecov](https://codecov.io/gh/Amri91/route-vc/branch/master/graph/badge.svg)](https://codecov.io/gh/Amri91/route-vc)
[![dependencies Status](https://david-dm.org/amri91/route-vc/status.svg)](https://david-dm.org/Amri91/route-vc)
[![devDependencies Status](https://david-dm.org/amri91/route-vc/dev-status.svg)](https://david-dm.org/Amri91/route-vc?type=dev)

## Installation
```
npm install route-v
```

## Description
This package lets you register functions (e.g. middlewares) for the same route and chooses the matching function based on the provided semver version provided.
By default this package supports getting the version from the url and expects functions to look like Koa or Express middlewares. Check the config section below to change this behavior.
This package has been tested in Koa, but it does not depend on it, it should work on express just as well and possibly other frameworks.

## Usage
```
// By default, this checks the url for /v(\d+.\d+.\d+)/;
const V = require('route-v');
const v = new V();
// Assuming the version is somewhere in the prefix
router.get('/', v.register({
    '<1.0.0': oldestGetter,
    '^1.0.0': newestGetter,
    '*': oldestGetter // you can also throw an error instead
})));
```

## Apply a global version check, useful if all your APIs accept a certain range of versions
```
// Example using koa, but you can apply any other functions.
const V = require('route-v');

const v = new V();

const vChecker = v.versionChecker((isSatisfied, {version, userVersion, predicate}) =>
    (ctx, next) => {
        if(!isSatisfied) {
            return ctx.throw(410, `Version ${userVersion} is not ${predicate} version ${version}`);
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

## Backward compatibility
Case:
- You want to put the version number in the url
- You already have old clients that do not use provide version at all
You can still use route-v with this regex prefix (/v\d+.\d+.\d+)? on your routes which will match even the calls that do not provide v(X) in the url.
You need to override the version extractor to return '0.0.0' by default instead of undefined. Expect the case '0.0.0' when you register your routes by adding the key '0.0.0', a wild card can be used as well '*'

Here is an example implementation if you are using koa-router, express routers should work similarly.

```
const {propOr} = require('ramda');
const baseUrl = '(/v\d+.\d+.\d+)?';

// The new versionExtractor is just like the default one excepts that it returns 0.0.0 instead of undefined.
const v = new V({versionExtractor: url => {
    const regexResult = /v(\d+.\d+.\d+)/.exec(url);
    return propOr('0.0.0', 1, regexResult);
});

const router = new Router({
    prefix: `${baseUrl}/resourceName`
});
// Ensure that you expect the '0.0.0' case
router.get('/', v.register({
    '<1.0.0': oldestGetter,
    '^1.0.0': newestGetter,
    '*': oldestGetter // this will now match
}));
```

## Config
By default this package supports getting the version from the url and expects functions to look like express or koa middlewares.

```
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
<dd><p>Default path to get the version number,
By default it takes the first parameter of the middleware,
in Koa it is ctx, in express, it is req
and looks for the property url in it.</p>
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
Default path to get the version number,
By default it takes the first parameter of the middleware,
in Koa it is ctx, in express, it is req
and looks for the property url in it.

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
**Returns**: <code>string</code> - the X from vX, or undefined  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | e.g. segment/v1/anotherSegment |

<a name="defaultVersionNotFoundErrorHandler"></a>

## defaultVersionNotFoundErrorHandler()
Default version not found error handler.
It throws an error. Override this if you need another behavior.

**Kind**: global function  
**Params**: args destructed arguments, same ones passed to your versions.  
