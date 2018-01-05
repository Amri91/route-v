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
This package lets you register functions (e.g. middlewares) for the same route and chooses the matching function based on the provided version number in the url or header (or another place you define).
Assuming versions are semver versions and by default supports getting the version from the url and expects functions to look like express or koa middlewares. Check the config section below to change this behavior.

## Usage
```
// By default, this checks the url for /v(\d+.\d+.\d+)/;
const V = require('route-v');
const v = new V();
// Assuming the version is somewhere in the prefix
router.get('/', v({
    '<1.0.0': oldestGetter,
    '^1.0.0': newestGetter,
    '*': oldestGetter // you can also throw an error instead
})));
```

## Apply a global version check, useful if all your APIs accept a certain range of versions
```
// Example using koa, but you can apply any other functions.
const V = require('route-v');

const v = new V({globalVersionChecker: (isSatisfied, {version, userVersion, predicate}) =>
    ctx => {
        if(!isSatisfied) {
            return ctx.throw(412, `Version ${userVersion} is not ${predicate} version ${version}`);
        }
    }});

app.use(
    v.versionChecker.satisfies('~1.0.0')
);
```

## Backward compatibility
Case:
- You want to put the version number in the url
- You already have old clients that do not use v(X) at all
You can still use route-v with this regex prefix (/v\d+.\d+.\d+)? which will match even the calls that do not provide v(X).
Just be sure to have '*' in the last key to match those and handle them appropriately.

Here is an example implementation if you are using koa-router, express routers should work similarly.

```
const baseUrl = '(/v\d+.\d+.\d+)?';

const router = new Router({
prefix: `${baseUrl}/resourceName`
});
// Ensure that you have '*'
router.get('/', v({
    '<1.0.0': oldestGetter,
    '^1.0.0': newestGetter,
    '*': oldestGetter // you can also throw an error instead
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

## Documentation

## Constants

<dl>
<dt><a href="#predicates">predicates</a> : <code>Object</code></dt>
<dd><p>Available predicates</p>
</dd>
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
</dl>

<a name="predicates"></a>

## predicates : <code>Object</code>
Available predicates

**Kind**: global constant  
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

