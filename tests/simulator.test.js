import test from 'node:test'
import assert from 'node:assert/strict'
import {
  CONTRACT_SIZE,
  LOOKBACK_BARS,
  SESSION_STEPS,
  TICK_SIZE,
  applyFuturesFill,
  black76,
  buildOptionsChain,
  buildOrderBook,
  buildSession,
  orderTriggerState,
  walkOrderBook,
} from '../src/simulator.js'

test('session generation is deterministic and tick-aligned', () => {
  const first = buildSession('desk', 'test-seed')
  const second = buildSession('desk', 'test-seed')

  assert.deepEqual(first, second)
  assert.equal(first.length, LOOKBACK_BARS + SESSION_STEPS)
  for (const bar of first) {
    const tickCount = bar.close / TICK_SIZE
    assert.ok(Math.abs(tickCount - Math.round(tickCount)) < 1e-9)
    assert.ok(bar.high >= Math.max(bar.open, bar.close))
    assert.ok(bar.low <= Math.min(bar.open, bar.close))
    assert.ok(bar.volume > 0)
  }
})

test('order book has a valid inside market and eight levels per side', () => {
  const bars = buildSession('desk', 'book-seed')
  const bar = bars[LOOKBACK_BARS + 14]
  const book = buildOrderBook(bar, 'desk', 'book-seed', 14)

  assert.equal(book.bids.length, 8)
  assert.equal(book.asks.length, 8)
  assert.ok(book.bestAsk > book.bestBid)
  assert.equal(book.spreadTicks, Math.round((book.bestAsk - book.bestBid) / TICK_SIZE))
  assert.ok(book.bidDepth > 0)
  assert.ok(book.askDepth > 0)
  assert.ok(book.imbalance >= -1 && book.imbalance <= 1)
})

test('market orders walk displayed depth and report an unfilled balance', () => {
  const book = {
    asks: [{ price: 3.101, size: 2 }, { price: 3.102, size: 1 }, { price: 3.103, size: 2 }],
    bids: [{ price: 3.099, size: 1 }, { price: 3.098, size: 2 }],
  }
  const result = walkOrderBook('buy', 8, book, 3)

  assert.equal(result.filledQuantity, 5)
  assert.equal(result.remaining, 3)
  assert.equal(result.executions.length, 3)
  assert.equal(result.averagePrice, 3.102)
})

test('futures fills average, realize, and reverse positions correctly', () => {
  const initial = { cash: 100000, realizedPnl: 0, fees: 0, position: { quantity: 0, averagePrice: 0 } }
  const opened = applyFuturesFill(initial, 'buy', 2, 3.0, 0).account
  const added = applyFuturesFill(opened, 'buy', 2, 3.1, 0).account
  const reduced = applyFuturesFill(added, 'sell', 3, 3.2, 0)
  const reversed = applyFuturesFill(reduced.account, 'sell', 3, 3.15, 0)

  assert.equal(added.position.quantity, 4)
  assert.equal(added.position.averagePrice, 3.05)
  assert.equal(reduced.account.position.quantity, 1)
  assert.equal(Math.round(reduced.realized), 4500)
  assert.equal(reversed.account.position.quantity, -2)
  assert.equal(reversed.account.position.averagePrice, 3.15)
  assert.equal(Math.round(reversed.realized), 1000)
})

test('limit, stop, and stop-limit triggers use the candle range', () => {
  const bar = { low: 3.05, high: 3.15 }
  assert.equal(orderTriggerState({ type: 'limit', side: 'buy', limitPrice: 3.06 }, bar), true)
  assert.equal(orderTriggerState({ type: 'limit', side: 'sell', limitPrice: 3.16 }, bar), false)
  assert.equal(orderTriggerState({ type: 'stop', side: 'sell', stopPrice: 3.07 }, bar), true)
  assert.deepEqual(
    orderTriggerState({ type: 'stop-limit', side: 'buy', stopPrice: 3.12, limitPrice: 3.13, triggered: false }, bar),
    { stopTriggered: true, limitMarketable: true },
  )
})

test('Black-76 call and put prices satisfy put-call parity', () => {
  const futures = 3.2
  const strike = 3.1
  const days = 30
  const rate = 0.043
  const call = black76(futures, strike, days, 0.5, 'call', rate)
  const put = black76(futures, strike, days, 0.5, 'put', rate)
  const parity = Math.exp(-rate * (days / 365)) * (futures - strike)

  assert.ok(Math.abs((call.price - put.price) - parity) < 0.0005)
  assert.ok(call.delta > 0 && call.delta < 1)
  assert.ok(put.delta < 0 && put.delta > -1)
})

test('options chain exposes tradeable quotes around the current futures price', () => {
  const chain = buildOptionsChain(3.2, 0)
  assert.equal(chain.length, 11)
  assert.ok(chain[0].strike < 3.2)
  assert.ok(chain.at(-1).strike > 3.2)

  for (const row of chain) {
    assert.ok(row.call.bid <= row.call.mark)
    assert.ok(row.call.ask >= row.call.mark)
    assert.ok(row.put.bid <= row.put.mark)
    assert.ok(row.put.ask >= row.put.mark)
    assert.ok(row.call.ask * CONTRACT_SIZE > 0)
  }
})
