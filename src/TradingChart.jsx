import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Crosshair,
  Minus,
  MousePointer2,
  RotateCcw,
  Ruler,
  TrendingUp,
} from 'lucide-react'
import {
  CONTRACT_SIZE,
  TICK_SIZE,
  bollingerBands,
  clamp,
  exponentialMovingAverage,
  formatMoney,
  formatPrice,
  formatSigned,
  simpleMovingAverage,
  volumeWeightedAveragePrice,
} from './simulator.js'

const DEFAULT_VIEWBOX_WIDTH = 980
const VIEWBOX_HEIGHT = 430
const PAD = { top: 22, right: 72, bottom: 34, left: 14 }
const PRICE_BOTTOM = 326
const VOLUME_TOP = 344
const VOLUME_BOTTOM = 402

const TOOL_ITEMS = [
  { id: 'cursor', label: 'Crosshair', icon: MousePointer2 },
  { id: 'trend', label: 'Trend line', icon: TrendingUp },
  { id: 'horizontal', label: 'Horizontal price line', icon: Minus },
  { id: 'measure', label: 'Measure move', icon: Ruler },
]

function aggregateBars(bars, size) {
  if (size === 1) return bars
  const result = []
  for (let index = 0; index < bars.length; index += size) {
    const group = bars.slice(index, index + size)
    if (!group.length) continue
    const first = group[0]
    const last = group.at(-1)
    result.push({
      ...last,
      index: last.index,
      open: first.open,
      high: Math.max(...group.map((bar) => bar.high)),
      low: Math.min(...group.map((bar) => bar.low)),
      close: last.close,
      volume: group.reduce((sum, bar) => sum + bar.volume, 0),
      event: group.find((bar) => bar.event?.major)?.event ?? last.event,
    })
  }
  return result
}

function pathFor(values, xFor, yFor, pick = (value) => value) {
  let started = false
  return values
    .map((value, index) => {
      const picked = value == null ? null : pick(value)
      if (picked == null || Number.isNaN(picked)) return ''
      const command = started ? 'L' : 'M'
      started = true
      return `${command} ${xFor(index).toFixed(2)} ${yFor(picked).toFixed(2)}`
    })
    .filter(Boolean)
    .join(' ')
}

function orderLinePrice(order) {
  if (order.type === 'limit' || order.type === 'stop-limit') return order.limitPrice
  if (order.type === 'stop') return order.stopPrice
  return null
}

function orderLineLabel(order) {
  if (order.type === 'limit') return `LMT ${order.side === 'buy' ? 'B' : 'S'} ${order.remaining}`
  if (order.type === 'stop') return `STP ${order.side === 'buy' ? 'B' : 'S'} ${order.remaining}`
  return `STL ${order.side === 'buy' ? 'B' : 'S'} ${order.remaining}`
}

