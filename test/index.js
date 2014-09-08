var test = require('tape')
var clone = require('lodash.clonedeep')
var FilterTree = require('..')

var tree, filter, fn, node, path, data, ids

test('simple filter', function (t) {
  ids = ['a']

  data = [{
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

  var orig = clone(data)

  fn = function (opt, query) {
    return searchFilter(opt, query) && unselectedFilter(opt)
  }

  function searchFilter (opt, query) {
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

  function unselectedFilter (opt) {
    return !opt.id || !~ids.indexOf(opt.id)
  }

  tree = FilterTree(data, fn, {})

  t.same(tree.query(''), [{
    title: 'first',
    keep: true,
    passes: true,
    options: [
      {id: 'b', keep: true, passes: true}
    ]
  }, {
    title: 'second',
    keep: true,
    passes: true,
    options: [{
      id: 'c',
      keep: true,
      passes: true,
      options: [
        {id: 'd', keep: true, passes: true}
      ]
    }]
  }, {
    title: 'third',
    keep: true,
    passes: true,
    options: [
      {id: 'e', keep: true, passes: true},
      {id: 'f', keep: true, passes: true}
    ]
  }])

  tree = FilterTree(data, fn, {keepMatchChildren: true})

  t.same(tree.query('e'), [{
    title: 'second',
    keep: true,
    passes: true,
    options: [{
      id: 'c',
      keep: false,
      passes: false,
      options: [
        {id: 'd', keep: false, passes: false}
      ]
    }]
  }, {
    title: 'third',
    keep: true,
    passes: false,
    options: [
      {id: 'e', keep: true, passes: true}
    ]
  }])

  tree = FilterTree(data, fn, {keepMatchChildren: false})

  t.same(tree.query('e'), [{
    title: 'second',
    keep: true,
    passes: true,
    options: []
  }, {
    title: 'third',
    keep: true,
    passes: false,
    options: [
      {id: 'e', keep: true, passes: true}
    ]
  }])

  t.same(data, orig, 'data is unmodified')

  t.end()
})
