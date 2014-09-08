var cloneDeep = require('lodash.clonedeep')
var NavTree = require('option-tree-navigate')
var process = require('./process')

module.exports = FilterTree

function FilterTree (data, fn, opts) {
  return {
    query: query.bind(null, data, fn, opts)
  }
}

function query (data, fn, opts, q) {
  var tree = NavTree(cloneDeep(data), opts)

  return process.runFilter(tree, fn, opts, q || '')
}
