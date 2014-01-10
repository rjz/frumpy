'use strict';

function onTik (model) {
  var keysPressed = model.keysPressed || '';
  return Frumpy.extend({}, model, {
    keysPressed: keysPressed + '.'
  });
}

function updateView (rootEl, model) {
  // Pretend that this isn't the worst view-renderer ever
  Object.keys(model).forEach(function (k) {
    var els = rootEl.querySelectorAll('[data-name="' + k + '"]');
    [].slice.call(els, rootEl).forEach(function (el) {
      try {
        el.innerText = model[k];
      } catch (e) {
        el.value = model[k];
      }
    });
  });
}

////////////////////////////

(function () {

  var p1Refresh = Frumpy.partial(updateView, document.querySelector('.playground1'));

  var playground1 = new Frumpy({}, [
    [ 'click',  [onClick,    p1Refresh] ],
    [ 'keyup',  [onKeyPress, p1Refresh] ],
    [ 'tikTok', [onTik,      p1Refresh] ]
  ]);

  document.addEventListener('keyup', playground1.as('keyup'));

  window.setInterval(playground1.as('tikTok'), 1000);

  function onClick (model, e) {
    var states = ['bang', 'arang'],
        index = +(model.foo == states[0]);
    return { foo: states[index] };
  }

  function onKeyPress (model, e) {
    var keysPressed = model.keysPressed || '';
    return Frumpy.extend({}, model, {
      keysPressed: keysPressed + String.fromCharCode(e.keyCode)
    });
  }
})();

////////////////////////////

(function () {

  var p2RootEl = document.querySelector('.playground2');

  var p2Refresh = Frumpy.partial(updateView, p2RootEl);

  var playground2 = new Frumpy({ hello: 'world' }, [
    [ 'xhr:load',     [unbind, onXhrLoad  ] ],
    [ 'xhr:error',    [unbind, onXhrError ] ],
    [ 'hello:change', [onHelloChange, save] ],
    [ 'model:change', p2Refresh ]
  ]);

  Frumpy.slice.call(p2RootEl.querySelectorAll('[data-name]'), 0).forEach(function (el) {
    var key = el.getAttribute('data-name');
    ['keyup','keydown','change'].forEach(function (evt) {
      el.addEventListener(evt, playground2.as(key + ':' + evt));
    });
  });

  function onHelloChange (model, evt) {
    return Frumpy.extend({}, model, {
      hello: evt.target.value,
      time: Date.now()
    });
  }

  function unbind (model, evt) {
    var req = evt.target;

    // Clean up handlers
    req.removeEventListener('load');
    req.removeEventListener('error');
  }

  function onXhrError (model, etc) {
    console.error('XHR failed');
  }

  function onXhrLoad (model, evt) {
    var req = evt.target;
    if (req.status >= 200 && req.status < 400){
      console.log('saved time:', JSON.parse(req.responseText).time);
    } else {
      console.error('err', req.status);
    }
  }

  function save (model) {

    var request = new XMLHttpRequest();

    request.open('POST', '/my/url', true);
    request.setRequestHeader('Content-type', 'application/json');

    request.addEventListener('load',  playground2.as('xhr:load'));
    request.addEventListener('error', playground2.as('xhr:error'));

    request.send(JSON.stringify(model));
  }
})();

