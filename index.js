var cloneDeep = require('lodash.clonedeep')
var NavTree = require('option-tree-navigate')
var process = require('./process')
var slice = Array.prototype.slice

module.exports = FilterTree

function FilterTree (data, fn, opts) {
  return {
    query: query.bind(null, data, fn, opts)
  }
}

function query (data, fn, opts) {
  var tree = NavTree(cloneDeep(data), opts)

  var args = slice.call(arguments, 0)
  args.shift()
  args.unshift(tree)

  return process.runFilter.apply(null, args)
}
