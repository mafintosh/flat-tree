exports.fullRoots = function (index, result) {
  if (index & 1) throw new Error('You can only look up roots for depth(0) blocks')
  if (!result) result = []

  index /= 2

  let offset = 0
  let factor = 1

  while (true) {
    if (!index) return result
    while (factor * 2 <= index) factor *= 2
    result.push(offset + factor - 1)
    offset = offset + 2 * factor
    index -= factor
    factor = 1
  }
}

exports.futureRoots = function (index, result) {
  if (index & 1) throw new Error('You can only look up future roots for depth(0) blocks')
  if (!result) result = []

  let factor = 1

  // make first root
  while (factor * 2 <= index) factor *= 2

  // full factor of 2 - done
  if (factor * 2 - 2 === index) return result

  let pos = factor / 2 - 1

  // while its not a full tree
  while ((pos + factor / 2 - 1) !== index) {
    pos += factor

    // read too far, to to left child
    while ((pos + factor / 2 - 1) > index) {
      factor /= 2
      pos -= factor / 2
    }

    // the "gap" is a future root
    result.push(pos - factor / 2)
  }

  return result
}

exports.patch = function (from, to) {
  if (from === 0 || from >= to) return []

  const roots = exports.fullRoots(from)
  const target = exports.fullRoots(to)

  // first find the first root that is different

  let i = 0
  for (; i < target.length; i++) {
    if (i >= roots.length || roots[i] !== target[i]) break
  }

  const patch = []

  if (i < roots.length) {
    // now we need to grow the newest root until it hits the diff one
    let prev = roots.length - 1

    const ite = exports.iterator(roots[prev--])

    while (ite.index !== target[i]) {
      ite.sibling()

      if (prev >= 0 && ite.index === roots[prev]) {
        prev--
      } else {
        patch.push(ite.index)
      }

      patch.push(ite.parent())
    }

    i++ // patched to next root, so inc
  }

  // include the rest

  for (; i < target.length; i++) patch.push(target[i])

  return patch
}

exports.depth = function (index) {
  let depth = 0

  index += 1
  while (!(index & 1)) {
    depth++
    index = rightShift(index)
  }

  return depth
}

exports.sibling = function (index, depth) {
  if (!depth) depth = exports.depth(index)
  const offset = exports.offset(index, depth)

  return exports.index(depth, offset & 1 ? offset - 1 : offset + 1)
}

exports.parent = function (index, depth) {
  if (!depth) depth = exports.depth(index)
  const offset = exports.offset(index, depth)

  return exports.index(depth + 1, rightShift(offset))
}

exports.leftChild = function (index, depth) {
  if (!(index & 1)) return -1
  if (!depth) depth = exports.depth(index)
  return exports.index(depth - 1, exports.offset(index, depth) * 2)
}

exports.rightChild = function (index, depth) {
  if (!(index & 1)) return -1
  if (!depth) depth = exports.depth(index)
  return exports.index(depth - 1, 1 + (exports.offset(index, depth) * 2))
}

exports.children = function (index, depth) {
  if (!(index & 1)) return null

  if (!depth) depth = exports.depth(index)
  const offset = exports.offset(index, depth) * 2

  return [
    exports.index(depth - 1, offset),
    exports.index(depth - 1, offset + 1)
  ]
}

exports.leftSpan = function (index, depth) {
  if (!(index & 1)) return index
  if (!depth) depth = exports.depth(index)
  return exports.offset(index, depth) * twoPow(depth + 1)
}

exports.rightSpan = function (index, depth) {
  if (!(index & 1)) return index
  if (!depth) depth = exports.depth(index)
  return (exports.offset(index, depth) + 1) * twoPow(depth + 1) - 2
}

exports.nextLeaf = function (index) {
  let factor = 1
  let r = index

  while ((r & 1) === 1) {
    r = (r - 1) / 2
    factor *= 2
  }

  return index + factor + 1
}

exports.count = function (index, depth) {
  if (!(index & 1)) return 1
  if (!depth) depth = exports.depth(index)
  return twoPow(depth + 1) - 1
}

