import { useMemo, useState } from 'react'
import { ArrowRight, BookOpen, Check, Clock, Factory, Flame, Home, Play, RotateCcw, Ship, Warehouse } from 'lucide-react'
import LessonVisual from './LessonVisual.jsx'
import TradingChart from './TradingChart.jsx'
import { black76, buildSession } from './simulator.js'
import { TRAINING_ASKS, walkTrainingBook } from './trainingVisuals.js'
import { reduceOnlyExample, replayOrder } from './courseModels.js'

const dollars = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
const price = (value) => `$${value.toFixed(3)}`

function Board({ title, children, result }) {
  return <section className="course-board" aria-label={title}><header><span>Practice bench</span><h4>{title}</h4><small>Simulated example</small></header><div className="course-board-body">{children}</div>{result && <output className="course-result">{result}</output>}</section>
}

function Range({ label, value, setValue, min, max, step = 1, format = (number) => number }) {
  return <label className="course-range"><span>{label}<strong>{format(value)}</strong></span><input aria-label={label} type="range" min={min} max={max} step={step} value={value} onChange={(event) => setValue(Number(event.target.value))} onInput={(event) => setValue(Number(event.target.value))} /><div><small>{format(min)}</small><small>{format(max)}</small></div></label>
}

function Modes({ label, options, value, setValue }) {
  return <div className="course-modes" role="group" aria-label={label}>{options.map(([id, text]) => <button key={id} type="button" aria-pressed={value === id} onClick={() => setValue(id)}>{text}</button>)}</div>
}

const DIAGRAMS = {
  'contract-map': {
    title: 'Read the contract', items: [
      ['NG', 'Product', 'NG is the exchange code for standard Henry Hub natural gas futures. Other gas products can use different sizes and codes.', Flame],
      ['V6', 'Delivery month', 'V means October. Here 6 means 2026. The month belongs to the contract; it is not the time shown on an intraday chart.', Clock],
      ['10,000', 'Energy quantity', 'One contract represents 10,000 MMBtu. MMBtu measures heat energy. Buying two contracts doubles this represented quantity.', Warehouse],
      ['$3.100', 'Price per MMBtu', 'The quote is dollars for one MMBtu. $3.100 x 10,000 = $31,000 of represented gas value for one contract.', BookOpen],
    ],
  },
  'order-ticket': {
    title: 'Follow one order', items: [
      ['1', 'Submit buy 3', 'You requested three contracts. Before any execution, you are still flat: there is no open position.', Play],
      ['2', 'Two contracts fill', 'Two bought contracts create a long position of two. The unfilled one is still working and may fill later.', Check],
      ['3', 'Cancel the remainder', 'The remaining buy request is removed. Your long position of two stays open. Selling two contracts would close it.', RotateCcw],
    ],
  },
  'gas-flow': {
    title: 'Sources and uses of gas', items: [
      ['IN', 'Production', 'Producers supply gas from wells. More output adds supply, with other conditions unchanged.', Factory],
      ['IN / OUT', 'Storage', 'Withdrawals release stored gas to the market. Injections take current gas out of the market and hold it for later.', Warehouse],
      ['OUT', 'Heating and power', 'Homes need heat and power stations need fuel. Weather can change both uses, sometimes in different regions at the same time.', Home],
      ['OUT', 'LNG exports', 'Export plants take pipeline gas, cool it into liquid, and load ships. More plant feedgas means more demand for domestic gas.', Ship],
    ],
  },
  'day-route': {
    title: 'One day at the desk', items: [
      ['01', 'Morning news', '06:00 Wire: review weather, production, and exports. Separate a fact from your interpretation of its price effect.', BookOpen],
      ['02', 'Build a view', 'Field Desk: compare the physical balance, storage expectations, and delivery-month curve.', Factory],
      ['03', 'Plan and execute', 'Trade Floor: inspect chart levels, spread, and depth. Choose quantity and exits, submit, then read the actual fills.', Play],
      ['04', 'Manage the position', 'Track both Positions and Working. Reassess your view when new information arrives. An order waiting to exit is not a completed exit.', Clock],
      ['05', 'Review the day', 'Closeout: review P&L, drawdown, and your journal. Write one specific decision to repeat and one to improve.', Check],
    ],
  },
}

