# option-tree-filter [![build status](https://secure.travis-ci.org/nrw/option-tree-filter.png)](http://travis-ci.org/nrw/option-tree-filter)

Filter an option tree

```js

var FilterTree = require('option-tree-filter')
var assert = require('assert')

var tree = FilterTree([{
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
}], [
  function idExact (opt, query) {
    return opt.id && opt.id === query
  }
])

// returns a copy. original data is unchanged.
assert.deepEqual(tree.query('e'), [{
  id: '3',
  options: [
    {
      id: 'e',
      passes: true,
      keep: true
    }
  ],
  passes: false,
  keep: true
}])
```

# usage