exports.countLeaves = function (index) {
  return (exports.count(index) + 1) / 2
}

exports.spans = function (index, depth) {
  if (!(index & 1)) return [index, index]
  if (!depth) depth = exports.depth(index)

  const offset = exports.offset(index, depth)
  const width = twoPow(depth + 1)

  return [offset * width, (offset + 1) * width - 2]
}

exports.index = function (depth, offset) {
  return (1 + 2 * offset) * twoPow(depth) - 1
}

exports.offset = function (index, depth) {
  if (!(index & 1)) return index / 2
  if (!depth) depth = exports.depth(index)

  return ((index + 1) / twoPow(depth) - 1) / 2
}

exports.iterator = function (index) {
  const ite = new Iterator()
  ite.seek(index || 0)
  return ite
}

function twoPow (n) {
  return n < 31 ? 1 << n : ((1 << 30) * (1 << (n - 30)))
}

function rightShift (n) {
  return (n - (n & 1)) / 2
}

function Iterator () {
  this.index = 0
  this.offset = 0
  this.factor = 0
}

Iterator.prototype.seek = function (index) {
  this.index = index
  if (this.index & 1) {
    this.offset = exports.offset(index)
    this.factor = twoPow(exports.depth(index) + 1)
  } else {
    this.offset = index / 2
    this.factor = 2
  }
}

Iterator.prototype.isLeft = function () {
  return (this.offset & 1) === 0
}

Iterator.prototype.isRight = function () {
  return (this.offset & 1) === 1
}

Iterator.prototype.contains = function (index) {
  return index > this.index
    ? index < (this.index + this.factor / 2)
    : index < this.index
      ? index > (this.index - this.factor / 2)
      : true
}

Iterator.prototype.prev = function () {
  if (!this.offset) return this.index
  this.offset--
  this.index -= this.factor
  return this.index
}

Iterator.prototype.next = function () {
  this.offset++
  this.index += this.factor
  return this.index
}

Iterator.prototype.count = function () {
  if (!(this.index & 1)) return 1
  return this.factor - 1
}

Iterator.prototype.countLeaves = function () {
  return (this.count() + 1) / 2
}

Iterator.prototype.sibling = function () {
  return this.isLeft() ? this.next() : this.prev()
}

Iterator.prototype.parent = function () {
  if (this.offset & 1) {
    this.index -= this.factor / 2
    this.offset = (this.offset - 1) / 2
  } else {
    this.index += this.factor / 2
    this.offset /= 2
  }
  this.factor *= 2
  return this.index
}

Iterator.prototype.leftSpan = function () {
  this.index = this.index - this.factor / 2 + 1
  this.offset = this.index / 2
  this.factor = 2
  return this.index
}

Iterator.prototype.rightSpan = function () {
  this.index = this.index + this.factor / 2 - 1
  this.offset = this.index / 2
  this.factor = 2
  return this.index
}

Iterator.prototype.leftChild = function () {
  if (this.factor === 2) return this.index
  this.factor /= 2
  this.index -= this.factor / 2
  this.offset *= 2
  return this.index
}

Iterator.prototype.rightChild = function () {
  if (this.factor === 2) return this.index
  this.factor /= 2
  this.index += this.factor / 2
  this.offset = 2 * this.offset + 1
  return this.index
}

Iterator.prototype.nextTree = function () {
  this.index = this.index + this.factor / 2 + 1
  this.offset = this.index / 2
  this.factor = 2
  return this.index
}

Iterator.prototype.prevTree = function () {
  if (!this.offset) {
    this.index = 0
    this.factor = 2
  } else {
    this.index = this.index - this.factor / 2 - 1
    this.offset = this.index / 2
    this.factor = 2
  }
  return this.index
}

Iterator.prototype.fullRoot = function (index) {
  if (index <= this.index || (this.index & 1) > 0) return false
  while (index > this.index + this.factor + this.factor / 2) {
    this.index += this.factor / 2
    this.factor *= 2
    this.offset /= 2
  }
  return true
}