function ConceptDiagram({ kind }) {
  const [selected, setSelected] = useState(0)
  const diagram = DIAGRAMS[kind]
  const [value, name, explanation, Icon] = diagram.items[selected]
  return <Board title={diagram.title} result={explanation}><div className={`concept-stations ${kind}`}>
    {diagram.items.map(([code, label, , ItemIcon], i) => <button key={label} type="button" aria-pressed={selected === i} onClick={() => setSelected(i)}><ItemIcon size={23} /><strong>{code}</strong><span>{label}</span></button>)}
  </div><div className="concept-focus"><Icon size={32} /><div><small>{name}</small><strong>{value}</strong></div><ArrowRight size={22} /><p>{kind === 'order-ticket' ? (selected === 0 ? 'Flat / 3 requested' : selected === 1 ? 'Long 2 / 1 working' : 'Long 2 / 0 working') : kind === 'gas-flow' ? 'Physical market balance' : kind === 'day-route' ? 'Observe, decide, then review' : 'One standard Henry Hub contract'}</p></div></Board>
}

function RiskBoard({ margin = false }) {
  const [quantity, setQuantity] = useState(1)
  const [ticks, setTicks] = useState(35)
  const risk = quantity * ticks * 10
  return <Board title={margin ? 'Collateral versus exposure' : 'Plan the price risk'} result={`${ticks} ticks x $10 x ${quantity} = ${dollars(risk)} ${margin ? 'loss for this price move' : 'planned risk'}, before fees and any worse exit.`}>
    <div className="course-two-controls"><Range label="Contracts" value={quantity} setValue={setQuantity} min={1} max={5} /><Range label={margin ? 'Adverse move in ticks' : 'Stop distance in ticks'} value={ticks} setValue={setTicks} min={5} max={150} /></div>
    {margin ? <div className="margin-comparison">{[['Represented gas value', quantity * 31000, 'exposure'], ['Reserved training margin', quantity * 4200, 'margin'], ['Loss from this move', risk, 'loss']].map(([label, amount, tone]) => <div key={label}><span>{label}</span><strong>{dollars(amount)}</strong><i className={tone} style={{ width: `${Math.max(2, amount / (quantity * 31000) * 100)}%` }} /></div>)}</div> : <div className="risk-price-map"><div><small>Long entry</small><strong>$3.100</strong></div><ArrowRight /><div><small>Planned losing exit</small><strong>{price(3.1 - ticks * .001)}</strong></div><div className="risk-dollar"><small>Planned price risk</small><strong>{dollars(risk)}</strong></div></div>}
  </Board>
}

function SpreadBoard() {
  const [spread, setSpread] = useState(3)
  const [quantity, setQuantity] = useState(1)
  return <Board title="Cross the spread" result={`Buy ${quantity} at ${price(3.1 + spread * .001)}, then sell at $3.100: ${dollars(-spread * quantity * 10)} before fees, assuming unchanged quotes and enough quantity.`}>
    <div className="course-two-controls"><Range label="Spread in ticks" value={spread} setValue={setSpread} min={1} max={8} /><Range label="Contracts" value={quantity} setValue={setQuantity} min={1} max={5} /></div>
    <div className="spread-diagram"><div className="bid"><small>Sell into the bid</small><strong>$3.100</strong></div><div><ArrowRight /><strong>{spread} ticks</strong><small>{dollars(spread * 10)} per contract</small></div><div className="ask"><small>Buy from the ask</small><strong>{price(3.1 + spread * .001)}</strong></div></div>
  </Board>
}

