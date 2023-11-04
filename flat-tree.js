// Alias the functions that are used by other functions
// to avoid local variable name collisions
var getdepth = depth
var getoffset = offset
var getindex = index

export function fullRoots (index, result) {
  if (index & 1) throw new Error('You can only look up roots for depth(0) blocks')
  if (!result) result = []

  index /= 2

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

export function depth (index) {
  var depth = 0

  index += 1
  while (!(index & 1)) {
    depth++
    index = rightShift(index)
  }

  return depth
}

export function sibling (index, depth) {
  if (!depth) depth = getdepth(index)
  var offset = getoffset(index, depth)

  return getindex(depth, offset & 1 ? offset - 1 : offset + 1)
}

export function parent (index, depth) {
  if (!depth) depth = getdepth(index)
  var offset = getoffset(index, depth)

  return getindex(depth + 1, rightShift(offset))
}

export function leftChild (index, depth) {
  if (!(index & 1)) return -1
  if (!depth) depth = getdepth(index)
  return getindex(depth - 1, getoffset(index, depth) * 2)
}

export function rightChild (index, depth) {
  if (!(index & 1)) return -1
  if (!depth) depth = getdepth(index)
  return getindex(depth - 1, 1 + (getoffset(index, depth) * 2))
}

export function children (index, depth) {
  if (!(index & 1)) return null

  if (!depth) depth = getdepth(index)
  var offset = getoffset(index, depth) * 2

  return [
    getindex(depth - 1, offset),
    getindex(depth - 1, offset + 1)
  ]
}

export function leftSpan (index, depth) {
  if (!(index & 1)) return index
  if (!depth) depth = getdepth(index)
  return getoffset(index, depth) * twoPow(depth + 1)
}

export function rightSpan (index, depth) {
  if (!(index & 1)) return index
  if (!depth) depth = getdepth(index)
  return (getoffset(index, depth) + 1) * twoPow(depth + 1) - 2
}

export function count (index, depth) {
  if (!(index & 1)) return 1
  if (!depth) depth = getdepth(index)
  return twoPow(depth + 1) - 1
}

export function spans (index, depth) {
  if (!(index & 1)) return [index, index]
  if (!depth) depth = getdepth(index)

  var offset = getoffset(index, depth)
  var width = twoPow(depth + 1)

  return [offset * width, (offset + 1) * width - 2]
}

export function index (depth, offset) {
  return (1 + 2 * offset) * twoPow(depth) - 1
}

export function offset (index, depth) {
  if (!(index & 1)) return index / 2
  if (!depth) depth = getdepth(index)

  return ((index + 1) / twoPow(depth) - 1) / 2
}

export function iterator (index) {
  var ite = new Iterator()
  ite.seek(index || 0)
  return ite
}

function twoPow (n) {
  return n < 31 ? 1 << n : ((1 << 30) * (1 << (n - 30)))
}

function rightShift (n) {
  return (n - (n & 1)) / 2
}

function Iterator (index) {
  this.index = 0
  this.offset = 0
  this.factor = 0
}

Iterator.prototype.seek = function (index) {
  this.index = index
  if (this.index & 1) {
    this.offset = getoffset(index)
    this.factor = twoPow(getdepth(index) + 1)
  } else {
    this.offset = index / 2
    this.factor = 2
  }
}

Iterator.prototype.isLeft = function () {
  return !(this.offset & 1)
}

Iterator.prototype.isRight = function () {
  return !this.isLeft()
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
