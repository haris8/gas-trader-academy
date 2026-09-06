import { Minus, Plus, ShieldCheck, X } from 'lucide-react'
import { CONTRACT_SIZE, clamp, formatMoney, formatPrice } from './simulator.js'

function positionMark(position, chain) {
  const row = chain.find((item) => item.strike === position.strike)
  return row?.[position.type]?.mark ?? 0
}

function positionBid(position, chain) {
  const row = chain.find((item) => item.strike === position.strike)
  return row?.[position.type]?.bid ?? 0
}

function PayoffChart({ positions, futuresPrice }) {
  const width = 720
  const height = 210
  const pad = { top: 18, right: 16, bottom: 30, left: 62 }
  const prices = Array.from({ length: 41 }, (_, index) => Math.max(0.5, futuresPrice - 0.65 + index * (1.3 / 40)))
  const points = prices.map((price) => {
    const pnl = positions.reduce((sum, position) => {
      const intrinsic = position.type === 'call'
        ? Math.max(0, price - position.strike)
        : Math.max(0, position.strike - price)
      return sum + (intrinsic - position.averagePrice) * CONTRACT_SIZE * position.quantity
    }, 0)
    return { price, pnl }
  })
  const maxAbs = Math.max(100, ...points.map((point) => Math.abs(point.pnl)))
  const minPrice = prices[0]
  const maxPrice = prices.at(-1)
  const xFor = (price) => pad.left + ((price - minPrice) / (maxPrice - minPrice)) * (width - pad.left - pad.right)
  const yFor = (pnl) => pad.top + ((maxAbs - pnl) / (maxAbs * 2)) * (height - pad.top - pad.bottom)
  const path = points.map((point, index) => `${index ? 'L' : 'M'} ${xFor(point.price).toFixed(2)} ${yFor(point.pnl).toFixed(2)}`).join(' ')
  const zeroY = yFor(0)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Option payoff at expiration">
      <rect width={width} height={height} className="payoff-surface" />
      <line x1={pad.left} x2={width - pad.right} y1={zeroY} y2={zeroY} className="payoff-zero" />
      <line x1={xFor(futuresPrice)} x2={xFor(futuresPrice)} y1={pad.top} y2={height - pad.bottom} className="payoff-spot" />
      <path d={path} className="payoff-line" />
      <text x={pad.left - 8} y={pad.top + 5} textAnchor="end" className="payoff-axis">{formatMoney(maxAbs)}</text>
      <text x={pad.left - 8} y={zeroY + 4} textAnchor="end" className="payoff-axis">$0</text>
      <text x={pad.left - 8} y={height - pad.bottom} textAnchor="end" className="payoff-axis">{formatMoney(-maxAbs)}</text>
      <text x={pad.left} y={height - 9} className="payoff-axis">{formatPrice(minPrice)}</text>
      <text x={width - pad.right} y={height - 9} textAnchor="end" className="payoff-axis">{formatPrice(maxPrice)}</text>
      <text x={xFor(futuresPrice) + 6} y={pad.top + 13} className="payoff-now">NOW</text>
    </svg>
  )
}

