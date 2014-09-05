var test = require('tape')
var clone = require('lodash.clonedeep')
var NavTree = require('option-tree-navigate')
var process = require('../process')

var tree, filter, fns, node, path, data

test('test tree', function (t) {
  data = [{
    id: '1',
    options: [
      {id: 'a'},
      {id: 'b'}
    ]
  }, {
    id: '2',
    options: [{
      id: 'c',
      options: [
        {id: 'd'}
      ]
    }]
  }, {
    id: '3',
    options: [
      {id: 'e'},
      {id: 'f'}
    ]
  }]

  var treeCopy = clone(data)

  fns = [
    function idExact (opt, query) {
      return opt.id && opt.id === query
    }
  ]

  t.same(process.testNodes(NavTree(data), fns, 'c')._tree, [{
    id: '1',
    passes: false,
    options: [
      {id: 'a', passes: false},
      {id: 'b', passes: false}
    ]
  }, {
    id: '2',
    passes: false,
    options: [{
      id: 'c',
      passes: true,
      options: [
        {id: 'd', passes: false}
      ]
    }]
  }, {
    id: '3',
    passes: false,
    options: [
      {id: 'e', passes: false},
      {id: 'f', passes: false}
    ]
  }])

  t.same(process.markKeepers(NavTree(data))._tree, [{
    id: '1',
    passes: false,
    keep: false,
    options: [
      {id: 'a', passes: false, keep: false},
      {id: 'b', passes: false, keep: false}
    ]
  }, {
    id: '2',
    passes: false, keep: true,
    options: [{
      id: 'c',
      passes: true,
      keep: true,
      options: [
        {id: 'd', passes: false, keep: false}
      ]
    }]
  }, {
    id: '3',
    passes: false,
    keep: false,
    options: [
      {id: 'e', passes: false, keep: false},
      {id: 'f', passes: false, keep: false}
    ]
  }])

  t.same(process.filterTree(data), [{
    id: '2',
    passes: false,
    keep: true,
    options: [{
      id: 'c',
      options: [],
      keep: true,
      passes: true
    }]
  }])

  t.end()
})

test('more filters', function (t) {
  tree = [{
    title: 'first',
    options: [
      {id: 'a'},
      {id: 'b'}
    ]
  }, {
    title: 'second',
    options: [{
      id: 'c',
      options: [
        {id: 'd'}
      ]
    }]
  }, {
    title: 'third',
    options: [
      {id: 'e'},
      {id: 'f'}
    ]
  }]
  var copy = clone(tree)

  fns = [function (opt, query) {
    try {
      var regex = new RegExp(query, 'i')
      return (
        (opt.id && regex.test(opt.id)) ||
        (opt.title && regex.test(opt.title))
      )
    } catch (e) {
      return false
    }
  }]

  t.same(process.runFilter(NavTree(clone(tree)), fns, {}, 'a'), [{
    title: 'first',
    passes: false,
    keep: true,
    options: [
      {id: 'a', keep: true, passes: true}
    ]
  }])
  t.same(copy, tree)

  t.same(process.runFilter(NavTree(tree), fns, {}, 'e'), [{
    title: 'second',
    passes: true,
    keep: true,
    options: []
  }, {
    title: 'third',
    passes: false,
    keep: true,
    options: [
      {id: 'e', keep: true, passes: true}
    ]
  }])

  t.end()
})