function CandleBoard() {
  const [selected, setSelected] = useState('open')
  const [direction, setDirection] = useState('up')
  const values = { open: direction === 'up' ? 3.102 : 3.109, high: 3.118, low: 3.095, close: direction === 'up' ? 3.109 : 3.102 }
  const y = (value) => 30 + (3.12 - value) / .027 * 170
  const descriptions = { open: 'The first trade in this time period.', high: 'The highest trade in this time period.', low: 'The lowest trade in this time period.', close: 'The last trade in this time period.' }
  return <Board title="Explore one candle" result={`${selected.toUpperCase()} ${price(values[selected])}: ${descriptions[selected]}`}>
    <Modes label="Candle direction" options={[[ 'up', 'Rising candle' ], ['down', 'Falling candle']]} value={direction} setValue={setDirection} />
    <div className="candle-detail-layout"><svg viewBox="0 0 380 235" role="img" aria-label={`${direction === 'up' ? 'Rising' : 'Falling'} candle, ${selected} highlighted`}><rect width="380" height="235" fill="#102f2b" />{Object.entries(values).map(([name, value]) => <g key={name}><line x1="50" x2="340" y1={y(value)} y2={y(value)} stroke={name === selected ? '#f4d64d' : '#49675b'} strokeDasharray="5 4" /><text x="12" y={y(value) - 5} fill={name === selected ? '#f4d64d' : '#bed1c5'} fontSize="13">{name.toUpperCase()} {value.toFixed(3)}</text></g>)}<line x1="242" x2="242" y1={y(values.high)} y2={y(values.low)} stroke="#f9f8e9" strokeWidth="3" /><rect x="218" width="48" y={y(Math.max(values.open, values.close))} height={Math.abs(y(values.open) - y(values.close))} fill={direction === 'up' ? '#6fce93' : '#ef917b'} /></svg><Modes label="Candle price" options={Object.keys(values).map((key) => [key, `${key[0].toUpperCase() + key.slice(1)} ${price(values[key])}`])} value={selected} setValue={setSelected} /></div>
  </Board>
}

function VolumeBoard() {
  const [busy, setBusy] = useState('quiet')
  const volume = busy === 'quiet' ? 100 : 900
  return <Board title="Same move, different participation" result={`${volume} contracts traded in the final period. The +$0.010 price move is unchanged. Volume alone does not predict direction.`}>
    <Modes label="Trading conditions" value={busy} setValue={setBusy} options={[[ 'quiet', 'Quiet trading' ], ['busy', 'Report release']]} />
    <div className="volume-demo" role="img" aria-label={`Last period volume ${volume} contracts, price change positive 0.010`}>{[170, 220, 140, 190, volume].map((amount, i) => <div key={i}><span>{amount}</span><i style={{ height: `${amount / 900 * 150}px` }} /><small>{i === 4 ? 'Latest +$0.010' : `Period ${i + 1}`}</small></div>)}</div>
  </Board>
}

const ROUTE_NAMES = { market: 'Buy 1 / Market', limit: 'Buy 1 / Limit $3.100', stop: 'Long 1 / Sell stop $3.065', 'stop-limit': 'Long 1 / Sell stop $3.065 / Limit $3.060' }
function OrderReplay({ type }) {
  const [index, setIndex] = useState(0)
  const result = replayOrder(type, index)
  const protective = type.startsWith('stop')
  return <Board title={ROUTE_NAMES[type]} result={result.fillPrice !== null ? `Filled at ${price(result.fillPrice)} during quote ${result.fillIndex + 1}. ${protective ? 'The one-contract long is now closed.' : 'The account now has a one-contract long.'}` : result.triggered ? 'The stop activated, but the bid is below the sell limit. The long position remains open.' : protective ? 'The trigger has not been reached. The long position is still open.' : 'The ask is above the buy limit. No position has opened.'}>
    <div className="replay-quotes">{result.quotes.map((quote, i) => <div key={i} className={`${index === i ? 'current' : ''} ${i > index ? 'future' : ''}`}><span>Quote {i + 1}</span><strong>{i <= index ? price(quote.last) : '?'}</strong><small>{i === 2 && protective ? 'Price gap' : 'Last trade'}</small></div>)}</div>
    <div className="replay-current"><span>Current bid <b>{price(result.quote.bid)}</b></span><span>Current ask <b>{price(result.quote.ask)}</b></span><strong>{result.status}</strong></div>
    <div className="replay-actions"><button type="button" aria-label="Restart example" title="Restart example" onClick={() => setIndex(0)}><RotateCcw size={18} /></button><button type="button" disabled={index === 3} onClick={() => setIndex((value) => value + 1)}><Play size={16} />{index === 3 ? 'Replay complete' : 'Next quote'}</button></div>
  </Board>
}

