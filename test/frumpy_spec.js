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

  describe('utilities', function () {
    ['first','last','rest','extend','partial'].forEach(function (fn) {
      it('includes ' + fn, function () {
        assert.ok(Frumpy[fn]);
      });
    });

    describe('.slice', function () {
      it('takes starting offset', function () {
        var arr = [1, 2, 3];
        assert.deepEqual(Frumpy.slice(arr, 1), [2,3]);
      });

      it('takes ending offset', function () {
        var arr = [1, 2, 3];
        assert.deepEqual(Frumpy.slice(arr, 1, 2), [2]);
      });
    });

    describe('.first', function () {
      it('returns first element', function () {
        var arr = [1, 2, 3];
        assert.equal(Frumpy.first(arr), 1);
      });
    });

    describe('.last', function () {
      it('returns last element', function () {
        var arr = [1, 2, 3];
        assert.equal(Frumpy.last(arr), 3);
      });
    });

    describe('.rest', function () {
      it('returns last element', function () {
        var arr = [1, 2, 3];
        assert.equal(Frumpy.last(arr), 3);
      });
    });

    describe('.extend', function () {
      it('returns an object', function () {
        var o = { a: 1 };
        assert.equal(Frumpy.extend(o, { b: 2 }) instanceof Object, true);
      });

      it('extends first object', function () {
        var o = { a: 1 };
        assert.equal(Frumpy.extend(o, { b: 2 }), o);
      });

      it('mixes in keys from additional objects', function () {
        var o = { a: 1 };
        Frumpy.extend(o,
          { b: 2 },
          { c: 3 }
        );
        assert.equal(o.a, 1);
        assert.equal(o.b, 2);
        assert.equal(o.c, 3);
      });
    });

    describe('.copy', function () {
      it('returns an object', function () {
        var o = { a: 1 };
        assert.equal(Frumpy.copy(o, { b: 2 }) instanceof Object, true);
      });

      it('does not extend the first object', function () {
        var o = { a: 1 };
        assert.notEqual(Frumpy.copy(o, { b: 2 }), o);
      });

      it('mixes in keys from additional objects', function () {
        var o = { a: 1 };
        var p = Frumpy.copy(o,
          { b: 2 },
          { c: 3 }
        );
        assert.equal(p.a, 1);
        assert.equal(p.b, 2);
        assert.equal(p.c, 3);
      });
    });

    describe('.partial', function () {
      var add = function (a, b) {
        return a + b;
      };

      it('returns a function', function () {
        assert.equal(Frumpy.partial(add, 4) instanceof Function, true);
      });

      it('binds arguments', function () {
        var add4 = Frumpy.partial(add, 4);
        assert.equal(add4(1), 5);
      });
    });
  });
});

describe('Frumpy::trigger', function () {

  it('Calls handler with arguments', function (done) {

    var handler = function (model, arg) {
      assert.equal(arg, 3);
      done();
    };

    var f = new Frumpy({}, [
      [ 'fizz', [ handler ] ]
    ]);

    f.trigger('fizz', 3);
  });

  it('Calls handlers in order', function (done) {

    var preHandler = function (model, arg) {
      return { arg: arg };
    };

    var handler = function (model) {
      assert.equal(model.arg, 'Aaaargh!');
      done();
    };

    var f = new Frumpy({}, [
      [ 'fizz', [ preHandler, handler ] ]
    ]);

    f.trigger('fizz', 'Aaaargh!');
  });
});

