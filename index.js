'use strict';

const {satisfies, validRange} = require('semver');
const {path, prop, find, keys, map} = require('ramda');
const t = require('tcomb');

const checkRange = range => {
  if(!validRange(range)) {
    throw new Error(`Range: "${range}" is not a valid range`);
  }
  return range;
};

// Produces helpful errors for the user.
const Routes = routes => {
  // Routes must be an object
  t.Object(routes);

  // Values of routes must be functions
  map(t.Function, Object.values(routes));

  const ranges = keys(routes);
  // Ranges need to be valid
  map(checkRange, ranges);

  // * needs to be the last range if present
  const matchAllIndex = ranges.indexOf('*');
  // If found and is not the last index
  if(matchAllIndex !== -1 && matchAllIndex !== (ranges.length - 1)) {
    // The '*' range is not the last
    throw new Error(
      'The * (match all) range is not last, some routes are unreachable because order matters'
    );
  }
};

/**
 * Loops through the versions and finds the first match
 * @param {String} userVersion a valid semver version
 * @param {Array} versions array of conditions
 * @returns one value from the versions array or undefined if none matched
 */
const getFirstMatch = (userVersion, versions) =>
  find(range => satisfies(userVersion, range), versions);

// Match the numbers after the v and between two slashes
const getVersionRegex = /v(\d+.\d+.\d+)/;

/**
 * Default path to the property passed to the version extractor,
 * It takes the property 'url' of the first parameter of the middleware,
 * in Koa it is ctx.url, in express, it is req.url
 * @type {Array}
 */
const defaultVersionPath = [0, 'url'];

/**
 * Attempts to get the version number from the url
 * @param {string} url e.g. segment/v1.0.0/anotherSegment
 * @returns {string} the version number, e.g. 1.0.0, or undefined
 */
const defaultVersionExtractor = url => {
  const regexResult = getVersionRegex.exec(url);
  return prop(1, regexResult);
};

/**
 * Default version not found error handler.
 * It throws an error. Override this if you need another behavior.
 * @params args destructed arguments, same ones passed to your functions.
 */
const defaultVersionNotFoundErrorHandler = (/* ...args */) => {
  throw new Error('Internal error: no match found');
};

/**
 * @param {Function} [extractor] Version extractor, by default it checks the url
 * @param {Array} [versionPath=[0, 'url']] path of the argument sent to the extractor.
 */
module.exports = function V({
  versionExtractor = defaultVersionExtractor,
  versionPath = defaultVersionPath,
  versionNotFoundErrorHandler = defaultVersionNotFoundErrorHandler
} = {}) {

  t.Function(versionExtractor);
  t.Array(versionPath);
  t.Function(versionNotFoundErrorHandler);

  /**
   * @param {Function} func, signature: (isSatisfied, details) => function
   * isSatisfied is the result of semver.satisfies, and the details
   * contain userVersion, predicate, version and range (version == range).
   */
  const versionChecker = func =>
    range => (...args) => {
      const userVersion = versionExtractor(path(versionPath, args));
      return func(satisfies(userVersion, range), {
        userVersion,
        predicate: 'compliant with',
        // backward compatibility
        version: range,
        range
      })(...args);
    };

  /**
   * Registers multiple middlewares and returns the matching one when called again
   * @param {Object} routes key: range, value: function
   * @returns {Function} middleware
   */
  const register = routes => {
    Routes(routes);
    /**
     * Executes the matching middleware.
     * @param args
     * @returns {*}
     */
    return (...args) => {
      const userVersion = versionExtractor(path(versionPath, args));
      const ranges = Object.keys(routes);
      const match = getFirstMatch(userVersion, ranges);
      if (!match) {
        return versionNotFoundErrorHandler(...args);
      }
      return routes[match](...args);
    };
  };

  return {
    // Backward compatibility
    register,
    versionChecker,
    v: register
  };
};
