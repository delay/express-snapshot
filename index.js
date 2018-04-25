#!/usr/bin/env node

const Promise = require('bluebird');
const Progress = require('progress');
const program = require('commander');
const join = require('path').join;
const http = require('http-promise');
const mkdirp = Promise.promisify(require('mkdirp'));
const cwd = process.cwd();
const lib = require('./lib')

program
  .version('1.0.0')
  .usage('[options] app.js')
  .option('-o,--output <dir>', 'specify the directory to save snapshot to');

program
  .command('*')
  .description('snapshot the given <app>')
  .action(function (filename) {
    var app = require(join(process.cwd(), filename));
    snapshot(app);
  });

if (require.main === module) {
  program.parse(process.argv);
} else {
  module.exports = snapshot;
}

function snapshot(app) {
  var date = new Date();
  var outputDir = program.output || 'snapshot-' + date.toISOString();
  var server = http.createServerAsync(app);
  var stack = lib.getRoutes(app._router && app._router.stack)
  var progress = new Progress('[:bar] :status', {
    width: 24,
    total: (stack.length * 2) + 1
  });

  server
    .listen(6044)
    .return(stack)
    .each(function (route) {
      progress.tick(1, { status: 'fetching ' + route.path });

      return mkdirp(lib.folderpath(route, outputDir))
        .then(lib.fetchHtml(route))
        .then(lib.returnResponse)
        .tap(function () {
          progress.tick(1, { status: 'writing ' + lib.filepath(route, outputDir) });
        })
        .then(lib.writeHtml(lib.filepath(route, outputDir)));
    })
    .then(function () {
      progress.tick(1, { status: 'finished' });
      server.close();
      return true
    })
    .catch(console.error);
};
