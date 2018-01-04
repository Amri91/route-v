'use strict';

const {versionExtractor, v} = require('../lib');

describe('Middleware version control', () => {
  const getUrl = version => `segment/${version}/anotherVersion`;

  describe('#version extractor', () => {
    it('should extract the version number if found', () => {
      expect(versionExtractor(getUrl('v1'))).toBe('1');
    });
    it('should return undefined if the version number was not found', () => {
      expect(versionExtractor(getUrl())).toBe(undefined);
    });
  });
  describe('#v', () => {
    let versions;
    beforeEach(() => {
      versions = {default: jest.fn(), 0: jest.fn(), 1: jest.fn()};
    });
    it('should call the correct version', () => {
      v(versions)({url: getUrl('v0')});
      expect(versions[0].mock.instances.length).toBe(1);
    });
    it('should call the default function if version was not found listed', () => {
      v(versions)({url: getUrl('v2')});
      expect(versions.default.mock.instances.length).toBe(1);
    });
    it('should use the custom path provided to get the version', () => {
      const newV = v(undefined, [0, 'custom']);
      newV(versions)({custom: getUrl('v0')});
      expect(versions[0].mock.instances.length).toBe(1);
    });
    it('should use the new extractor', () => {
      const newV = v(() => 1, undefined);
      newV(versions)({url: getUrl('v0')});
      expect(versions[1].mock.instances.length).toBe(1);
    });
    it('should use the new extractor (without calling second parameter)', () => {
      const newV = v(() => 1);
      newV(versions)({url: getUrl('v0')});
      expect(versions[1].mock.instances.length).toBe(1);
    });
  });
});
