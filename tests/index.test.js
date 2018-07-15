'use strict';

const {propOr} = require('ramda');

const routeV = require('../index');

describe('Middleware version control', () => {
  const getUrl = version => `segment/${version}/anotherSegment`;
  let v, versionChecker;

  beforeEach(() => {
    ({v, versionChecker} = routeV());
  });

  describe('#constructor', () => {
    it('should throw an exception if extra parameters are passed (for migration issues)', () => {
      expect(() => routeV({versionPath: 1})).toThrow();
    });
    it('should expect empty params', () => {
      expect(() => routeV()).not.toThrow();
    });
  });
  describe('#register', () => {
    let versions;
    beforeEach(() => {
      versions = {'0.0.1': jest.fn(), '>0.0.1': jest.fn(), '*': jest.fn()};
    });
    it('should call the correct version', () => {
      v(versions)({originalUrl: getUrl('v0.2.1')});
      expect(versions['>0.0.1'].mock.instances.length).toBe(1);
    });
    it('should call the wild card version if nothing else matched (order is preserved)', () => {
      v(versions)({originalUrl: getUrl('v0.0.0')});
      expect(versions['*'].mock.instances.length).toBe(1);
    });
    it('should call the wild card version if bad version was supplied', () => {
      ({v} = routeV({versionExtractor: url => {
        const regexResult = /v(\d+.\d+.\d+)/.exec(url);
        return propOr('0.0.0', 1, regexResult);
      }}));
      v(versions)({originalUrl: getUrl('v__')});
      expect(versions['*'].mock.instances.length).toBe(1);
    });
    it('should throw an error if nothing was matched', () => {
      expect(() => v({'0.0.0': jest.fn()})({originalUrl: getUrl('v0.0.1')})).toThrow();
    });
    it('should use the new extractor', () => {
      const newV = routeV({versionExtractor: () => '20.0.0'});
      newV.v(versions)({originalUrl: getUrl('_')});
      expect(versions['>0.0.1'].mock.instances.length).toBe(1);
    });
    it('should throw if * is not the last entry', () => {
      expect(() => v({
        '*': () => console,
        '1.0.0': () => console,
        '2.0.0': () => console
      })).toThrow();
    });
    it('should throw if one of the values is not a function', () => {
      expect(() => v({
        '1.0.0': () => console,
        '>2.0.0': 1
      })).toThrow();
    });
    it('should throw if a range is not valid', () => {
      expect(() => v({
        'helloWorld!': () => console,
        '2.0.0': () => console
      })).toThrow();
    });
  });
  describe('#versionChecker', () => {
    it('it should pass if version satisfied the predicate ^1.0.0', done => {
      const customVChecker = versionChecker((isSatisfied, details) => (ctx, next) => {
        expect(details).toBeTruthy();
        done(!isSatisfied);
      });
      customVChecker('^1.0.0')({originalUrl: getUrl('v1.0.1')});
    });
    it('it should fail if version is null', done => {
      const customVChecker = versionChecker((isSatisfied, details) => (ctx, next) => {
        expect(details).toBeTruthy();
        done(isSatisfied);
      });
      customVChecker('^1.0.0')({originalUrl: null});
    });
    it('it should fail if version is bad', done => {
      const customVChecker = versionChecker((isSatisfied, details) => (ctx, next) => {
        expect(details).toBeTruthy();
        done(isSatisfied);
      });
      customVChecker('^1.0.0')({originalUrl: getUrl('badVersion')});
    });
    it('it should fail if no version is passed', done => {
      const customVChecker = versionChecker((isSatisfied, details) => (ctx, next) => {
        expect(details).toBeTruthy();
        done(isSatisfied);
      });
      customVChecker('^1.0.0')({originalUrl: getUrl('`segment/anotherSegment`')});
    });
  });
});