function BracketBoard() {
  const [move, setMove] = useState('waiting')
  return <Board title="One position, two linked exits" result={move === 'waiting' ? 'The long position is open. Both exits are working.' : `The ${move} exit filled in this example. The other exit is canceled; the position is flat.`}>
    <Modes label="Bracket outcome" value={move} setValue={setMove} options={[[ 'waiting', 'No exit yet' ], ['target', 'Rise to target'], ['stop', 'Fall to stop']]} />
    <div className="bracket-ladder">{[['Target sell limit', '3.160', 'target'], ['Long entry', '3.100', 'entry'], ['Protective sell stop', '3.065', 'stop']].map(([label, value, id]) => <div key={id} className={id}><span>{label}</span><strong>${value}</strong><small>{id === 'entry' ? (move === 'waiting' ? 'Long 1' : 'Flat') : move === 'waiting' ? 'Working' : move === id ? 'Filled' : 'Canceled'}</small></div>)}</div>
  </Board>
}

function ControlsBoard() {
  const [quantity, setQuantity] = useState(3)
  const [reduce, setReduce] = useState(true)
  const [tif, setTif] = useState('DAY')
  const result = reduceOnlyExample(quantity, reduce)
  return <Board title="Close without reversing" result={`${result.executed} contract${result.executed === 1 ? '' : 's'} sold. Result: ${result.position === 0 ? 'flat' : `short ${Math.abs(result.position)}`}. ${tif === 'DAY' ? 'Unfilled DAY orders expire at training settlement.' : 'GTC orders can remain working until canceled or the scenario is reset.'}`}>
    <p className="board-context">Starting position: <strong>Long 1 contract</strong></p><Range label="Requested sell quantity" value={quantity} setValue={setQuantity} min={1} max={5} />
    <div className="course-two-controls"><label className="course-checkbox"><input type="checkbox" checked={reduce} onChange={(event) => setReduce(event.target.checked)} />Reduce only</label><Modes label="Order duration" options={[[ 'DAY', 'DAY' ], ['GTC', 'GTC']]} value={tif} setValue={setTif} /></div>
    <div className="position-equation"><span>Long 1</span><span>-</span><span>Sell {result.executed}</span><span>=</span><strong>{result.position === 0 ? 'Flat' : `Short ${Math.abs(result.position)}`}</strong></div>
  </Board>
}

function DepthBoard({ limit = false }) {
  const [level, setLevel] = useState(0)
  const eligible = TRAINING_ASKS.slice(0, level + 1)
  const result = walkTrainingBook(10, eligible)
  return <Board title={limit ? 'Which sellers can a buy limit use?' : 'Size and cumulative depth'} result={limit ? `Buy 10 at limit ${price(TRAINING_ASKS[level].price)}: ${result.filled} can fill, ${result.remaining} remain working in this fixed book.` : `${TRAINING_ASKS[level].size} at this row; ${eligible.reduce((sum, item) => sum + item.size, 0)} offered in total from the best ask through this row.`}>
    <div className="course-depth-table"><div className="depth-heading"><span>Ask price</span><span>Size</span><span>Cumulative</span></div>{TRAINING_ASKS.map((row, i) => <button key={row.price} type="button" aria-pressed={level === i} onClick={() => setLevel(i)} className={i <= level ? 'eligible' : ''}><span>{price(row.price)} {i === 0 && <small>Best ask</small>}</span><strong>{row.size}</strong><span>{TRAINING_ASKS.slice(0, i + 1).reduce((sum, item) => sum + item.size, 0)}</span><i style={{ width: `${(i + 1) * 25}%` }} /></button>)}</div>
  </Board>
}

function QueueBoard() {
  const [incoming, setIncoming] = useState(5)
  const yours = Math.min(2, Math.max(0, incoming - 6))
  return <Board title="A simple first-in-first-out queue" result={`${Math.min(6, incoming)} earlier contracts filled. ${yours} of your 2 filled; ${2 - yours} of yours still wait.`}>
    <Range label="Arriving sell contracts" value={incoming} setValue={setIncoming} min={0} max={8} /><div className="queue-tokens" aria-label="Six earlier contracts followed by your two">{Array.from({ length: 8 }, (_, i) => <div key={i} className={`${i >= 6 ? 'yours' : ''} ${i < incoming ? 'filled' : ''}`}><small>{i >= 6 ? 'Yours' : 'Earlier'}</small><strong>{i < incoming ? <Check size={20} /> : i + 1}</strong><span>{i < incoming ? 'Filled' : 'Waiting'}</span></div>)}</div>
  </Board>
}

