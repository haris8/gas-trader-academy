export const STARTING_CASH = 100000
export const CONTRACT_SIZE = 10000
export const TICK_SIZE = 0.001
export const TICK_VALUE = CONTRACT_SIZE * TICK_SIZE
export const MARGIN_PER_CONTRACT = 4200
export const COMMISSION_PER_CONTRACT = 4.5
export const OPTION_COMMISSION = 3.25
export const LOOKBACK_BARS = 18
export const SESSION_STEPS = 32

export const DIFFICULTIES = {
  guided: {
    label: 'Guided',
    description: 'Deeper book, calmer reactions',
    noise: 0.012,
    shockScale: 0.72,
    liquidity: 1.3,
    baseSpread: 1,
  },
  desk: {
    label: 'Desk',
    description: 'Institutional pace',
    noise: 0.022,
    shockScale: 1,
    liquidity: 1,
    baseSpread: 2,
  },
  pit: {
    label: 'Fast Market',
    description: 'Thin, volatile, unforgiving',
    noise: 0.036,
    shockScale: 1.28,
    liquidity: 0.68,
    baseSpread: 3,
  },
}

export const DESK_PHASES = [
  { id: 'briefing', label: 'Morning Brief', short: 'Brief', start: 0, end: 3 },
  { id: 'open', label: 'Opening Flow', short: 'Open', start: 4, end: 13 },
  { id: 'report', label: 'Storage Release', short: 'EIA', start: 14, end: 18 },
  { id: 'manage', label: 'Position Management', short: 'Manage', start: 19, end: 27 },
  { id: 'settle', label: 'Settlement', short: 'Settle', start: 28, end: 31 },
]

export const SESSION_EVENTS = [
  {
    step: 0,
    category: 'Desk handoff',
    headline: 'Overnight gas holds above the prior value area',
    detail: 'Volume is light. Weather and LNG demand disagree, leaving the opening bias unresolved.',
    sentiment: 'neutral',
    shock: 0,
    liquidityFactor: 1,
  },
  {
    step: 4,
    category: 'Weather',
    headline: '06z model adds 7 cooling-degree days',
    detail: 'The South and Mid-Atlantic trend hotter for the 11-15 day window.',
    sentiment: 'bullish',
    shock: 0.042,
    liquidityFactor: 0.78,
  },
  {
    step: 8,
    category: 'Opening flow',
    headline: 'Producer hedge offers cap the first rally',
    detail: 'Commercial selling appears above the overnight high as liquidity builds.',
    sentiment: 'bearish',
    shock: -0.031,
    liquidityFactor: 0.88,
  },
  {
    step: 11,
    category: 'LNG',
    headline: 'Feedgas nominations print near a seasonal high',
    detail: 'Export demand tightens the domestic balance into the storage release.',
    sentiment: 'bullish',
    shock: 0.036,
    liquidityFactor: 0.82,
  },
  {
    step: 14,
    category: 'EIA storage',
    headline: 'Storage injection lands at +61 Bcf vs +76 expected',
    detail: 'The 15 Bcf bullish miss triggers stops above the morning range.',
    sentiment: 'bullish',
    shock: 0.137,
    liquidityFactor: 0.38,
  },
  {
    step: 18,
    category: 'Pipeline flows',
    headline: 'Permian receipts recover after maintenance',
    detail: 'Incremental supply tempers the post-storage momentum.',
    sentiment: 'bearish',
    shock: -0.052,
    liquidityFactor: 0.7,
  },
  {
    step: 23,
    category: 'Weather update',
    headline: '12z ensemble trims late-period heat confidence',
    detail: 'The afternoon model run removes part of the morning demand revision.',
    sentiment: 'bearish',
    shock: -0.064,
    liquidityFactor: 0.62,
  },
  {
    step: 28,
    category: 'Risk',
    headline: 'Funds reduce gross exposure into settlement',
    detail: 'Two-way flow increases while traders flatten intraday risk.',
    sentiment: 'neutral',
    shock: -0.018,
    liquidityFactor: 0.76,
  },
  {
    step: 30,
    category: 'Settlement',
    headline: 'Front month enters the settlement window',
    detail: 'Liquidity concentrates at the settlement price and all DAY orders prepare to expire.',
    sentiment: 'neutral',
    shock: 0.009,
    liquidityFactor: 0.58,
  },
]

