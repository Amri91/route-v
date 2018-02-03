'use strict';

const request = require('supertest');

const {app: koaApp} = require('../examples/koa');
const {app: expressApp} = require('../examples/express');

describe('Route V for Koa', () => {
  describe('GET /v/Greetings', () => {
    it('should return <ola> when requesting a version compliant with ^1.0.0', async () => {
      const {text} = await request(koaApp.callback())
      .get(`/v1.0.0/greetings`)
      .expect(200);
      expect(text).toBe('ola');
    });
    it('should return <hello> when requesting a version compliant with  <1.x', async () => {
      const {text} = await request(koaApp.callback())
      .get(`/v0.1.9/greetings`)
      .expect(200);
      expect(text).toBe('hello');
    });
    it('should return <hi> when requesting a version other acceptable versions.', async () => {
      const {text} = await request(koaApp.callback())
      .get(`/v2.6.9/greetings`)
      .expect(200);
      expect(text).toBe('hi');
    });
    it('should return 400 when requesting a version not compliant with <5.x.', async () => {
      await request(koaApp.callback())
      .get(`/v5.0.1/greetings`)
      .expect(400);
    });
  });
});

describe('Route V for express', () => {
  describe('GET /v/Greetings', () => {
    it('should return <ola> when requesting a version compliant with ^1.0.0', async () => {
      const {text} = await request(expressApp)
      .get(`/v1.0.0/greetings`)
      .expect(200);
      expect(text).toBe('ola');
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
      const a = await request(expressApp)
      .get(`/v5.0.1/greetings`)
      .expect(400);
    });
  });
});
