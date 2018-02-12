'use strict';

const request = require('supertest');

const {app: koaApp} = require('../examples/koa');
const {app: koaAppHeader} = require('../examples/koa_header');
const {app: expressApp} = require('../examples/express');
const {app: expressAppHeader} = require('../examples/express_header');

describe('Route V for Koa', () => {
  describe('GET /v/Greetings', () => {
    it('should return <hola> when requesting a version compliant with ^1.0.0', async () => {
      const {text} = await request(koaApp.callback())
      .get(`/v1.0.0/greetings`)
      .expect(200);
      expect(text).toBe('hola');
    });
    it('should return <hello> when requesting a version compliant with  <1.x', async () => {
      const {text} = await request(koaApp.callback())
      .get(`/v0.1.9/greetings`)
      .expect(200);
      expect(text).toBe('hello');
    });
    it('should return <hi> when requesting a version other acceptable versions.', async () => {
      await request(koaApp.callback())
      .get(`/v2.6.9/greetings`)
      .expect(400);
    });
    it('should return 400 when requesting a version not compliant with <5.x.', async () => {
      await request(koaApp.callback())
      .get(`/v5.0.1/greetings`)
      .expect(400);
    });
    it('should return 404 when requesting api with an invalid version', async () => {
      await request(koaApp.callback())
      .get(`/vhello/greetings`)
      .expect(404);
    });
  });
});

describe('Route V (headers) for Koa', () => {
  describe('GET /v/Greetings', () => {
    it('should return <hola> when requesting a version compliant with ^1.0.0', async () => {
      const {text} = await request(koaAppHeader.callback())
      .get(`/greetings`)
      .set('X-API-VERSION', '1.0.0')
      .expect(200);
      expect(text).toBe('hola');
    });
    it('should return <hello> when requesting a version compliant with  <1.x', async () => {
      const {text} = await request(koaAppHeader.callback())
      .get(`/greetings`)
      .set('X-API-VERSION', '0.1.1')
      .expect(200);
      expect(text).toBe('hello');
    });
    it('should return <hi> when requesting a version other acceptable versions.', async () => {
      const {text} = await request(koaAppHeader.callback())
      .get(`/greetings`)
      .set('X-API-VERSION', '2.6.9')
      .expect(200);
      expect(text).toBe('hi');
    });
    it('should return 400 when requesting a version not compliant with <5.x.', async () => {
      await request(koaAppHeader.callback())
      .get(`/greetings`)
      .set('X-API-VERSION', '5.0.1')
      .expect(400);
    });
    it('should return 400 when requesting an invalid version', async () => {
      await request(koaAppHeader.callback())
      .get(`/greetings`)
      .set('X-API-VERSION', 'hello')
      .expect(400);
    });
  });
});

describe('Route V for express', () => {
  describe('GET /v/Greetings', () => {
    it('should return <hola> when requesting a version compliant with ^1.0.0', async () => {
      const {text} = await request(expressApp)
      .get(`/v1.0.0/greetings`)
      .expect(200);
      expect(text).toBe('hola');
    });
    it('should return <hello> when requesting a version compliant with  <1.x', async () => {
      const {text} = await request(expressApp)
      .get(`/v0.1.9/greetings`)
      .expect(200);
      expect(text).toBe('hello');
    });
    it('should return <hi> when requesting a version other acceptable versions.', async () => {
      const {text} = await request(expressApp)
      .get(`/v2.6.9/greetings`)
      .expect(200);
      expect(text).toBe('hi');
    });
    it('should return 400 when requesting a version not compliant with <5.x.', async () => {
      await request(expressApp)
      .get(`/v5.0.1/greetings`)
      .expect(400);
    });
  });
});

describe('Route V (headers) for Express', () => {
  describe('GET /v/Greetings', () => {
    it('should return <hola> when requesting a version compliant with ^1.0.0', async () => {
      const {text} = await request(expressAppHeader)
      .get(`/greetings`)
      .set('X-API-VERSION', '1.0.0')
      .expect(200);
      expect(text).toBe('hola');
    });
    it('should return <hello> when requesting a version compliant with  <1.x', async () => {
      const {text} = await request(expressAppHeader)
      .get(`/greetings`)
      .set('X-API-VERSION', '0.1.1')
      .expect(200);
      expect(text).toBe('hello');
    });
    it('should return <hi> when requesting a version other acceptable versions.', async () => {
      const {text} = await request(expressAppHeader)
      .get(`/greetings`)
      .set('X-API-VERSION', '2.6.9')
      .expect(200);
      expect(text).toBe('hi');
    });
    it('should return 400 when requesting a version not compliant with <5.x.', async () => {
      await request(expressAppHeader)
      .get(`/greetings`)
      .set('X-API-VERSION', '5.0.1')
      .expect(400);
    });
    it('should return 400 when requesting an invalid version', async () => {
      await request(expressAppHeader)
      .get(`/greetings`)
      .set('X-API-VERSION', 'hello')
      .expect(400);
    });
  });
});
