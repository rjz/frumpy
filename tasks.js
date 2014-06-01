var path = require('path'),
    fs = require('fs');

var Frumpy = require('./src/frumpy');

function fatalOr (orElse) {
  return function (err, result) {
    if (err) {
      process.stderr.write(err.toString() + '\n');
      process.exit(1);
    }
    else {
      orElse.apply(this, Frumpy.rest(arguments));
    }
  }
}

//  Run example server
//
//      $ npm start
//
module.exports.server = function () {

  var port = 3277;

  var file = new (require('node-static').Server)('src');

  var index = fs.readFileSync(path.join(__dirname, 'src/examples/index.html'));

  require('http').createServer(function (req, res) {
    var reqData = '';

    function onServed (err, result) {
      if (err) {
        res.end(index);
      }
    }

    req.addListener('data', function (data) {
      reqData += data;
    });

    req.addListener('end', function (data) {
      process.stdout.write([req.method, req.url].join(' ') + '\n');
      if (req.method.toUpperCase() === 'GET') {
        file.serve(req, res, onServed);
      }
      else {
        process.stdout.write('  ^-- ' + reqData + '\n');
        res.end(reqData);
      }
    }).resume();
  }).listen(port);

  process.stdout.write('Go play @ http://localhost:' + port + '\n');
};

// Generate documentation
//
//    $ npm run-script docs
//
module.exports.docs = function () {

  var glob = require('glob'),
      scrawl = require('scrawl'),
      hogan = require('hogan.js');

  function readAndParse (path) {
    var src = fs.readFileSync(path, 'utf8'),
        parsed = scrawl.parse(src);

    return parsed.map(function (p) {
      if (p.signal) {
        if (!p.signal.map) {
          p.signal = [p.signal];
        }
        p.signal = p.signal.map(function (s) {
          var parts = s.split(' ');
          return {
            name: Frumpy.first(parts),
            desc: Frumpy.rest(parts).join(' ')
          };
        });
      }

      return p;
    });
  }

  function reduceSrcFiles (a, b) {
    return a.concat([{
      id: path.basename(b, '.js'),
      methods: readAndParse(b)
    }]);
  }

  glob('src/plugins/*.js', fatalOr(function (pluginFiles) {

    var core = readAndParse('./src/frumpy.js');
    var plugins = pluginFiles.reduce(reduceSrcFiles, []);

    glob('src/docs/*.hogan', fatalOr(function (templateFiles) {

      var templates = templateFiles.reduce(function (ts, f) {
        var name = path.basename(f, '.hogan'),
            newTs = Frumpy.extend({}, ts);
        newTs[name] = hogan.compile(fs.readFileSync(f, 'utf8'));
        return newTs;
      }, {});

      var tmpl = templates['template'].render({
        core: core,
        plugins: plugins
      }, templates);

      if (!fs.existsSync('./docs')) {
        fs.mkdirSync('./docs');
      }

      fs.createReadStream('./src/docs/style.css')
        .pipe(fs.createWriteStream('./docs/style.css'));

      fs.writeFileSync('./docs/index.html', tmpl);
    }));
  }));
};

