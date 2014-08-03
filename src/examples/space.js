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
      width:  opts._radius * 2,
      height: opts._radius * 2,
      _el: el
    });

    Object.freeze(this);
  }

  var initialState = {
    score: 0,
    created: [],
    destroyed: [],
    actors: [
      new Actor({
        _radius: 16,
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
    ['onClick',    [adjustAvatar]],
    ['itsAllOver', [gameOver]]
  ]);

  win.setInterval(app.as('tick'), 20);
  win.setInterval(app.as('spawnTick'), 100);

  win.addEventListener('keyup', app.as('onKeyup'));

  win.addEventListener('click', app.as('onClick'));

  document.addEventListener('DOMContentLoaded', app.as('ready'));

  function gameOver (model) {
    console.log('it\'s all over');
  }

  function ready (model) {
    return Frumpy.copy(model, {
      t0: (new Date()),
      isPaused: false,
      $scene: document.querySelector('.js-scene'),
      $score: document.querySelector('.js-scene .js-score')
    });
  }

  // Split an array based on a truth test. Values matching go left; values
  // failing go right.
  function splitArr (arr, test) {
    return arr.reduce(function (results, a) {
      if (test(a)) {
        return [results[0].concat(a), results[1]];
      }
      else {
        return [results[0], results[1].concat(a)];
      }
    }, [[],[]]);
  }

  function isAvatar (a) {
    return a.type === 'avatar';
  }

  function copyAvatarVelocity (model, iter) {

    var actorTypes = splitArr(model.actors, isAvatar);
    var avatars = actorTypes[0];
    var others = actorTypes[1];

    if (!avatars.length) return model;

    return Frumpy.copy(model, {
      actors: others.concat(avatars.map(function (a) {
        return new Actor(Frumpy.copy(a, {
          v: iter(a)
        }));
      }))
    });
  }

  function adjustAvatar (model, evt) {
    return copyAvatarVelocity(model, function (a) {
      var dy = evt.clientY - a.pos[1],
          dx = evt.clientX - a.pos[0];

      var c = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

      var vx = dx / c * 2,
          vy = dy / c * 2;

      return [vx, vy];
    });
  }

  function togglePaused (model, evt) {
    var attrs;

    var identity = function (v) {
      return v;
    };

    if (!model.isGameOver) {
      switch (evt.keyCode) {
        case 32:
          return { isPaused: !model.isPaused };
        case 37: // left
          return copyAvatarVelocity(model, Frumpy.partial(identity, [-2, 0]));
        case 39: // right
          return copyAvatarVelocity(model, Frumpy.partial(identity, [2, 0]));
        case 38: // up
          return copyAvatarVelocity(model, Frumpy.partial(identity, [0, -2]));
        case 40: // down
          return copyAvatarVelocity(model, Frumpy.partial(identity, [0, 2]));
      }
      if (attrs) {
        return Frumpy.copy(model, attrs);
      }
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
    }

    var newGoon = new Actor({
      type: 'goon',
      id: Math.random(),
      pos: pos,
      v: v,
      _radius: 16 + Math.floor(Math.random() * 40)
    });

    return Frumpy.copy(model, {
      created: [newGoon]
    });
  }

  function calc (model) {

    var updatedActors;

    var tickPosition = function (actor) {
      var x = actor.pos[0] + actor.v[0],
          y = actor.pos[1] + actor.v[1];

      return new Actor(Frumpy.copy(actor, {
        pos: [x, y]
      }));
    };

    if (!model.isPaused) {

      updatedActors = model.created.concat(model.actors).map(tickPosition);

      return Frumpy.copy(model, {
        score: (new Date()) - model.t0,
        actors: updatedActors,
        created: []
      });
    }
  }

  function cull (model) {

    var destroyed, survivors,
        isGameOver = false,
        isPaused = false;

    var w = win.innerWidth,
        h = win.innerHeight;

    var isInBounds = function (g) {
      var gx = g.pos[0],
          gy = g.pos[1];

      return (gx > 0 && gx < w && gy > 0 && gy < h);
    };

    if (!model.isPaused) {

      survivors = splitArr(model.actors, isInBounds);

      destroyed = model.destroyed.concat(survivors[1]);

      if (destroyed.some(function (g) {
        return g.type === 'avatar';
      })) {
        isPaused = true;
        isGameOver = true;
        app.trigger('itsAllOver');
      }

      return Frumpy.copy(model, {
        actors: survivors[0],
        destroyed: destroyed,
        isGameOver: isGameOver,
        isPaused: isPaused
      });
    }
  }

  function collide (model) {

    var survivors;

    // check by circles. naive.
    var haveCollided = function (g1, g2) {

      var radius = g1._radius + g2._radius;

      return (Math.abs(g1.pos[0] - g2.pos[0]) < radius &&
              Math.abs(g1.pos[1] - g2.pos[1]) < radius);
    };

    var hasSurvived = function (a) {
      return !model.actors.some(function (h) {
        return a !== h && haveCollided(a, h);
      });
    };

    if (!model.isPaused) {

      survivors = splitArr(model.actors, hasSurvived);

      return Frumpy.copy(model, {
        actors    : survivors[0],
        destroyed : model.destroyed.concat(survivors[1])
      });
    }
  }

  function redraw (model) {

    var drawActor = function (g, i) {
      if (g._el.parentNode !== model.$scene) {
        model.$scene.appendChild(g._el);
      }

      Frumpy.extend(g._el.style, {
        width: g.width + 'px',
        height: g.height + 'px',
        left: (g.pos[0] - g.width / 2) + 'px',
        top:  (g.pos[1] - g.height / 2) + 'px'
      });
    };

    var removeActor = function (g) {
      if (g._el.parentNode === model.$scene) {
        model.$scene.removeChild(g._el);
      }
    };

    if (!model.isPaused) {
      win.requestAnimationFrame(function () {
        model.destroyed.forEach(removeActor);
        model.actors.forEach(drawActor);

        model.$score.innerText = model.score;

        return Frumpy.copy(model, {
          destroyed: []
        });
      });
    }
  }
})(window);

