(function () {

  'use strict';

  var state0 = {
    lastRequest: null
  };

  var app = new Frumpy(state0, [
    [ 'xhr:load',  [onXhrLoad] ],
    [ 'xhr:error', [onXhrError] ]
  ]);

  function log () {
    console.log.apply(console, ['[XHR Example]'].concat(Frumpy.slice(arguments)));
  }

  function onXhrLoad (model, req) {
    if (req.status >= 200 && req.status < 400) {
      log('success!', req.status);
    }
    else {
      log('error!', req.status);
    }
    return Frumpy.extend({}, model, { lastRequest: req.status });
  }

  function onXhrError (model, xhr) {
    log('failed establishing connection');
  }

  var xhr = Frumpy.xhr(app);

  xhr.open('get', '/foobar');
  xhr.send();

})();

