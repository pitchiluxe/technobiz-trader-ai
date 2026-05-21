## Project Name
TechnoBiz Trader AI — Advanced TradingView Clone with AI Market Analyst

## Mission
Build a full-featured TradingView-inspired web application using TradingView Lightweight Charts that provides professional-grade charting, AI-powered market analysis, live market data, multi-layout workspaces, watchlists, indicators, strategy tools, and AI-generated trade signals.

The platform must feel modern, fast, smooth, and production-grade like TradingView.

This project must be optimized for:
- Real-time trading
- AI-assisted decision making
- Multi-market analysis
- Scalability
- Modular architecture
- Fast rendering
- Clean UI/UX
- Deployability to GitHub + Vercel

---

# Core Stack

## Frontend
- Next.js 15+
- React 19+
- TypeScript
- TailwindCSS
- ShadCN/UI
- Zustand for state
- TradingView Lightweight Charts
- Framer Motion
- React Query / TanStack Query
- Socket.io-client
- React Hook Form
- Zod validation

## Backend
- Node.js
- Express OR Next.js API routes
- Python microservices for AI analysis
- Flask for Python AI bridge
- WebSocket server
- Redis (optional for scaling)
- PostgreSQL or Supabase

## AI
- Ollama (local AI inference)
- OpenRouter API
- Claude models
- DeepSeek
- Mistral
- Llama
- Qwen
- Gemma
- Mixtral

Claude must automatically discover:
- `.env.local`
- `/workflow`
- `/services`
- `/ai`
directories.

Claude must never hardcode API keys.

---

# Main Objective

Create a professional clone of TradingView with:
- Advanced charting
- AI trading assistant
- Smart signal generation
- Multi-layout dashboards
- Real-time streaming
- AI market analysis
- AI trade planning
- Email notifications
- Workspace persistence
- Cross-market support

---

# Required Features

# 1. Multi-Chart Dashboard

Implement dynamic chart layouts:

Supported layouts:
- 1 chart
- 2 charts
- 4 charts
- 6 charts
- 8 charts

Requirements:
- Fully responsive
- Resizable panels
- Drag-and-drop panes
- Persistent layouts
- Save workspace locally
- Restore previous session
- Smooth animations

Examples:
- 1 = Fullscreen
- 2 = Side-by-side
- 4 = 2x2
- 6 = 3x2
- 8 = 4x2

---

# 2. TradingView Lightweight Charts

Use:
https://github.com/tradingview/lightweight-charts

Must support:
- Candlestick charts
- Area charts
- Baseline charts
- Histogram
- Volume overlays
- Crosshair sync
- Multi-timeframe
- Zoom
- Pan
- Auto-scale
- Multiple indicators
- Drawing tools

---

# 3. Advanced Trading Features

Implement:
- Watchlist
- Market screener
- Favorites
- Symbol search
- Hotlists
- Market overview
- Heatmap
- News panel
- Economic calendar
- Order panel simulation

---

# 4. Technical Indicators

Support:
- RSI
- MACD
- EMA
- SMA
- VWAP
- Bollinger Bands
- ATR
- Fibonacci
- Stochastic
- Volume profile

Indicators must be:
- Toggleable
- Editable
- Persisted in workspace

---

# 5. AI Trading Analyst (MOST IMPORTANT)

The AI system is the heart of the platform.

Use:
- Ollama locally
- OpenRouter remotely
- Claude
- DeepSeek
- Mistral
- Llama
- Qwen
- Mixtral

The AI must act like a professional institutional trader.

Capabilities:
- Analyze charts
- Detect trend
- Detect liquidity
- Detect support/resistance
- Detect order blocks
- Detect fair value gaps
- Detect supply/demand
- Detect breakouts
- Detect reversals
- Detect manipulation
- Detect volatility

The AI must provide:
- Market bias
- Entry point
- Stop loss
- Take profit
- Risk/reward ratio
- Trade confidence score
- Multi-timeframe confirmation
- Trade explanation
- Market structure analysis

---

# 6. AI Signal Engine

When user requests:
"Analyze BTCUSD"
or
"Analyze NAS100"

The AI should:
1. Pull live market data
2. Analyze current trend
3. Analyze indicators
4. Analyze market structure
5. Generate trade setup
6. Generate risk profile
7. Generate probabilities
8. Display visual annotations

Return:
- Entry
- Stop loss
- Take profit
- Confidence %
- Long/Short recommendation
- Timeframe alignment
- AI explanation

---

# 7. Email Signal Delivery

The AI must be able to:
- Send signals to email
- Use Gmail SMTP
- Support custom user emails
- Queue signals
- Save signal history

Default email:
technobiztrader@gmail.com

Users can also specify:
- Their own email
- Multiple recipients

Signals should include:
- Screenshot
- Chart image
- Trade setup
- SL/TP
- AI reasoning

---

# 8. Live Data Sources

Create modular provider system.

Supported providers:
- Binance
- Hyperliquid
- Alpaca
- Polygon
- Yahoo Finance
- Finnhub
- Zerodha
- TwelveData

Architecture:
```ts
/services/dataProviders/