export default function OptionsLab({ chain, futuresPrice, positions, onBuy, onClose }) {
  const quantity = positions.orderQuantity ?? 1
  const optionPositions = positions.items ?? []
  const setQuantity = positions.setOrderQuantity
  const totalMarketValue = optionPositions.reduce((sum, position) => sum + positionMark(position, chain) * CONTRACT_SIZE * position.quantity, 0)
  const totalCost = optionPositions.reduce((sum, position) => sum + position.averagePrice * CONTRACT_SIZE * position.quantity, 0)
  const totalDelta = optionPositions.reduce((sum, position) => {
    const row = chain.find((item) => item.strike === position.strike)
    return sum + (row?.[position.type]?.delta ?? 0) * position.quantity
  }, 0)
  const totalTheta = optionPositions.reduce((sum, position) => {
    const row = chain.find((item) => item.strike === position.strike)
    return sum + (row?.[position.type]?.theta ?? 0) * position.quantity
  }, 0)

  return (
    <div className="options-workspace">
      <section className="options-header-band">
        <div>
          <span className="section-kicker">Vol sheet · risk-defined structures</span>
          <h2>The Vol Board</h2>
          <p>Henry Hub options on futures · 24-day training expiry</p>
        </div>
        <div className="option-summary-strip">
          <div><span>Market value</span><strong>{formatMoney(totalMarketValue)}</strong></div>
          <div><span>Open P&amp;L</span><strong className={totalMarketValue - totalCost >= 0 ? 'positive-text' : 'negative-text'}>{formatMoney(totalMarketValue - totalCost)}</strong></div>
          <div><span>Net delta</span><strong>{totalDelta.toFixed(2)}</strong></div>
          <div><span>Theta / day</span><strong className="negative-text">{formatMoney(totalTheta)}</strong></div>
        </div>
      </section>

      <div className="options-grid">
        <section className="options-chain-panel">
          <div className="chain-toolbar">
            <div>
              <span className="section-kicker">NG options · sheet V-24</span>
              <h3>October Chain</h3>
            </div>
            <div className="contract-stepper">
              <span>Qty</span>
              <button type="button" title="Decrease option quantity" onClick={() => setQuantity(clamp(quantity - 1, 1, 10))}><Minus size={15} /></button>
              <strong>{quantity}</strong>
              <button type="button" title="Increase option quantity" onClick={() => setQuantity(clamp(quantity + 1, 1, 10))}><Plus size={15} /></button>
            </div>
          </div>

          <div className="options-chain" role="table" aria-label="Natural gas options chain">
            <div className="chain-super-head" role="row">
              <strong>CALLS</strong>
              <span>STRIKE</span>
              <strong>PUTS</strong>
            </div>
            <div className="chain-column-head" role="row">
              <span>Delta</span><span>Bid</span><span>Ask</span><span>Strike</span><span>Bid</span><span>Ask</span><span>Delta</span>
            </div>
            {chain.map((row) => {
              const callItm = futuresPrice > row.strike
              const putItm = futuresPrice < row.strike
              return (
                <div key={row.strike} className={`chain-row ${Math.abs(row.strike - futuresPrice) < 0.026 ? 'atm' : ''}`} role="row">
                  <span className={callItm ? 'itm' : ''}>{row.call.delta.toFixed(2)}</span>
                  <span className={callItm ? 'itm' : ''}>{row.call.bid.toFixed(3)}</span>
                  <button type="button" className={callItm ? 'itm' : ''} title={`Buy ${formatPrice(row.strike)} call`} onClick={() => onBuy('call', row, quantity)}>{row.call.ask.toFixed(3)}</button>
                  <strong>{row.strike.toFixed(3)}</strong>
                  <span className={putItm ? 'itm' : ''}>{row.put.bid.toFixed(3)}</span>
                  <button type="button" className={putItm ? 'itm' : ''} title={`Buy ${formatPrice(row.strike)} put`} onClick={() => onBuy('put', row, quantity)}>{row.put.ask.toFixed(3)}</button>
                  <span className={putItm ? 'itm' : ''}>{row.put.delta.toFixed(2)}</span>
                </div>
              )
            })}
          </div>
        </section>

        <aside className="options-side">
          <section className="option-risk-panel">
            <ShieldCheck size={22} aria-hidden="true" />
            <div>
              <span className="section-kicker">Long premium</span>
              <h3>Known maximum loss</h3>
              <p>A purchased option cannot lose more than its premium and fees. Time decay still works against the buyer each day.</p>
            </div>
          </section>

          <section className="option-positions-panel">
            <div className="compact-panel-header">
              <div>
                <span className="section-kicker">Book</span>
                <h3>Option Positions</h3>
              </div>
              <span className="count-badge">{optionPositions.length}</span>
            </div>
            {!optionPositions.length ? (
              <div className="empty-state">Buy an ask from the chain to build a defined-risk position.</div>
            ) : (
              <div className="option-position-list">
                {optionPositions.map((position) => {
                  const mark = positionMark(position, chain)
                  const pnl = (mark - position.averagePrice) * CONTRACT_SIZE * position.quantity
                  return (
                    <div key={position.id} className="option-position-row">
                      <div>
                        <strong>{position.quantity}x {position.strike.toFixed(3)} {position.type === 'call' ? 'Call' : 'Put'}</strong>
                        <span>Avg {position.averagePrice.toFixed(3)} · Mark {mark.toFixed(3)}</span>
                      </div>
                      <b className={pnl >= 0 ? 'positive-text' : 'negative-text'}>{formatMoney(pnl)}</b>
                      <button type="button" title="Close option position" onClick={() => onClose(position, positionBid(position, chain))}><X size={15} /></button>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </aside>
      </div>

      <section className="payoff-panel">
        <div className="compact-panel-header">
          <div>
            <span className="section-kicker">Grease-pencil scenario</span>
            <h3>Expiration Payoff</h3>
          </div>
          <span className="payoff-note">Includes premium paid</span>
        </div>
        {optionPositions.length ? <PayoffChart positions={optionPositions} futuresPrice={futuresPrice} /> : <div className="payoff-empty">The payoff diagram appears after the first option trade.</div>}
      </section>
    </div>
  )
}
