(function () {

  'use strict';

  var state0 = {
    lastRequest: null
  };

  var app = new Frumpy(state0, [
    [ 'xhr:load',  [onXhrLoad] ],
    [ 'xhr:error', [onXhrError] ]
  ]);

  app.include = function (name) {
    this[name] = Frumpy[name];
  };

  app.include(Frumpy.xhr);

  function onXhrLoad (model, req) {
    if (req.status >= 200 && req.status < 400){
      model.lastRequest = req.status;
/*      try {
        return JSON.parse(req.responseText)
      }
      catch (e) {
        console.error(e);
      }
      */
    } else {
      console.error('err', req.status);
    }

    return Frumpy.extend({}, model, { lastRequest: req.status });
  }

  function onXhrError (model, xhr) {

  }

  app.xhr('get', '/foobar').send();

})();

