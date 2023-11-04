const test = require('brittle')
const flat = require('./')

test('base blocks', function (t) {
  t.is(flat.index(0, 0), 0)
  t.is(flat.index(0, 1), 2)
  t.is(flat.index(0, 2), 4)
})

test('parents', function (t) {
  t.is(flat.index(1, 0), 1)
  t.is(flat.index(1, 1), 5)
  t.is(flat.index(2, 0), 3)

  t.is(flat.parent(0), 1)
  t.is(flat.parent(2), 1)
  t.is(flat.parent(1), 3)
})

test('children', function (t) {
  t.is(flat.children(0), null)
  t.alike(flat.children(1), [0, 2])
  t.alike(flat.children(3), [1, 5])
  t.alike(flat.children(9), [8, 10])
})

test('leftChild', function (t) {
  t.is(flat.leftChild(0), -1)
  t.is(flat.leftChild(1), 0)
  t.is(flat.leftChild(3), 1)
})

test('rightChild', function (t) {
  t.is(flat.rightChild(0), -1)
  t.is(flat.rightChild(1), 2)
  t.is(flat.rightChild(3), 5)
})

test('siblings', function (t) {
  t.is(flat.sibling(0), 2)
  t.is(flat.sibling(2), 0)
  t.is(flat.sibling(1), 5)
  t.is(flat.sibling(5), 1)
})

test('fullRoots', function (t) {
  t.alike(flat.fullRoots(0), [])
  t.alike(flat.fullRoots(2), [0])
  t.alike(flat.fullRoots(8), [3])
  t.alike(flat.fullRoots(20), [7, 17])
  t.alike(flat.fullRoots(18), [7, 16])
  t.alike(flat.fullRoots(16), [7])
})

test('futureRoots', function (t) {
  t.alike(flat.futureRoots(0), [])
  t.alike(flat.futureRoots(2), [])
  t.alike(flat.futureRoots(4), [3])
  t.alike(flat.futureRoots(6), [])
  t.alike(flat.futureRoots(8), [7])
  t.alike(flat.futureRoots(10), [7])
  t.alike(flat.futureRoots(12), [7, 11])
  t.alike(flat.futureRoots(14), [])
  t.alike(flat.futureRoots(16), [15])
  t.alike(flat.futureRoots(18), [15])
  t.alike(flat.futureRoots(20), [15, 19])
  t.alike(flat.futureRoots(22), [15])
  t.alike(flat.futureRoots(24), [15, 23])
  t.alike(flat.futureRoots(26), [15, 23])
  t.alike(flat.futureRoots(28), [15, 23, 27])
  t.alike(flat.futureRoots(30), [])
  t.alike(flat.futureRoots(32), [31])
})

test('futureRoots with a big random trees', function (t) {
  for (let i = 0; i < 5; i++) {
    const n = Math.floor(Math.random() * 10000) * 2
    const roots = flat.futureRoots(n)
    const brute = []

    for (let i = 0; i < n; i++) {
      if (flat.rightSpan(i) > n) brute.push(i)
    }

    t.alike(roots, brute)
  }
})

test('depths', function (t) {
  t.is(flat.depth(0), 0)
  t.is(flat.depth(1), 1)
  t.is(flat.depth(2), 0)
  t.is(flat.depth(3), 2)
  t.is(flat.depth(4), 0)
})

test('offsets', function (t) {
  t.is(flat.offset(0), 0)
  t.is(flat.offset(1), 0)
  t.is(flat.offset(2), 1)
  t.is(flat.offset(3), 0)
  t.is(flat.offset(4), 2)
})

test('spans', function (t) {
  t.alike(flat.spans(0), [0, 0])
  t.alike(flat.spans(1), [0, 2])
  t.alike(flat.spans(3), [0, 6])
  t.alike(flat.spans(23), [16, 30])
  t.alike(flat.spans(27), [24, 30])
})

test('leftSpan', function (t) {
  t.is(flat.leftSpan(0), 0)
  t.is(flat.leftSpan(1), 0)
  t.is(flat.leftSpan(3), 0)
  t.is(flat.leftSpan(23), 16)
  t.is(flat.leftSpan(27), 24)
})

