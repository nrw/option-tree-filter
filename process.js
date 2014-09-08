// omit if
// - filter function returns false AND
// - no child node passed the filter function

// keep if
// - filter functions returned true OR
// - any child node received true from filter function

module.exports = {
  testNodes: testNodes,
  markKeepers: markKeepers,
  filterTree: filterTree,
  runFilter: runFilter
}

var slice = Array.prototype.slice
var blacklist = ['keepChildren', 'passes', 'keep']

// takes a NavTree, returns raw object
function runFilter (tree, fn, opts, query) {
  var args = slice.call(arguments)
  testNodes.apply(null, args)
  markKeepers(tree)
  filterTree(tree._tree, opts)
  return tree._tree
}

// takes a NavTree, returns it
function testNodes (tree, fn, opts, query) {
  var node, path, passes, res
  var args = slice.call(arguments, 3)

  while ((path = tree.nextNode(path))) {
    node = tree.readPath(path)
    res = fn.apply(null, [node].concat(args))

    if (typeof res !== 'object') {
      res = {passes: !!res}
    }

    node.passes = !!res.passes

    node.keepChildren = res.keepChildren !== undefined ?
      !!res.keepChildren : opts.keepMatchChildren !== undefined ?
        !!opts.keepMatchChildren : false

    if (res.keep !== undefined) {
      node.keep = res.keep
    }
  }
  return tree
}

// takes a NavTree, returns it
function markKeepers (tree) {
  var node, path, children

  while ((path = tree.nextNode(path))) {
    node = tree.readPath(path)
    children = tree.childNodes(path)

    node.keep = node.keep !== undefined ?
      node.keep : passes(node) || children.some(passes)

    if (node.passes && node.keepChildren) {
      for (var i = children.length - 1; i >= 0; i--) {
        children[i].keep = children[i].keep !== undefined ?
          children[i].keep : true
      }
    }
  }
  return tree
}

// takes a raw object
function filterTree (tree, opts) {
  tree = tree || []
  opts = opts || {}
  opts.optionField = opts.optionField || 'options'

  var node

  for (var i = 0; i < tree.length; i++) {
    node = tree[i]

    if (node.keep) {
      if (node[opts.optionField]) {
        filterTree(node[opts.optionField])
      }
      clean(node)
    } else {
      tree.splice(i, 1)
      i--
    }
  }
  return tree
}

function passes (obj) {
  return obj.passes
}

function clean (obj) {
  for (var i = blacklist.length - 1; i >= 0; i--) {
    delete obj[blacklist[i]]
  }
  return obj
}