export const BRIEFING_CARDS = [
  {
    id: 'weather',
    source: 'Weather desk',
    time: '06:05 CT',
    headline: 'Cooling demand revised +1.8 Bcf/d',
    detail: 'The 6-10 day South Central outlook shifts hotter while forecast confidence improves.',
    correct: 'bullish',
    why: 'More cooling demand usually increases gas-fired power burn.',
    weight: 2,
  },
  {
    id: 'production',
    source: 'Flow monitor',
    time: '06:12 CT',
    headline: 'Lower-48 production rebounds 0.7 Bcf/d',
    detail: 'Appalachian maintenance ends and dry gas output returns above 105 Bcf/d.',
    correct: 'bearish',
    why: 'More supply is bearish when demand and inventories are unchanged.',
    weight: -1,
  },
  {
    id: 'lng',
    source: 'LNG tracker',
    time: '06:18 CT',
    headline: 'Feedgas nominations rise to 15.2 Bcf/d',
    detail: 'Freeport and Corpus Christi nominations both strengthen before the cash open.',
    correct: 'bullish',
    why: 'Higher LNG feedgas pulls more supply from the domestic market.',
    weight: 1,
  },
]

export const FUNDAMENTAL_METRICS = [
  { id: 'storage', label: 'Storage vs 5-year', value: '+4.2%', change: '-0.8 pp', tone: 'bearish' },
  { id: 'production', label: 'Dry production', value: '105.3 Bcf/d', change: '+0.7', tone: 'bearish' },
  { id: 'lng', label: 'LNG feedgas', value: '15.2 Bcf/d', change: '+0.5', tone: 'bullish' },
  { id: 'power', label: 'Power burn', value: '46.8 Bcf/d', change: '+1.8', tone: 'bullish' },
]

export const FUNDAMENTAL_QUESTIONS = [
  {
    id: 'storage-surprise',
    prompt: 'Consensus is +76 Bcf. EIA reports +61 Bcf. What is the first-order price impact?',
    answers: ['bullish', 'neutral', 'bearish'],
    correct: 'bullish',
    explanation: 'A smaller injection than expected means inventories built 15 Bcf less than traders priced in.',
  },
  {
    id: 'curve',
    prompt: 'January trades $0.42 above October. What curve shape is this?',
    answers: ['backwardation', 'flat', 'contango'],
    correct: 'contango',
    explanation: 'Deferred prices above nearby prices create contango, common when future winter demand carries a premium.',
  },
  {
    id: 'basis',
    prompt: 'A Gulf Coast pipeline constraint traps supply in-basin. What usually happens to local basis?',
    answers: ['strengthens', 'unchanged', 'weakens'],
    correct: 'weakens',
    explanation: 'Trapped supply often pushes the local cash price lower relative to Henry Hub.',
  },
]

export const FUTURES_CURVE = [
  { contract: 'Oct', priceOffset: -0.032, volume: '168k' },
  { contract: 'Nov', priceOffset: 0.084, volume: '92k' },
  { contract: 'Dec', priceOffset: 0.238, volume: '71k' },
  { contract: 'Jan', priceOffset: 0.388, volume: '64k' },
  { contract: 'Feb', priceOffset: 0.301, volume: '39k' },
  { contract: 'Mar', priceOffset: 0.176, volume: '34k' },
]

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function roundPrice(value) {
  return Number((Math.round(value / TICK_SIZE) * TICK_SIZE).toFixed(3))
}

export function formatPrice(value) {
  return `$${Number(value).toFixed(3)}`
}

export function formatMoney(value, digits = 0) {
  const sign = value < 0 ? '-' : ''
  return `${sign}$${Math.abs(value).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`
}

export function formatSigned(value, digits = 0) {
  const sign = value > 0 ? '+' : value < 0 ? '-' : ''
  return `${sign}${Math.abs(value).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`
}

function hashSeed(seedText) {
  return Array.from(String(seedText)).reduce((hash, char) => {
    return (hash * 31 + char.charCodeAt(0)) % 2147483647
  }, 137)
}

export function seededNoise(index, seedText = 'desk') {
  const seed = hashSeed(seedText)
  const value = Math.sin(seed * 0.00031 + index * 78.233) * 43758.5453
  return value - Math.floor(value)
}

export function sessionTime(step) {
  const totalMinutes = 6 * 60 + step * 15
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const hour12 = hours % 12 || 12
  return `${hour12}:${String(minutes).padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`
}

