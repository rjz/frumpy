(function () {

  /**
   *  Signals:
   *
   *    - `xhr:load` - an XHR request is completed, regardless of status
   *    - `xhr:error` - an XHR request failed to connect to the remote host
   *
   * @id  Frumpy.xhr
   * @type  Function
   * @param {String} method - an HTTP method
   * @param {String} url - to where should we address the request?
   *
   * app.include(Frumpy.xhr);
   * app.xhr('post', '/items').send({ 'foobar' });
   */
  Frumpy.xhr = function (method, url) {

    var app = this;

    // Clean up handlers
    var unbind = function (req) {
      req.removeEventListener('load', _onLoad);
      req.removeEventListener('error', _onError);
    };

    var _onError = function (evt) {
      var req = evt.target;
      unbind(req);
      app.trigger('xhr:error', evt.target);
    };

    var _onLoad = function (evt) {
      var req = evt.target;
      unbind(req);
      app.trigger('xhr:load', evt.target);
    };

    var request = new XMLHttpRequest();

    request.open(method, url, true);

    request.addEventListener('load',  _onLoad);
    request.addEventListener('error', _onError);

    return request;
  };

})();

