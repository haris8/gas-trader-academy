// Each page introduces one concept before asking the learner to use it.
export const LESSON_STEPS = {
  contract: [
    {
      id: 'agreement', title: 'Start with the agreement', visual: 'contract-map',
      paragraphs: [
        'Natural gas is a fuel used for heating, electricity, and manufacturing. Its price changes as the amount available and the amount people want change. A futures contract is a standardized agreement to buy or sell a set amount for a specified future delivery month at an agreed price.',
        'An exchange is an organized marketplace that sets the contract rules and matches buyers with sellers. Henry Hub is a pipeline connection in Louisiana whose gas price is a widely used US reference. This game follows the standard Henry Hub natural gas contract, abbreviated NG.',
      ],
      terms: [['Contract', 'One standardized unit of an agreement, not one unit of gas.'], ['MMBtu', 'One million British thermal units: a measure of energy.']],
      example: 'One standard NG contract covers 10,000 MMBtu. A quote of $3.100 means $3.100 per MMBtu, so the represented gas is worth $31,000.',
      task: 'Select each part of the contract to see what it tells you.',
      app: 'The Trade Floor quote strip identifies the training contract as NGV6. The quote is a unit price, not the cost of the whole contract.',
    },
    {
      id: 'direction', title: 'Buying, selling, and closing a trade', visual: 'contract',
      paragraphs: [
        'A position is a trade you have opened and have not yet closed. Buying first creates a long position: you gain when price rises and lose when it falls. Selling first creates a short position: you gain when price falls and lose when it rises. Futures allow either direction.',
        'Closing means making the opposite trade for the same quantity in the same contract. Buy one, then sell one, and you are flat: no open position remains. Entry is the opening price; exit is the closing price. P&L means profit and loss.',
      ],
      terms: [['Long', 'Bought first; benefits from a rise.'], ['Short', 'Sold first; benefits from a fall.'], ['Flat', 'No open position.'], ['Tick', 'The smallest price step. The next page explains its dollar value.']],
      example: 'Buy one at $3.100 and sell at $3.120: gain $200 before costs. Sell one at $3.100 and buy back at $3.120: lose $200 before costs.',
      task: 'Set a positive price move, then switch between Long and Short. The price move is unchanged; the profit changes sign.',
      app: 'Buy and Sell are in Order Chit. Positions shows what you own; Flatten futures submits an order to close it.',
    },
    {
      id: 'tick-math', title: 'Turn a tiny price move into dollars', visual: 'contract',
      paragraphs: [
        'A tick is the smallest permitted change in the quoted price. For this standard NG contract, one tick is $0.001 per MMBtu. Multiply that by 10,000 MMBtu and one tick changes the value of one contract by $10.',
        'Count ticks by dividing the price change by 0.001. Then multiply ticks by $10 and by the number of contracts. More contracts multiply both potential profit and potential loss. Commissions are fees for trading, so your final result also includes those costs.',
      ],
      terms: [['Tick value', 'Dollar change for one tick on one contract.'], ['Commission', 'A trading fee charged on execution.']],
      example: '$3.137 - $3.100 = $0.037. Divide by $0.001 to get 37 ticks. Two long contracts gain 37 x $10 x 2 = $740 before costs.',
      task: 'Use one contract and a 10-tick move. Increase to two contracts and compare the result.',
      app: 'Order Chit displays the $10 tick value. Chart measurements show dollars for one contract; multiply by your own quantity.',
    },
    {
      id: 'margin', title: 'Margin is a deposit, not a spending limit', visual: 'margin',
      paragraphs: [
        'You do not pay the full $31,000 represented by a contract to open a futures position. Instead, the account must hold collateral called margin. The game reserves a fixed $4,200 per contract. Actual broker and exchange requirements vary.',
        'Leverage means a relatively small amount of collateral supports a larger price exposure. Margin does not cap your loss. Equity is the current value of your account, including gains or losses on open trades. Available funds are what remains after margin and other reservations.',
      ],
      terms: [['Margin', 'Collateral required to support a position.'], ['Equity', 'Cash plus the current value of open gains or losses.']],
      example: 'A $0.100 fall costs a one-contract long $1,000. That loss comes from your account even though the margin deposit was $4,200.',
      task: 'Increase contract quantity. Compare represented value, reserved margin, and loss from the same price move.',
      app: 'Read Equity and available funds before sending an order. The game uses simplified margin; it is not a current broker quote.',
    },
    {
      id: 'risk', title: 'Plan the loss before planning the profit', visual: 'risk',
      paragraphs: [
        'Before entering, choose the price at which you would admit the idea was wrong. This is your planned exit for a loss. The distance from entry to that price, multiplied by tick value and quantity, is your planned price risk.',
        'A stop-loss order can help request that exit automatically; a later lesson explains how. Its final fill may be worse in a fast market, so planned risk is an estimate. Open or unrealized P&L still changes with the market. Realized P&L is recorded after closing.',
      ],
      terms: [['Unrealized', 'Profit or loss on a position that is still open.'], ['Realized', 'Profit or loss recorded when a position closes.']],
      example: 'Enter long at $3.100 with an exit planned at $3.065. The 35-tick distance is $350 for one contract or $700 for two, before fees and slippage.',
      task: 'Set a 35-tick stop distance and compare one versus three contracts.',
      app: 'Attach bracket in Order Chit creates exit orders around an entry. Closeout separates results and tracks the largest account decline, called drawdown.',
      check: { question: 'You buy two NG contracts. Price falls 10 ticks. What is the loss before costs?', options: ['$20', '$100', '$200'], correct: 2, explanation: 'Each tick is $10 per contract. 10 ticks x $10 x 2 contracts = $200. Margin does not change this calculation.' },
    },
    {
      id: 'expiry', title: 'Know what the contract month means', visual: 'contract-map',
      paragraphs: [
        'The letters after NG identify the delivery month and year. In the training label NGV6, V means October and 6 denotes 2026. Different delivery months are separate contracts and can have different prices.',
        'An open standard NG futures contract held into delivery can involve physical obligations. A trader avoiding delivery normally closes before the applicable deadline or rolls: closes the expiring contract and opens a later one. This simulator has no physical delivery; its compressed day ends at a simulated settlement.',
      ],
      terms: [['Expiry', 'The end of a contract\'s trading life.'], ['Roll', 'Close one contract month and open a later one.'], ['Settlement', 'An official reference price used to value positions.']],
      example: 'Selling your October long and buying a November contract changes the delivery month. It is two trades, each with its own price and costs.',
      task: 'Select Delivery month on the contract diagram and read the NGV6 label.',
      app: 'The simulator Next 15m button advances the training day. Advancing time changes market conditions; it does not automatically close every position.',
    },
  ],
  tape: [
    {
      id: 'auction', title: 'How a price becomes a trade', visual: 'tape',
      paragraphs: [
        'At any moment, buyers propose prices they are willing to pay and sellers propose prices they are willing to accept. The highest advertised buying price is the bid. The lowest advertised selling price is the ask, also called the offer.',
        'A trade happens when someone accepts an available opposite-side price. The last price is the price of the most recently completed trade. It is history, so it is not necessarily a price still available to you. The tape is the stream of completed trades.',
      ],
      terms: [['Bid', 'Best price currently advertised by a buyer.'], ['Ask', 'Best price currently advertised by a seller.']],
      example: 'With bid $3.108, ask $3.111, and last $3.109, an immediate buy seeks $3.111. The last price does not give you the right to buy at $3.109.',
      task: 'Switch between Market buy and Market sell. Follow the highlighted quote.',
      app: 'Book & Ladder shows both sides. The large price above the chart is last traded price.',
    },
    {
      id: 'spread', title: 'The spread is part of your trading cost', visual: 'spread',
      paragraphs: [
        'The spread is ask minus bid. Crossing the spread means accepting the opposite side\'s quote for an immediate trade. Buying at the ask and immediately selling at the bid loses the spread if neither quote moves.',
        'A wider spread makes that immediate round trip more expensive. It often appears when fewer traders offer liquidity or prices are changing quickly. Liquidity means the amount available to trade at the prices you want; the order-book lesson examines it in detail.',
      ],
      terms: [['Spread', 'The distance between best ask and best bid.'], ['Round trip', 'An opening trade followed by its closing trade.']],
      example: 'Buy at $3.111 and sell at $3.108: lose $0.003 x 10,000 = $30 per contract before commissions.',
      task: 'Widen the spread from one tick to six. Compare the immediate round-trip loss.',
      app: 'The spread label in Book & Ladder changes with the simulated conditions. Check it again before an order around a news release.',
    },
    {
      id: 'candle', title: 'Read one candle, four prices at a time', visual: 'candle',
      paragraphs: [
        'A candlestick is a compact picture of trades over a chosen time period. Open is the first price, close is the last, high is the highest, and low is the lowest. These four values are often shortened to OHLC.',
        'The thick body joins open to close. The thin line, called a wick, extends to the high and low. Green means the close is above the open; red means below. A candle records what happened, not what must happen next.',
      ],
      terms: [['Body', 'The distance between open and close.'], ['Wick', 'The full high-to-low range outside the body.']],
      example: 'Open $3.102, high $3.118, low $3.095, close $3.109: price finished higher, but it also traded below the open during the period.',
      task: 'Select Open, High, Low, and Close to locate each on the candle. Then switch to a falling candle.',
      app: 'Select Crosshair in the chart toolbar, then move over or tap a candle to inspect its OHLC values.',
    },
    {
      id: 'volume', title: 'Volume tells you how much traded', visual: 'volume',
      paragraphs: [
        'Volume counts contracts traded during a period. It is different from order-book size, which counts advertised interest that has not necessarily traded. Every executed contract has both a buyer and a seller; volume alone does not tell you which side will win next.',
        'Compare a volume bar with earlier bars from the same session. A price move alongside unusually high volume may reflect more participation, but it can still reverse. A catalyst is an event that changes expectations, such as a weather forecast or storage report.',
      ],
      terms: [['Volume', 'Contracts actually traded during a period.'], ['Catalyst', 'An event that can change how traders value the market.']],
      example: 'A candle rises $0.010 on 100 contracts. Another rises the same amount on 900 contracts. The price change matches, but participation differs.',
      task: 'Compare Quiet trading and Report release. Keep the price move fixed while participation changes.',
      app: 'Volume bars sit below the candles. The event message below the chart names the current simulated catalyst.',
    },
    {
      id: 'timeframe', title: 'Zoom out without inventing new trades', visual: 'chart-time',
      paragraphs: [
        'A timeframe is the amount of time included in one candle. Four 15-minute candles combine into one hour: use the first open, highest high, lowest low, and final close. Their volumes add together.',
        'A longer timeframe smooths the picture but hides some movement inside the candle. A shorter one shows that movement with more detail. Neither is automatically better. Compare them to understand context before choosing an entry.',
      ],
      terms: [['Aggregation', 'Combining several smaller periods into one larger period.']],
      example: 'Four candles might rise, fall, fall, then rise. The hourly candle could finish green even though the hour contained two declines.',
      task: 'Switch from 15m to 1h. Count the candles and inspect how their highs and lows combine.',
      app: 'The Trade Floor has 15m, 30m, and 1h buttons at the left of the chart toolbar.',
      check: { question: 'An hourly candle closes above its open. Does that prove every 15-minute candle inside it rose?', options: ['Yes, they must all be green', 'No, movement inside the hour can go both ways', 'Only when volume is high'], correct: 1, explanation: 'The hourly body compares the first and last prices only. It hides intermediate rises and falls.' },
    },
  ],
  orders: [
    {
      id: 'ticket', title: 'An order is an instruction, not a completed trade', visual: 'order-ticket',
      paragraphs: [
        'An order tells the market what you want to do. Side is Buy or Sell; quantity is the number of contracts; type describes the conditions under which the order can execute. A fill is the part of that instruction that actually traded.',
        'A working order is waiting for an opportunity to fill. A filled order has executed; a canceled order stops requesting any remaining quantity. Canceling does not undo a trade already filled. A position is the exposure left by your fills.',
      ],
      terms: [['Order', 'A request to trade.'], ['Fill', 'An actual execution of some or all requested quantity.'], ['Working', 'Still eligible to execute.']],
      example: 'Submit a buy for three contracts. Two fill and one remains working. You now have a two-contract long position plus one unfilled buy request.',
      task: 'Select the stages in the order timeline to follow a request into a position.',
      app: 'Order Chit sends the request. Working, Fills, All Orders, and Positions below the chart show different parts of its life.',
    },
    {
      id: 'market', title: 'Market orders ask for an immediate execution', visual: 'order-market',
      paragraphs: [
        'A market order tries to trade promptly against available opposite-side orders. A buy takes selling interest starting at the ask; a sell takes buying interest starting at the bid. It does not specify a guaranteed fill price.',
        'If the best price has too little quantity, execution may continue at worse prices. This difference from the first available quote is called slippage. The simulator limits how far it searches through displayed levels, so a market order can also finish only partly filled.',
      ],
      terms: [['Slippage', 'A fill price different from the reference price you expected.']],
      example: 'A buy needs two contracts. One seller offers one at $3.111 and another offers one at $3.112. The average is $3.1115, not $3.111.',
      task: 'Advance the example market. Read why the market buy is filled before the later prices occur.',
      app: 'Choose Market in Order Chit, review quantity, and inspect actual prices in Fills after submitting.',
    },
    {
      id: 'limit', title: 'Limit orders name your worst acceptable price', visual: 'order-limit',
      paragraphs: [
        'A buy limit means buy at my limit price or lower. A sell limit means sell at my limit price or higher. A limit protects the worst price you accept, but does not guarantee a fill. It may wait, fill partly, or never trade.',
        'A buy limit below the ask usually waits. A buy limit at or above the ask is marketable: it can execute immediately against eligible sellers. Even when price touches your limit, other orders and available quantity can affect whether you fill.',
      ],
      terms: [['Limit price', 'Your worst acceptable execution price.'], ['Marketable', 'Able to trade against an available quote right now.']],
      example: 'Buy limit $3.100: an ask at $3.105 is too expensive. An ask at $3.099 is eligible and could give a better price than your limit.',
      task: 'Advance the quotes until the ask falls below the buy limit. Observe when Waiting becomes Filled.',
      app: 'Select Limit and enter Limit price. Clicking a size in the depth ladder stages a limit in the ticket for review.',
    },
    {
      id: 'stop', title: 'A stop-loss uses a trigger price', visual: 'order-stop',
      paragraphs: [
        'Suppose you already bought one contract. A sell stop below the market is an instruction to request an exit if price falls to its trigger. A buy stop above the market can protect an existing short position. Stops can also be used for entries, so side and position matter.',
        'In this game, a stop-market becomes a market order once triggered. The stop price starts the order; it is not a guaranteed exit price. If price jumps past it, the available bid for your sell may be much lower.',
      ],
      terms: [['Trigger', 'The condition that activates an order.'], ['Stop-loss', 'An intended exit to limit a position\'s loss.']],
      example: 'Long at $3.100, sell stop $3.065. If the next tradable bid is $3.050, the exit may be around $3.050: a $500 loss rather than the planned $350.',
      task: 'Use the gap scenario. Compare the stop trigger with the actual exit price.',
      app: 'Choose Sell, Stop Market, a stop below the market, and Reduce only for a long exit. Exchange stop protections can differ from this simplified model.',
    },
    {
      id: 'stop-limit', title: 'A stop-limit adds a price boundary', visual: 'order-stop-limit',
      paragraphs: [
        'A stop-limit has two prices. The stop activates the instruction; the limit then sets the worst execution price. For a protective sell, the limit is often below the stop so some movement is allowed after activation.',
        'If the market falls below your sell limit, the order can remain working while your position keeps losing. The price boundary protects the fill price, not the account from further loss. This is the key difference from a stop-market.',
      ],
      terms: [['Stop-limit', 'A trigger that activates a limit order.']],
      example: 'Sell stop $3.065, sell limit $3.060. A bid of $3.050 triggers the stop but is below the acceptable sell price. No exit happens in that example.',
      task: 'Advance through the gap. Notice that Triggered does not mean Filled. Then see what happens if price recovers.',
      app: 'Stop Limit requires both fields. Watch Working and Positions together so an activated order is not mistaken for a closed position.',
    },
    {
      id: 'bracket', title: 'Link a planned loss and a planned profit', visual: 'bracket',
      paragraphs: [
        'A bracket attaches two exit instructions to an entry: a stop-loss on the losing side and a profit-taking limit on the favorable side. The pair is often linked as OCO, meaning one cancels the other.',
        'For a long, the protective sell stop is below entry and the profit-target sell limit is above it. After an exit fills, the other instruction should no longer close the same quantity. Partial fills and cancellations still need monitoring.',
      ],
      terms: [['Target', 'A price where you plan to take a profit.'], ['OCO', 'One cancels the other: linked alternatives for an exit.']],
      example: 'Buy at $3.100 with a 0.035 stop offset and 0.060 target offset. The intended stop is $3.065 and target $3.160, measured from the actual entry fill.',
      task: 'Choose a move toward the target or stop. Watch which exit fills and which is canceled.',
      app: 'Attach bracket uses price offsets, not dollar amounts. Multiply the offset by 10,000 and quantity to estimate dollars.',
    },
    {
      id: 'controls', title: 'Control lifetime and prevent an accidental reversal', visual: 'order-controls',
      paragraphs: [
        'Time in force controls how long an unfilled instruction remains eligible. DAY expires at the simulator settlement. GTC means good till canceled; in this game it can remain working to the scenario end. Loading a new scenario resets orders.',
        'Reduce-only allows an order to close an existing position but not increase exposure or reverse its direction. Without it, selling three while long one could close the long and open a short of two. Reducing risk requires checking the quantity as well as the side.',
      ],
      terms: [['DAY', 'An order lasting only the current trading day.'], ['GTC', 'Good till canceled.'], ['Reduce-only', 'Execution is limited to reducing an existing position.']],
      example: 'Long one, submit sell three with Reduce only: at most one can close. The instruction cannot create a new two-contract short.',
      task: 'Toggle Reduce only in the example and compare the resulting position.',
      app: 'Set Time in force and Reduce only in Order Chit. Cancel a remaining request in Working; use Flatten to close an existing position.',
    },
    {
      id: 'order-review', title: 'Read the result before sending another order', visual: 'order-ticket',
      paragraphs: [
        'After sending, check what actually happened. A request can be accepted but still waiting. A partial fill creates a position immediately for the quantity executed, while the remainder may keep working. Your intended quantity and your actual exposure can differ.',
        'A useful routine is side, quantity, order type, price conditions, exits, then submit. Afterward inspect Fills, Working, and Positions. If something differs from your plan, pause and identify the cause before sending another instruction.',
      ],
      terms: [['Exposure', 'How much your account changes when the market moves.']],
      example: 'Two fills at different prices are not necessarily duplicate orders. They may be pieces of one request consuming different levels of liquidity.',
      task: 'Follow the timeline through Partial fill and Cancel remainder. Observe that the filled position remains.',
      app: 'Guided Drills lets you rehearse these actions on the Trade Floor after completing this lesson.',
      check: { question: 'Your sell stop-limit triggers, but the best bid is below its sell limit. What can happen?', options: ['It must fill at the stop price', 'It can remain working while the long position stays open', 'It becomes a guaranteed market exit'], correct: 1, explanation: 'The trigger activates a limit order. A sell still needs a bid at or above its limit, so the position may remain open.' },
    },
  ],
  liquidity: [
    {
      id: 'depth', title: 'The book shows waiting interest at several prices', visual: 'depth-map',
      paragraphs: [
        'An order book groups unfilled buying and selling interest by price. The nearest bid and ask are only the first available levels. Depth of market, abbreviated DOM, displays multiple levels so you can see the quantity behind each quote.',
        'Size means contracts at one price. Cumulative total adds sizes through successive levels. Advertised interest can be canceled or changed before you reach it, so the display is a snapshot, not a promise.',
      ],
      terms: [['Level', 'One price row in the order book.'], ['Depth', 'Quantity offered across multiple price levels.']],
      example: 'Four contracts at $3.111 plus three at $3.112 means seven are displayed at or below $3.112 on the selling side.',
      task: 'Select an ask row and compare its own size with the cumulative total.',
      app: 'Book & Ladder has Order book and Depth of market ladder views. Clicking a price-level size stages an order; review it before sending.',
    },
    {
      id: 'walk', title: 'A larger order can use worse prices', visual: 'liquidity',
      paragraphs: [
        'A market buy starts at the lowest ask. If there is not enough quantity there, it takes the next ask, then the next. A market sell moves down the bids. This is called walking the book.',
        'Average fill price weights each execution by its quantity. An average can sit between valid tick prices because it is an average of several fills, not a separate exchange trade. Slippage measures how far that average moved from your reference quote.',
      ],
      terms: [['Weighted average', 'An average where larger quantities have more influence.']],
      example: '(4 x $3.111 + 3 x $3.112 + 3 x $3.113) / 10 = $3.11190. That is 0.9 ticks worse than the starting ask.',
      task: 'Compare Fit best ask with Walk the book. Read the fill bars and the average price.',
      app: 'Fills reports prices and quantity. A large buy can have a higher average cost than the number shown on the submit button.',
    },
    {
      id: 'partial', title: 'A partial fill means only part traded', visual: 'limit-depth',
      paragraphs: [
        'A limit buy can only use sellers at or below its limit. If you request ten contracts at $3.111 but only four are offered there, four can execute and six can remain waiting. You have a four-contract long position already.',
        'A market order can also stop short in this simulator if its search through displayed levels runs out. Its leftover quantity is canceled. A limit remainder can stay working. Always check the status rather than assuming every remainder behaves the same way.',
      ],
      terms: [['Remaining quantity', 'The part of the original request that has not filled.']],
      example: 'Buy ten, fill four, six still working. Cancel the six and you keep the four already bought; cancellation is not an exit.',
      task: 'Raise the buy limit one tick at a time. More rows become eligible and the working remainder shrinks.',
      app: 'Working shows the remaining amount. Positions shows filled exposure. Check both after any partial execution.',
    },
    {
      id: 'queue', title: 'Touching your price is not the same as filling you', visual: 'queue',
      paragraphs: [
        'Other orders can be competing for the same price. In a simple first-in-first-out queue, earlier requests at a price are served before later ones. A trade at your limit can therefore fill someone else while your request keeps waiting.',
        'Actual exchange matching rules differ by product and order type. This queue is a teaching example; the game approximates fills using candle ranges and available capacity rather than reproducing an exchange queue. It cannot promise real-world execution priority.',
      ],
      terms: [['Queue', 'Orders competing for available execution at one price.']],
      example: 'Six contracts are ahead of your two. If five opposing contracts arrive, none of yours fills. If eight arrive, your two can fill in this simple queue.',
      task: 'Increase arriving sell quantity. Watch the earlier orders fill before your order.',
      app: 'A candle touching a working price does not mean the whole order is finished. Look for the actual fill record.',
    },
    {
      id: 'liquidity-review', title: 'Judge quantity, spread, and event conditions together', visual: 'spread',
      paragraphs: [
        'A tight spread is helpful, but the best level might have very little size. A deep book is helpful, but quotes may disappear around a report. These are separate observations, and both affect how an order might execute.',
        'Before submitting, compare your requested quantity with nearby depth, note the spread cost, and check the event clock. The goal is to understand the possible outcome: several prices, a partial fill, or an order still waiting.',
      ],
      terms: [['Execution quality', 'How the actual prices and fills compare with what you intended.']],
      example: 'A one-tick spread with one contract offered may be fine for a one-contract trade, yet insufficient for an immediate ten-contract trade at that price.',
      task: 'Compare the round-trip spread cost for one contract and five contracts.',
      app: 'The same seed and difficulty reproduce the market path, making it possible to compare execution choices on a repeated scenario.',
      check: { question: 'A ten-contract limit buy fills four. You cancel the remaining six. What is left?', options: ['No position', 'A four-contract long position', 'A ten-contract short position'], correct: 1, explanation: 'Canceling removes the unfilled instruction only. You must sell the four bought contracts to close that position.' },
    },
  ],
  charts: [
    {
      id: 'axes', title: 'Read the chart as a map of time and price', visual: 'chart-time',
      paragraphs: [
        'Time runs from left to right along the bottom. Prices are on the vertical scale: higher on the screen means a higher price. Each candle summarizes one period. The current quote and your entry price are separate references.',
        'Start with the overall movement, then inspect specific candles. A support area is a price region where buying previously interrupted a decline. Resistance is where selling previously interrupted a rise. These describe past behavior; either area can fail.',
      ],
      terms: [['Support', 'An area where declines previously met buying.'], ['Resistance', 'An area where rises previously met selling.']],
      example: 'Repeated lows near $3.100 suggest a level worth observing. They do not guarantee another bounce.',
      task: 'Switch timeframes and locate a previous high and low. Use Crosshair to inspect their prices.',
      app: 'The practice chart uses the same chart tools as Trade Floor. Drawings here do not change your trading account.',
    },
    {
      id: 'averages', title: 'Smooth price with a moving average', visual: 'chart-averages',
      paragraphs: [
        'An indicator is a calculation drawn from market data. A simple moving average, SMA, averages recent closing prices. SMA 7 uses seven closes, equally weighted. It drops the oldest value when a new candle arrives.',
        'An exponential moving average, EMA, gives greater weight to recent observations. EMA 9 uses a different weighting from SMA 7, so their lines can differ for two reasons: weighting and period. Both react to past data and can lag a sudden turn.',
      ],
      terms: [['Period', 'How many candles or observations a calculation uses.'], ['Lag', 'A delayed response to a new move.']],
      example: 'Closes of 3.100, 3.110, and 3.120 have a three-period SMA of 3.110. The average is not a forecast of the next close.',
      task: 'Toggle SMA and EMA separately. Compare each line with the candles around a reversal.',
      app: 'SMA and EMA are independent toggles. Their periods are listed in the chart legend.',
    },
    {
      id: 'vwap', title: 'Ask where most trading took place', visual: 'chart-vwap',
      paragraphs: [
        'VWAP means volume-weighted average price. It gives more influence to periods with more contracts traded. The simulator estimates it using each candle\'s typical price, the average of high, low, and close, multiplied by that candle\'s volume.',
        'Price above VWAP is above that calculated average; below is below it. This can help describe where a fill occurred relative to the sampled trading. It is not automatically a buy or sell instruction. In this game the available chart history is the sample, including the displayed lookback.',
      ],
      terms: [['Benchmark', 'A reference used for comparison.'], ['Typical price', 'High plus low plus close, divided by three.']],
      example: '100 contracts near $3.100 and 300 near $3.120 produce a weighted average near $3.115, closer to the busier price.',
      task: 'Show VWAP alone and compare the latest close with the line. Describe the location without predicting the next move.',
      app: 'Toggle VWAP above the chart. Changing aggregation can slightly change this candle-based estimate.',
    },
    {
      id: 'bands', title: 'See how variable prices have been', visual: 'chart-bands',
      paragraphs: [
        'Volatility describes how much prices vary. Bollinger Bands place two lines around a moving average using a measure of variation called standard deviation. In the game, BB 10,2 means a ten-close average with bands two standard deviations away.',
        'The bands generally widen when the sampled closes become more dispersed and narrow when they bunch together. A band touch is not a promise of reversal. During a strong move price can keep traveling near or beyond a band.',
      ],
      terms: [['Volatility', 'The amount of variation in prices.'], ['Standard deviation', 'A numerical measure of how spread out values are around an average.']],
      example: 'Closes clustered near $3.100 create narrower bands than closes spread between $3.050 and $3.150, using the same settings.',
      task: 'Turn BB on, then use the higher-volatility sample. Compare band width.',
      app: 'BB is the band toggle. It needs enough history to calculate; a very short aggregated series can show no band yet.',
    },
    {
      id: 'draw', title: 'Mark a level and a trend yourself', visual: 'chart-draw',
      paragraphs: [
        'A horizontal line marks one price across time. Use it for a prior high, low, or planned decision level. A trend line connects two chosen points and helps you compare the slope of a move.',
        'The quality of a drawing depends on the points you choose. It is a note on your reasoning, not a prediction engine. Keep only lines with a purpose, and remember that moving a line after a loss does not erase the loss.',
      ],
      terms: [['Swing point', 'A local high or low compared with nearby candles.']],
      example: 'Mark the lowest price before a bounce with a horizontal line. Connect two later rising lows with a trend line to describe that sequence.',
      task: 'Choose Horizontal price line and tap a price. Then select Trend line and tap two points. Use Clear drawings to start over.',
      app: 'The line icon takes one point. The sloping-line icon takes two. A pending first point is shown until you choose the second.',
    },
    {
      id: 'measure', title: 'Convert a chart idea into a dollar estimate', visual: 'chart-measure',
      paragraphs: [
        'The ruler measures the price difference between two points. It divides that difference by tick size and multiplies by the contract value to show ticks and dollars. The chart readout is for one contract.',
        'Measure from a possible entry to your planned losing exit, then multiply by quantity. A signed negative measurement simply means the second point is lower; it is not automatically a loss for a short trade. Fees and a worse exit price can increase the actual cost.',
      ],
      terms: [['Invalidation', 'The condition or price that would make you abandon a trade idea.']],
      example: 'Entry $3.110 and losing exit $3.080 are 30 ticks apart. That is $300 per contract or $900 for three, before costs.',
      task: 'Choose Measure move and tap two different prices. Read the tick distance, then calculate it for two contracts.',
      app: 'A line or ruler is only an annotation. It does not submit a stop or any other order.',
    },
    {
      id: 'chart-review', title: 'Build a short, repeatable chart routine', visual: 'chart-draw',
      paragraphs: [
        'First choose the timeframe and locate the recent range, the space between its high and low. Next mark one level that matters. Add a benchmark only if you have a question it answers, such as how the current price compares with the trading average.',
        'Finally measure a possible losing exit and decide whether the dollar exposure fits your plan. Chart study organizes your reasoning; the order ticket is where you act. Keep those two steps connected by checking that the entered prices match the plan.',
      ],
      terms: [['Range', 'The distance between a high and a low for a chosen period.']],
      example: 'A useful note is: entry near 3.110, invalidation below 3.080, 30 ticks or $300 per contract. "The chart looks good" leaves the risk undefined.',
      task: 'Make one horizontal level and one measurement. Compare their numbers before marking the lesson complete.',
      app: 'Use the same sequence in the Mark and measure guided drill, then review your execution in Closeout.',
      check: { question: 'The ruler says 30 ticks, $300. You plan three contracts. What does that distance represent?', options: ['$300 for the whole trade', '$900 before costs and slippage', 'A guaranteed maximum loss of $900'], correct: 1, explanation: 'The ruler value is per contract. $300 x 3 = $900 planned price risk; an actual stop exit and fees can make the loss larger.' },
    },
  ],
  fundamentals: [
    {
      id: 'physical', title: 'Follow the gas before following the price', visual: 'gas-flow',
      paragraphs: [
        'Fundamentals are facts about the real gas market. Supply comes from production, imports, and withdrawals from storage. Demand includes heating, electricity generation, industrial use, exports, and additions to storage. Pipelines connect these sources and uses.',
        'More available gas with unchanged demand tends to put downward pressure on price. More demand with unchanged supply tends to put upward pressure on it. Bullish means a view favoring higher prices; bearish favors lower prices. Several forces usually act together.',
      ],
      terms: [['Production', 'Gas brought out of the ground and prepared for use.'], ['Storage', 'Gas held for later use.'], ['Balance', 'A comparison of available supply and uses.']],
      example: 'A factory uses more gas at the same time a producer adds output. Looking at only the factory could miss the offsetting supply change.',
      task: 'Select a source or use in the flow diagram and read its role.',
      app: 'Field Desk contains the physical-market information. Start there to understand what a headline could change.',
    },
    {
      id: 'weather', title: 'Turn weather and exports into demand changes', visual: 'fundamentals',
      paragraphs: [
        'Cold weather can increase gas used for heating. Hot summer weather can increase electricity demand for cooling, which can increase gas burned in power stations. That power-station use is called power burn.',
        'LNG means liquefied natural gas, cooled for transport by ship. Feedgas is pipeline gas sent to an LNG export plant. More feedgas can increase domestic gas demand; an export-plant outage can reduce it. Location, season, and the size of the change all matter.',
      ],
      terms: [['LNG', 'Liquefied natural gas, cooled for shipping.'], ['Feedgas', 'Gas supplied to an LNG export plant.'], ['Power burn', 'Gas used to produce electricity.']],
      example: 'A hotter forecast can raise expected power burn. If production also rises enough, the net supply-demand effect could be small.',
      task: 'Toggle the weather, production, and LNG signals. Identify which changes offset one another.',
      app: '06:00 Wire asks you to judge headlines. Bullish and bearish describe possible price pressure, not guaranteed outcomes.',
    },
    {
      id: 'storage', title: 'Compare a storage report with expectations', visual: 'storage',
      paragraphs: [
        'An injection adds gas to storage; a withdrawal removes it. The US Energy Information Administration, EIA, publishes estimates of weekly storage changes. Bcf means billion cubic feet, a volume unit used in these reports. It is different from the MMBtu energy unit in a futures quote.',
        'Traders often form a consensus estimate before a release. A surprise is the reported change relative to that estimate. An injection can still be interpreted as relatively supportive of price if it is smaller than expected. The wider market context can override the initial interpretation.',
      ],
      terms: [['Injection', 'Gas added to storage.'], ['Consensus', 'A typical or average expectation before an event.']],
      example: 'Expected injection +80 Bcf, actual +65 Bcf: 15 Bcf less gas was added than expected. The surprise is tighter than expected even though storage increased.',
      task: 'Move the actual injection above and below the +80 Bcf expectation. Watch the surprise change sign.',
      app: 'The EIA event is a major point on the training clock. Recheck spread and depth when the simulated report arrives.',
    },
    {
      id: 'curve', title: 'Different delivery months have different prices', visual: 'curve',
      paragraphs: [
        'A futures curve puts delivery months on the horizontal axis and today\'s price for each month on the vertical axis. It is a snapshot of several contracts today, not a chart of how one price moved through time.',
        'Contango describes later contracts priced above nearby ones. Backwardation describes nearby contracts priced above later ones. Gas curves can also have seasonal peaks, such as a winter month above autumn and spring. Storage costs, availability, and expected seasonal demand all affect the shape.',
      ],
      terms: [['Nearby', 'A contract with an earlier delivery month.'], ['Deferred', 'A contract with a later delivery month.']],
      example: 'October $3.10 and November $3.25 means November costs $0.15 more today. It does not promise October will rise to $3.25.',
      task: 'Compare rising, falling, and winter-peak curves. Read what changes along the horizontal axis.',
      app: 'The curve in Field Desk compares months. The candlestick chart on Trade Floor tracks one training contract through time.',
    },
    {
      id: 'options', title: 'An option gives a right with an upfront price', visual: 'option-payoff',
      paragraphs: [
        'An option on futures is a different contract. A call gives its buyer the right to buy the underlying futures at a specified strike price; a put gives the right to sell. The right lasts until expiry. The buyer pays a premium for it.',
        'At expiry, a call has intrinsic value when futures are above strike; a put when futures are below strike. Intrinsic value is the amount the right is worth if used then. The simulator uses simplified option values and payoffs rather than a delivery or exercise workflow.',
      ],
      terms: [['Underlying', 'The futures contract the option refers to.'], ['Strike', 'The price written into the option\'s right.'], ['Premium', 'The price paid to buy the option.']],
      example: 'A $3.100 call with premium $0.120 costs $1,200 using the 10,000 multiplier. At a futures expiry price of $3.180 it has $800 intrinsic value, but loses $400 after premium.',
      task: 'Compare a long call and long put at the same expiration price. Find when each has value.',
      app: 'Vol Board shows calls and puts by strike. The premium quote must be multiplied by 10,000 for one option\'s dollar cost.',
    },
    {
      id: 'breakeven', title: 'Being right about direction may not be enough', visual: 'option-payoff',
      paragraphs: [
        'For a purchased call at expiry, break-even before fees is strike plus premium. For a purchased put, it is strike minus premium. An option can finish with value yet still lose money if that value is less than the amount paid.',
        'In the game\'s long-option model, the maximum loss is the premium paid plus fees because the option value cannot fall below zero. This statement applies to purchasing options, not to every option-selling strategy. Closing before expiry also depends on remaining time and market prices.',
      ],
      terms: [['Break-even', 'The price where profit after premium is zero, before fees.']],
      example: '$3.100 strike + $0.120 call premium = $3.220 break-even at expiry. At $3.200 the call is worth $1,000 but still loses $200 on its $1,200 purchase.',
      task: 'Set the call expiration price to $3.220, then $3.200. Compare value with profit.',
      app: 'The expiration payoff is a future outcome calculation. It is not the current bid or ask quoted for the option.',
    },
    {
      id: 'greeks', title: 'Why an option changes before expiry', visual: 'option-time',
      paragraphs: [
        'Before expiry, an option may be worth more than its intrinsic value because the futures still have time to move. Delta estimates how much its price changes for a small change in the futures price, holding other inputs steady. It is an estimate, not a fixed multiplier forever.',
        'Theta estimates the effect of one day passing with other inputs held steady. Time passing generally hurts a purchased option. Implied volatility is the amount of future variation reflected in an option price; higher volatility generally makes calls and puts more expensive because more outcomes become possible.',
      ],
      terms: [['Delta', 'Approximate sensitivity to a small futures price change.'], ['Theta', 'Approximate sensitivity to one day passing.'], ['Implied volatility', 'Expected price variation reflected in the option quote.']],
      example: 'Delta 0.50 suggests a $0.010 futures rise could add about $0.005 to a call premium, roughly $50 per option. Other inputs can change the result.',
      task: 'Hold futures and strike fixed. Reduce days remaining, then raise volatility and compare option value.',
      app: 'Vol Board lists IV, delta, and theta. Compare both premium and time remaining before treating a low price as a bargain.',
    },
    {
      id: 'daily-routine', title: 'Put the pieces into a trader\'s day', visual: 'day-route',
      paragraphs: [
        'Begin by checking the overnight news and scheduled releases. Write what changed in supply or demand and what evidence would change your view. Then inspect the chart and execution conditions before choosing any trade quantity.',
        'During the session, monitor positions and working exits as new information arrives. At the end, review the reasoning, actual fills, costs, and losses as well as the final profit. A profitable trade can still be poorly planned; a losing trade can still follow a sensible process.',
      ],
      terms: [['Trade thesis', 'Your reason for taking a trade, plus what would change your mind.'], ['Debrief', 'A review of decisions and results after the session.']],
      example: 'Morning: weather demand rises. Before entry: measure risk and spread. After a report: update the view. Closeout: compare intended and actual execution.',
      task: 'Select each stage of the day and connect it with the matching screen in the app.',
      app: 'Use 06:00 Wire, Field Desk, Trade Floor, Vol Board, and Closeout as a repeatable routine, then use Guided Drills for targeted practice.',
      check: { question: 'You paid $1,200 for a call. At expiry it is worth $800. What is your result before fees?', options: ['A profit of $800', 'A loss of $400', 'No loss because the call has value'], correct: 1, explanation: 'Profit is value received minus premium paid: $800 - $1,200 = -$400. A correct directional view does not automatically recover the premium.' },
    },
  ],
}

