(function (win) {

  'use strict';

  function Actor (opts) {

    var el;
    if (opts._el) {
      el = opts._el;
    }
    else {
      el = document.createElement('div');
      el.className = opts.type || 'goon';
    }

    Frumpy.extend(this, opts, {
      width: 32,
      height: 32,
      _el: el
    });

    Object.freeze(this);
  }

  var initialState = {
    newGoons: [],
    actors: [
      new Actor({
        type: 'avatar',
        pos: [window.innerWidth / 2, window.innerHeight / 2],
        v: [0, 0]
      })
    ],
    isPaused: true
  };

  var app = new Frumpy(initialState, [
    ['ready',      [ready]],
    ['tick',       [calc, collide, cull, redraw]],
    ['spawnTick',  [spawn, spawn, spawn]],
    ['onKeyup',    [togglePaused]],
    ['onClick',    [adjustAvatar]]
  ]);

  win.setInterval(app.as('tick'), 20);
  win.setInterval(app.as('spawnTick'), 100);

  win.addEventListener('keyup', app.as('onKeyup'));

  win.addEventListener('click', app.as('onClick'));

  document.addEventListener('DOMContentLoaded', app.as('ready'));

  function ready (model) {
    return Frumpy.copy(model, {
      isPaused: false,
      $scene: document.querySelector('.scene')
    });
  }

  function adjustAvatar (model, evt) {
    var avatars, others;

    var actorTypes = model.actors.reduce(function (types, a) {
      if (a.type === 'avatar') {
        return [types[0].concat(a), types[1]];
      }
      else {
        return [types[0], types[1].concat(a)];
      }
    }, [[],[]]);

    avatars = actorTypes[0];
    others = actorTypes[1];

    if (!avatars.length) return model;

    return Frumpy.copy(model, {
      actors: others.concat(avatars.map(function (a) {
        var dy = evt.clientY - a.pos[1],
            dx = evt.clientX - a.pos[0];

        var c = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

        var vx = dx / c * 2,
            vy = dy / c * 2

        return new Actor(Frumpy.copy(a, {
          v: [vx, vy]
        }));
      }))
    });
  }

  function togglePaused (model, evt) {
    switch (evt.keyCode) {
      case 32:
        return Frumpy.copy(model, { isPaused: !model.isPaused });
        break;
    }
  }

  function spawn (model) {

    var mx = win.innerWidth - 10,
        my = win.innerHeight - 10;

    var rx = Math.max(10, Math.random() * mx),
        ry = Math.max(10, Math.random() * my);

    var pos, v;

    var side = Math.floor(Math.random() * 4);

    if (model.isPaused) return;

    switch (side) {
      case 0: pos = [0 , ry]; v = [0.8,  0]; break;
      case 1: pos = [mx, ry]; v = [-0.8, 0]; break;
      case 2: pos = [rx, 0 ]; v = [0,  0.8]; break;
      case 3: pos = [rx, my]; v = [0, -0.8]; break;
    };

    var newGoon = new Actor({
      type: 'goon',
      id: Math.random(),
      pos: pos,
      v: v
    });

    return Frumpy.copy(model, { newGoons: [newGoon] });
  }

  function calc (model) {
    var tickPosition = function (actor) {
      var x = actor.pos[0] + actor.v[0],
          y = actor.pos[1] + actor.v[1];

      return {
        pos: [x, y]
      }
    };

    var copiedGoons = model.newGoons.concat(model.actors).map(function (g) {
      return new Actor(Frumpy.copy(g, tickPosition(g)));
    });

    if (model.isPaused) return;

    return Frumpy.copy(model, {
      actors: copiedGoons,
      newGoons: []
    });
  }

  function cull (model) {
    var w = win.innerWidth,
        h = win.innerHeight;

    var newGoons = model.actors.filter(function (g) {

      var gx = g.pos[0],
          gy = g.pos[1];

      if (g._deleted) { // collision?
        if (g.type === 'avatar') {
          //model.isPaused = true;
          console.log('destroyed');
        }
        if (model.$scene && g._el.parentNode === model.$scene) {
          model.$scene.removeChild(g._el);
        }
      }
      else if (gx > 0 && gx < w && gy > 0 && gy < h) {
        return true;
      }
      else if (g._el.parentNode === model.$scene) {
        model.$scene.removeChild(g._el);
      }
    });

    if (model.isPaused) return;

    return Frumpy.copy(model, { actors: newGoons });
  }

  function collide (model) {

    // check by circles. naive.
    var checkCollision = function (g1, g2) {
      if (Math.abs(g1.pos[0] - g2.pos[0]) < 30 && Math.abs(g1.pos[1] - g2.pos[1]) < 30) {
        return true;
      }
    };

    var newGoons = model.actors.reduce(function (m, g) {
      var collisions = model.actors.filter(function (h) {
        return g !== h && checkCollision(g, h);
      });

      if (collisions.length) {
        return m.concat(new Actor(Frumpy.extend({
          _deleted: true
        }, g)));
      }
      else {
        return m.concat(g);
      }
    }, []);

    if (model.isPaused) return;

    return Frumpy.copy(model, { actors: newGoons });
  }

  function redraw (model) {

    if (model.isPaused) return;

    model.actors.filter(function (g, i) {

      if (g._el.parentNode !== model.$scene) {
        model.$scene.appendChild(g._el);
      }

      Frumpy.extend(g._el.style, {
        left: (g.pos[0] - g.width / 2) + 'px',
        top: (g.pos[1] - g.height / 2) + 'px'
      });
    });
  }

})(window);

