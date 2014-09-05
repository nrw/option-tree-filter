var cloneDeep = require('lodash.clonedeep')
var NavTree = require('option-tree-navigate')
var process = require('./process')

module.exports = FilterTree

function FilterTree (data, fns, opts) {
  return {
    query: query.bind(null, data, fns, opts)
  }
}

function query (data, fns, opts, q) {
  var tree = NavTree(cloneDeep(data))

  return process.runFilter(tree, fns, opts, q || '')
}
