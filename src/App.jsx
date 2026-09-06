import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  CloudSun,
  Flame,
  Gauge,
  GraduationCap,
  ListChecks,
  Medal,
  Minus,
  Newspaper,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Save,
  ShieldAlert,
  SlidersHorizontal,
  Target,
  Trash2,
  Trophy,
  Wallet,
  X,
  Zap,
} from 'lucide-react'
import MarketDepth from './MarketDepth.jsx'
import OptionsLab from './OptionsLab.jsx'
import TradingChart from './TradingChart.jsx'
import {
  BRIEFING_CARDS,
  CONTRACT_SIZE,
  DESK_PHASES,
  DIFFICULTIES,
  FUNDAMENTAL_METRICS,
  FUNDAMENTAL_QUESTIONS,
  FUTURES_CURVE,
  LOOKBACK_BARS,
  MARGIN_PER_CONTRACT,
  OPTION_COMMISSION,
  SESSION_EVENTS,
  SESSION_STEPS,
  STARTING_CASH,
  TICK_VALUE,
  applyFuturesFill,
  buildOptionsChain,
  buildOrderBook,
  buildSession,
  clamp,
  formatMoney,
  formatPrice,
  formatSigned,
  futuresUnrealized,
  orderTriggerState,
  phaseForStep,
  restingFillCapacity,
  roundPrice,
  sessionTime,
  walkOrderBook,
} from './simulator.js'
import './App.css'

const LEADERBOARD_KEY = 'gas-trader-academy-board-v2'
const INITIAL_ACCOUNT = {
  cash: STARTING_CASH,
  realizedPnl: 0,
  fees: 0,
  position: { quantity: 0, averagePrice: 0 },
}

const DEFAULT_LEADERS = [
  { name: 'Maya', score: 7420, pnl: 6840, rank: 'Senior Trader' },
  { name: 'Jules', score: 6810, pnl: 5190, rank: 'Trader' },
  { name: 'Owen', score: 5940, pnl: 3750, rank: 'Trader' },
]

const NAV_ITEMS = [
  { id: 'briefing', label: 'Morning Brief', icon: Newspaper },
  { id: 'trade', label: 'Trade Desk', icon: BarChart3 },
  { id: 'fundamentals', label: 'Fundamentals', icon: CloudSun },
  { id: 'options', label: 'Options Lab', icon: CircleDollarSign },
  { id: 'debrief', label: 'Debrief', icon: ListChecks },
]

function loadLeaderboard() {
  try {
    const parsed = JSON.parse(localStorage.getItem(LEADERBOARD_KEY))
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_LEADERS
  } catch {
    return DEFAULT_LEADERS
  }
}

function optionMark(position, chain) {
  const row = chain.find((item) => item.strike === position.strike)
  return row?.[position.type]?.mark ?? 0
}

function optionMarketValue(positions, chain) {
  return positions.reduce((sum, position) => sum + optionMark(position, chain) * CONTRACT_SIZE * position.quantity, 0)
}

function mergeOrderUpdates(orderLog, updates) {
  const byId = new Map(updates.map((order) => [order.id, order]))
  return orderLog.map((order) => byId.get(order.id) ?? order)
}

function processWorkingOrders({ orders, account, bar, book, seed, step }) {
  let nextAccount = account
  const nextWorking = []
  const updates = []
  const fills = []
  const canceledGroups = new Set()
  const sortedOrders = [...orders].sort((a, b) => {
    const priority = (order) => order.type === 'stop' ? 0 : order.type === 'stop-limit' ? 1 : 2
    return priority(a) - priority(b)
  })

  for (const order of sortedOrders) {
    if (order.ocoGroup && canceledGroups.has(order.ocoGroup)) {
      updates.push({ ...order, status: 'Canceled (OCO)', canceledAt: sessionTime(step) })
      continue
    }

    const trigger = orderTriggerState(order, bar)
    const stopTriggered = order.type === 'stop-limit' ? trigger.stopTriggered : order.triggered
    const shouldFill = order.type === 'stop-limit' ? trigger.limitMarketable : Boolean(trigger)
    const triggeredOrder = stopTriggered && !order.triggered ? { ...order, triggered: true, status: 'Triggered' } : order

    if (!shouldFill) {
      nextWorking.push(triggeredOrder)
      if (triggeredOrder !== order) updates.push(triggeredOrder)
      continue
    }

    let executableQuantity = order.remaining
    if (order.reduceOnly) {
      const closable = order.side === 'sell'
        ? Math.max(0, nextAccount.position.quantity)
        : Math.max(0, -nextAccount.position.quantity)
      executableQuantity = Math.min(executableQuantity, closable)
    }

    if (executableQuantity <= 0) {
      updates.push({ ...triggeredOrder, status: 'Canceled (flat)', canceledAt: sessionTime(step) })
      continue
    }

    const fillDetails = order.type === 'stop' ? (() => {
      const sweep = walkOrderBook(order.side, executableQuantity, book, 5)
      return { fillQuantity: sweep.filledQuantity, fillPrice: sweep.averagePrice, liquidity: 'Taker' }
    })() : {
      fillQuantity: Math.min(executableQuantity, restingFillCapacity(triggeredOrder, bar, seed, step)),
      fillPrice: triggeredOrder.limitPrice,
      liquidity: 'Maker',
    }
    const { fillQuantity, fillPrice, liquidity } = fillDetails

    if (!fillQuantity) {
      nextWorking.push(triggeredOrder)
      continue
    }

    const execution = applyFuturesFill(nextAccount, order.side, fillQuantity, fillPrice)
    nextAccount = execution.account
    const remaining = order.remaining - fillQuantity
    const filledQuantity = order.filledQuantity + fillQuantity
    const averageFillPrice = order.filledQuantity
      ? roundPrice((order.averageFillPrice * order.filledQuantity + fillPrice * fillQuantity) / filledQuantity)
      : fillPrice
    const status = remaining > 0 ? `Partially filled ${filledQuantity}/${order.quantity}` : 'Filled'
    const updated = { ...triggeredOrder, remaining, filledQuantity, averageFillPrice, status, updatedAt: sessionTime(step) }
    updates.push(updated)
    fills.push({
      id: `fill-${order.id}-${step}-${filledQuantity}`,
      orderId: order.id,
      time: sessionTime(step),
      side: order.side,
      quantity: fillQuantity,
      price: fillPrice,
      liquidity,
      realized: execution.realized,
      fee: execution.fee,
      partial: remaining > 0,
    })

    if (remaining > 0) {
      nextWorking.push(updated)
    } else if (order.ocoGroup) {
      canceledGroups.add(order.ocoGroup)
    }
  }

  const afterOco = nextWorking.filter((order) => {
    if (!order.ocoGroup || !canceledGroups.has(order.ocoGroup)) return true
    updates.push({ ...order, status: 'Canceled (OCO)', canceledAt: sessionTime(step) })
    return false
  })

  const finalWorking = step >= 30
    ? afterOco.filter((order) => {
      if (order.timeInForce !== 'DAY') return true
      updates.push({ ...order, status: 'Expired at settlement', canceledAt: sessionTime(step) })
      return false
    })
    : afterOco

  return { account: nextAccount, workingOrders: finalWorking, updates, fills }
}

