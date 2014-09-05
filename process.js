// omit if
// - any filter function returns false AND
// - no child node got all trues from the filter functions

// keep if
// - all filter functions returned true OR
// - any child node received true for all filter functions

module.exports = {
  testNodes: testNodes,
  markKeepers: markKeepers,
  filterTree: filterTree,
  runFilter: runFilter
}

// takes a NavTree, returns raw object
function runFilter (tree, fns, opts, query) {
  testNodes(tree, fns, query)
  markKeepers(tree)
  filterTree(tree._tree, opts)
  return tree._tree
}

// takes a NavTree, returns it
function testNodes (tree, fns, query) {
  var node, path, passes

  while ((path = tree.nextNode(path))) {
    node = tree.readPath(path)
    node.passes = passesAll(fns, node, query)
  }
  return tree
}

// takes a NavTree, returns it
function markKeepers (tree) {
  var node, path, children

  while ((path = tree.nextNode(path))) {
    node = tree.readPath(path)
    children = tree.childNodes(path)
    node.keep = passes(node) || children.some(passes)
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
      if (!(opts.keepMatchChildren && node.passes) && node[opts.optionField]) {
        filterTree(node[opts.optionField])
      }
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

function passesAll (fns, node, query) {
  for (var i = 0; i < fns.length; i++) {
    if (!fns[i](node, query)) return false
  }
  return true
}
