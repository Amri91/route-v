'use strict';

const semver = require('semver');
const {path, prop, find} = require('ramda');
const t = require('tcomb');

/**
 * Available predicates
 * @type {{satisfies: string, gt: string, gte: string, lt: string, lte: string, eq: string, neq: string}}
 */
const predicates = {
  satisfies: 'compliant with',
  gt: 'greater than',
  gte: 'greater than or equal to',
  lt: 'less than',
  lte: 'less than or equal to',
  eq: 'equal to',
  neq: 'different from'
};

/**
 * Loops through the versions and finds the first match
 * @param {String} userVersion a valid semver version
 * @param {Array} versions array of conditions
 * @returns one value from the versions array or undefined if none matched
 */
const getFirstMatch = (userVersion, versions) =>
  find(range => semver.satisfies(userVersion, range), versions);

// Match the numbers after the v and between two slashes
const getVersionRegex = /v(\d*.\d*.\d*)/;

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

module.exports = class V {
  /**
   * @param {Function} [extractor] Version extractor, by default it checks the url
   * @param {Array} [versionPath=[0, 'url']] path of the argument sent to the extractor.
   * @param {Function} [globalVersionChecker] This function is called when you use versionChecker[k]
   * e.g. versionChecker.satisfied('^1.0.0'). An example of a globalVersionChecker:
   * (isSatisifed, details) => your custom function like express or koa middleware.
   * isSatisifed is a boolean that is true if the user version passes, it is false otherwise, the
   * details always contain the userVersion, the condition (version), and the predicate used.
   */
  constructor({versionExtractor = defaultVersionExtractor, versionPath = defaultVersionPath, globalVersionChecker} = {}) {
    this._versionExtractor = t.Function(versionExtractor);
    this._versionPath = t.Array(versionPath);
    if(globalVersionChecker) {
      this._globalVersionChecker = t.Function(globalVersionChecker);
      this.versionChecker = {};
      Object.keys(predicates).forEach(k => {
        this.versionChecker[k] = version => (...args) => {
          const userVersion = this._versionExtractor(path(this._versionPath, args));
          this._globalVersionChecker(semver[k](userVersion, version), {
            userVersion,
            predicate: predicates[k],
            version
          })(...args);
        };
      });
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
      if(!match) throw 'Internal error: version not found';
      return versions[match](args);
    };
  };
};
