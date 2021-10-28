var tape = require('tape')
var feed = require('./')

tape('base blocks', function (t) {
  t.same(feed.index(0, 0), 0)
  t.same(feed.index(0, 1), 2)
  t.same(feed.index(0, 2), 4)
  t.end()
})

tape('parents', function (t) {
  t.same(feed.index(1, 0), 1)
  t.same(feed.index(1, 1), 5)
  t.same(feed.index(2, 0), 3)

  t.same(feed.parent(0), 1)
  t.same(feed.parent(2), 1)
  t.same(feed.parent(1), 3)

  t.end()
})

tape('children', function (t) {
  t.same(feed.children(0), null)
  t.same(feed.children(1), [0, 2])
  t.same(feed.children(3), [1, 5])
  t.same(feed.children(9), [8, 10])
  t.end()
})

tape('leftChild', function (t) {
  t.same(feed.leftChild(0), -1)
  t.same(feed.leftChild(1), 0)
  t.same(feed.leftChild(3), 1)
  t.end()
})

tape('rightChild', function (t) {
  t.same(feed.rightChild(0), -1)
  t.same(feed.rightChild(1), 2)
  t.same(feed.rightChild(3), 5)
  t.end()
})

tape('siblings', function (t) {
  t.same(feed.sibling(0), 2)
  t.same(feed.sibling(2), 0)
  t.same(feed.sibling(1), 5)
  t.same(feed.sibling(5), 1)

  t.end()
})

tape('fullRoots', function (t) {
  t.same(feed.fullRoots(0), [])
  t.same(feed.fullRoots(2), [0])
  t.same(feed.fullRoots(8), [3])
  t.same(feed.fullRoots(20), [7, 17])
  t.same(feed.fullRoots(18), [7, 16])
  t.same(feed.fullRoots(16), [7])
  t.end()
})

tape('depths', function (t) {
  t.same(feed.depth(0), 0)
  t.same(feed.depth(1), 1)
  t.same(feed.depth(2), 0)
  t.same(feed.depth(3), 2)
  t.same(feed.depth(4), 0)
  t.end()
})

tape('offsets', function (t) {
  t.same(feed.offset(0), 0)
  t.same(feed.offset(1), 0)
  t.same(feed.offset(2), 1)
  t.same(feed.offset(3), 0)
  t.same(feed.offset(4), 2)
  t.end()
})

tape('spans', function (t) {
  t.same(feed.spans(0), [0, 0])
  t.same(feed.spans(1), [0, 2])
  t.same(feed.spans(3), [0, 6])
  t.same(feed.spans(23), [16, 30])
  t.same(feed.spans(27), [24, 30])
  t.end()
})

tape('leftSpan', function (t) {
  t.same(feed.leftSpan(0), 0)
  t.same(feed.leftSpan(1), 0)
  t.same(feed.leftSpan(3), 0)
  t.same(feed.leftSpan(23), 16)
  t.same(feed.leftSpan(27), 24)
  t.end()
})

tape('rightSpan', function (t) {
  t.same(feed.rightSpan(0), 0)
  t.same(feed.rightSpan(1), 2)
  t.same(feed.rightSpan(3), 6)
  t.same(feed.rightSpan(23), 30)
  t.same(feed.rightSpan(27), 30)
  t.end()
})

tape('count', function (t) {
  t.same(feed.count(0), 1)
  t.same(feed.count(1), 3)
  t.same(feed.count(3), 7)
  t.same(feed.count(5), 3)
  t.same(feed.count(23), 15)
  t.same(feed.count(27), 7)
  t.end()
})

tape('countLeaves', function (t) {
  t.same(feed.countLeaves(0), 1)
  t.same(feed.countLeaves(1), 2)
  t.same(feed.countLeaves(2), 1)
  t.same(feed.countLeaves(3), 4)
  t.same(feed.countLeaves(4), 1)
  t.same(feed.countLeaves(5), 2)
  t.same(feed.countLeaves(23), 8)
  t.same(feed.countLeaves(27), 4)
  t.end()
})

tape('parent > int32', function (t) {
  t.same(feed.parent(10000000000), 10000000001)
  t.end()
})

tape('child to parent to child', function (t) {
  var child = 0
  for (var i = 0; i < 50; i++) child = feed.parent(child)
  t.same(child, 1125899906842623)
  for (var j = 0; j < 50; j++) child = feed.leftChild(child)
  t.same(child, 0)
  t.end()
})

tape('iterator', function (t) {
  var iterator = feed.iterator()

  t.same(iterator.index, 0)
  t.same(iterator.parent(), 1)
  t.same(iterator.parent(), 3)
  t.same(iterator.parent(), 7)
  t.same(iterator.rightChild(), 11)
  t.same(iterator.leftChild(), 9)
  t.same(iterator.next(), 13)
  t.same(iterator.leftSpan(), 12)

  t.end()
})

tape('iterator, non-leaf start', function (t) {
  var iterator = feed.iterator(1)

  t.same(iterator.index, 1)
  t.same(iterator.parent(), 3)
  t.same(iterator.parent(), 7)
  t.same(iterator.rightChild(), 11)
  t.same(iterator.leftChild(), 9)
  t.same(iterator.next(), 13)
  t.same(iterator.leftSpan(), 12)

  t.end()
})

tape('iterator, full root', function (t) {
  var iterator = feed.iterator(0)

  t.same(iterator.fullRoot(0), false)

  t.same(iterator.fullRoot(22), true)
  t.same(iterator.index, 7)

  t.same(iterator.nextTree(), 16)

  t.same(iterator.fullRoot(22), true)
  t.same(iterator.index, 17)

  t.same(iterator.nextTree(), 20)

  t.same(iterator.fullRoot(22), true)
  t.same(iterator.index, 20)

  t.same(iterator.nextTree(), 22)
  t.same(iterator.fullRoot(22), false)

  t.end()
})

tape('iterator, full root, 10 big random trees', function (t) {
  for (var i = 0; i < 10; i++) {
    var iterator = feed.iterator(0)
    var tree = Math.floor(Math.random() * 0xffffffff) * 2
    var expected = feed.fullRoots(tree)
    var actual = []

    for (; iterator.fullRoot(tree); iterator.nextTree()) {
      actual.push(iterator.index)
    }

    t.same(actual, expected)
    t.same(iterator.fullRoot(tree), false)
  }

  t.end()
})

tape('iterator, count', function (t) {
  t.same(feed.iterator(0).count(), 1)
  t.same(feed.iterator(1).count(), 3)
  t.same(feed.iterator(3).count(), 7)
  t.same(feed.iterator(5).count(), 3)
  t.same(feed.iterator(23).count(), 15)
  t.same(feed.iterator(27).count(), 7)
  t.end()
})

tape('iterator, countLeaves', function (t) {
  t.same(feed.iterator(0).countLeaves(), 1)
  t.same(feed.iterator(1).countLeaves(), 2)
  t.same(feed.iterator(2).countLeaves(), 1)
  t.same(feed.iterator(3).countLeaves(), 4)
  t.same(feed.iterator(4).countLeaves(), 1)
  t.same(feed.iterator(5).countLeaves(), 2)
  t.same(feed.iterator(23).countLeaves(), 8)
  t.same(feed.iterator(27).countLeaves(), 4)
  t.end()
})