export function phaseForStep(step) {
  return DESK_PHASES.find((phase) => step >= phase.start && step <= phase.end) ?? DESK_PHASES.at(-1)
}

export function eventForStep(step) {
  const scheduled = SESSION_EVENTS.find((event) => event.step === step)
  if (scheduled) return { ...scheduled, major: step > 0 }

  const quietTape = [
    ['Market flow', 'Screen trade rotates around VWAP', 'Neither side controls the tape while resting liquidity rebuilds.'],
    ['Options flow', 'Dealers rebalance gamma near the at-the-money strike', 'Small futures hedges dampen movement between catalysts.'],
    ['Cash market', 'Regional cash differentials trade inside recent ranges', 'No new physical constraint has appeared in the flow data.'],
    ['Positioning', 'Systematic accounts adjust exposure with volatility', 'Mechanical flow matters while fundamental headlines stay quiet.'],
  ]
  const [category, headline, detail] = quietTape[step % quietTape.length]
  return { step, category, headline, detail, sentiment: 'neutral', shock: 0, liquidityFactor: 1, major: false }
}

export function buildSession(difficultyKey = 'desk', seed = 'daily-desk') {
  const config = DIFFICULTIES[difficultyKey] ?? DIFFICULTIES.desk
  const bars = []
  let previousClose = roundPrice(3.08 + (seededNoise(2, seed) - 0.5) * 0.12)

  for (let index = 0; index < LOOKBACK_BARS + SESSION_STEPS; index += 1) {
    const sessionStep = index - LOOKBACK_BARS
    const event = sessionStep >= 0 ? eventForStep(sessionStep) : null
    const cycle = Math.sin(index * 0.63 + seededNoise(6, seed) * 2.8) * 0.006
    const meanReversion = (3.16 - previousClose) * 0.006
    const noise = (seededNoise(index + 31, seed) - 0.5) * config.noise
    const eventShock = (event?.shock ?? 0) * config.shockScale
    const open = previousClose
    const close = roundPrice(clamp(open + cycle + meanReversion + noise + eventShock, 1.6, 6.2))
    const eventRange = event?.major ? Math.abs(eventShock) * 0.24 : 0
    const wick = 0.006 + seededNoise(index + 91, seed) * 0.014 + eventRange
    const high = roundPrice(Math.max(open, close) + wick * (0.45 + seededNoise(index + 141, seed)))
    const low = roundPrice(Math.min(open, close) - wick * (0.45 + seededNoise(index + 211, seed)))
    const baseVolume = 720 + Math.round(seededNoise(index + 301, seed) * 1050)
    const volume = Math.round(baseVolume * (event?.major ? 2.5 : 1) * (1 + Math.abs(close - open) * 8))

    bars.push({
      index,
      sessionStep,
      time: sessionStep >= 0 ? sessionTime(sessionStep) : `Prev ${index + 1}`,
      open,
      high,
      low,
      close,
      volume,
      event,
    })
    previousClose = close
  }

  return bars
}

export function buildOrderBook(bar, difficultyKey, seed, step) {
  const config = DIFFICULTIES[difficultyKey] ?? DIFFICULTIES.desk
  const rangeTicks = Math.max(1, Math.round((bar.high - bar.low) / TICK_SIZE))
  const eventLiquidity = bar.event?.liquidityFactor ?? 1
  const spreadTicks = clamp(
    Math.round(config.baseSpread + rangeTicks / 22 + (1 / eventLiquidity - 1) * 2.4),
    1,
    9,
  )
  const lowerTicks = Math.floor(spreadTicks / 2)
  const upperTicks = spreadTicks - lowerTicks
  const bestBid = roundPrice(bar.close - lowerTicks * TICK_SIZE)
  const bestAsk = roundPrice(bar.close + Math.max(1, upperTicks) * TICK_SIZE)
  const liquidity = config.liquidity * eventLiquidity
  const bids = []
  const asks = []

  for (let level = 0; level < 8; level += 1) {
    const shape = 1 + level * 0.24
    const bidNoise = seededNoise(step * 37 + level * 5 + 801, seed)
    const askNoise = seededNoise(step * 41 + level * 7 + 901, seed)
    bids.push({
      price: roundPrice(bestBid - level * TICK_SIZE),
      size: Math.max(1, Math.round((2 + bidNoise * 9) * shape * liquidity)),
    })
    asks.push({
      price: roundPrice(bestAsk + level * TICK_SIZE),
      size: Math.max(1, Math.round((2 + askNoise * 9) * shape * liquidity)),
    })
  }

  const bidDepth = bids.reduce((sum, level) => sum + level.size, 0)
  const askDepth = asks.reduce((sum, level) => sum + level.size, 0)
  return {
    bestBid,
    bestAsk,
    mid: roundPrice((bestBid + bestAsk) / 2),
    spreadTicks: Math.round((bestAsk - bestBid) / TICK_SIZE),
    spreadValue: (bestAsk - bestBid) * CONTRACT_SIZE,
    bids,
    asks,
    bidDepth,
    askDepth,
    imbalance: (bidDepth - askDepth) / Math.max(1, bidDepth + askDepth),
    condition: spreadTicks >= 6 ? 'Dislocated' : spreadTicks >= 4 ? 'Wide' : spreadTicks >= 2 ? 'Normal' : 'Tight',
  }
}

