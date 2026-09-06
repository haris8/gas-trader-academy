export const TRAINING_LESSONS = [
  {
    id: 'contract',
    number: '01',
    title: 'The NG Contract',
    label: 'Contract mechanics',
    duration: '6 min',
    level: 'Foundation',
    summary: 'Learn what one Henry Hub futures contract represents and why small price moves create meaningful P&L.',
    objectives: [
      'Read an NG futures quote in dollars per MMBtu.',
      'Convert ticks into contract P&L.',
      'Separate margin from the economic value of the contract.',
    ],
    sections: [
      {
        title: 'What you are trading',
        body: 'One standard NG futures contract represents 10,000 MMBtu of natural gas priced at Henry Hub. The simulator uses NGV6 as its training contract: NG is natural gas, V is the October month code, and 6 is the training year.',
      },
      {
        title: 'Tick math',
        body: 'NG is quoted in dollars per MMBtu. The minimum simulated move is 0.001. Multiply 0.001 by 10,000 MMBtu and one tick is worth $10 per contract. A move from 3.100 to 3.137 is 37 ticks, or $370 per contract.',
      },
      {
        title: 'Margin is a performance bond',
        body: 'The simulator reserves $4,200 of margin per open contract. Margin is not the purchase price and it is not the maximum loss. It is collateral that makes leverage possible, so available funds and drawdown matter as much as the entry price.',
      },
    ],
    calculation: '2 contracts x 37 ticks x $10 = $740',
    takeaway: 'Always translate the planned stop distance into dollars before sending the order.',
  },
  {
    id: 'tape',
    number: '02',
    title: 'Read the Tape',
    label: 'Quotes and candles',
    duration: '7 min',
    level: 'Foundation',
    summary: 'Turn the quote strip, candlesticks, volume, and spread into a concise view of current conditions.',
    objectives: [
      'Read open, high, low, and close from a candle.',
      'Distinguish last price from bid and ask.',
      'Recognize when a wider spread raises execution cost.',
    ],
    sections: [
      {
        title: 'Four prices in every candle',
        body: 'Each candle summarizes a 15-minute auction. The body connects open and close; the wick shows the high and low. A green body closed above its open. A red body closed below it. Candle color alone does not prove what happens next.',
      },
      {
        title: 'Last, bid, and ask',
        body: 'The large quote is the latest traded price. Buyers currently advertise the bid and sellers advertise the ask. A market buy crosses to the ask; a market sell crosses to the bid. The distance between them is the spread.',
      },
      {
        title: 'Volume adds context',
        body: 'A move on expanding volume usually carries more information than the same move on quiet volume. Compare the candle to nearby bars and scheduled catalysts instead of reading one bar in isolation.',
      },
    ],
    calculation: 'Buy 3.112 / sell 3.109 = 3 ticks = $30 per contract',
    takeaway: 'Price tells you where the auction moved; spread and volume tell you how it moved.',
  },
  {
    id: 'orders',
    number: '03',
    title: 'Order Mechanics',
    label: 'Execution controls',
    duration: '10 min',
    level: 'Core desk',
    summary: 'Choose market, limit, stop, and stop-limit orders intentionally, then control their lifetime and risk.',
    objectives: [
      'Match each order type to its execution tradeoff.',
      'Place protective orders on the correct side of the market.',
      'Use DAY, GTC, reduce-only, and OCO brackets correctly.',
    ],
    sections: [
      {
        title: 'Market versus limit',
        body: 'A market order prioritizes execution, not price. It walks available book levels until filled or liquidity runs out. A limit order sets the worst acceptable price, but it may rest without filling. A marketable limit can execute immediately up to its limit.',
      },
      {
        title: 'Stops become active later',
        body: 'A stop-market order becomes a market order after its trigger trades. A stop-limit order becomes a limit order after triggering, so it controls price but can miss the exit. A protective sell stop for a long position belongs below the market; a protective buy stop for a short belongs above it.',
      },
      {
        title: 'Order controls',
        body: 'DAY orders expire at settlement while GTC orders remain working. Reduce-only prevents an exit from accidentally opening a reverse position. An attached OCO bracket links a protective stop and profit target so one cancels when the other fills.',
      },
    ],
    calculation: 'Entry 3.100 with a 0.035 stop = 35 ticks = $350 risk per contract',
    takeaway: 'Order type controls uncertainty: market orders accept price uncertainty; limit orders accept fill uncertainty.',
  },
  {
    id: 'liquidity',
    number: '04',
    title: 'Book and Liquidity',
    label: 'Depth and partial fills',
    duration: '8 min',
    level: 'Core desk',
    summary: 'Use the order book and DOM to estimate slippage, queue risk, and the chance of a partial fill.',
    objectives: [
      'Read size and cumulative depth at each price.',
      'Explain why large orders receive multiple fill prices.',
      'Stage a limit order directly from the DOM ladder.',
    ],
    sections: [
      {
        title: 'Displayed depth',
        body: 'Each ask row is displayed sell liquidity and each bid row is displayed buy liquidity. Size is available at that level; total is cumulative depth through that level. Displayed depth can change, so it is evidence, not a guarantee.',
      },
      {
        title: 'Slippage and partial fills',
        body: 'If order size exceeds the best level, a market order walks to worse prices. Its average fill becomes a volume-weighted blend. A limit order may fill only the available quantity at eligible prices and leave the balance working.',
      },
      {
        title: 'Dynamic spread',
        body: 'The simulator widens and narrows the spread as volatility and liquidity change. A one-tick spread is cheaper to cross than a three-tick spread. Around major events, both spread and displayed depth deserve another look before execution.',
      },
    ],
    calculation: '10 at 3.110 + 5 at 3.111 = 15 filled at 3.11033 average',
    takeaway: 'Size the order against visible depth, not just account buying power.',
  },
  {
    id: 'charts',
    number: '05',
    title: 'Chart Workstation',
    label: 'Indicators and drawings',
    duration: '11 min',
    level: 'Core desk',
    summary: 'Use timeframes, benchmarks, volatility bands, and drawing tools without turning the chart into noise.',
    objectives: [
      'Change timeframe without confusing aggregation with new information.',
      'Use SMA, EMA, VWAP, and Bollinger Bands for distinct questions.',
      'Mark structure and measure risk with the drawing toolbar.',
    ],
    sections: [
      {
        title: 'Start with structure',
        body: 'Use the crosshair to inspect exact OHLC values. The horizontal-line tool marks support, resistance, or a catalyst level. The trend-line tool connects meaningful swing points. The ruler measures the tick and dollar distance between two points.',
      },
      {
        title: 'Choose the benchmark',
        body: 'SMA weights each close equally. EMA responds faster to recent prices. VWAP estimates the session average price weighted by volume and is useful for execution context. Bollinger Bands frame dispersion around a moving average; touching a band is not an automatic signal.',
      },
      {
        title: 'A repeatable chart pass',
        body: 'First mark the catalyst high and low. Then compare price with VWAP. Finally measure the distance from a possible entry to invalidation. Add an indicator only when it answers a question that price alone does not.',
      },
    ],
    calculation: '0.052 measured move = 52 ticks = $520 per contract',
    takeaway: 'Draw the level that invalidates the idea before drawing the level that proves it right.',
  },
  {
    id: 'fundamentals',
    number: '06',
    title: 'Balance and Volatility',
    label: 'Fundamentals and options',
    duration: '12 min',
    level: 'Applied',
    summary: 'Connect physical supply and demand to the futures curve, then use options to shape asymmetric risk.',
    objectives: [
      'Classify major gas fundamentals as supply or demand pressures.',
      'Interpret contango and backwardation without treating either as a forecast.',
      'Explain premium, delta, theta, and maximum loss for a long option.',
    ],
    sections: [
      {
        title: 'Build the balance',
        body: 'Hotter summer weather can raise power-burn demand. Higher production adds supply. LNG feedgas exports pull gas from the domestic balance. Storage reports show whether inventories changed more or less than the market expected; the surprise often matters more than the headline number.',
      },
      {
        title: 'Read the curve',
        body: 'Contango means deferred contracts trade above nearby contracts; backwardation means nearby contracts trade above deferred contracts. The shape reflects storage economics, seasonality, and scarcity. It is a relative-price map, not a guaranteed direction call.',
      },
      {
        title: 'Long option risk',
        body: 'A call benefits from higher futures prices and a put benefits from lower prices. The buyer pays premium up front and cannot lose more than premium plus fees. Delta estimates directional sensitivity. Theta estimates daily time decay, which works against a long option as expiry approaches.',
      },
    ],
    calculation: '0.120 premium x 10,000 MMBtu = $1,200 paid per option',
    takeaway: 'Use futures for direct exposure and options when the shape of the risk matters as much as direction.',
  },
]