test('rightSpan', function (t) {
  t.is(flat.rightSpan(0), 0)
  t.is(flat.rightSpan(1), 2)
  t.is(flat.rightSpan(3), 6)
  t.is(flat.rightSpan(23), 30)
  t.is(flat.rightSpan(27), 30)
})

test('count', function (t) {
  t.is(flat.count(0), 1)
  t.is(flat.count(1), 3)
  t.is(flat.count(3), 7)
  t.is(flat.count(5), 3)
  t.is(flat.count(23), 15)
  t.is(flat.count(27), 7)
})

test('countLeaves', function (t) {
  t.is(flat.countLeaves(0), 1)
  t.is(flat.countLeaves(1), 2)
  t.is(flat.countLeaves(2), 1)
  t.is(flat.countLeaves(3), 4)
  t.is(flat.countLeaves(4), 1)
  t.is(flat.countLeaves(5), 2)
  t.is(flat.countLeaves(23), 8)
  t.is(flat.countLeaves(27), 4)
})

test('parent > int32', function (t) {
  t.is(flat.parent(10000000000), 10000000001)
})

test('child to parent to child', function (t) {
  let child = 0
  for (let i = 0; i < 50; i++) child = flat.parent(child)
  t.is(child, 1125899906842623)
  for (let j = 0; j < 50; j++) child = flat.leftChild(child)
  t.is(child, 0)
})

test('iterator', function (t) {
  const iterator = flat.iterator()

  t.is(iterator.index, 0)
  t.is(iterator.parent(), 1)
  t.is(iterator.parent(), 3)
  t.is(iterator.parent(), 7)
  t.is(iterator.rightChild(), 11)
  t.is(iterator.leftChild(), 9)
  t.is(iterator.next(), 13)
  t.is(iterator.leftSpan(), 12)
})

test('iterator, non-leaf start', function (t) {
  const iterator = flat.iterator(1)

  t.is(iterator.index, 1)
  t.is(iterator.parent(), 3)
  t.is(iterator.parent(), 7)
  t.is(iterator.rightChild(), 11)
  t.is(iterator.leftChild(), 9)
  t.is(iterator.next(), 13)
  t.is(iterator.leftSpan(), 12)
})

test('iterator, full root', function (t) {
  const iterator = flat.iterator(0)

  t.is(iterator.fullRoot(0), false)

  t.is(iterator.fullRoot(22), true)
  t.is(iterator.index, 7)

  t.is(iterator.nextTree(), 16)

  t.is(iterator.fullRoot(22), true)
  t.is(iterator.index, 17)

  t.is(iterator.nextTree(), 20)

  t.is(iterator.fullRoot(22), true)
  t.is(iterator.index, 20)

  t.is(iterator.nextTree(), 22)
  t.is(iterator.fullRoot(22), false)
})

test('iterator, full root, 10 big random trees', function (t) {
  for (let i = 0; i < 10; i++) {
    const iterator = flat.iterator(0)
    const tree = Math.floor(Math.random() * 0xffffffff) * 2
    const expected = flat.fullRoots(tree)
    const actual = []

    for (; iterator.fullRoot(tree); iterator.nextTree()) {
      actual.push(iterator.index)
    }

    t.alike(actual, expected)
    t.is(iterator.fullRoot(tree), false)
  }
})

test('iterator, count', function (t) {
  t.is(flat.iterator(0).count(), 1)
  t.is(flat.iterator(1).count(), 3)
  t.is(flat.iterator(3).count(), 7)
  t.is(flat.iterator(5).count(), 3)
  t.is(flat.iterator(23).count(), 15)
  t.is(flat.iterator(27).count(), 7)
})

test('iterator, countLeaves', function (t) {
  t.is(flat.iterator(0).countLeaves(), 1)
  t.is(flat.iterator(1).countLeaves(), 2)
  t.is(flat.iterator(2).countLeaves(), 1)
  t.is(flat.iterator(3).countLeaves(), 4)
  t.is(flat.iterator(4).countLeaves(), 1)
  t.is(flat.iterator(5).countLeaves(), 2)
  t.is(flat.iterator(23).countLeaves(), 8)
  t.is(flat.iterator(27).countLeaves(), 4)
})
