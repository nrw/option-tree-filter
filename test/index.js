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
    options: [
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
  }])

  tree = FilterTree(data, fn, {keepMatchChildren: true})

  t.same(tree.query('e'), [{
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
      {id: 'e'}
    ]
  }])

  tree = FilterTree(data, fn, {keepMatchChildren: false})

  t.same(tree.query('e'), [{
    title: 'second',
    options: []
  }, {
    title: 'third',
    options: [
      {id: 'e'}
    ]
  }])

  t.same(data, orig, 'data is unmodified')

  t.end()
})