const CHART_SETTINGS = {
  'chart-time': { indicators: {}, tool: 'cursor', result: '15m means fifteen minutes per candle. 1h groups four of those candles. Crosshair shows the selected candle values.' },
  'chart-averages': { indicators: { sma: true }, tool: 'cursor', result: 'SMA 7 averages seven closes. EMA 9 weights recent closes more heavily. Both use past observations.' },
  'chart-vwap': { indicators: { vwap: true }, tool: 'cursor', result: 'The VWAP line weights typical prices by volume across the available sample. Above or below describes location, not a guaranteed trade.' },
  'chart-bands': { indicators: { bands: true }, tool: 'cursor', result: 'BB 10,2 uses ten closing prices and two standard deviations. A wider band describes greater variation in those closes.' },
  'chart-draw': { indicators: {}, tool: 'horizontal', result: 'Horizontal price line needs one point. Trend line needs two points. Clear drawings removes your annotations.' },
  'chart-measure': { indicators: {}, tool: 'measure', result: 'Measure move needs two points. Dollars are for one contract, before fees and any worse execution.' },
}
function ChartPractice({ kind }) {
  const [drawings, setDrawings] = useState([])
  const [volatility, setVolatility] = useState('normal')
  const settings = CHART_SETTINGS[kind]
  const priceBounds = useMemo(() => {
    const sample = buildSession('desk', 'course-chart').slice(0, 40)
    return [Math.min(...sample.map((bar) => 3.1 + (bar.low - 3.1) * 2.5)), Math.max(...sample.map((bar) => 3.1 + (bar.high - 3.1) * 2.5))]
  }, [])
  const bars = useMemo(() => buildSession('desk', 'course-chart').slice(0, 40).map((bar) => {
    const factor = volatility === 'high' ? 2.5 : 1
    return { ...bar, ...Object.fromEntries(['open', 'high', 'low', 'close'].map((key) => [key, 3.1 + (bar[key] - 3.1) * factor])) }
  }), [volatility])
  return <Board title="Practice with the trading chart" result={`${settings.result}${drawings.length ? ` ${drawings.length} annotation${drawings.length === 1 ? '' : 's'} on this practice chart.` : ''}`}>
    {kind === 'chart-bands' && <Modes label="Price variation sample" value={volatility} setValue={setVolatility} options={[[ 'normal', 'Normal variation' ], ['high', 'Higher variation']]} />}
    <TradingChart bars={bars} position={{ quantity: 0, averagePrice: 0 }} workingOrders={[]} drawings={drawings} onDrawingsChange={setDrawings} initialTool={settings.tool} initialIndicators={settings.indicators} priceBounds={kind === 'chart-bands' ? priceBounds : undefined} fitContainer />
  </Board>
}

function StorageBoard() {
  const [actual, setActual] = useState(65)
  const surprise = actual - 80
  return <Board title="Expected versus reported injection" result={surprise < 0 ? `${-surprise} Bcf less added than expected. Relatively tighter supply than the expectation, all else equal.` : surprise > 0 ? `${surprise} Bcf more added than expected. Relatively looser supply than the expectation, all else equal.` : 'The reported addition matches the expectation. There is no numerical surprise in this example.'}>
    <Range label="Actual injection in Bcf" value={actual} setValue={setActual} min={40} max={120} />
    <div className="storage-comparison">{[['Expected', 80], ['Reported', actual]].map(([name, value]) => <div key={name}><span>{name}</span><i style={{ width: `${value / 120 * 100}%` }} /><strong>+{value} Bcf</strong></div>)}</div><p className="board-context">Both bars show gas being <strong>added</strong>. The comparison tells you whether the addition was larger or smaller than expected.</p>
  </Board>
}

