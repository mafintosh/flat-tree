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

tape('siblings', function (t) {
  t.same(feed.sibling(0), 2)
  t.same(feed.sibling(2), 0)
  t.same(feed.sibling(1), 5)
  t.same(feed.sibling(5), 1)

  t.end()
})

tape('roots', function (t) {
  t.same(feed.roots(0), [])
  t.same(feed.roots(2), [0])
  t.same(feed.roots(20), [7, 17])
  t.same(feed.roots(18), [7, 16])
  t.same(feed.roots(16), [7])
  t.end()
})