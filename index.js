'use strict';

const {satisfies, validRange} = require('semver');
const {prop, find, keys, map, compose, not, filter} = require('ramda');
const t = require('tcomb');

const VersionPath =
  t.refinement(
    t.Nil,
    not,
    'VersionPath (No longer supported in the new version of route-v, check the docs)'
  );

// (Not actual signature) getBadRanges :: Array<String> a => a -> a
const getBadRanges = filter(compose(not, validRange));

// Produces verbose errors for the user.
const Routes = routes => {
  // Routes must be an object
  t.Object(routes);

  // Values of routes must be functions
  map(t.Function, Object.values(routes));

  const ranges = keys(routes);
  // Ranges need to be valid
  const badRanges = getBadRanges(ranges);
  if (badRanges.length) {
    throw new Error(`The following ranges are invalid: ${badRanges}`);
  }

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
 * @param {Array} ranges array of conditions
 * @returns function(String): * function that takes a single userVersion
 */
// (Not actual signature) setupFind :: xs -> x -> Maybe x
const setupFind = ranges =>
/**
 * Loops through the versions and finds the first match
 * @param {String} userVersion a valid semver version
 * @returns one value from the versions array or undefined if none matched
 */
  userVersion =>
    find(range => satisfies(userVersion, range), ranges);

// Match the numbers after the v and between two slashes
const vRegex = new RegExp(/v(\d+.\d+.\d+)/);

// (Not actual signature) execVerRegex :: String s => s -> Boolean
const execVerRegex = s => vRegex.exec(s);

/**
 * Default path to the property passed to the version extractor,
 * It takes the property 'url' of the first parameter of the middleware,
 * in Koa it is ctx.url, in express, it is req.url
 * @type {Array}
 */
const getUrl = prop('originalUrl');

/**
 * Attempts to get the version number from the url
 * @param {string} url e.g. segment/v1.0.0/anotherSegment
 * @returns {string} the version number, e.g. 1.0.0, or undefined
 */
// (Not actual signature) vExtractor :: String s => obj -> Maybe s
const defaultVersionExtractor = compose(prop(1), execVerRegex, getUrl);

/**
 * Default version not found error handler.
 * It throws an error. Override this if you need another behavior.
 * @params args destructed arguments, same ones passed to your functions.
 */
const defaultVersionNotFoundErrorHandler = (/* ...args */) => {
  throw new Error('Internal error: no match found');
};

/**
 * @param {Function} [versionExtractor] Version extractor, by default it checks the url
 * @param {Function} [versionNotFoundErrorHandler] Executed when no matching
 * function is found, by default throws a native and error.
 */
module.exports = function V({
  versionExtractor = defaultVersionExtractor,
  versionNotFoundErrorHandler = defaultVersionNotFoundErrorHandler,
  versionPath
} = {}) {
  t.Function(versionExtractor);
  t.Function(versionNotFoundErrorHandler);
  VersionPath(versionPath);

  /**
   * @param {Function} func, signature: (isSatisfied, details) => function
   * isSatisfied is the result of semver.satisfies, and the details
   * contain userVersion, predicate, version and range (version == range).
   */
  const versionChecker = func =>
    range => (...args) => {
      const userVersion = versionExtractor(...args);
      return func(satisfies(userVersion, range), {
        userVersion,
        predicate: 'compliant with',
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
    const findMatch = setupFind(Object.keys(routes));
    /**
     * Executes the matching middleware.
     * @param args
     * @returns {*}
     */
    return (...args) => {
      const userVersion = versionExtractor(...args);
      const match = findMatch(userVersion);
      if (!match) {
        return versionNotFoundErrorHandler(...args);
      }
      return routes[match](...args);
    };
  };

  return {
    versionChecker,
    v: register
  };
};