export const GUIDED_DRILLS = [
  {
    id: 'quote-scan',
    step: '01',
    title: 'Read the inside market',
    target: 'quote',
    evidence: null,
    summary: 'Orient yourself before touching the order ticket.',
    actions: [
      'Read the last price and 15-minute change.',
      'Compare available funds, margin, position, and equity.',
      'Find the current bid, ask, spread, and market condition in Book & Ladder.',
    ],
    success: 'You can state the cost of crossing the spread for one contract.',
  },
  {
    id: 'market-bracket',
    step: '02',
    title: 'Send a protected market order',
    target: 'ticket',
    evidence: 'bracket',
    summary: 'Experience immediate execution while defining the exit before entry.',
    actions: [
      'Choose Buy, Market, and 1 contract.',
      'Leave Attach bracket enabled and inspect both offsets.',
      'Send the order, then inspect the position and two linked OCO orders.',
    ],
    success: 'A market fill and OCO stop/target pair appear in the blotter.',
  },
  {
    id: 'dom-limit',
    step: '03',
    title: 'Stage a limit from the DOM',
    target: 'depth',
    evidence: 'dom',
    summary: 'Use price-level liquidity to prepare an order instead of typing blindly.',
    actions: [
      'Switch Book & Ladder to the DOM view.',
      'Select displayed bid size to stage a buy limit at that price.',
      'Review the populated Order Chit before sending it.',
    ],
    success: 'The ticket is staged from a visible DOM price level.',
  },
  {
    id: 'protective-stop',
    step: '04',
    title: 'Place a protective stop',
    target: 'ticket',
    evidence: 'stop',
    summary: 'Put invalidation into the market as an order, not a hope.',
    actions: [
      'For a long position, choose Sell and Stop Market.',
      'Set the stop below the current bid and enable Reduce only.',
      'Send it and verify its trigger price under Working orders.',
    ],
    success: 'A reduce-only stop is working on the correct side of the market.',
  },
  {
    id: 'partial-fill',
    step: '05',
    title: 'Create a partial fill',
    target: 'depth',
    evidence: 'partial',
    summary: 'See how displayed size controls what can execute at one price.',
    actions: [
      'Note the size available at the best ask.',
      'Send a buy limit at that ask for more than the displayed size.',
      'Compare filled quantity with the remaining working balance.',
    ],
    success: 'The fills tab marks an execution with a remaining balance.',
  },
  {
    id: 'chart-markup',
    step: '06',
    title: 'Mark and measure the chart',
    target: 'chart',
    evidence: 'chart',
    summary: 'Translate a visual idea into a price level and dollar risk.',
    actions: [
      'Select the horizontal-line tool and mark a recent swing level.',
      'Select the ruler, then choose an entry and invalidation point.',
      'Compare the measured dollar risk with available funds.',
    ],
    success: 'A chart annotation is visible and the ruler reports ticks and dollars.',
  },
]