const CURVES = { rising: [3.1, 3.2, 3.3, 3.4], falling: [3.4, 3.3, 3.2, 3.1], seasonal: [3.1, 3.3, 3.55, 3.25] }
function CurveBoard() {
  const [shape, setShape] = useState('rising')
  const values = CURVES[shape]
  return <Board title="Today's prices for different months" result={shape === 'rising' ? 'Contango: later contracts cost more in this example. This is not a forecast path for October.' : shape === 'falling' ? 'Backwardation: earlier contracts cost more in this example.' : 'A seasonal curve can have a winter peak rather than rising or falling all the way across.'}>
    <Modes label="Curve shape" value={shape} setValue={setShape} options={[[ 'rising', 'Rising' ], ['falling', 'Falling'], ['seasonal', 'Winter peak']]} />
    <svg className="curve-example" viewBox="0 0 500 235" role="img" aria-label={`${shape} futures curve for October, November, January, and March`}><rect width="500" height="235" fill="#102f2b" /><text x="20" y="20" fill="#bcd6c9" fontSize="12">Price per MMBtu</text>{[3.1, 3.3, 3.5].map((p) => <g key={p}><text x="8" y={180 - (p - 3) * 240} fill="#bcd6c9" fontSize="12">{p.toFixed(2)}</text><line x1="65" x2="470" y1={175 - (p - 3) * 240} y2={175 - (p - 3) * 240} stroke="#3d6055" /></g>)}<polyline points={values.map((p, i) => `${85 + i * 120},${175 - (p - 3) * 240}`).join(' ')} fill="none" stroke="#f4d64d" strokeWidth="3" />{values.map((p, i) => <g key={i}><circle cx={85 + i * 120} cy={175 - (p - 3) * 240} r="5" fill="#f47b50" /><text x={85 + i * 120} y={160 - (p - 3) * 240} textAnchor="middle" fill="#f5f5df" fontSize="13">{p.toFixed(3)}</text><text x={85 + i * 120} y="205" textAnchor="middle" fill="#bcd6c9" fontSize="13">{['Oct', 'Nov', 'Jan', 'Mar'][i]}</text></g>)}</svg>
  </Board>
}

function OptionTimeBoard() {
  const [days, setDays] = useState(30)
  const [volatility, setVolatility] = useState(45)
  const call = black76(3.1, 3.1, days, volatility / 100, 'call').price
  return <Board title="Time and uncertainty have a price" result={`At fixed futures and strike of $3.100, this model values the call near ${dollars(call * 10000)}. Change one input at a time to compare its effect.`}>
    <div className="course-two-controls"><Range label="Days remaining" value={days} setValue={setDays} min={1} max={90} /><Range label="Annualized volatility percent" value={volatility} setValue={setVolatility} min={10} max={100} /></div>
    <div className="option-time-result"><Clock size={32} /><div><small>Long call premium / model estimate</small><strong>{dollars(call * 10000)}</strong><span>{price(call)} per MMBtu</span></div><div className="time-value-meter"><i style={{ height: `${Math.min(100, call * 250)}%` }} /></div></div><p className="board-context">Futures equals strike, so intrinsic value is zero here. The modeled premium represents time value. The percentage input describes variation over a year, not a promised yearly return.</p>
  </Board>
}

export default function CourseVisual({ kind }) {
  if (DIAGRAMS[kind]) return <ConceptDiagram kind={kind} />
  if (kind === 'margin' || kind === 'risk') return <RiskBoard margin={kind === 'margin'} />
  if (kind === 'spread') return <SpreadBoard />
  if (kind === 'candle') return <CandleBoard />
  if (kind === 'volume') return <VolumeBoard />
  if (['order-market', 'order-limit', 'order-stop', 'order-stop-limit'].includes(kind)) return <OrderReplay type={kind.slice(6)} />
  if (kind === 'bracket') return <BracketBoard />
  if (kind === 'order-controls') return <ControlsBoard />
  if (kind === 'depth-map' || kind === 'limit-depth') return <DepthBoard limit={kind === 'limit-depth'} />
  if (kind === 'queue') return <QueueBoard />
  if (CHART_SETTINGS[kind]) return <ChartPractice kind={kind} />
  if (kind === 'storage') return <StorageBoard />
  if (kind === 'curve') return <CurveBoard />
  if (kind === 'option-time') return <OptionTimeBoard />
  return <LessonVisual lessonId={kind === 'option-payoff' ? 'fundamentals' : kind} initialMode={kind === 'option-payoff' ? 'options' : 'balance'} focused />
}
