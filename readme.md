# Route version control
[![Build Status](https://travis-ci.org/Amri91/route-vc.svg?branch=master)](https://travis-ci.org/Amri91/route-vc)
[![codecov](https://codecov.io/gh/Amri91/route-vc/branch/master/graph/badge.svg)](https://codecov.io/gh/Amri91/route-vc)
[![dependencies Status](https://david-dm.org/amri91/route-vc/status.svg)](https://david-dm.org/Amri91/route-vc)
[![devDependencies Status](https://david-dm.org/amri91/route-vc/dev-status.svg)](https://david-dm.org/Amri91/route-vc?type=dev)

## Installation
```
npm install route-vc
```

## Description
This package lets you register functions (e.g. middlewares) for the same route and chooses the matching function based on the provided version number in the url or header.
Assuming version numbers are integers and by default supports getting the version from the url and expects functions to look like express or koa middlewares. Check the config section below to change this behavior.

## Usage
```
// By default, this checks the url for /v(\d*)/;
const {v} = require('route-vc');
// Assuming v(\d*) is somewhere in the prefix
router.get('/', v({
0: oldestGetter, // if v0 was provided
1: newestGetter, // if v1 was provided
default: oldestGetter // otherwise, e.g. no v(x) was provided or the number is not listed, you can also throw an error instead
})));
```

## Backward compatibility
Case:
- You want to put the version number in the url
- You already have old clients that do not use v(X) at all

You can still use route version control with this regex prefix (/v\\d*)? which will match even the calls that do not provide v(X).

Here is an example implementation if you are using koa-router, express routers should work similarly.

```
const baseUrl = '(/v\\d*)?';

const router = new Router({
prefix: `${baseUrl}/resourceName`
});

router.get('/', v({
default: oldestGetter,
0: oldestGetter,
1: newestGetter
}));
```

## Config
By default this package supports getting the version from the url and expects functions to look like express or koa middlewares.

```
const {v} = require('route-vc');

/**
* Path to get the version number
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
* @param {string} url e.g. segment/v1/anotherSegment
* @returns {string} the X from vX, or undefined
*/
const defaultVersionExtractor = url => {
const regexResult = getVersionRegex.exec(url);
return prop(1, regexResult);
};

const customizedVC = v(versionExtractor, versionPath);

// From now on, use customizedVC same as v. Need more flexibility in providing the options? You can curry v.
router.get('/', customizedVC({
default: oldestGetter,
0: oldestGetter,
1: newestGetter
}));
```

## Apply minimum version globally
You can use a simple middleware for that

```
exports.minimumVersion = version => (ctx, next) => {
if (versionExtractor(ctx.url) >= version) {
return next();
}
ctx.throw(400, 'version not supported');
};

```

## Test
```
npm test
```

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
<dt><a href="#versionExtractor">versionExtractor(url)</a> ⇒ <code>string</code></dt>
<dd><p>Attempts to get the version number from the url</p>
</dd>
<dt><a href="#v">v(versions, [versions[x]], [extractor], [versionPath])</a> ⇒ <code>function</code></dt>
<dd><p>Registers multiple middlewares and returns the matching one when called again</p>
</dd>
</dl>

<a name="defaultVersionPath"></a>

## defaultVersionPath : <code>Array</code>
Default path to get the version number,
By default it takes the first parameter of the middleware,
in Koa it is ctx, in express, it is req
and looks for the property url in it.

**Kind**: global constant  
<a name="versionExtractor"></a>

## versionExtractor(url) ⇒ <code>string</code>
Attempts to get the version number from the url

**Kind**: global function  
**Returns**: <code>string</code> - the X from vX, or undefined  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | e.g. segment/v1/anotherSegment |

<a name="v"></a>

## v(versions, [versions[x]], [extractor], [versionPath]) ⇒ <code>function</code>
Registers multiple middlewares and returns the matching one when called again

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| versions | <code>Object</code> |  | contains all the relevant functions |
| versions.default | <code>function</code> |  | default function to execute unless a more appropriate one is available |
| [versions[x]] | <code>function</code> |  | other functions may be provided but are not required. x needs to be an integer. |
| [extractor] | <code>function</code> |  | Version extractor, by default it checks the url |
| [versionPath] | <code>Array</code> | <code>[0, &#x27;url&#x27;]</code> | path of the argument sent to the extractor. By default, it points to the url of the first middleware argument |

