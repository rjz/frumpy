(function () {

  'use strict';

  var state0 = {
    lastRequest: null
  };

  var app = new Frumpy(state0, [
    [ 'xhr:load',  [onXhrLoad] ],
    [ 'xhr:error', [onXhrError] ]
  ]);

  /**
   *  Signals:
   *
   *    - xhr:load - an XHR request is completed, regardless of status
   *    - xhr:error - an XHR request failed to connect to the remote host
   */
  Frumpy.xhr = function (method, url) {

    // Clean up handlers
    var unbind = function (req) {
      req.removeEventListener('load', _onLoad);
      req.removeEventListener('error', _onError);
    };

    var _onError = function (evt) {
      var req = evt.target;
      unbind(req);
      f.trigger('xhr:error', evt.target);
    };

    var _onLoad = function (evt) {
      var req = evt.target;
      unbind(req);
      f.trigger('xhr:load', evt.target);
    };

    return function (model, url) {
      var request = new XMLHttpRequest();

      request.open(method, url, true);

      request.addEventListener('load',  _onLoad);
      request.addEventListener('error', _onError);

      request.send();
    };
  }

  app.include = function (mixin) {


  };

  app.include(Frumpy.xhr);

  function go () {
    app.xhr('get', '/foobar');
  }

  function onXhrLoad (model, req) {
    if (req.status >= 200 && req.status < 400){
      try {
        return JSON.parse(req.responseText)
      }
      catch (e) {
        console.error(e);
      }
    } else {
      console.error('err', req.status);
    }
  }

  function onXhrError (model, xhr) {

  }

})();

