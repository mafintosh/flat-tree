exports.fullRoots = function (index) {
  if (index % 2 !== 0) throw new Error('You can only look up roots for depth(0) blocks')

  index /= 2

  var result = []
  var offset = 0
  var factor = 1

  while (true) {
    if (!index) return result
    while (factor * 2 <= index) factor *= 2
    result.push(offset + factor - 1)
    offset = offset + 2 * factor
    index -= factor
    factor = 1
  }
}

exports.depth = function (index) {
  var depth = 0

  index += 1
  while (!(index & 1)) {
    depth++
    index >>= 1
  }

  return depth
}

exports.sibling = function (index) {
  var depth = exports.depth(index)
  var offset = exports.offset(index, depth)

  return exports.index(depth, offset % 2 ? offset - 1 : offset + 1)
}

exports.parent = function (index) {
  var depth = exports.depth(index)
  var offset = exports.offset(index, depth)

  return exports.index(depth + 1, offset >> 1)
}

exports.leftChild = function (index, depth) {
  if (index % 2 === 0) return -1
  if (!depth) depth = exports.depth(index)
  return exports.index(depth - 1, exports.offset(index, depth) << 1)
}

exports.rightChild = function (index, depth) {
  if (index % 2 === 0) return -1
  if (!depth) depth = exports.depth(index)
  return exports.index(depth - 1, 1 + (exports.offset(index, depth) << 1))
}

exports.children = function (index, depth) {
  if (index % 2 === 0) return null

  if (!depth) depth = exports.depth(index)
  var offset = exports.offset(index, depth) << 1

  return [
    exports.index(depth - 1, offset),
    exports.index(depth - 1, offset + 1)
  ]
}

exports.leftSpan = function (index, depth) {
  if (index % 2 === 0) return index
  if (!depth) depth = exports.depth(index)
  return exports.offset(index, depth) * (2 << depth)
}

exports.rightSpan = function (index, depth) {
  if (index % 2 === 0) return index
  if (!depth) depth = exports.depth(index)
  return (exports.offset(index, depth) + 1) * (2 << depth) - 2
}

exports.spans = function (index, depth) {
  if (index % 2 === 0) return [index, index]
  if (!depth) depth = exports.depth(index)

  var offset = exports.offset(index, depth)
  var width = 2 << depth

  return [offset * width, (offset + 1) * width - 2]
}

exports.index = function (depth, offset) {
  return (1 + 2 * offset) * (1 << depth) - 1
}

exports.offset = function (index, depth) {
  if (index % 2 === 0) return index / 2
  if (!depth) depth = exports.depth(index)

  return ((index + 1) / (1 << depth) - 1) / 2
}
