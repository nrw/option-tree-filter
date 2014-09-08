var test = require('tape')
var clone = require('lodash.clonedeep')
var NavTree = require('option-tree-navigate')
var process = require('../process')

var tree, filter, fn, node, path, data

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

  fn = function idExact (opt, query) {
    return opt.id && opt.id === query
  }

  t.same(process.testNodes(NavTree(data), fn, {}, 'c')._tree, [{
    id: '1',
    passes: false,
    keepChildren: false,
    options: [
      {id: 'a', passes: false, keepChildren: false},
      {id: 'b', passes: false, keepChildren: false}
    ]
  }, {
    id: '2',
    passes: false,
    keepChildren: false,
    options: [{
      id: 'c',
      passes: true,
      keepChildren: false,
      options: [
        {id: 'd', passes: false, keepChildren: false}
      ]
    }]
  }, {
    id: '3',
    passes: false,
    keepChildren: false,
    options: [
      {id: 'e', passes: false, keepChildren: false},
      {id: 'f', passes: false, keepChildren: false}
    ]
  }])

  t.same(process.markKeepers(NavTree(data))._tree, [{
    id: '1',
    passes: false,
    keep: false,
    keepChildren: false,

    options: [
      {id: 'a', passes: false, keep: false, keepChildren: false},
      {id: 'b', passes: false, keep: false, keepChildren: false}
    ]
  }, {
    id: '2',
    passes: false, keep: true, keepChildren: false,
    options: [{
      id: 'c',
      passes: true,
      keep: true,
      keepChildren: false,
      options: [
        {id: 'd', passes: false, keep: false, keepChildren: false}
      ]
    }]
  }, {
    id: '3',
    passes: false,
    keep: false,
    keepChildren: false,
    options: [
      {id: 'e', passes: false, keep: false, keepChildren: false},
      {id: 'f', passes: false, keep: false, keepChildren: false}
    ]
  }])

  t.same(process.filterTree(data), [{
    id: '2',
    options: [{
      id: 'c',
      options: []
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

  fn = function (opt, query) {
    try {
      var regex = new RegExp(query, 'i')
      return (
        (opt.id && regex.test(opt.id)) ||
        (opt.title && regex.test(opt.title))
      )
    } catch (e) {
      return false
    }
  }

  t.same(process.runFilter(NavTree(clone(tree)), fn, {}, 'a'), [{
    title: 'first',
    options: [
      {id: 'a'}
    ]
  }])
  t.same(copy, tree)

  t.same(process.runFilter(NavTree(tree), fn, {}, 'e'), [{
    title: 'second',
    options: []
  }, {
    title: 'third',
    options: [
      {id: 'e'}
    ]
  }])

  t.end()
})

test('forward arguments to filter fn', function (t) {
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

  fn = function (opt, query, value) {
    for (var i = value.length - 1; i >= 0; i--) {
      if (opt.id === value[i].id) {
        return {
          keep: false,
          passes: false,
          keepChildren: false
        }
      }
    }
    try {
      var regex = new RegExp(query, 'i')
      return {
        passes: (
          (opt.id && regex.test(opt.id)) ||
          (opt.title && regex.test(opt.title))
        ),
        keepChildren: true
      }
    } catch (e) {
      return {passes: false}
    }
  }

  t.same(process.runFilter(NavTree(clone(tree)), fn, {}, 'th', [{id: 'e'}]), [{
    title: 'third',
    options: [
      {id: 'f'}
    ]
  }])
  t.same(copy, tree)

  t.end()
})
