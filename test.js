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
