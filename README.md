# Frumpy

A tiny (<1k) event dispatcher with very few features and opinions.

[http://rjz.github.io/frumpy](http://rjz.github.io/frumpy)

[![Build
Status](https://travis-ci.org/rjz/frumpy.svg)](https://travis-ci.org/rjz/frumpy)

### Example

Write some routines that interact with the application model.

    function log (model) {
      // No return value; model will not be updated.
      console.log(model);
    }

    function ticking (model) {
      // Update the model
      return Frumpy.copy(model, {
        foo: model.foo + 5
      });
    }

Then create an instance of `Frumpy` and wire it up:

    var model = { foo: 0 };

    var handlers = [
      [ 'tikTok',       ticking ],
      [ 'model:change', log     ]
    ];

    var f = new Frumpy(model,  handlers);

    setInterval(f.as('tikTok'), 500);

### Usage

    $ npm install && bower install

Launch a server at http://localhost:3277

    $ npm start

### Tests

    $ npm test

### License

[WTFPL](http://www.wtfpl.net/)

