import { useState } from 'react'
import { BarChart3, Layers3 } from 'lucide-react'
import { TICK_SIZE, formatMoney, formatPrice, roundPrice } from './simulator.js'

function DepthRow({ level, side, maxDepth, cumulative }) {
  const width = `${Math.max(8, (cumulative / maxDepth) * 100)}%`
  return (
    <div className={`depth-row ${side}`}>
      <span className="depth-fill" style={{ width }} />
      <span className="depth-price">{level.price.toFixed(3)}</span>
      <strong>{level.size}</strong>
      <span>{cumulative}</span>
    </div>
  )
}

export default function MarketDepth({ book, onPriceOrder }) {
  const [view, setView] = useState('book')
  const maxDepth = Math.max(book.bidDepth, book.askDepth, 1)
  const asksWithCumulative = book.asks.reduce((rows, level) => {
    return [...rows, { level, cumulative: (rows.at(-1)?.cumulative ?? 0) + level.size }]
  }, [])
  const bidsWithCumulative = book.bids.reduce((rows, level) => {
    return [...rows, { level, cumulative: (rows.at(-1)?.cumulative ?? 0) + level.size }]
  }, [])

  const askMap = new Map(book.asks.map((level) => [level.price.toFixed(3), level.size]))
  const bidMap = new Map(book.bids.map((level) => [level.price.toFixed(3), level.size]))
  const topPrice = roundPrice(book.bestAsk + 5 * TICK_SIZE)
  const ladder = Array.from({ length: 14 }, (_, index) => roundPrice(topPrice - index * TICK_SIZE))

  return (
    <section className="depth-panel" aria-label="Market depth">
      <div className="compact-panel-header">
        <div>
          <span className="section-kicker">Liquidity</span>
          <h3>Market Depth</h3>
        </div>
        <div className="mini-tabs" aria-label="Depth view">
          <button type="button" className={view === 'book' ? 'active' : ''} title="Order book" onClick={() => setView('book')}>
            <Layers3 size={15} aria-hidden="true" />
          </button>
          <button type="button" className={view === 'dom' ? 'active' : ''} title="Depth of market ladder" onClick={() => setView('dom')}>
            <BarChart3 size={15} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="spread-readout">
        <span className={`market-condition ${book.condition.toLowerCase()}`}>{book.condition}</span>
        <strong>{book.spreadTicks} tick spread</strong>
        <span>{formatMoney(book.spreadValue)} / contract</span>
      </div>

      {view === 'book' ? (
        <div className="order-book-table">
          <div className="depth-head">
            <span>Price</span>
            <span>Size</span>
            <span>Total</span>
          </div>
          <div className="book-side asks">
            {[...asksWithCumulative].slice(0, 6).reverse().map(({ level, cumulative }) => (
              <DepthRow key={`ask-${level.price}`} level={level} side="ask" cumulative={cumulative} maxDepth={maxDepth} />
            ))}
          </div>
          <div className="inside-market">
            <span>{formatPrice(book.bestBid)}</span>
            <strong>{book.spreadTicks}t</strong>
            <span>{formatPrice(book.bestAsk)}</span>
          </div>
          <div className="book-side bids">
            {bidsWithCumulative.slice(0, 6).map(({ level, cumulative }) => (
              <DepthRow key={`bid-${level.price}`} level={level} side="bid" cumulative={cumulative} maxDepth={maxDepth} />
            ))}
          </div>
        </div>
      ) : (
        <div className="dom-table">
          <div className="dom-head">
            <span>Bid</span>
            <span>Price</span>
            <span>Ask</span>
          </div>
          {ladder.map((price) => {
            const key = price.toFixed(3)
            const bidSize = bidMap.get(key)
            const askSize = askMap.get(key)
            return (
              <div key={key} className={`dom-row ${bidSize ? 'has-bid' : ''} ${askSize ? 'has-ask' : ''}`}>
                {bidSize ? (
                  <button type="button" title={`Place buy limit at ${key}`} onClick={() => onPriceOrder('buy', price)}>{bidSize}</button>
                ) : <span />}
                <strong>{key}</strong>
                {askSize ? (
                  <button type="button" title={`Place sell limit at ${key}`} onClick={() => onPriceOrder('sell', price)}>{askSize}</button>
                ) : <span />}
              </div>
            )
          })}
        </div>
      )}

      <div className="imbalance-meter">
        <span>Book imbalance</span>
        <div><i style={{ width: `${50 + book.imbalance * 50}%` }} /></div>
        <strong className={book.imbalance >= 0 ? 'positive-text' : 'negative-text'}>
          {book.imbalance >= 0 ? '+' : ''}{(book.imbalance * 100).toFixed(0)}%
        </strong>
      </div>
    </section>
  )
}