export const QUIZ_QUESTIONS = [
  {
    id: 'tick-value',
    prompt: 'NG rises from 3.100 to 3.137. What is the gain on two long contracts?',
    options: [
      { id: 'a', label: '$74' },
      { id: 'b', label: '$370' },
      { id: 'c', label: '$740' },
      { id: 'd', label: '$7,400' },
    ],
    correct: 'c',
    explanation: 'The move is 37 ticks. At $10 per tick per contract, 37 x $10 x 2 = $740.',
  },
  {
    id: 'market-order',
    prompt: 'What does a market order guarantee in this simulator?',
    options: [
      { id: 'a', label: 'A specific price' },
      { id: 'b', label: 'Execution priority, subject to displayed liquidity' },
      { id: 'c', label: 'A maker rebate' },
      { id: 'd', label: 'No slippage' },
    ],
    correct: 'b',
    explanation: 'A market order prioritizes execution and walks displayed depth. Its final price can differ from the best quote.',
  },
  {
    id: 'buy-limit',
    prompt: 'The market is 3.109 bid / 3.112 ask. Where would a passive buy limit normally rest?',
    options: [
      { id: 'a', label: 'At 3.109 or lower' },
      { id: 'b', label: 'At 3.112 or higher' },
      { id: 'c', label: 'Only at 3.110' },
      { id: 'd', label: 'Above the session high' },
    ],
    correct: 'a',
    explanation: 'A buy limit at the bid or lower supplies liquidity. At or above the ask it becomes marketable.',
  },
  {
    id: 'long-stop',
    prompt: 'Which order is the conventional protection for an existing long futures position?',
    options: [
      { id: 'a', label: 'Buy stop above the ask' },
      { id: 'b', label: 'Sell stop below the bid' },
      { id: 'c', label: 'Sell limit below the bid' },
      { id: 'd', label: 'Buy limit above the ask' },
    ],
    correct: 'b',
    explanation: 'A long position loses as price falls, so its protective exit is a sell stop below the current market.',
  },
  {
    id: 'partial',
    prompt: 'What does a partial fill mean?',
    options: [
      { id: 'a', label: 'The exchange rejected the order' },
      { id: 'b', label: 'The price was rounded' },
      { id: 'c', label: 'Some quantity executed and some remains or was canceled' },
      { id: 'd', label: 'The spread disappeared' },
    ],
    correct: 'c',
    explanation: 'Available liquidity was enough for only part of the requested quantity at eligible prices.',
  },
  {
    id: 'vwap',
    prompt: 'What question is VWAP best suited to answer?',
    options: [
      { id: 'a', label: 'Where was the volume-weighted average session price?' },
      { id: 'b', label: 'What will the next candle close at?' },
      { id: 'c', label: 'How much margin is required?' },
      { id: 'd', label: 'When does an option expire?' },
    ],
    correct: 'a',
    explanation: 'VWAP is an execution and location benchmark built from price weighted by traded volume.',
  },
  {
    id: 'ruler',
    prompt: 'Why use the chart ruler before entering a trade?',
    options: [
      { id: 'a', label: 'To increase displayed liquidity' },
      { id: 'b', label: 'To convert entry-to-stop distance into ticks and dollars' },
      { id: 'c', label: 'To cancel every drawing' },
      { id: 'd', label: 'To tighten the spread' },
    ],
    correct: 'b',
    explanation: 'The ruler turns a visual distance into explicit tick and dollar risk before the position exists.',
  },
  {
    id: 'storage',
    prompt: 'Why can the EIA storage reaction differ from the headline injection or withdrawal?',
    options: [
      { id: 'a', label: 'Only candle color matters' },
      { id: 'b', label: 'The market reacts to the result versus expectations' },
      { id: 'c', label: 'Storage never affects gas' },
      { id: 'd', label: 'Every report is automatically bullish' },
    ],
    correct: 'b',
    explanation: 'Prices tend to respond to surprise relative to consensus and positioning, not the raw number alone.',
  },
  {
    id: 'long-option',
    prompt: 'What is the maximum loss for a purchased option in the simulator?',
    options: [
      { id: 'a', label: 'Unlimited' },
      { id: 'b', label: 'Initial margin' },
      { id: 'c', label: 'Premium paid plus fees' },
      { id: 'd', label: 'The strike price' },
    ],
    correct: 'c',
    explanation: 'A long option cannot fall below zero value, so the buyer risks the premium paid and transaction fees.',
  },
  {
    id: 'reduce-only',
    prompt: 'What problem does reduce-only prevent?',
    options: [
      { id: 'a', label: 'An exit order opening a reverse position' },
      { id: 'b', label: 'A limit order joining the book' },
      { id: 'c', label: 'The session reaching settlement' },
      { id: 'd', label: 'The chart changing timeframe' },
    ],
    correct: 'a',
    explanation: 'Reduce-only caps execution at the quantity available to close, so an oversized exit cannot reverse the position.',
  },
]

export const PASSING_QUIZ_SCORE = 8

export function scoreQuiz(answers) {
  return QUIZ_QUESTIONS.reduce((score, question) => score + (answers[question.id] === question.correct ? 1 : 0), 0)
}
