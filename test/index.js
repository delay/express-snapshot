var assert = require('assert');
var snapshot = require('..');
const lib = require('../lib')
const app = require('./server')

describe('module', function () {
  it('exports snapshot', function () {
    assert.equal('function', typeof snapshot);
  });

  it('gets all of routes', () => {
    const routes = lib.getRoutes(app._router && app._router.stack)
    assert.equal(routes[0].path, '/foo/foo1.html')
    assert.equal(routes[1].path, '/foo/foo2.html')
    assert.equal(routes[2].path, '/bar.html')
    assert.equal(routes[3].path, '/baz.html')
  })
});
