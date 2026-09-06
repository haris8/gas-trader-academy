export const TRAINING_ASKS = [
  { price: 3.111, size: 4 },
  { price: 3.112, size: 3 },
  { price: 3.113, size: 6 },
  { price: 3.114, size: 8 },
]

export function contractPnl(moveTicks, contracts, side) {
  const direction = side === 'short' ? -1 : 1
  return moveTicks * 10 * contracts * direction
}

export function walkTrainingBook(quantity, levels = TRAINING_ASKS) {
  let remaining = quantity
  let notional = 0
  let filled = 0

  const executions = levels.map((level) => {
    const fill = Math.min(remaining, level.size)
    remaining -= fill
    filled += fill
    notional += fill * level.price
    return { ...level, fill }
  })

  const averagePrice = filled ? notional / filled : 0
  const slippageTicks = filled ? Math.round((averagePrice - levels[0].price) / 0.001) : 0

  return { executions, filled, remaining, averagePrice, slippageTicks }
}

export function optionOutcome(type, settlement, strike = 3.1, premium = 0.12) {
  const intrinsic = type === 'put'
    ? Math.max(strike - settlement, 0)
    : Math.max(settlement - strike, 0)
  const netPremium = intrinsic - premium

  return {
    intrinsic,
    pnl: netPremium * 10000,
    breakEven: type === 'put' ? strike - premium : strike + premium,
  }
}

export function balanceBias(signals) {
  const score = signals.reduce((total, signal) => total + (signal.active ? signal.impact : 0), 0)
  const label = score >= 2 ? 'Bullish pressure' : score <= -2 ? 'Bearish pressure' : 'Mixed balance'
  return { score, label }
}
