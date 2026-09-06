# Gas Trader Academy

Gas Trader Academy is a browser-based Henry Hub natural gas futures simulator built for people learning how a professional trading desk works. A session follows one compressed trader day from the 6:00 AM CT handoff through the storage report and settlement.

The app is an educational game. It does not use live market data, connect to a broker, or place real orders.

## Run Locally

```powershell
npm.cmd install
npm.cmd run dev
```

Open `http://localhost:5173`.

## Verify

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run build
```

## Trader-Day Gameplay

- Morning Brief: grade weather, production, and LNG signals, then commit to an opening bias.
- Trade Desk: trade a deterministic intraday Henry Hub scenario through scheduled market catalysts.
- Fundamentals Room: inspect regional weather load, physical balance metrics, the futures curve, storage surprises, and basis scenarios.
- Options Lab: trade calls and puts with bid/ask quotes, implied volatility, delta, theta, premium accounting, and expiration payoff charts.
- Training Center: study six desk lessons, run guided drills against the live simulator, and pass a ten-question knowledge check.
- Debrief: review P&L, max drawdown, execution quality, completed quests, journal notes, rank, and the local leaderboard.

## Training Center

- Lessons explain the NG contract, bid/ask tape, order types, liquidity, chart tools, and fundamental volatility.
- Every lesson includes a focused interactive board with live calculations, visual feedback, and a plain-English takeaway.
- Guided drills route learners back to the Trade Desk and highlight the exact quote, ticket, order book, or chart control to use.
- The knowledge check grades each answer with a desk-focused explanation and requires 8 out of 10 to pass.
- Completed lessons, drill evidence, best quiz score, XP, and rank persist in browser local storage.

## Execution Model

- Market, limit, stop-market, and stop-limit futures orders.
- DAY and GTC time in force plus reduce-only controls.
- Attached stop-loss and profit-target brackets linked as OCO orders.
- Marketable limits consume eligible displayed liquidity and leave any unfilled balance working.
- Resting orders can fill over multiple bars, producing visible partial fills.
- Market orders walk up to four displayed price levels and may be partially filled when depth is insufficient.
- Dynamic bid/ask spreads and eight-level order books respond to volatility, difficulty, and event liquidity.
- A switchable order-book and depth-of-market ladder supports one-click limit-order staging.
- Position averaging, reversals, realized/open P&L, commission, simplified training margin, buying-power reservation, and drawdown tracking.

## Chart Tools

- Intraday candlesticks and volume.
- 15-minute, 30-minute, and 1-hour aggregation.
- SMA, EMA, VWAP, and Bollinger Bands.
- Crosshair with OHLC inspection.
- Trend lines, horizontal price levels, and tick/dollar measurement drawings.
- Position average, working limit, and working stop overlays.

## Simulation Notes

The market path is deterministic for a given scenario seed and difficulty. Futures use the standard 10,000 MMBtu training multiplier and a $0.001 tick, which makes one tick worth $10 per contract. Margin is deliberately simplified and fixed for the learning exercise. Options use a simplified Black-76 model and are marked against generated training quotes.

Browser local storage keeps the leaderboard on the current device. No account or backend is required.