export function walkOrderBook(side, quantity, book, maxLevels = 4) {
  const levels = (side === 'buy' ? book.asks : book.bids).slice(0, maxLevels)
  let remaining = quantity
  let notional = 0
  const executions = []

  for (const level of levels) {
    if (remaining <= 0) break
    const filled = Math.min(remaining, level.size)
    executions.push({ price: level.price, quantity: filled })
    notional += level.price * filled
    remaining -= filled
  }

  const filledQuantity = quantity - remaining
  return {
    filledQuantity,
    remaining,
    averagePrice: filledQuantity ? roundPrice(notional / filledQuantity) : 0,
    executions,
  }
}

export function futuresUnrealized(position, markPrice) {
  if (!position.quantity) return 0
  return (markPrice - position.averagePrice) * CONTRACT_SIZE * position.quantity
}

export function applyFuturesFill(account, side, quantity, price, commission = COMMISSION_PER_CONTRACT) {
  const signedFill = side === 'buy' ? quantity : -quantity
  const oldQuantity = account.position.quantity
  const oldDirection = Math.sign(oldQuantity)
  const fillDirection = Math.sign(signedFill)
  let nextQuantity = oldQuantity + signedFill
  let averagePrice = account.position.averagePrice
  let realized = 0

  if (oldQuantity === 0 || oldDirection === fillDirection) {
    const combined = Math.abs(oldQuantity) + quantity
    averagePrice = combined
      ? roundPrice((Math.abs(oldQuantity) * averagePrice + quantity * price) / combined)
      : 0
  } else {
    const closingQuantity = Math.min(Math.abs(oldQuantity), quantity)
    realized = (price - averagePrice) * CONTRACT_SIZE * closingQuantity * oldDirection
    if (nextQuantity === 0) averagePrice = 0
    if (Math.sign(nextQuantity) !== oldDirection && nextQuantity !== 0) averagePrice = price
  }

  const fee = quantity * commission
  return {
    account: {
      ...account,
      cash: account.cash + realized - fee,
      realizedPnl: account.realizedPnl + realized,
      fees: account.fees + fee,
      position: { quantity: nextQuantity, averagePrice: roundPrice(averagePrice) },
    },
    realized,
    fee,
  }
}

export function orderTriggerState(order, bar) {
  if (order.type === 'limit') {
    return order.side === 'buy' ? bar.low <= order.limitPrice : bar.high >= order.limitPrice
  }
  if (order.type === 'stop') {
    return order.side === 'buy' ? bar.high >= order.stopPrice : bar.low <= order.stopPrice
  }
  if (order.type === 'stop-limit') {
    const stopTriggered = order.triggered || (order.side === 'buy' ? bar.high >= order.stopPrice : bar.low <= order.stopPrice)
    const limitMarketable = order.side === 'buy' ? bar.low <= order.limitPrice : bar.high >= order.limitPrice
    return { stopTriggered, limitMarketable: stopTriggered && limitMarketable }
  }
  return false
}

export function restingFillCapacity(order, bar, seed, step) {
  const participation = Math.max(1, Math.round(bar.volume / 620))
  const randomCapacity = 1 + Math.floor(seededNoise(step * 53 + Number(order.sequence ?? 0) + 1201, seed) * participation)
  const firstFillCap = order.filledQuantity === 0 && order.remaining > 2 ? Math.max(1, Math.ceil(order.remaining * 0.45)) : order.remaining
  return Math.min(order.remaining, randomCapacity, firstFillCap)
}