export default function TradingChart({
  bars,
  position,
  workingOrders,
  drawings,
  onDrawingsChange,
  onDrawingCreated,
  initialTool = 'cursor',
  initialIndicators = { sma: true, ema: false, vwap: true, bands: false },
  priceBounds,
  fitContainer = false,
}) {
  const chartElement = useRef(null)
  const [measuredWidth, setMeasuredWidth] = useState(DEFAULT_VIEWBOX_WIDTH)
  const VIEWBOX_WIDTH = fitContainer ? measuredWidth : DEFAULT_VIEWBOX_WIDTH
  const [timeframe, setTimeframe] = useState(1)
  const [tool, setTool] = useState(initialTool)
  const [pendingPoint, setPendingPoint] = useState(null)
  const [hover, setHover] = useState(null)
  const [indicators, setIndicators] = useState(initialIndicators)
  useEffect(() => {
    if (!fitContainer || !chartElement.current) return
    const observer = new ResizeObserver(([entry]) => setMeasuredWidth(Math.max(240, Math.round(entry.contentRect.width))))
    observer.observe(chartElement.current)
    return () => observer.disconnect()
  }, [fitContainer])
  const displayBars = useMemo(() => aggregateBars(bars, timeframe).slice(-42), [bars, timeframe])
  const sma = useMemo(() => simpleMovingAverage(displayBars, 7), [displayBars])
  const ema = useMemo(() => exponentialMovingAverage(displayBars, 9), [displayBars])
  const vwap = useMemo(() => volumeWeightedAveragePrice(displayBars), [displayBars])
  const bands = useMemo(() => bollingerBands(displayBars, 10, 2), [displayBars])

  const extraPrices = [
    position.quantity ? position.averagePrice : null,
    ...workingOrders.map(orderLinePrice),
    ...drawings.flatMap((drawing) => {
      if (drawing.type === 'horizontal') return [drawing.price]
      return [drawing.start?.price, drawing.end?.price]
    }),
  ].filter((value) => Number.isFinite(value))
  const allHighs = displayBars.map((bar) => bar.high).concat(extraPrices)
  const allLows = displayBars.map((bar) => bar.low).concat(extraPrices)
  const rawMax = Math.max(...allHighs, ...(priceBounds ?? []))
  const rawMin = Math.min(...allLows, ...(priceBounds ?? []))
  const padding = Math.max(0.018, (rawMax - rawMin) * 0.11)
  const priceMax = rawMax + padding
  const priceMin = rawMin - padding
  const innerWidth = VIEWBOX_WIDTH - PAD.left - PAD.right
  const timeTickCount = Math.min(6, Math.max(2, Math.floor(innerWidth / 70)))
  const timeTickStride = Math.max(1, Math.ceil(displayBars.length / timeTickCount))
  const chartHeight = PRICE_BOTTOM - PAD.top
  const candleSlot = innerWidth / Math.max(1, displayBars.length)
  const candleWidth = clamp(candleSlot * 0.58, 3, 14)
  const maxVolume = Math.max(...displayBars.map((bar) => bar.volume), 1)
  const xFor = (index) => PAD.left + candleSlot * index + candleSlot / 2
  const yFor = (price) => PAD.top + ((priceMax - price) / Math.max(0.001, priceMax - priceMin)) * chartHeight
  const volumeY = (volume) => VOLUME_BOTTOM - (volume / maxVolume) * (VOLUME_BOTTOM - VOLUME_TOP)
  const last = displayBars.at(-1)
  const hoverCardX = hover ? clamp(hover.x > VIEWBOX_WIDTH - 260 ? hover.x - 192 : hover.x + 10, 4, VIEWBOX_WIDTH - 186) : 0
  const yTicks = Array.from({ length: 5 }, (_, index) => priceMax - ((priceMax - priceMin) * index) / 4)

  function toggleIndicator(key) {
    setIndicators((current) => ({ ...current, [key]: !current[key] }))
  }

  function pointFromEvent(event) {
    // Include the SVG's scale and letterboxing when mapping a pointer to price.
    const pointer = event.currentTarget.createSVGPoint()
    pointer.x = event.clientX
    pointer.y = event.clientY
    const { x, y } = pointer.matrixTransform(event.currentTarget.getScreenCTM().inverse())
    const barIndex = clamp(Math.floor((x - PAD.left) / candleSlot), 0, displayBars.length - 1)
    const price = priceMax - ((clamp(y, PAD.top, PRICE_BOTTOM) - PAD.top) / chartHeight) * (priceMax - priceMin)
    return {
      x: xFor(barIndex),
      y: yFor(price),
      index: displayBars[barIndex].index,
      displayIndex: barIndex,
      price: Math.round(price / TICK_SIZE) * TICK_SIZE,
      bar: displayBars[barIndex],
    }
  }

  function handlePointerMove(event) {
    setHover(pointFromEvent(event))
  }

  function handleChartClick(event) {
    if (tool === 'cursor') return
    const point = pointFromEvent(event)
    if (tool === 'horizontal') {
      onDrawingsChange([...drawings, { id: `h-${Date.now()}`, type: 'horizontal', price: point.price }])
      onDrawingCreated?.('horizontal')
      return
    }

    if (!pendingPoint) {
      setPendingPoint({ index: point.index, price: point.price })
      return
    }

    onDrawingsChange([
      ...drawings,
      {
        id: `${tool}-${Date.now()}`,
        type: tool,
        start: pendingPoint,
        end: { index: point.index, price: point.price },
      },
    ])
    setPendingPoint(null)
    onDrawingCreated?.(tool)
  }

  function xForOriginalIndex(originalIndex) {
    let nearest = 0
    let distance = Infinity
    displayBars.forEach((bar, index) => {
      const nextDistance = Math.abs(bar.index - originalIndex)
      if (nextDistance < distance) {
        nearest = index
        distance = nextDistance
      }
    })
    return xFor(nearest)
  }

  return (
    <div className="chart-module" ref={chartElement}>
      <div className="chart-toolbar" aria-label="Chart tools">
        <div className="timeframe-control" aria-label="Chart timeframe">
          {[
            [1, '15m'],
            [2, '30m'],
            [4, '1h'],
          ].map(([value, label]) => (
            <button key={value} type="button" className={timeframe === value ? 'active' : ''} onClick={() => setTimeframe(value)}>
              {label}
            </button>
          ))}
        </div>

        <div className="drawing-tools">
          {TOOL_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={tool === id ? 'active' : ''}
              title={label}
              aria-label={label}
              onClick={() => {
                setTool(id)
                setPendingPoint(null)
              }}
            >
              <Icon size={16} aria-hidden="true" />
            </button>
          ))}
          <button
            type="button"
            title="Clear drawings"
            aria-label="Clear drawings"
            disabled={!drawings.length}
            onClick={() => {
              onDrawingsChange([])
              setPendingPoint(null)
            }}
          >
            <RotateCcw size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="indicator-control" aria-label="Indicators">
          {[
            ['sma', 'SMA'],
            ['ema', 'EMA'],
            ['vwap', 'VWAP'],
            ['bands', 'BB'],
          ].map(([key, label]) => (
            <button key={key} type="button" className={indicators[key] ? 'active' : ''} onClick={() => toggleIndicator(key)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className={`trading-chart ${tool !== 'cursor' ? 'drawing-active' : ''}`}>
        <svg
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          role="img"
          aria-label="Interactive Henry Hub candlestick chart"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHover(null)}
          onClick={handleChartClick}
        >
          <rect width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} className="chart-surface" />

          {yTicks.map((tick) => (
            <g key={tick}>
              <line x1={PAD.left} x2={VIEWBOX_WIDTH - PAD.right} y1={yFor(tick)} y2={yFor(tick)} className="chart-grid-line" />
              <text x={VIEWBOX_WIDTH - PAD.right + 10} y={yFor(tick) + 4} className="chart-axis-text">
                {tick.toFixed(3)}
              </text>
            </g>
          ))}

          {displayBars.map((bar, index) => {
            const up = bar.close >= bar.open
            const bodyTop = yFor(Math.max(bar.open, bar.close))
            const bodyBottom = yFor(Math.min(bar.open, bar.close))
            const bodyHeight = Math.max(2, bodyBottom - bodyTop)
            return (
              <g key={`${bar.index}-${index}`}>
                <line x1={xFor(index)} x2={xFor(index)} y1={yFor(bar.high)} y2={yFor(bar.low)} className={`candle-wick ${up ? 'up' : 'down'}`} />
                <rect
                  x={xFor(index) - candleWidth / 2}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  className={`candle-body ${up ? 'up' : 'down'}`}
                />
                <rect
                  x={xFor(index) - candleWidth / 2}
                  y={volumeY(bar.volume)}
                  width={candleWidth}
                  height={VOLUME_BOTTOM - volumeY(bar.volume)}
                  className={`volume-bar ${up ? 'up' : 'down'}`}
                />
                {bar.event?.major && (
                  <g className={`event-marker ${bar.event.sentiment}`}>
                    <path d={`M ${xFor(index) - 5} ${PAD.top + 2} L ${xFor(index) + 5} ${PAD.top + 2} L ${xFor(index)} ${PAD.top + 10} Z`} />
                    <title>{`${bar.event.category}: ${bar.event.headline}`}</title>
                  </g>
                )}
              </g>
            )
          })}

          {indicators.bands && (
            <>
              <path d={pathFor(bands, xFor, yFor, (value) => value.upper)} className="indicator-line bands" />
              <path d={pathFor(bands, xFor, yFor, (value) => value.lower)} className="indicator-line bands" />
            </>
          )}
          {indicators.sma && <path d={pathFor(sma, xFor, yFor)} className="indicator-line sma" />}
          {indicators.ema && <path d={pathFor(ema, xFor, yFor)} className="indicator-line ema" />}
          {indicators.vwap && <path d={pathFor(vwap, xFor, yFor)} className="indicator-line vwap" />}

          {position.quantity !== 0 && (
            <g>
              <line x1={PAD.left} x2={VIEWBOX_WIDTH - PAD.right} y1={yFor(position.averagePrice)} y2={yFor(position.averagePrice)} className="position-line" />
              <text x={PAD.left + 8} y={yFor(position.averagePrice) - 6} className="position-label">
                AVG {formatPrice(position.averagePrice)}
              </text>
            </g>
          )}

          {workingOrders.map((order) => {
            const price = orderLinePrice(order)
            if (!Number.isFinite(price)) return null
            return (
              <g key={order.id}>
                <line x1={PAD.left} x2={VIEWBOX_WIDTH - PAD.right} y1={yFor(price)} y2={yFor(price)} className={`order-line ${order.side}`} />
                <text x={VIEWBOX_WIDTH - PAD.right - 94} y={yFor(price) - 5} className={`order-label ${order.side}`}>
                  {orderLineLabel(order)}
                </text>
              </g>
            )
          })}

          {drawings.map((drawing) => {
            if (drawing.type === 'horizontal') {
              return (
                <g key={drawing.id}>
                  <line x1={PAD.left} x2={VIEWBOX_WIDTH - PAD.right} y1={yFor(drawing.price)} y2={yFor(drawing.price)} className="user-drawing horizontal" />
                  <text x={PAD.left + 8} y={yFor(drawing.price) - 6} className="drawing-label">
                    {formatPrice(drawing.price)}
                  </text>
                </g>
              )
            }

            const startX = xForOriginalIndex(drawing.start.index)
            const endX = xForOriginalIndex(drawing.end.index)
            const startY = yFor(drawing.start.price)
            const endY = yFor(drawing.end.price)
            const ticks = Math.round((drawing.end.price - drawing.start.price) / TICK_SIZE)
            const measureX = clamp((startX + endX) / 2, 76, VIEWBOX_WIDTH - 76)
            return (
              <g key={drawing.id}>
                <line x1={startX} x2={endX} y1={startY} y2={endY} className={`user-drawing ${drawing.type}`} />
                <circle cx={startX} cy={startY} r="3.5" className="drawing-anchor" />
                <circle cx={endX} cy={endY} r="3.5" className="drawing-anchor" />
                {drawing.type === 'measure' && (
                  <g>
                    <rect x={measureX - 72} y={(startY + endY) / 2 - 18} width="144" height="26" rx="4" className="measure-badge" />
                    <text x={measureX} y={(startY + endY) / 2} textAnchor="middle" className="measure-label">
                      {formatSigned(ticks)} ticks · {formatMoney(ticks * TICK_SIZE * CONTRACT_SIZE)}
                    </text>
                  </g>
                )}
              </g>
            )
          })}

          {pendingPoint && (
            <circle cx={xForOriginalIndex(pendingPoint.index)} cy={yFor(pendingPoint.price)} r="5" className="pending-anchor" />
          )}

          <line x1={PAD.left} x2={VIEWBOX_WIDTH - PAD.right} y1={yFor(last.close)} y2={yFor(last.close)} className="last-price-line" />
          <rect x={VIEWBOX_WIDTH - PAD.right} y={yFor(last.close) - 11} width="66" height="22" rx="3" className="last-price-badge" />
          <text x={VIEWBOX_WIDTH - PAD.right + 33} y={yFor(last.close) + 4} textAnchor="middle" className="last-price-text">
            {last.close.toFixed(3)}
          </text>

          <line x1={PAD.left} x2={VIEWBOX_WIDTH - PAD.right} y1={VOLUME_TOP - 7} y2={VOLUME_TOP - 7} className="volume-divider" />
          <text x={PAD.left} y={VOLUME_TOP + 4} className="volume-label">VOL</text>

          {displayBars.filter((_, index) => index % timeTickStride === 0).map((bar) => {
            const index = displayBars.indexOf(bar)
            return (
              <text key={`time-${bar.index}`} x={xFor(index)} y={VIEWBOX_HEIGHT - 10} textAnchor="middle" className="chart-axis-text">
                {bar.time.replace(' AM', '').replace(' PM', '')}
              </text>
            )
          })}

          {hover && (
            <g className="crosshair-layer">
              <line x1={hover.x} x2={hover.x} y1={PAD.top} y2={VOLUME_BOTTOM} />
              <line x1={PAD.left} x2={VIEWBOX_WIDTH - PAD.right} y1={hover.y} y2={hover.y} />
              <rect x={hoverCardX} y={34} width="182" height="72" rx="5" className="crosshair-card" />
              <text x={hoverCardX + 10} y={54} className="crosshair-title">
                {hover.bar.time}
              </text>
              <text x={hoverCardX + 10} y={74} className="crosshair-value">
                O {hover.bar.open.toFixed(3)}  H {hover.bar.high.toFixed(3)}
              </text>
              <text x={hoverCardX + 10} y={94} className="crosshair-value">
                L {hover.bar.low.toFixed(3)}  C {hover.bar.close.toFixed(3)}
              </text>
            </g>
          )}
        </svg>
      </div>

      <div className="chart-legend" aria-label="Active indicators">
        <span><Crosshair size={13} aria-hidden="true" /> {pendingPoint ? 'Select the second point' : `${displayBars.length} bars`}</span>
        {indicators.sma && <span className="sma-key">SMA 7</span>}
        {indicators.ema && <span className="ema-key">EMA 9</span>}
        {indicators.vwap && <span className="vwap-key">VWAP</span>}
        {indicators.bands && <span className="bands-key">BB 10,2</span>}
      </div>
    </div>
  )
}
