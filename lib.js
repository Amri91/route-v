'use strict';

const semver = require('semver');
const {path, prop, find} = require('ramda');
const t = require('tcomb');

/**
 * Loops through the versions and finds the first match
 * @param {String} userVersion a valid semver version
 * @param {Array} versions array of conditions
 * @returns one value from the versions array or undefined if none matched
 */
const getFirstMatch = (userVersion, versions) =>
  find(range => semver.satisfies(userVersion, range), versions);

// Match the numbers after the v and between two slashes
const getVersionRegex = /v(\d+.\d+.\d+)/;

/**
 * Default path to get the version number,
 * By default it takes the first parameter of the middleware,
 * in Koa it is ctx, in express, it is req
 * and looks for the property url in it.
 * @type {Array}
 */
const defaultVersionPath = [0, 'url'];

/**
 * Attempts to get the version number from the url
 * @param {string} url e.g. segment/v1/anotherSegment
 * @returns {string} the X from vX, or undefined
 */
const defaultVersionExtractor = url => {
  const regexResult = getVersionRegex.exec(url);
  return prop(1, regexResult);
};

/**
 * Default version not found error handler.
 * It throws an error. Override this if you need another behavior.
 * @params args destructed arguments, same ones passed to your versions.
 */
const defaultVersionNotFoundErrorHandler = (...args) => {
  throw 'Internal error: no match found';
};

module.exports = class V {
  /**
   * @param {Function} [extractor] Version extractor, by default it checks the url
   * @param {Array} [versionPath=[0, 'url']] path of the argument sent to the extractor.
   */
  constructor({
                versionExtractor = defaultVersionExtractor,
                versionPath = defaultVersionPath,
                versionNotFoundErrorHandler = defaultVersionNotFoundErrorHandler
  } = {}) {
    this._versionExtractor = t.Function(versionExtractor);
    this._versionPath = t.Array(versionPath);
    this._versionNotFoundErrorHandler = t.Function(versionNotFoundErrorHandler);
  }

  /**
   * @param {Function} func, signature: (isSatisfied, details) => function
   * where isSatisfied is true if semver.satisfies returns true and false otherwise, and the details
   * contain userVersion, predicate, and version.
   */
  versionChecker(func) {
    return version => (...args) => {
      const userVersion = this._versionExtractor(path(this._versionPath, args));
      return func(semver.satisfies(userVersion, version), {
        userVersion,
        predicate: 'compliant with',
        version
      })(...args);
    }
  }

  /**
   * Registers multiple middlewares and returns the matching one when called again
   * @param {Object} versions contains all the relevant functions
   * @param {Function} versions.default default function to execute unless a more appropriate one is available
   * @param {Function} [versions[x]] other functions may be provided but are not required. x needs to be an integer.
   * By default, it points to the url of the first middleware argument
   * @returns {function}
   */
  register(versions) {
    /**
     * Executes the matching middleware.
     * @param args
     * @returns {function} middleware
     */
    return (...args) => {
      const userVersion = this._versionExtractor(path(this._versionPath, args));
      const conditions = Object.keys(versions);
      const match = getFirstMatch(userVersion, conditions);
      if(!match) return this._versionNotFoundErrorHandler(...args);
      return versions[match](...args);
    };
  };
};
