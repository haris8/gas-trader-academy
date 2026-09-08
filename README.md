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

- Six beginner-first lesson carousels contain 39 short steps covering the NG contract, bid/ask tape, orders, liquidity, chart tools, fundamentals, and options.
- Each step introduces its terms, walks through a numerical example, and provides focused practice plus a connection to the actual trading desk.
- Practice includes quote-by-quote order replays, stop gaps, linked exits, partial fills, queue position, storage surprises, delivery-month curves, and option payoff/time-value controls.
- Chart lessons use the same chart as the Trade Floor, with isolated practice drawings and indicator controls that do not change the trading account.
- Understanding checks give immediate explanations and allow retries. New lesson completion requires visiting every step and answering the check correctly; existing completion stamps are preserved.
- Guided drills route learners back to the Trade Desk and highlight the exact quote, ticket, order book, or chart control to use.
- The knowledge check grades each answer with a desk-focused explanation and requires 8 out of 10 to pass.
- Your current lesson and step, visited steps, answers, completion stamps, drill evidence, best quiz score, XP, and rank persist in browser local storage.

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