function Metric({ label, value, icon: Icon, tone = '' }) {
  return <div className={`top-metric ${tone}`}><Icon size={16} aria-hidden="true" /><span>{label}</span><strong>{value}</strong></div>
}

function SessionTimeline({ step }) {
  const currentPhase = phaseForStep(step)
  return (
    <div className="session-timeline" aria-label="Trading day timeline">
      {DESK_PHASES.map((phase) => {
        const complete = step > phase.end
        const active = phase.id === currentPhase.id
        return (
          <div key={phase.id} className={`${complete ? 'complete' : ''} ${active ? 'active' : ''}`}>
            <span>{complete ? <Check size={13} /> : phase.start + 1}</span>
            <div><strong>{phase.short}</strong><small>{sessionTime(phase.start)}</small></div>
          </div>
        )
      })}
    </div>
  )
}

function QuestList({ missions }) {
  const complete = missions.filter((mission) => mission.done).length
  return (
    <div className="quest-block">
      <div className="quest-title"><span>Shift Quests</span><strong>{complete}/{missions.length}</strong></div>
      <div className="quest-progress"><i style={{ width: `${(complete / missions.length) * 100}%` }} /></div>
      <div className="quest-list">
        {missions.slice(0, 6).map((mission) => (
          <div key={mission.id} className={mission.done ? 'done' : ''}><CheckCircle2 size={14} aria-hidden="true" /><span>{mission.label}</span><b>+{mission.points}</b></div>
        ))}
      </div>
    </div>
  )
}

