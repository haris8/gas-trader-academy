import { useMemo, useState } from 'react'
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BarChart3,
  Calculator,
  Check,
  CircleDollarSign,
  CloudSun,
  Gauge,
  Minus,
  MousePointer2,
  PackageOpen,
  Ruler,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  Waves,
} from 'lucide-react'
import {
  TRAINING_ASKS,
  balanceBias,
  contractPnl,
  optionOutcome,
  walkTrainingBook,
} from './trainingVisuals.js'

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

const PLAIN_NOTES = {
  contract: 'A futures contract gives you price exposure. In this simulator, you are not arranging physical delivery of natural gas.',
  tape: 'Bid is the best advertised buyer, ask is the best advertised seller, and last is the most recent completed trade.',
  orders: 'No order type is perfect. Each one chooses between certainty of execution and certainty of price.',
  liquidity: 'The best quote covers only the first row. A larger order may need several prices to finish.',
  charts: 'A chart tool is useful only when it answers a question about location, trend, volatility, or risk.',
  fundamentals: 'Gas prices respond to changing expectations. A bullish fact can still produce a selloff if traders expected something stronger.',
}

function LabShell({ lessonId, title, prompt, status, children }) {
  return (
    <section className={`lesson-lab lesson-lab-${lessonId}`} aria-label={`${title} interactive exercise`}>
      <header className="lesson-lab-head">
        <div><span>HANDS-ON BOARD</span><h3>{title}</h3><p>{prompt}</p></div>
        <div className="lesson-lab-live"><Activity size={14} />LIVE</div>
      </header>
      <div className="lesson-lab-stage">{children}</div>
      <footer className="lesson-lab-footer">
        <MousePointer2 size={16} aria-hidden="true" />
        <p><b>In plain English:</b> {PLAIN_NOTES[lessonId]}</p>
        <strong>{status}</strong>
      </footer>
    </section>
  )
}