export const COURSE_SOURCES = [
  { label: 'CME: futures order types', url: 'https://www.cmegroup.com/education/courses/futures-trading-mechanics-and-regulation/futures-order-types' },
  { label: 'CME: futures and options glossary', url: 'https://www.cmegroup.com/education/glossary' },
  { label: 'EIA: natural gas price drivers', url: 'https://www.eia.gov/energyexplained/natural-gas/factors-affecting-natural-gas-prices.php' },
]

export function normalizeLessonProgress(value) {
  const progress = {}
  for (const [lessonId, steps] of Object.entries(LESSON_STEPS)) {
    const saved = value?.[lessonId]
    const ids = new Set(steps.map((step) => step.id))
    const answers = {}
    for (const step of steps) {
      const answer = saved?.answers?.[step.id]
      if (step.check && Number.isInteger(answer) && answer >= 0 && answer < step.check.options.length) answers[step.id] = answer
    }
    progress[lessonId] = {
      current: ids.has(saved?.current) ? saved.current : steps[0].id,
      seen: Array.isArray(saved?.seen) ? [...new Set(saved.seen.filter((id) => ids.has(id)))] : [],
      answers,
    }
  }
  return progress
}

export function lessonReady(lessonId, progress) {
  const steps = LESSON_STEPS[lessonId]
  return steps.every((step) => progress?.seen?.includes(step.id) && (!step.check || progress?.answers?.[step.id] === step.check.correct))
}
