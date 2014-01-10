var Frumpy = require('../src/frumpy'),
    assert = require('assert');

describe('Frumpy', function () {
  describe('when instantiated with no arguments', function () {
    it('blows up', function () {
      assert.throws(function () {
        new Frumpy();
      });
    });
  });

  describe('when instantiated with state and handlers', function () {
    it('is ok', function () {
      assert.doesNotThrow(function () {
        new Frumpy({}, []);
      });
    });
  });
});