function ContractLab() {
  const [side, setSide] = useState('long')
  const [moveTicks, setMoveTicks] = useState(37)
  const [contracts, setContracts] = useState(2)
  const entry = 3.1
  const exit = entry + moveTicks * 0.001
  const pnl = contractPnl(moveTicks, contracts, side)
  const favorable = pnl >= 0

  return (
    <LabShell
      lessonId="contract"
      title="Tick Translator"
      prompt="Change the position and price move. Watch a small quote change become contract P&L."
      status={`${Math.abs(moveTicks)} ticks x $10 x ${contracts} contract${contracts === 1 ? '' : 's'}`}
    >
      <div className="lab-control-strip">
        <div className="lab-segment" aria-label="Position direction">
          <button type="button" className={side === 'long' ? 'active' : ''} onClick={() => setSide('long')}><ArrowUp size={15} />Long</button>
          <button type="button" className={side === 'short' ? 'active' : ''} onClick={() => setSide('short')}><ArrowDown size={15} />Short</button>
        </div>
        <label className="contract-stepper">
          <span>Contracts</span>
          <button type="button" aria-label="Decrease contracts" disabled={contracts === 1} onClick={() => setContracts((value) => Math.max(1, value - 1))}>-</button>
          <strong>{contracts}</strong>
          <button type="button" aria-label="Increase contracts" disabled={contracts === 5} onClick={() => setContracts((value) => Math.min(5, value + 1))}>+</button>
        </label>
      </div>

      <div className="contract-quote-visual">
        <div><span>Entry</span><strong>${entry.toFixed(3)}</strong></div>
        <div className={`price-move-arrow ${moveTicks >= 0 ? 'up' : 'down'}`}>
          {moveTicks >= 0 ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
          <strong>{moveTicks > 0 ? '+' : ''}{moveTicks} ticks</strong>
        </div>
        <div><span>Exit</span><strong>${exit.toFixed(3)}</strong></div>
        <div className={`contract-pnl ${favorable ? 'gain' : 'loss'}`}><span>P&L</span><strong>{pnl >= 0 ? '+' : '-'}{money.format(Math.abs(pnl))}</strong></div>
      </div>

      <label className="lab-slider">
        <span><b>Price move</b><em>Drag through a falling or rising market</em></span>
        <input type="range" min="-60" max="60" step="1" value={moveTicks} onChange={(event) => setMoveTicks(Number(event.target.value))} />
        <div><small>-60 ticks</small><small>Entry</small><small>+60 ticks</small></div>
      </label>
    </LabShell>
  )
}

function TapeLab() {
  const [action, setAction] = useState('buy')
  const bid = 3.108
  const ask = 3.111
  const last = 3.109
  const fillPrice = action === 'buy' ? ask : bid

  return (
    <LabShell
      lessonId="tape"
      title="Inside Market Reader"
      prompt="Choose an immediate action, then trace which advertised price your order reaches."
      status={`${((ask - bid) / 0.001).toFixed(0)}-tick spread = $${((ask - bid) * 10000).toFixed(0)} per contract`}
    >
      <div className="tape-lab-grid">
        <div className="candle-inspector" aria-label="Candlestick with open, high, low, and close labels">
          <div className="candle-scale"><span>H 3.118</span><span>C 3.109</span><span>O 3.102</span><span>L 3.095</span></div>
          <div className="training-candle"><i className="wick" /><i className="body" /></div>
          <div className="candle-caption"><BarChart3 size={16} /><span>15-minute candle</span><strong>Close above open</strong></div>
        </div>

        <div className="inside-market">
          <div className={`inside-quote bid ${action === 'sell' ? 'hit' : ''}`}><span>BID</span><strong>${bid.toFixed(3)}</strong><small>best buyer</small></div>
          <div className="inside-last"><span>LAST</span><strong>${last.toFixed(3)}</strong></div>
          <div className={`inside-quote ask ${action === 'buy' ? 'hit' : ''}`}><span>ASK</span><strong>${ask.toFixed(3)}</strong><small>best seller</small></div>
          <div className="tape-action-buttons">
            <button type="button" className={action === 'sell' ? 'active sell' : ''} onClick={() => setAction('sell')}><ArrowDown size={15} />Market sell</button>
            <button type="button" className={action === 'buy' ? 'active buy' : ''} onClick={() => setAction('buy')}><ArrowUp size={15} />Market buy</button>
          </div>
          <p className="market-readout"><MousePointer2 size={15} /><span>A market <b>{action}</b> prioritizes speed and reaches the <b>{action === 'buy' ? 'ask' : 'bid'}</b> near ${fillPrice.toFixed(3)}.</span></p>
        </div>
      </div>
    </LabShell>
  )
}

const ORDER_CONFIG = {
  market: { name: 'Market', marker: 'NOW', certainty: 'Execution first', tradeoff: 'Final price can slip', detail: 'The order immediately takes available prices from the book.' },
  limit: { name: 'Limit', marker: 'LIMIT', certainty: 'Worst price controlled', tradeoff: 'May never fill', detail: 'The order waits at your price unless it is already marketable.' },
  stop: { name: 'Stop Market', marker: 'STOP', certainty: 'Activates at trigger', tradeoff: 'Fill price can slip', detail: 'Once triggered, it becomes a market order.' },
  'stop-limit': { name: 'Stop Limit', marker: 'TRIGGER + LIMIT', certainty: 'Trigger and price controlled', tradeoff: 'Can miss the exit', detail: 'Once triggered, it becomes a limit order rather than a market order.' },
}

function OrdersLab() {
  const [type, setType] = useState('market')
  const [side, setSide] = useState('buy')
  const [tif, setTif] = useState('DAY')
  const [reduceOnly, setReduceOnly] = useState(false)
  const [bracket, setBracket] = useState(true)
  const config = ORDER_CONFIG[type]
  const markerSide = side === 'buy' ? 'lower' : 'upper'

  return (
    <LabShell
      lessonId="orders"
      title="Order Route Board"
      prompt="Change the order type and side. The route board shows what the instruction controls—and what it cannot promise."
      status={`${config.certainty} / ${config.tradeoff}`}
    >
      <div className="order-lab-controls">
        <div className="lab-segment compact" aria-label="Order side">
          <button type="button" className={side === 'buy' ? 'active' : ''} onClick={() => setSide('buy')}><ArrowUp size={14} />Buy</button>
          <button type="button" className={side === 'sell' ? 'active' : ''} onClick={() => setSide('sell')}><ArrowDown size={14} />Sell</button>
        </div>
        <div className="order-type-tabs" aria-label="Order type">
          {Object.entries(ORDER_CONFIG).map(([id, item]) => <button key={id} type="button" className={type === id ? 'active' : ''} onClick={() => setType(id)}>{item.name}</button>)}
        </div>
      </div>

      <div className="order-route-visual">
        <div className="route-book">
          <span className="route-price ask">3.114 ASK</span>
          <span className={`route-marker upper ${markerSide === 'upper' && type !== 'market' ? 'visible' : ''}`}>{config.marker}</span>
          <div className="route-market-line"><span>MARKET</span><strong>3.110</strong></div>
          <span className={`route-marker lower ${markerSide === 'lower' && type !== 'market' ? 'visible' : ''}`}>{config.marker}</span>
          <span className="route-price bid">3.106 BID</span>
        </div>
        <ArrowRight className="route-arrow" size={24} />
        <div className="route-result">
          <SlidersHorizontal size={22} />
          <span>{side.toUpperCase()} / {config.name.toUpperCase()}</span>
          <strong>{config.certainty}</strong>
          <p>{config.detail}</p>
          <small>{config.tradeoff}</small>
        </div>
      </div>

      <div className="order-safety-controls">
        <div className="lab-segment compact" aria-label="Time in force">
          {['DAY', 'GTC'].map((value) => <button key={value} type="button" className={tif === value ? 'active' : ''} onClick={() => setTif(value)}>{value}</button>)}
        </div>
        <label><input type="checkbox" checked={reduceOnly} onChange={(event) => setReduceOnly(event.target.checked)} /><span><ShieldCheck size={15} />Reduce only</span></label>
        <label><input type="checkbox" checked={bracket} onChange={(event) => setBracket(event.target.checked)} /><span><Target size={15} />OCO bracket</span></label>
        <p><b>{tif}</b> {tif === 'DAY' ? 'expires at settlement.' : 'stays working across sessions.'} {reduceOnly ? ' Reduce-only prevents a reversal.' : ''} {bracket ? ' The linked stop and target cancel each other.' : ''}</p>
      </div>
    </LabShell>
  )
}

function LiquidityLab() {
  const [quantity, setQuantity] = useState(10)
  const result = useMemo(() => walkTrainingBook(quantity), [quantity])
  const maxSize = Math.max(...TRAINING_ASKS.map((level) => level.size))

  return (
    <LabShell
      lessonId="liquidity"
      title="Walk the Book"
      prompt="Increase a market buy and watch it consume each ask level from the best price upward."
      status={result.remaining ? `${result.filled} filled / ${result.remaining} unfilled` : `${result.filled} filled / ${result.slippageTicks} ticks average slippage`}
    >
      <label className="liquidity-size-control">
        <span><PackageOpen size={17} /><b>Market buy size</b><strong>{quantity} contracts</strong></span>
        <input type="range" min="1" max="25" step="1" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
      </label>
      <div className="liquidity-presets" aria-label="Order-size examples">
        {[{ value: 4, label: 'Fit best ask' }, { value: 10, label: 'Walk the book' }, { value: 25, label: 'Exceed depth' }].map((preset) => (
          <button key={preset.value} type="button" className={quantity === preset.value ? 'active' : ''} onClick={() => setQuantity(preset.value)}>{preset.label}<strong>{preset.value}</strong></button>
        ))}
      </div>

      <div className="liquidity-board">
        <div className="training-dom" aria-label="Training ask depth">
          <div className="dom-head"><span>Ask price</span><span>Displayed</span><span>Your fill</span></div>
          {result.executions.map((level, index) => (
            <div key={level.price} className={`dom-row ${level.fill ? 'consumed' : ''}`}>
              <span>${level.price.toFixed(3)}{index === 0 && <small>BEST</small>}</span>
              <strong>{level.size}</strong>
              <span className="fill-meter"><i style={{ width: `${(level.fill / maxSize) * 100}%` }} /><b>{level.fill || '-'}</b></span>
            </div>
          ))}
        </div>
        <div className="fill-receipt">
          <span>SIMULATED FILL TICKET</span>
          <div><small>Requested</small><strong>{quantity}</strong></div>
          <div><small>Filled</small><strong>{result.filled}</strong></div>
          <div><small>Average</small><strong>${result.averagePrice.toFixed(5)}</strong></div>
          <div><small>Unfilled</small><strong className={result.remaining ? 'warning' : ''}>{result.remaining}</strong></div>
          <p>{result.remaining ? 'Displayed depth ran out. A real market order would continue searching for liquidity.' : result.slippageTicks ? 'The average is worse than the best ask because the order needed multiple rows.' : 'The whole order fit at the best ask, so there was no book slippage.'}</p>
        </div>
      </div>
    </LabShell>
  )
}

const CHART_BARS = [
  [3.086, 3.094, 3.081, 3.091], [3.091, 3.099, 3.088, 3.097], [3.097, 3.102, 3.09, 3.093],
  [3.093, 3.106, 3.091, 3.103], [3.103, 3.112, 3.1, 3.108], [3.108, 3.116, 3.104, 3.106],
  [3.106, 3.111, 3.098, 3.101], [3.101, 3.107, 3.096, 3.105], [3.105, 3.119, 3.103, 3.116],
  [3.116, 3.122, 3.11, 3.113], [3.113, 3.118, 3.106, 3.109], [3.109, 3.115, 3.104, 3.112],
]

const HOURLY_BARS = [0, 4, 8].map((start) => {
  const group = CHART_BARS.slice(start, start + 4)
  return [group[0][0], Math.max(...group.map((bar) => bar[1])), Math.min(...group.map((bar) => bar[2])), group.at(-1)[3]]
})

function chartY(price) {
  return 16 + ((3.125 - price) / 0.05) * 142
}

function ChartLab() {
  const [timeframe, setTimeframe] = useState('15m')
  const [tools, setTools] = useState({ vwap: true, bands: false, level: false, ruler: false })
  const activeNames = Object.entries(tools).filter(([, active]) => active).map(([name]) => name.toUpperCase())
  const chartBars = timeframe === '15m' ? CHART_BARS : HOURLY_BARS
  const vwapPoints = timeframe === '15m'
    ? '48,120 98,112 148,108 198,102 248,94 298,91 348,94 398,92 448,82 498,75 548,72 598,70'
    : '145,102 325,91 505,72'
  const upperBandPoints = timeframe === '15m'
    ? '48,45 98,40 148,48 198,43 248,35 298,39 348,48 398,40 448,26 498,22 548,30 598,28'
    : '145,43 325,39 505,24'
  const lowerBandPoints = timeframe === '15m'
    ? '48,145 98,139 148,147 198,139 248,129 298,133 348,144 398,137 448,121 498,115 548,123 598,118'
    : '145,143 325,136 505,119'

  function toggleTool(tool) {
    setTools((current) => ({ ...current, [tool]: !current[tool] }))
  }

  return (
    <LabShell
      lessonId="charts"
      title="Chart Overlay Bench"
      prompt="Toggle one tool at a time. Use the readout below the chart to connect each overlay with its job."
      status={activeNames.length ? `${activeNames.join(' + ')} active` : 'Price and volume only'}
    >
      <div className="chart-lab-toolbar">
        <div className="lab-segment compact" aria-label="Chart timeframe">
          {['15m', '1h'].map((value) => <button key={value} type="button" className={timeframe === value ? 'active' : ''} onClick={() => setTimeframe(value)}>{value}</button>)}
        </div>
        <div className="chart-tool-buttons" aria-label="Chart overlays">
          <button type="button" aria-pressed={tools.vwap} className={tools.vwap ? 'active' : ''} onClick={() => toggleTool('vwap')}><Waves size={15} />VWAP</button>
          <button type="button" aria-pressed={tools.bands} className={tools.bands ? 'active' : ''} onClick={() => toggleTool('bands')}><Activity size={15} />Bands</button>
          <button type="button" aria-pressed={tools.level} className={tools.level ? 'active' : ''} onClick={() => toggleTool('level')}><Minus size={15} />Level</button>
          <button type="button" aria-pressed={tools.ruler} className={tools.ruler ? 'active' : ''} onClick={() => toggleTool('ruler')}><Ruler size={15} />Ruler</button>
        </div>
      </div>

      <div className="training-chart-wrap">
        <svg className="training-chart" viewBox="0 0 640 220" role="img" aria-label="Interactive training candlestick chart">
          <rect width="640" height="220" fill="#071d1b" />
          {[36, 76, 116, 156].map((y) => <line key={y} x1="42" x2="624" y1={y} y2={y} stroke="#22423a" strokeWidth="1" />)}
          {[90, 180, 270, 360, 450, 540].map((x) => <line key={x} x1={x} x2={x} y1="12" y2="190" stroke="#17342e" strokeWidth="1" />)}
          {tools.bands && <><polyline points={upperBandPoints} fill="none" stroke="#6fa9bc" strokeWidth="2" /><polyline points={lowerBandPoints} fill="none" stroke="#6fa9bc" strokeWidth="2" /></>}
          {tools.vwap && <polyline points={vwapPoints} fill="none" stroke="#f4d64d" strokeWidth="3" />}
          {chartBars.map(([open, high, low, close], index) => {
            const x = timeframe === '15m' ? 50 + index * 50 : 145 + index * 180
            const candleWidth = timeframe === '15m' ? 14 : 30
            const up = close >= open
            return <g key={`${timeframe}-${x}`}><line x1={x} x2={x} y1={chartY(high)} y2={chartY(low)} stroke={up ? '#78d89a' : '#ef7258'} strokeWidth={timeframe === '15m' ? 2 : 3} /><rect x={x - candleWidth / 2} y={Math.min(chartY(open), chartY(close))} width={candleWidth} height={Math.max(3, Math.abs(chartY(open) - chartY(close)))} fill={up ? '#56bb79' : '#df604c'} /></g>
          })}
          {tools.level && <><line x1="42" x2="624" y1={chartY(3.1)} y2={chartY(3.1)} stroke="#f16a3a" strokeWidth="2" strokeDasharray="7 5" /><text x="545" y={chartY(3.1) - 5} fill="#f16a3a" fontSize="11">LEVEL 3.100</text></>}
          {tools.ruler && <><line x1="202" x2="448" y1={chartY(3.093)} y2={chartY(3.116)} stroke="#fff7ce" strokeWidth="2" strokeDasharray="4 4" /><circle cx="202" cy={chartY(3.093)} r="5" fill="#fff7ce" /><circle cx="448" cy={chartY(3.116)} r="5" fill="#fff7ce" /><text x="278" y="57" fill="#fff7ce" fontSize="12">23 TICKS / $230</text></>}
          <text x="48" y="207" fill="#789087" fontSize="10">{timeframe === '15m' ? '15-MINUTE DETAIL' : '1-HOUR AGGREGATION'}</text>
        </svg>
        <div className="chart-question-strip">
          <div><Target size={16} /><span><b>Level</b> marks structure.</span></div>
          <div><Waves size={16} /><span><b>VWAP</b> gives session location.</span></div>
          <div><Activity size={16} /><span><b>Bands</b> frame dispersion.</span></div>
          <div><Ruler size={16} /><span><b>Ruler</b> converts distance to risk.</span></div>
        </div>
      </div>
    </LabShell>
  )
}

const INITIAL_SIGNALS = [
  { id: 'weather', name: 'Hotter forecast', group: 'DEMAND', impact: 2, active: true },
  { id: 'production', name: 'Higher production', group: 'SUPPLY', impact: -2, active: true },
  { id: 'lng', name: 'More LNG feedgas', group: 'DEMAND', impact: 2, active: false },
  { id: 'storage', name: 'Large injection', group: 'SUPPLY', impact: -2, active: false },
]

function FundamentalsLab() {
  const [mode, setMode] = useState('balance')
  const [signals, setSignals] = useState(INITIAL_SIGNALS)
  const [optionType, setOptionType] = useState('call')
  const [settlement, setSettlement] = useState(3.18)
  const balance = balanceBias(signals)
  const option = optionOutcome(optionType, settlement)

  function toggleSignal(id) {
    setSignals((current) => current.map((signal) => signal.id === id ? { ...signal, active: !signal.active } : signal))
  }

  return (
    <LabShell
      lessonId="fundamentals"
      title="Balance and Risk Console"
      prompt="Build a physical-market view, then switch to Option Risk to see how premium changes the payoff."
      status={mode === 'balance' ? balance.label : `${optionType.toUpperCase()} break-even $${option.breakEven.toFixed(3)}`}
    >
      <div className="fundamental-mode-tabs lab-segment" aria-label="Fundamentals exercise mode">
        <button type="button" className={mode === 'balance' ? 'active' : ''} onClick={() => setMode('balance')}><Gauge size={15} />Balance board</button>
        <button type="button" className={mode === 'options' ? 'active' : ''} onClick={() => setMode('options')}><CircleDollarSign size={15} />Option risk</button>
      </div>

      {mode === 'balance' ? (
        <div className="balance-console">
          <div className="signal-switches">
            {signals.map((signal) => (
              <button key={signal.id} type="button" aria-pressed={signal.active} className={signal.active ? 'active' : ''} onClick={() => toggleSignal(signal.id)}>
                <span>{signal.group}</span><strong>{signal.name}</strong><small>{signal.active ? (signal.impact > 0 ? 'Supports price' : 'Weighs on price') : 'Not in scenario'}</small><i>{signal.active ? <Check size={14} /> : '+'}</i>
              </button>
            ))}
          </div>
          <div className="balance-gauge">
            <CloudSun size={25} />
            <span>NET PRESSURE</span>
            <strong>{balance.label}</strong>
            <div className="gauge-track"><i style={{ left: `${50 + Math.max(-4, Math.min(4, balance.score)) * 10}%` }} /></div>
            <div className="gauge-labels"><small>Bearish</small><small>Mixed</small><small>Bullish</small></div>
            <p>Click signals on or off. This is a framework for organizing evidence—not a guaranteed price forecast.</p>
          </div>
        </div>
      ) : (
        <div className="option-risk-console">
          <div className="option-risk-settings">
            <div className="lab-segment compact" aria-label="Long option type">
              <button type="button" className={optionType === 'call' ? 'active' : ''} onClick={() => setOptionType('call')}><ArrowUp size={14} />Long call</button>
              <button type="button" className={optionType === 'put' ? 'active' : ''} onClick={() => setOptionType('put')}><ArrowDown size={14} />Long put</button>
            </div>
            <dl><div><dt>Strike</dt><dd>$3.100</dd></div><div><dt>Premium paid</dt><dd>$1,200</dd></div><div><dt>Maximum loss</dt><dd>$1,200</dd></div></dl>
          </div>
          <label className="option-settlement-slider">
            <span><b>Futures price at expiration</b><strong>${settlement.toFixed(3)}</strong></span>
            <input type="range" min="2.8" max="3.4" step="0.01" value={settlement} onChange={(event) => setSettlement(Number(event.target.value))} />
            <div className="option-payoff-line"><i className="strike" /><i className="breakeven" style={{ left: `${((option.breakEven - 2.8) / 0.6) * 100}%` }} /><i className="settlement" style={{ left: `${((settlement - 2.8) / 0.6) * 100}%` }} /></div>
            <div className="option-line-labels"><small>$2.800</small><small>Strike</small><small>$3.400</small></div>
          </label>
          <div className={`option-outcome ${option.pnl >= 0 ? 'gain' : 'loss'}`}><Calculator size={20} /><span>Expiration P&L</span><strong>{option.pnl >= 0 ? '+' : '-'}{money.format(Math.abs(option.pnl))}</strong><small>Intrinsic value minus premium paid</small></div>
        </div>
      )}
    </LabShell>
  )
}

export default function LessonVisual({ lessonId }) {
  if (lessonId === 'contract') return <ContractLab />
  if (lessonId === 'tape') return <TapeLab />
  if (lessonId === 'orders') return <OrdersLab />
  if (lessonId === 'liquidity') return <LiquidityLab />
  if (lessonId === 'charts') return <ChartLab />
  if (lessonId === 'fundamentals') return <FundamentalsLab />
  return null
}
