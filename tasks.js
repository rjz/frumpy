var path = require('path'),
    fs = require('fs');

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

  function parseFile (path) {
    var src = fs.readFileSync(path, 'utf8');
    return scrawl.parse(src);
  }

  var flatten = function (a, b) {
    return a.concat(parseFile(b));
  };

  glob('src/plugins/*.js', function (err, plugins) {

    var entries = parseFile('./src/frumpy.js');
    var pluginMethods = plugins.reduce(flatten, []);

    glob('src/docs/*.hogan', function (err, templates) {

      var tf = templates.reduce(function (ts, f) {
        ts[path.basename(f, '.hogan')] = hogan.compile(fs.readFileSync(f, 'utf8'));
        return ts;
      }, {});

      var tmpl = tf['template'].render({ entries: entries, pluginMethods: pluginMethods }, tf);

      if (!fs.existsSync('./docs')) {
        fs.mkdirSync('./docs');
      }

      fs.createReadStream('./src/docs/style.css').pipe(fs.createWriteStream('./docs/style.css'));

      fs.writeFileSync('./docs/index.html', tmpl);
    });
  });
};