function MorningBrief({ responses, setResponses, thesis, setThesis, locked, onCommit, onOpenDesk }) {
  const answered = Object.keys(responses).length
  const correctReads = BRIEFING_CARDS.filter((card) => responses[card.id] === card.correct).length
  return (
    <div className="briefing-workspace">
      <section className="briefing-lead">
        <div>
          <span className="section-kicker">06:00 CT · Tuesday shift</span>
          <h2>Build the morning game plan</h2>
          <p>Read the overnight changes, classify each market impact, then commit to a desk bias before liquidity arrives.</p>
        </div>
        <div className="brief-score"><span>Signal read</span><strong>{locked ? `${correctReads}/3` : `${answered}/3`}</strong><small>{locked ? 'graded' : 'reviewed'}</small></div>
      </section>

      <div className="briefing-grid">
        <section className="brief-cards-area">
          <div className="section-heading">
            <div><span className="section-kicker">Overnight intelligence</span><h3>Signal Board</h3></div>
            <span className="live-pill"><i /> LIVE FEED</span>
          </div>
          <div className="brief-card-list">
            {BRIEFING_CARDS.map((card) => {
              const answer = responses[card.id]
              return (
                <article key={card.id} className={`brief-card ${locked ? 'locked' : ''}`}>
                  <div className="brief-card-source"><span>{card.source}</span><time>{card.time}</time></div>
                  <h4>{card.headline}</h4>
                  <p>{card.detail}</p>
                  <div className="impact-picker" aria-label={`Impact of ${card.headline}`}>
                    {['bullish', 'neutral', 'bearish'].map((choice) => (
                      <button
                        key={choice}
                        type="button"
                        className={`${answer === choice ? 'active' : ''} ${locked && choice === card.correct ? 'correct' : ''} ${locked && answer === choice && answer !== card.correct ? 'wrong' : ''}`}
                        disabled={locked}
                        onClick={() => setResponses((current) => ({ ...current, [card.id]: choice }))}
                      >
                        {choice === 'bullish' ? <ArrowUpRight size={15} /> : choice === 'bearish' ? <ArrowDownRight size={15} /> : <Minus size={15} />}{choice}
                      </button>
                    ))}
                  </div>
                  {locked && <div className="brief-explanation"><BookOpen size={15} />{card.why}</div>}
                </article>
              )
            })}
          </div>
        </section>

        <aside className="brief-side">
          <section className="thesis-panel">
            <span className="section-kicker">Desk decision</span>
            <h3>Opening Bias</h3>
            <p>What is the net message from the board?</p>
            <div className="thesis-options">
              {['bullish', 'neutral', 'bearish'].map((choice) => (
                <button key={choice} type="button" className={thesis === choice ? 'active' : ''} disabled={locked} onClick={() => setThesis(choice)}>
                  {choice === 'bullish' ? <ArrowUpRight /> : choice === 'bearish' ? <ArrowDownRight /> : <SlidersHorizontal />}<span>{choice}</span>
                </button>
              ))}
            </div>
            {!locked ? (
              <button type="button" className="primary-command" disabled={answered < 3 || !thesis} onClick={onCommit}>Commit game plan <ChevronRight size={17} /></button>
            ) : (
              <div className={`thesis-result ${thesis === 'bullish' ? 'correct' : 'review'}`}><CheckCircle2 size={18} /><span>{thesis === 'bullish' ? 'The weighted read is bullish.' : 'The weighted board favored a bullish bias.'}</span></div>
            )}
            <button type="button" className="secondary-command" onClick={onOpenDesk}>Open trade desk</button>
          </section>

          <section className="catalyst-panel">
            <div className="compact-panel-header"><div><span className="section-kicker">Today</span><h3>Catalyst Calendar</h3></div><CalendarClock size={20} /></div>
            <div className="catalyst-list">
              {SESSION_EVENTS.filter((event) => event.step > 0).slice(0, 6).map((event) => (
                <div key={event.step}><time>{sessionTime(event.step)}</time><span>{event.category}</span><i className={event.sentiment} /></div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function CurveChart({ price }) {
  const width = 620
  const height = 190
  const pad = { top: 18, right: 22, bottom: 34, left: 52 }
  const data = FUTURES_CURVE.map((item) => ({ ...item, price: price + item.priceOffset }))
  const min = Math.min(...data.map((item) => item.price)) - 0.05
  const max = Math.max(...data.map((item) => item.price)) + 0.05
  const xFor = (index) => pad.left + (index / (data.length - 1)) * (width - pad.left - pad.right)
  const yFor = (value) => pad.top + ((max - value) / (max - min)) * (height - pad.top - pad.bottom)
  const path = data.map((item, index) => `${index ? 'L' : 'M'} ${xFor(index)} ${yFor(item.price)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Natural gas futures curve">
      <line x1={pad.left} x2={width - pad.right} y1={height - pad.bottom} y2={height - pad.bottom} className="curve-axis" />
      <path d={path} className="curve-line" />
      {data.map((item, index) => (
        <g key={item.contract}><circle cx={xFor(index)} cy={yFor(item.price)} r="4.5" className="curve-dot" /><text x={xFor(index)} y={height - 12} textAnchor="middle" className="curve-label">{item.contract}</text><text x={xFor(index)} y={yFor(item.price) - 10} textAnchor="middle" className="curve-price">{item.price.toFixed(3)}</text></g>
      ))}
    </svg>
  )
}

function Fundamentals({ currentPrice, answers, setAnswers }) {
  const correct = FUNDAMENTAL_QUESTIONS.filter((question) => answers[question.id] === question.correct).length
  return (
    <div className="fundamentals-workspace">
      <section className="view-title-band">
        <div><span className="section-kicker">Physical market intelligence</span><h2>Fundamentals Room</h2><p>Translate weather, storage, production, and infrastructure into a tradeable balance.</p></div>
        <div className="room-score"><GraduationCap size={21} /><strong>{correct}/{FUNDAMENTAL_QUESTIONS.length}</strong><span>reads correct</span></div>
      </section>

      <section className="fund-metrics" aria-label="Fundamental market metrics">
        {FUNDAMENTAL_METRICS.map((metric) => <div key={metric.id}><span>{metric.label}</span><strong>{metric.value}</strong><small className={metric.tone}>{metric.change}</small></div>)}
      </section>

      <div className="fund-grid">
        <section className="weather-panel">
          <div className="section-heading"><div><span className="section-kicker">Forecast demand</span><h3>Regional Weather Load</h3></div><span className="model-time">06z ensemble</span></div>
          <div className="weather-map" aria-label="Simplified regional weather demand map">
            <div className="region west normal"><span>WEST</span><strong>Normal</strong><small>+0.1 Bcf/d</small></div>
            <div className="region midwest warm"><span>MIDWEST</span><strong>Warm</strong><small>+0.4 Bcf/d</small></div>
            <div className="region northeast mild"><span>NORTHEAST</span><strong>Mild</strong><small>-0.2 Bcf/d</small></div>
            <div className="region south hot"><span>SOUTH CENTRAL</span><strong>Hot</strong><small>+1.5 Bcf/d</small></div>
            <div className="region southeast warm"><span>SOUTHEAST</span><strong>Warm</strong><small>+0.3 Bcf/d</small></div>
          </div>
          <div className="weather-legend"><span><i className="normal" />Below load</span><span><i className="warm" />Elevated</span><span><i className="hot" />High</span></div>
        </section>

        <section className="curve-panel">
          <div className="section-heading"><div><span className="section-kicker">Term structure</span><h3>Futures Curve</h3></div><span className="curve-shape">Contango</span></div>
          <CurveChart price={currentPrice} />
          <div className="curve-stats"><span>Oct-Jan spread</span><strong>+{(FUTURES_CURVE[3].priceOffset - FUTURES_CURVE[0].priceOffset).toFixed(3)}</strong><span>Winter premium</span></div>
        </section>
      </div>

      <section className="scenario-drill">
        <div className="section-heading"><div><span className="section-kicker">Desk drills</span><h3>Make the Call</h3></div><Target size={21} /></div>
        <div className="drill-grid">
          {FUNDAMENTAL_QUESTIONS.map((question, index) => {
            const answer = answers[question.id]
            return (
              <article key={question.id} className={answer ? (answer === question.correct ? 'correct' : 'wrong') : ''}>
                <span className="drill-number">0{index + 1}</span><h4>{question.prompt}</h4>
                <div className="drill-answers">{question.answers.map((choice) => <button key={choice} type="button" className={answer === choice ? 'active' : ''} disabled={Boolean(answer)} onClick={() => setAnswers((current) => ({ ...current, [question.id]: choice }))}>{choice}</button>)}</div>
                {answer && <p><BookOpen size={15} />{question.explanation}</p>}
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function OrderTicket({ ticket, setTicket, book, onSubmit, onClosePosition, position }) {
  const update = (key, value) => setTicket((current) => ({ ...current, [key]: value }))
  const priceLabel = ticket.side === 'buy' ? book.bestAsk : book.bestBid
  return (
    <section className="order-ticket" aria-label="Futures order ticket">
      <div className="compact-panel-header"><div><span className="section-kicker">NG · Oct</span><h3>Order Ticket</h3></div><span className="tick-value">1 tick = {formatMoney(TICK_VALUE)}</span></div>
      <div className="side-picker"><button type="button" className={ticket.side === 'buy' ? 'active buy' : ''} onClick={() => update('side', 'buy')}><ArrowUpRight size={17} />Buy</button><button type="button" className={ticket.side === 'sell' ? 'active sell' : ''} onClick={() => update('side', 'sell')}><ArrowDownRight size={17} />Sell</button></div>
      <div className="ticket-field"><label htmlFor="order-type">Order type</label><select id="order-type" value={ticket.type} onChange={(event) => update('type', event.target.value)}><option value="market">Market</option><option value="limit">Limit</option><option value="stop">Stop Market</option><option value="stop-limit">Stop Limit</option></select></div>
      <div className="quantity-field"><span>Contracts</span><div><button type="button" title="Decrease contracts" onClick={() => update('quantity', clamp(ticket.quantity - 1, 1, 25))}><Minus size={15} /></button><strong>{ticket.quantity}</strong><button type="button" title="Increase contracts" onClick={() => update('quantity', clamp(ticket.quantity + 1, 1, 25))}><Plus size={15} /></button></div></div>
      {(ticket.type === 'limit' || ticket.type === 'stop-limit') && <div className="ticket-field"><label htmlFor="limit-price">Limit price</label><input id="limit-price" type="number" step="0.001" value={ticket.limitPrice} placeholder={priceLabel.toFixed(3)} onChange={(event) => update('limitPrice', event.target.value)} /></div>}
      {(ticket.type === 'stop' || ticket.type === 'stop-limit') && <div className="ticket-field"><label htmlFor="stop-price">Stop price</label><input id="stop-price" type="number" step="0.001" value={ticket.stopPrice} placeholder={priceLabel.toFixed(3)} onChange={(event) => update('stopPrice', event.target.value)} /></div>}
      <div className="ticket-pair">
        <div className="ticket-field"><label htmlFor="time-in-force">Time in force</label><select id="time-in-force" value={ticket.timeInForce} onChange={(event) => update('timeInForce', event.target.value)}><option>DAY</option><option>GTC</option></select></div>
        <label className="check-control"><input type="checkbox" checked={ticket.reduceOnly} onChange={(event) => update('reduceOnly', event.target.checked)} /><span>Reduce only</span></label>
      </div>
      {ticket.type === 'market' && <div className="bracket-control"><label className="check-control"><input type="checkbox" checked={ticket.bracket} onChange={(event) => update('bracket', event.target.checked)} /><span>Attach bracket</span></label>{ticket.bracket && <div className="bracket-fields"><label>Stop offset<input type="number" step="0.005" min="0.005" value={ticket.stopOffset} onChange={(event) => update('stopOffset', event.target.value)} /></label><label>Target offset<input type="number" step="0.005" min="0.005" value={ticket.targetOffset} onChange={(event) => update('targetOffset', event.target.value)} /></label></div>}</div>}
      <button type="button" className={`submit-order ${ticket.side}`} onClick={onSubmit}>{ticket.side === 'buy' ? 'Buy' : 'Sell'} {ticket.quantity} {ticket.type === 'market' ? `@ ${formatPrice(priceLabel)}` : ticket.type.replace('-', ' ')}</button>
      <button type="button" className="close-position" disabled={!position.quantity} onClick={onClosePosition}>Flatten futures</button>
    </section>
  )
}

function Blotter({ tab, setTab, account, markPrice, workingOrders, orderLog, fills, onCancel }) {
  const unrealized = futuresUnrealized(account.position, markPrice)
  return (
    <section className="blotter-panel">
      <div className="blotter-tabs">
        {[
          ['positions', 'Positions', account.position.quantity ? 1 : 0],
          ['working', 'Working', workingOrders.length],
          ['fills', 'Fills', fills.length],
          ['orders', 'All Orders', orderLog.length],
        ].map(([id, label, count]) => <button key={id} type="button" className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{label}<span>{count}</span></button>)}
      </div>
      {tab === 'positions' && (account.position.quantity ? <div className="position-table table-row-grid"><div><span>Instrument</span><strong>NG Oct Futures</strong></div><div><span>Position</span><strong className={account.position.quantity > 0 ? 'positive-text' : 'negative-text'}>{account.position.quantity > 0 ? 'Long' : 'Short'} {Math.abs(account.position.quantity)}</strong></div><div><span>Average</span><strong>{formatPrice(account.position.averagePrice)}</strong></div><div><span>Mark</span><strong>{formatPrice(markPrice)}</strong></div><div><span>Open P&amp;L</span><strong className={unrealized >= 0 ? 'positive-text' : 'negative-text'}>{formatMoney(unrealized)}</strong></div><div><span>Margin</span><strong>{formatMoney(Math.abs(account.position.quantity) * MARGIN_PER_CONTRACT)}</strong></div></div> : <div className="empty-state">No futures position. Your risk is flat.</div>)}
      {tab === 'working' && (workingOrders.length ? <div className="orders-table"><div className="orders-head"><span>Time</span><span>Side</span><span>Type</span><span>Qty</span><span>Price</span><span>Status</span><span /></div>{workingOrders.map((order) => <div key={order.id} className="orders-row"><span>{order.createdAt}</span><strong className={order.side}>{order.side}</strong><span>{order.type}</span><span>{order.filledQuantity}/{order.quantity}</span><span>{formatPrice(order.limitPrice ?? order.stopPrice)}</span><span>{order.status}</span><button type="button" title="Cancel order" onClick={() => onCancel(order.id)}><X size={14} /></button></div>)}</div> : <div className="empty-state">No working orders in the market.</div>)}
      {tab === 'fills' && (fills.length ? <div className="orders-table fills-table"><div className="orders-head"><span>Time</span><span>Side</span><span>Qty</span><span>Price</span><span>Liquidity</span><span>Realized</span><span /></div>{fills.slice(0, 10).map((fill) => <div key={fill.id} className="orders-row"><span>{fill.time}</span><strong className={fill.side}>{fill.side}</strong><span>{fill.quantity}{fill.partial ? '*' : ''}</span><span>{formatPrice(fill.price)}</span><span>{fill.liquidity}</span><span className={fill.realized >= 0 ? 'positive-text' : 'negative-text'}>{formatMoney(fill.realized - fill.fee)}</span><span /></div>)}</div> : <div className="empty-state">Executions will appear here, including partial fills.</div>)}
      {tab === 'orders' && (orderLog.length ? <div className="orders-table"><div className="orders-head"><span>Time</span><span>Side</span><span>Type</span><span>Qty</span><span>Filled</span><span>Status</span><span /></div>{orderLog.slice(0, 10).map((order) => <div key={order.id} className="orders-row"><span>{order.createdAt}</span><strong className={order.side}>{order.side}</strong><span>{order.type}</span><span>{order.quantity}</span><span>{order.filledQuantity}</span><span>{order.status}</span><span /></div>)}</div> : <div className="empty-state">Your audit trail is empty.</div>)}
    </section>
  )
}

function TradeDesk({ currentBar, previousBar, visibleBars, book, account, equity, availableFunds, workingOrders, orderLog, fills, ticket, setTicket, drawings, setDrawings, onDrawingCreated, onSubmit, onClosePosition, onPriceOrder, onCancel, blotterTab, setBlotterTab }) {
  const change = currentBar.close - previousBar.close
  const changePct = change / previousBar.close
  const unrealized = futuresUnrealized(account.position, currentBar.close)
  const margin = Math.abs(account.position.quantity) * MARGIN_PER_CONTRACT
  return (
    <div className="trade-workspace">
      <section className="market-overview-band">
        <div className="instrument-quote"><div><span className="section-kicker">NYMEX · NGV6</span><h2>{formatPrice(currentBar.close)}</h2></div><span className={change >= 0 ? 'up' : 'down'}>{change >= 0 ? <ArrowUpRight size={17} /> : <ArrowDownRight size={17} />}{formatSigned(change, 3)} ({formatSigned(changePct * 100, 2)}%)</span></div>
        <div className="desk-account-strip"><div><span>Futures P&amp;L</span><strong className={unrealized >= 0 ? 'positive-text' : 'negative-text'}>{formatMoney(unrealized)}</strong></div><div><span>Position</span><strong>{account.position.quantity ? `${account.position.quantity > 0 ? 'Long' : 'Short'} ${Math.abs(account.position.quantity)}` : 'Flat'}</strong></div><div><span>Margin used</span><strong>{formatMoney(margin)}</strong></div><div><span>Available</span><strong>{formatMoney(availableFunds)}</strong></div><div><span>Equity</span><strong>{formatMoney(equity)}</strong></div></div>
      </section>
      <div className="trade-grid">
        <div className="chart-column">
          <section className="chart-panel"><TradingChart bars={visibleBars} position={account.position} workingOrders={workingOrders} drawings={drawings} onDrawingsChange={setDrawings} onDrawingCreated={onDrawingCreated} /></section>
          <section className={`market-news ${currentBar.event?.sentiment ?? 'neutral'}`}><Bell size={19} aria-hidden="true" /><time>{currentBar.time}</time><div><span>{currentBar.event?.category ?? 'Market flow'}</span><strong>{currentBar.event?.headline ?? 'Order flow controls the tape'}</strong><p>{currentBar.event?.detail}</p></div></section>
        </div>
        <aside className="execution-column"><OrderTicket ticket={ticket} setTicket={setTicket} book={book} onSubmit={onSubmit} onClosePosition={onClosePosition} position={account.position} /><MarketDepth book={book} onPriceOrder={onPriceOrder} /></aside>
      </div>
      <Blotter tab={blotterTab} setTab={setBlotterTab} account={account} markPrice={currentBar.close} workingOrders={workingOrders} orderLog={orderLog} fills={fills} onCancel={onCancel} />
    </div>
  )
}

function Debrief({ stats, missions, journal, setJournal, leaderboard, handle, setHandle, onSave, onReset, finished, onTrade }) {
  const grade = stats.score >= 7000 ? 'A' : stats.score >= 5600 ? 'B' : stats.score >= 4300 ? 'C' : 'D'
  return (
    <div className="debrief-workspace">
      <section className="debrief-score-band"><div className="grade-mark"><span>DESK GRADE</span><strong>{grade}</strong></div><div><span className="section-kicker">End-of-day review</span><h2>{finished ? 'Shift complete' : 'Live performance review'}</h2><p>{finished ? 'Settlement is final. Review process quality before starting the next scenario.' : 'The desk report updates throughout the session. Finish at settlement to lock the score.'}</p></div><div className="score-total"><span>Desk score</span><strong>{stats.score.toLocaleString()}</strong><small>{stats.rank}</small></div></section>
      <section className="debrief-metrics"><div><Activity /><span>Total P&amp;L</span><strong className={stats.pnl >= 0 ? 'positive-text' : 'negative-text'}>{formatMoney(stats.pnl)}</strong></div><div><ShieldAlert /><span>Max drawdown</span><strong>{formatMoney(stats.maxDrawdown)}</strong></div><div><Zap /><span>Learning XP</span><strong>{stats.xp.toLocaleString()}</strong></div><div><Gauge /><span>Execution rate</span><strong>{stats.executionRate}%</strong></div></section>
      <div className="debrief-grid">
        <section className="mission-review"><div className="section-heading"><div><span className="section-kicker">Performance</span><h3>Shift Quests</h3></div><Target size={21} /></div><div className="mission-review-list">{missions.map((mission) => <div key={mission.id} className={mission.done ? 'done' : ''}><CheckCircle2 size={17} /><span>{mission.label}</span><strong>{mission.done ? `+${mission.points}` : 'Open'}</strong></div>)}</div></section>
        <section className="journal-panel"><div className="section-heading"><div><span className="section-kicker">Process</span><h3>Trader Journal</h3></div><BookOpen size={21} /></div><label htmlFor="trade-journal">What was your thesis, best decision, and biggest mistake?</label><textarea id="trade-journal" value={journal} onChange={(event) => setJournal(event.target.value)} placeholder="I expected... I entered because... Next shift I will..." /><div className="journal-prompts"><span>Thesis</span><span>Execution</span><span>Risk</span><span>Next adjustment</span></div></section>
        <section className="leaderboard-panel"><div className="section-heading"><div><span className="section-kicker">Local league</span><h3>Leaderboard</h3></div><Medal size={21} /></div><div className="leaderboard-entry"><input aria-label="Trader handle" maxLength={18} value={handle} onChange={(event) => setHandle(event.target.value)} /><button type="button" title="Save score" onClick={onSave}><Save size={17} /></button><button type="button" title="Reset leaderboard" onClick={onReset}><Trash2 size={17} /></button></div><ol className="leaderboard-list">{leaderboard.map((entry, index) => <li key={`${entry.name}-${entry.score}-${index}`}><span>{index + 1}</span><div><strong>{entry.name}</strong><small>{entry.rank} · {formatMoney(entry.pnl)}</small></div><b>{entry.score.toLocaleString()}</b></li>)}</ol></section>
      </div>
      {!finished && <button type="button" className="return-desk" onClick={onTrade}>Return to trade desk <ChevronRight size={17} /></button>}
    </div>
  )
}

function App() {
  const todaySeed = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [difficulty, setDifficulty] = useState('desk')
  const [scenarioSeed, setScenarioSeed] = useState(todaySeed)
  const bars = useMemo(() => buildSession(difficulty, scenarioSeed), [difficulty, scenarioSeed])
  const [step, setStep] = useState(0)
  const [activeView, setActiveView] = useState('briefing')
  const [autoPlay, setAutoPlay] = useState(false)
  const [account, setAccount] = useState(INITIAL_ACCOUNT)
  const [workingOrders, setWorkingOrders] = useState([])
  const [orderLog, setOrderLog] = useState([])
  const [fills, setFills] = useState([])
  const [optionPositions, setOptionPositions] = useState([])
  const [optionTrades, setOptionTrades] = useState([])
  const [optionQuantity, setOptionQuantity] = useState(1)
  const [drawings, setDrawings] = useState([])
  const [usedDrawingTool, setUsedDrawingTool] = useState(false)
  const [briefResponses, setBriefResponses] = useState({})
  const [thesis, setThesis] = useState('')
  const [briefLocked, setBriefLocked] = useState(false)
  const [fundAnswers, setFundAnswers] = useState({})
  const [blotterTab, setBlotterTab] = useState('positions')
  const [journal, setJournal] = useState('')
  const [leaderboard, setLeaderboard] = useState(loadLeaderboard)
  const [handle, setHandle] = useState('Rookie')
  const [notice, setNotice] = useState('Morning handoff is ready. Build a game plan before the first catalyst.')
  const [risk, setRisk] = useState({ peak: STARTING_CASH, maxDrawdown: 0, maxMargin: 0 })
  const [ticket, setTicket] = useState({ side: 'buy', type: 'market', quantity: 1, limitPrice: '', stopPrice: '', timeInForce: 'DAY', reduceOnly: false, bracket: true, stopOffset: '0.035', targetOffset: '0.060' })

  const activeIndex = LOOKBACK_BARS + step
  const currentBar = bars[activeIndex]
  const previousBar = bars[Math.max(0, activeIndex - 1)]
  const visibleBars = bars.slice(0, activeIndex + 1)
  const book = useMemo(() => buildOrderBook(currentBar, difficulty, scenarioSeed, step), [currentBar, difficulty, scenarioSeed, step])
  const optionsChain = useMemo(() => buildOptionsChain(currentBar.close, step), [currentBar.close, step])
  const optionsValue = optionMarketValue(optionPositions, optionsChain)
  const futuresPnl = futuresUnrealized(account.position, currentBar.close)
  const equity = account.cash + futuresPnl + optionsValue
  const marginUsed = Math.abs(account.position.quantity) * MARGIN_PER_CONTRACT
  const reservedMargin = workingOrders.filter((order) => !order.reduceOnly).reduce((sum, order) => sum + order.remaining * MARGIN_PER_CONTRACT, 0)
  const availableFunds = equity - marginUsed - reservedMargin
  const finished = step === SESSION_STEPS - 1
  const correctBriefReads = BRIEFING_CARDS.filter((card) => briefResponses[card.id] === card.correct).length
  const correctFundReads = FUNDAMENTAL_QUESTIONS.filter((question) => fundAnswers[question.id] === question.correct).length

  const missions = [
    { id: 'brief', label: 'Complete morning brief', points: 350, done: briefLocked },
    { id: 'fundamentals', label: 'Finish fundamentals drills', points: 450, done: Object.keys(fundAnswers).length === FUNDAMENTAL_QUESTIONS.length },
    { id: 'limit', label: 'Work a limit order', points: 300, done: orderLog.some((order) => order.type === 'limit') },
    { id: 'partial', label: 'Experience a partial fill', points: 425, done: fills.some((fill) => fill.partial) },
    { id: 'stop', label: 'Protect risk with a stop', points: 375, done: orderLog.some((order) => order.type === 'stop') },
    { id: 'chart', label: 'Mark a chart level', points: 225, done: usedDrawingTool },
    { id: 'option', label: 'Trade an option', points: 500, done: optionTrades.length > 0 },
    { id: 'settle', label: 'Reach settlement', points: 600, done: finished },
  ]
  const missionXp = missions.filter((mission) => mission.done).reduce((sum, mission) => sum + mission.points, 0)
  const skillXp = correctBriefReads * 90 + correctFundReads * 120 + (thesis === 'bullish' && briefLocked ? 180 : 0)
  const xp = missionXp + skillXp
  const rank = xp >= 2900 ? 'Senior Trader' : xp >= 1900 ? 'Trader' : xp >= 900 ? 'Junior Trader' : 'Analyst'
  const pnl = equity - STARTING_CASH
  const score = Math.max(0, Math.round(1800 + xp + pnl / 4 - risk.maxDrawdown / 15))
  const executionRate = orderLog.length ? Math.round((fills.length / orderLog.length) * 100) : 0

  useEffect(() => { localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard)) }, [leaderboard])

  const updateRisk = useCallback((nextEquity, nextMargin) => {
    setRisk((current) => {
      const peak = Math.max(current.peak, nextEquity)
      return { peak, maxDrawdown: Math.max(current.maxDrawdown, peak - nextEquity), maxMargin: Math.max(current.maxMargin, nextMargin) }
    })
  }, [])

  const advanceOneStep = useCallback(() => {
    if (step >= SESSION_STEPS - 1) return
    const nextStep = step + 1
    const nextBar = bars[LOOKBACK_BARS + nextStep]
    const nextBook = buildOrderBook(nextBar, difficulty, scenarioSeed, nextStep)
    const processed = processWorkingOrders({ orders: workingOrders, account, bar: nextBar, book: nextBook, seed: scenarioSeed, step: nextStep })
    const nextChain = buildOptionsChain(nextBar.close, nextStep)
    const nextEquity = processed.account.cash + futuresUnrealized(processed.account.position, nextBar.close) + optionMarketValue(optionPositions, nextChain)
    setAccount(processed.account)
    setWorkingOrders(processed.workingOrders)
    if (processed.updates.length) setOrderLog((current) => mergeOrderUpdates(current, processed.updates))
    if (processed.fills.length) setFills((current) => [...processed.fills.reverse(), ...current])
    setStep(nextStep)
    updateRisk(nextEquity, Math.abs(processed.account.position.quantity) * MARGIN_PER_CONTRACT)
    const event = nextBar.event
    if (processed.fills.length) {
      const totalFilled = processed.fills.reduce((sum, fill) => sum + fill.quantity, 0)
      setNotice(`${totalFilled} contract${totalFilled === 1 ? '' : 's'} filled as the tape advanced to ${nextBar.time}.`)
      setBlotterTab('fills')
    } else if (event?.major) setNotice(`${event.category}: ${event.headline}`)
    if (nextStep === SESSION_STEPS - 1) setAutoPlay(false)
  }, [account, bars, difficulty, optionPositions, scenarioSeed, step, updateRisk, workingOrders])

  useEffect(() => {
    if (!autoPlay || finished) return undefined
    const timer = window.setTimeout(advanceOneStep, 1100)
    return () => window.clearTimeout(timer)
  }, [advanceOneStep, autoPlay, finished])

  function executeMarketOrder(side, requestedQuantity, reduceOnly = false, attachBracket = false) {
    let quantity = clamp(requestedQuantity, 1, 25)
    if (reduceOnly) {
      const closable = side === 'sell' ? Math.max(0, account.position.quantity) : Math.max(0, -account.position.quantity)
      quantity = Math.min(quantity, closable)
    }
    if (!quantity) { setNotice('Reduce-only order canceled because there is no matching position to close.'); return }
    const sweep = walkOrderBook(side, quantity, book, 4)
    if (!sweep.filledQuantity) { setNotice('No displayed liquidity was available for the market order.'); return }
    const execution = applyFuturesFill(account, side, sweep.filledQuantity, sweep.averagePrice)
    const projectedEquity = execution.account.cash + futuresUnrealized(execution.account.position, currentBar.close) + optionMarketValue(optionPositions, optionsChain)
    const projectedMargin = Math.abs(execution.account.position.quantity) * MARGIN_PER_CONTRACT
    if (projectedEquity - projectedMargin < 0) { setNotice('Order rejected: projected margin exceeds available equity.'); return }

    const id = `ord-${Date.now()}-${orderLog.length}`
    const partial = sweep.remaining > 0
    const marketOrder = { id, sequence: orderLog.length, instrument: 'NGV6', side, type: 'market', quantity, remaining: 0, filledQuantity: sweep.filledQuantity, averageFillPrice: sweep.averagePrice, createdAt: currentBar.time, status: partial ? `Partially filled ${sweep.filledQuantity}/${quantity}; balance canceled` : 'Filled', timeInForce: 'IOC', reduceOnly }
    const fill = { id: `fill-${id}`, orderId: id, time: currentBar.time, side, quantity: sweep.filledQuantity, price: sweep.averagePrice, liquidity: 'Taker', realized: execution.realized, fee: execution.fee, partial }
    const attachedOrders = []
    if (attachBracket && sweep.filledQuantity > 0) {
      const group = `oco-${id}`
      const stopOffset = Math.max(0.005, Number(ticket.stopOffset) || 0.035)
      const targetOffset = Math.max(0.005, Number(ticket.targetOffset) || 0.06)
      const exitSide = side === 'buy' ? 'sell' : 'buy'
      const direction = side === 'buy' ? 1 : -1
      attachedOrders.push(
        { id: `${id}-stop`, sequence: orderLog.length + 1, instrument: 'NGV6', side: exitSide, type: 'stop', quantity: sweep.filledQuantity, remaining: sweep.filledQuantity, filledQuantity: 0, averageFillPrice: 0, stopPrice: roundPrice(sweep.averagePrice - direction * stopOffset), createdAt: currentBar.time, status: 'Working', timeInForce: 'GTC', reduceOnly: true, ocoGroup: group },
        { id: `${id}-target`, sequence: orderLog.length + 2, instrument: 'NGV6', side: exitSide, type: 'limit', quantity: sweep.filledQuantity, remaining: sweep.filledQuantity, filledQuantity: 0, averageFillPrice: 0, limitPrice: roundPrice(sweep.averagePrice + direction * targetOffset), createdAt: currentBar.time, status: 'Working', timeInForce: 'GTC', reduceOnly: true, ocoGroup: group },
      )
    }
    setAccount(execution.account)
    setOrderLog((current) => [marketOrder, ...attachedOrders, ...current])
    setWorkingOrders((current) => [...current, ...attachedOrders])
    setFills((current) => [fill, ...current])
    setBlotterTab(partial ? 'fills' : 'positions')
    updateRisk(projectedEquity, projectedMargin)
    setNotice(`${side === 'buy' ? 'Bought' : 'Sold'} ${sweep.filledQuantity}${partial ? ` of ${quantity}` : ''} at ${formatPrice(sweep.averagePrice)}${attachBracket ? ' with OCO protection' : ''}.`)
  }

  function submitFuturesOrder() {
    let quantity = clamp(Number(ticket.quantity) || 1, 1, 25)
    if (ticket.type === 'market') { executeMarketOrder(ticket.side, quantity, ticket.reduceOnly, ticket.bracket); return }
    const limitPrice = ticket.type === 'limit' || ticket.type === 'stop-limit' ? roundPrice(Number(ticket.limitPrice)) : null
    const stopPrice = ticket.type === 'stop' || ticket.type === 'stop-limit' ? roundPrice(Number(ticket.stopPrice)) : null
    if ((ticket.type === 'limit' || ticket.type === 'stop-limit') && (!ticket.limitPrice || !Number.isFinite(limitPrice) || limitPrice <= 0)) { setNotice('Enter a valid limit price.'); return }
    if ((ticket.type === 'stop' || ticket.type === 'stop-limit') && (!ticket.stopPrice || !Number.isFinite(stopPrice) || stopPrice <= 0)) { setNotice('Enter a valid stop price.'); return }
    if (ticket.reduceOnly) {
      const closable = ticket.side === 'sell' ? Math.max(0, account.position.quantity) : Math.max(0, -account.position.quantity)
      quantity = Math.min(quantity, closable)
      if (!quantity) { setNotice('Reduce-only order canceled because there is no matching position to close.'); return }
    }
    if ((ticket.type === 'stop' || ticket.type === 'stop-limit') && ((ticket.side === 'buy' && stopPrice <= book.bestAsk) || (ticket.side === 'sell' && stopPrice >= book.bestBid))) {
      setNotice(`A ${ticket.side} stop must be beyond the current ${ticket.side === 'buy' ? 'ask' : 'bid'}.`)
      return
    }
    if (!ticket.reduceOnly && availableFunds < quantity * MARGIN_PER_CONTRACT) { setNotice('Order rejected: working-order margin would exceed available funds.'); return }
    const id = `ord-${Date.now()}-${orderLog.length}`
    let order = { id, sequence: orderLog.length, instrument: 'NGV6', side: ticket.side, type: ticket.type, quantity, remaining: quantity, filledQuantity: 0, averageFillPrice: 0, limitPrice, stopPrice, createdAt: currentBar.time, status: 'Working', timeInForce: ticket.timeInForce, reduceOnly: ticket.reduceOnly, triggered: false }
    const isMarketableLimit = ticket.type === 'limit' && (ticket.side === 'buy' ? limitPrice >= book.bestAsk : limitPrice <= book.bestBid)

    if (isMarketableLimit) {
      const eligibleLevels = (ticket.side === 'buy' ? book.asks : book.bids).filter((level) => ticket.side === 'buy' ? level.price <= limitPrice : level.price >= limitPrice)
      const sweep = walkOrderBook(ticket.side, quantity, book, eligibleLevels.length)
      if (sweep.filledQuantity) {
        const execution = applyFuturesFill(account, ticket.side, sweep.filledQuantity, sweep.averagePrice)
        const remaining = quantity - sweep.filledQuantity
        order = { ...order, remaining, filledQuantity: sweep.filledQuantity, averageFillPrice: sweep.averagePrice, status: remaining ? `Partially filled ${sweep.filledQuantity}/${quantity}` : 'Filled' }
        const fill = { id: `fill-${id}`, orderId: id, time: currentBar.time, side: ticket.side, quantity: sweep.filledQuantity, price: sweep.averagePrice, liquidity: 'Taker', realized: execution.realized, fee: execution.fee, partial: remaining > 0 }
        const projectedEquity = execution.account.cash + futuresUnrealized(execution.account.position, currentBar.close) + optionsValue
        setAccount(execution.account)
        if (remaining) setWorkingOrders((current) => [...current, order])
        setOrderLog((current) => [order, ...current])
        setFills((current) => [fill, ...current])
        setBlotterTab('fills')
        updateRisk(projectedEquity, Math.abs(execution.account.position.quantity) * MARGIN_PER_CONTRACT)
        setNotice(`Limit order filled ${sweep.filledQuantity}${remaining ? ` of ${quantity}; ${remaining} remain at ${formatPrice(limitPrice)}` : ''}.`)
        return
      }
    }

    setWorkingOrders((current) => [...current, order])
    setOrderLog((current) => [order, ...current])
    setBlotterTab('working')
    setNotice(`${ticket.type.replace('-', ' ')} ${ticket.side} order is working for ${quantity} contract${quantity === 1 ? '' : 's'}.`)
  }

  function closeFuturesPosition() {
    if (!account.position.quantity) return
    executeMarketOrder(account.position.quantity > 0 ? 'sell' : 'buy', Math.abs(account.position.quantity), true, false)
  }

  function cancelOrder(id) {
    const target = workingOrders.find((order) => order.id === id)
    setWorkingOrders((current) => current.filter((order) => order.id !== id))
    setOrderLog((current) => current.map((order) => order.id === id ? { ...order, status: 'Canceled', canceledAt: currentBar.time } : order))
    setNotice(`${target?.type ?? 'Order'} canceled at ${currentBar.time}.`)
  }

  function prepareDomOrder(side, price) {
    setTicket((current) => ({ ...current, side, type: 'limit', limitPrice: price.toFixed(3), reduceOnly: false }))
    setNotice(`${side === 'buy' ? 'Buy' : 'Sell'} limit staged at ${formatPrice(price)}. Review the ticket to send it.`)
  }

  function buyOption(type, row, quantity) {
    const premium = row[type].ask
    const cost = premium * CONTRACT_SIZE * quantity
    const fee = OPTION_COMMISSION * quantity
    if (availableFunds < cost + fee) { setNotice('Option order rejected: premium exceeds available funds.'); return }
    const key = `${type}-${row.strike.toFixed(3)}`
    const existing = optionPositions.find((position) => position.key === key)
    const nextPositions = existing
      ? optionPositions.map((position) => position.key === key ? { ...position, averagePrice: roundPrice((position.averagePrice * position.quantity + premium * quantity) / (position.quantity + quantity)), quantity: position.quantity + quantity } : position)
      : [...optionPositions, { id: `opt-${Date.now()}`, key, type, strike: row.strike, quantity, averagePrice: premium }]
    setOptionPositions(nextPositions)
    setOptionTrades((current) => [{ id: `opt-trade-${Date.now()}`, type, strike: row.strike, quantity, price: premium, side: 'buy', time: currentBar.time }, ...current])
    const nextAccount = { ...account, cash: account.cash - cost - fee, fees: account.fees + fee }
    setAccount(nextAccount)
    updateRisk(nextAccount.cash + futuresPnl + optionMarketValue(nextPositions, optionsChain), marginUsed)
    setNotice(`Bought ${quantity} ${formatPrice(row.strike)} ${type} at ${premium.toFixed(3)} premium.`)
  }

  function closeOption(position, bid) {
    const proceeds = bid * CONTRACT_SIZE * position.quantity
    const fee = OPTION_COMMISSION * position.quantity
    const realized = (bid - position.averagePrice) * CONTRACT_SIZE * position.quantity
    setOptionPositions((current) => current.filter((item) => item.id !== position.id))
    setOptionTrades((current) => [{ id: `opt-trade-${Date.now()}`, type: position.type, strike: position.strike, quantity: position.quantity, price: bid, side: 'sell', time: currentBar.time }, ...current])
    setAccount((current) => ({ ...current, cash: current.cash + proceeds - fee, realizedPnl: current.realizedPnl + realized, fees: current.fees + fee }))
    setNotice(`Closed ${position.quantity} ${formatPrice(position.strike)} ${position.type} at ${bid.toFixed(3)}.`)
  }

  function commitBrief() {
    setBriefLocked(true)
    setNotice(thesis === 'bullish' ? 'Morning game plan graded: bullish bias matches the weighted signals.' : 'Morning game plan saved. The desk favored a bullish weighted read.')
  }

  function saveScore() {
    const entry = { name: handle.trim().slice(0, 18) || 'Rookie', score, pnl: Math.round(pnl), rank }
    setLeaderboard((current) => [entry, ...current].sort((a, b) => b.score - a.score).slice(0, 8))
    setNotice(`${entry.name} posted ${score.toLocaleString()} points to the local league.`)
  }

  function resetScenario(nextDifficulty = difficulty, nextSeed = scenarioSeed) {
    setDifficulty(nextDifficulty)
    setScenarioSeed(nextSeed)
    setStep(0)
    setActiveView('briefing')
    setAutoPlay(false)
    setAccount(INITIAL_ACCOUNT)
    setWorkingOrders([])
    setOrderLog([])
    setFills([])
    setOptionPositions([])
    setOptionTrades([])
    setOptionQuantity(1)
    setDrawings([])
    setUsedDrawingTool(false)
    setBriefResponses({})
    setThesis('')
    setBriefLocked(false)
    setFundAnswers({})
    setJournal('')
    setRisk({ peak: STARTING_CASH, maxDrawdown: 0, maxMargin: 0 })
    setTicket((current) => ({ ...current, type: 'market', quantity: 1, limitPrice: '', stopPrice: '', reduceOnly: false }))
    setNotice('New trading shift loaded. Start with the morning handoff.')
  }

  const stats = { score, pnl, xp, rank, maxDrawdown: risk.maxDrawdown, executionRate }

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <div className="brand-lockup"><div className="brand-mark"><Flame size={22} /></div><div><strong>Gas Trader Academy</strong><span>Henry Hub Desk Sim</span></div></div>
        <div className={`market-status ${finished ? 'settled' : ''}`}><i /> {finished ? 'SESSION SETTLED' : 'MARKET OPEN'} <span>{currentBar.time} CT</span></div>
        <div className="top-metrics"><Metric icon={Trophy} label="Score" value={score.toLocaleString()} tone="gold" /><Metric icon={Zap} label="XP" value={xp.toLocaleString()} tone="xp" /><Metric icon={Wallet} label="Equity" value={formatMoney(equity)} tone={pnl >= 0 ? 'positive' : 'negative'} /></div>
        <div className="session-controls"><button type="button" title="Load a new scenario" onClick={() => resetScenario(difficulty, `${scenarioSeed}-next`)}><RefreshCw size={17} /></button><button type="button" className={autoPlay ? 'active' : ''} title={autoPlay ? 'Pause market' : 'Run market'} onClick={() => setAutoPlay((current) => !current)} disabled={finished}>{autoPlay ? <Pause size={17} /> : <Play size={17} />}</button><button type="button" className="next-tick" onClick={advanceOneStep} disabled={finished}>Next 15m <ChevronRight size={16} /></button></div>
      </header>
      <div className="app-body">
        <aside className="app-sidebar">
          <nav aria-label="Trader day views">{NAV_ITEMS.map(({ id, label, icon: Icon }) => <button key={id} type="button" className={activeView === id ? 'active' : ''} title={label} onClick={() => setActiveView(id)}><Icon size={19} /><span>{label}</span></button>)}</nav>
          <div className="sidebar-rank"><span>Desk rank</span><strong>{rank}</strong><div><i style={{ width: `${Math.min(100, (xp / 2900) * 100)}%` }} /></div><small>{Math.max(0, 2900 - xp)} XP to Senior</small></div>
          <QuestList missions={missions} />
          <div className="training-note"><GraduationCap size={17} /><span>Educational simulation. No live orders or market data.</span></div>
        </aside>
        <main className="main-stage">
          <div className="stage-toolbar"><SessionTimeline step={step} /><div className="difficulty-control"><Gauge size={16} /><select aria-label="Difficulty" value={difficulty} onChange={(event) => resetScenario(event.target.value, todaySeed)}>{Object.entries(DIFFICULTIES).map(([id, item]) => <option key={id} value={id}>{item.label}</option>)}</select></div></div>
          <div className="notice-bar" role="status"><Activity size={16} /><span>{notice}</span><button type="button" title="Dismiss message" onClick={() => setNotice('Desk systems normal.')}><X size={14} /></button></div>
          {activeView === 'briefing' && <MorningBrief responses={briefResponses} setResponses={setBriefResponses} thesis={thesis} setThesis={setThesis} locked={briefLocked} onCommit={commitBrief} onOpenDesk={() => setActiveView('trade')} />}
          {activeView === 'trade' && <TradeDesk currentBar={currentBar} previousBar={previousBar} visibleBars={visibleBars} book={book} account={account} equity={equity} availableFunds={availableFunds} workingOrders={workingOrders} orderLog={orderLog} fills={fills} ticket={ticket} setTicket={setTicket} drawings={drawings} setDrawings={setDrawings} onDrawingCreated={() => setUsedDrawingTool(true)} onSubmit={submitFuturesOrder} onClosePosition={closeFuturesPosition} onPriceOrder={prepareDomOrder} onCancel={cancelOrder} blotterTab={blotterTab} setBlotterTab={setBlotterTab} />}
          {activeView === 'fundamentals' && <Fundamentals currentPrice={currentBar.close} answers={fundAnswers} setAnswers={setFundAnswers} />}
          {activeView === 'options' && <OptionsLab chain={optionsChain} futuresPrice={currentBar.close} positions={{ items: optionPositions, orderQuantity: optionQuantity, setOrderQuantity: setOptionQuantity }} onBuy={buyOption} onClose={closeOption} />}
          {activeView === 'debrief' && <Debrief stats={stats} missions={missions} journal={journal} setJournal={setJournal} leaderboard={leaderboard} handle={handle} setHandle={setHandle} onSave={saveScore} onReset={() => setLeaderboard(DEFAULT_LEADERS)} finished={finished} onTrade={() => setActiveView('trade')} />}
        </main>
      </div>
    </div>
  )
}

export default App
