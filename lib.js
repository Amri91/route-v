'use strict';

const {path, propOr, prop, curryN, __} = require('ramda');
const {isObjectLike} = require('lodash');

// Match the numbers after the v and between two slashes
const getVersionRegex = /v(\d*)/;

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
exports.versionExtractor = url => {
  const regexResult = getVersionRegex.exec(url);
  return prop(1, regexResult);
};

/**
 * Registers multiple middlewares and returns the matching one when called again
 * @param {Object} versions contains all the relevant functions
 * @param {Function} versions.default default function to execute unless a more appropriate one is available
 * @param {Function} [versions[x]] other functions may be provided but are not required. x needs to be an integer.
 * @param {Function} [extractor] Version extractor, by default it checks the url
 * @param {Array} [versionPath=[0, 'url']] path of the argument sent to the extractor.
 * By default, it points to the url of the first middleware argument
 * @returns {function}
 */
exports.v = (versions, extractor, versionPath = defaultVersionPath) => {
  if(isObjectLike(versions)) {
    /**
     * Executes the matching middleware.
     * @param args
     * @returns {function} middleware
     */
    return (...args) => {
      extractor = extractor || exports.versionExtractor;
      const versionNumber = extractor(path(versionPath, args));
      return propOr(versions.default, versionNumber, versions)(...args);
    };
  }
  return curryN(3, exports.v)(__, versions || exports.versionExtractor, extractor)
};