function normalCdf(value) {
  const sign = value < 0 ? -1 : 1
  const x = Math.abs(value) / Math.sqrt(2)
  const t = 1 / (1 + 0.3275911 * x)
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const erf = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-x * x)
  return 0.5 * (1 + sign * erf)
}

export function black76(futuresPrice, strike, days, volatility, type, rate = 0.043) {
  const time = Math.max(days / 365, 1 / 365)
  const sigmaRootT = volatility * Math.sqrt(time)
  const d1 = (Math.log(futuresPrice / strike) + 0.5 * volatility * volatility * time) / sigmaRootT
  const d2 = d1 - sigmaRootT
  const discount = Math.exp(-rate * time)
  const call = discount * (futuresPrice * normalCdf(d1) - strike * normalCdf(d2))
  const put = discount * (strike * normalCdf(-d2) - futuresPrice * normalCdf(-d1))
  const delta = type === 'call' ? discount * normalCdf(d1) : -discount * normalCdf(-d1)
  return { price: Math.max(TICK_SIZE, type === 'call' ? call : put), delta }
}

export function buildOptionsChain(futuresPrice, step) {
  const center = Math.round(futuresPrice / 0.05) * 0.05
  const days = Math.max(18, 24 - step / SESSION_STEPS)
  const strikes = Array.from({ length: 11 }, (_, index) => roundPrice(center + (index - 5) * 0.05))

  return strikes.map((strike) => {
    const moneyness = Math.abs(strike - futuresPrice) / Math.max(futuresPrice, 0.1)
    const volatility = 0.48 + moneyness * 1.7
    const call = black76(futuresPrice, strike, days, volatility, 'call')
    const put = black76(futuresPrice, strike, days, volatility, 'put')
    const nextCall = black76(futuresPrice, strike, Math.max(1, days - 1), volatility, 'call')
    const nextPut = black76(futuresPrice, strike, Math.max(1, days - 1), volatility, 'put')
    const callSpread = Math.max(0.003, call.price * 0.065)
    const putSpread = Math.max(0.003, put.price * 0.065)

    return {
      strike,
      days,
      volatility,
      call: {
        bid: roundPrice(Math.max(TICK_SIZE, call.price - callSpread / 2)),
        ask: roundPrice(call.price + callSpread / 2),
        mark: roundPrice(call.price),
        delta: call.delta,
        theta: (nextCall.price - call.price) * CONTRACT_SIZE,
      },
      put: {
        bid: roundPrice(Math.max(TICK_SIZE, put.price - putSpread / 2)),
        ask: roundPrice(put.price + putSpread / 2),
        mark: roundPrice(put.price),
        delta: put.delta,
        theta: (nextPut.price - put.price) * CONTRACT_SIZE,
      },
    }
  })
}

export function simpleMovingAverage(bars, period) {
  return bars.map((bar, index) => {
    if (index < period - 1) return null
    const window = bars.slice(index - period + 1, index + 1)
    return window.reduce((sum, item) => sum + item.close, 0) / period
  })
}

export function exponentialMovingAverage(bars, period) {
  const multiplier = 2 / (period + 1)
  let previous = bars[0]?.close ?? 0
  return bars.map((bar, index) => {
    previous = index === 0 ? bar.close : (bar.close - previous) * multiplier + previous
    return previous
  })
}

export function volumeWeightedAveragePrice(bars) {
  let cumulativeVolume = 0
  let cumulativeValue = 0
  return bars.map((bar) => {
    const typical = (bar.high + bar.low + bar.close) / 3
    cumulativeVolume += bar.volume
    cumulativeValue += typical * bar.volume
    return cumulativeValue / Math.max(1, cumulativeVolume)
  })
}

export function bollingerBands(bars, period = 10, deviations = 2) {
  return bars.map((bar, index) => {
    if (index < period - 1) return null
    const window = bars.slice(index - period + 1, index + 1).map((item) => item.close)
    const mean = window.reduce((sum, value) => sum + value, 0) / period
    const variance = window.reduce((sum, value) => sum + (value - mean) ** 2, 0) / period
    const standardDeviation = Math.sqrt(variance)
    return { upper: mean + deviations * standardDeviation, lower: mean - deviations * standardDeviation, middle: mean }
  })
}
