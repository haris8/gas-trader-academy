export const ORDER_REPLAY_QUOTES = [
  { bid: 3.108, ask: 3.111, last: 3.109 },
  { bid: 3.102, ask: 3.105, last: 3.104 },
  { bid: 3.097, ask: 3.099, last: 3.098 },
  { bid: 3.1, ask: 3.103, last: 3.101 },
]

export const STOP_REPLAY_QUOTES = [
  { bid: 3.098, ask: 3.101, last: 3.1 },
  { bid: 3.07, ask: 3.073, last: 3.071 },
  { bid: 3.05, ask: 3.054, last: 3.052 },
  { bid: 3.061, ask: 3.064, last: 3.062 },
]

// This replay assumes one contract of available liquidity at each displayed quote.
export function replayOrder(type, index) {
  const protective = type === 'stop' || type === 'stop-limit'
  const quotes = protective ? STOP_REPLAY_QUOTES : ORDER_REPLAY_QUOTES
  let triggered = false
  let fillPrice = null
  let fillIndex = null
  for (let i = 0; i <= index; i += 1) {
    const quote = quotes[i]
    if (protective && quote.last <= 3.065) triggered = true
    const eligible = type === 'market' || (type === 'limit' && quote.ask <= 3.1)
      || (type === 'stop' && triggered) || (type === 'stop-limit' && triggered && quote.bid >= 3.06)
    if (fillPrice === null && eligible) {
      fillPrice = protective ? quote.bid : quote.ask
      fillIndex = i
    }
  }
  return { quote: quotes[index], quotes, triggered, fillPrice, fillIndex, status: fillPrice !== null ? 'Filled' : triggered ? 'Triggered, still working' : protective ? 'Waiting for trigger' : 'Working, waiting for price' }
}

export function reduceOnlyExample(sellQuantity, reduceOnly) {
  const executed = reduceOnly ? Math.min(sellQuantity, 1) : sellQuantity
  return { executed, position: 1 - executed }
}
