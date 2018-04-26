const Promise = require('bluebird');
const fetch = Promise.promisify(require('request'));
const write = Promise.promisify(require('fs').writeFile);
const path = require('path')

exports.getRoutes = getRoutes
exports.filepath = filepath
exports.folderpath = folderpath 
exports.fetchHtml = fetchHtml 
exports.returnResponse = returnResponse
exports.writeHtml = writeHtml

function getRoutes(stack) {
  const routes = (stack || [])
    .filter(it => it.route || it.name === 'router')
    .reduce((result, it) => {
      if (! it.route) {
        // We are handling a router middleware.
          const stack = it.handle.stack
        const routes = getRoutes(stack)

        return result.concat(routes)
      }

      return result.concat(it.route)
    }, [])

  return routes
}

function filepath(route, outputDir) {
  if (route.path.match(/\.[^\.]+$/)) return outputDir + route.path;
  return outputDir + route.path.split('/').concat(['index.']).join('/');
}

function folderpath(route, outputDir) {
  if (route.path.match(/\.[^\.]+$/)) {
    return outputDir + route.path.split('/').slice(0, -1).join('/');
  }
  return outputDir + route.path;
}

function fetchHtml(route) {
  return function () {
    return fetch('http://localhost:6044' + route.path);
  }
}

function returnResponse(res) {
  return res[0];
}

function writeHtml(filepath) {
  return function (response) {
    const contentType = response.headers['content-type'];
    const pathExt = path.extname(filepath)
    const ext = contentType.split(';')[0].split(/\/|\+/).pop() || 'html';
    const fp = pathExt ? filepath : filepath + ext
    return write(fp, response.body);
  };
}
