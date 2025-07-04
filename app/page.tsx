"use client"

import { useState, useEffect, useRef } from "react"
import { type GoldRateData, GoldPriceStream } from "@/lib/gold-api"
import { CurrencySelector } from "@/components/currency-selector"
import { SourceIndicator } from "@/components/source-indicator"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export default function GoldDashboard() {
  const [goldData, setGoldData] = useState<GoldRateData | null>(null)
  const [selectedCurrency, setSelectedCurrency] = useState("USD")
  const [tokensRemaining, setTokensRemaining] = useState(84200.25)
  const [isLoading, setIsLoading] = useState(true)
  const streamRef = useRef<GoldPriceStream | null>(null)

  // Currency symbols mapping
  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      CAD: "C$",
      AUD: "A$",
      CHF: "CHF",
      CNY: "¥",
    }
    return symbols[currency] || "$"
  }

  // Initialize gold price stream
  useEffect(() => {
    streamRef.current = new GoldPriceStream(selectedCurrency)

    const handlePriceUpdate = (data: GoldRateData) => {
      setGoldData(data)
      setIsLoading(false)
    }

    streamRef.current.subscribe(handlePriceUpdate)

    return () => {
      if (streamRef.current) {
        streamRef.current.unsubscribe(handlePriceUpdate)
      }
    }
  }, [selectedCurrency])

  // Handle currency change
  const handleCurrencyChange = (newCurrency: string) => {
    setSelectedCurrency(newCurrency)
    setIsLoading(true)
    if (streamRef.current) {
      streamRef.current.changeCurrency(newCurrency)
    }
  }

  // Simulate token purchases
  useEffect(() => {
    const interval = setInterval(() => {
      setTokensRemaining((prev) => Math.max(84000, prev - Math.random() * 0.5))
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  // Generate chart path data
  const generateChartPath = (isGold = true) => {
    const points = []
    const width = 1200
    const height = 200
    const segments = 50

    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * width
      const baseY = height / 2
      const amplitude = 30
      const frequency = 0.02
      const phase = isGold ? 0 : Math.PI / 4
      const trend = goldData ? (goldData.changePercent > 0 ? -0.01 : -0.02) : -0.02

      const y =
        baseY +
        Math.sin(i * frequency + phase) * amplitude +
        Math.sin(i * frequency * 2.5 + phase) * (amplitude * 0.3) +
        Math.sin(i * frequency * 0.5 + phase) * (amplitude * 0.7) +
        i * trend

      points.push(`${x},${Math.max(10, Math.min(height - 10, y))}`)
    }

    return points.join(" ")
  }

  if (isLoading || !goldData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-900 via-yellow-800 to-amber-900 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white text-lg sm:text-xl">Loading live gold rates from multiple sources...</p>
        </div>
      </div>
    )
  }

  const currencySymbol = getCurrencySymbol(selectedCurrency)
  const auxPrice = goldData.price * 0.8 // 20% discount
  const auxChange = goldData.change * 0.8
  const auxChangePercent = goldData.changePercent

  return (
    <div
      className="min-h-screen relative"
      style={{
        background: "linear-gradient(135deg, #8B4513 0%, #DAA520 50%, #B8860B 100%)",
      }}
    >
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative z-10 p-3 sm:p-6">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-4">
            <div className="hidden sm:block"></div>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold text-white tracking-tight leading-tight">
              Today's Gold, Tomorrow's Value
            </h1>
            <div className="flex flex-col items-center sm:items-end gap-2">
              <CurrencySelector value={selectedCurrency} onValueChange={handleCurrencyChange} />
              <div className="text-xs text-white/70 text-center sm:text-right">
                Last updated: {new Date(goldData.lastUpdated).toLocaleTimeString()}
              </div>
            </div>
          </div>
          <p className="text-base sm:text-xl text-white/90 max-w-5xl mx-auto leading-relaxed mb-4 px-2">
            Every AUX1 is directly tied to the live market value of gold—offering a smarter, asset-backed alternative at
            a <span className="font-bold text-yellow-300">20% discount</span>. Buy early, secure more value.
          </p>

          {/* Data Sources */}
          <div className="flex justify-center mb-4 px-2">
            <SourceIndicator sources={goldData.sources} />
          </div>
        </div>

        {/* Main Dashboard Container */}
        <div className="max-w-7xl mx-auto">
          <div
            className="rounded-2xl sm:rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            {/* Top Cards Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
              {/* Live Gold Spot Price */}
              <div className="p-4 sm:p-8 border-b lg:border-b-0 lg:border-r border-white/10">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full"></div>
                  <h3 className="text-white font-semibold text-base sm:text-lg">Live Gold Spot Price</h3>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm sm:text-lg">1 oz:</span>
                    <span className="text-xl sm:text-3xl font-bold text-white">
                      {currencySymbol}
                      {goldData.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm sm:text-lg">¼ oz:</span>
                    <span className="text-base sm:text-xl text-white">
                      {currencySymbol}
                      {(goldData.price / 4).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-2 sm:gap-4 mt-4 sm:mt-6">
                    <Badge variant={goldData.change >= 0 ? "default" : "destructive"} className="text-xs sm:text-sm">
                      {goldData.change >= 0 ? "+" : ""}
                      {goldData.change.toFixed(2)}
                    </Badge>
                    <Badge
                      variant={goldData.changePercent >= 0 ? "default" : "destructive"}
                      className="text-xs sm:text-sm"
                    >
                      {goldData.changePercent >= 0 ? "+" : ""}
                      {goldData.changePercent.toFixed(2)}%
                    </Badge>
                  </div>
                </div>
              </div>

              {/* AUX1 Coin Price */}
              <div className="p-4 sm:p-8 border-b lg:border-b-0 lg:border-r border-white/10">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 rounded-full"></div>
                  <h3 className="text-white font-semibold text-base sm:text-lg">AUX1 Coin Price</h3>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm sm:text-lg">1 oz Token:</span>
                    <span className="text-xl sm:text-3xl font-bold text-white">
                      {currencySymbol}
                      {auxPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm sm:text-lg">¼ oz Token:</span>
                    <span className="text-base sm:text-xl text-white">
                      {currencySymbol}
                      {(auxPrice / 4).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-2 sm:gap-4 mt-4 sm:mt-6">
                    <Badge variant={auxChange >= 0 ? "default" : "destructive"} className="text-xs sm:text-sm">
                      {auxChange >= 0 ? "+" : ""}
                      {auxChange.toFixed(2)}
                    </Badge>
                    <Badge variant={auxChangePercent >= 0 ? "default" : "destructive"} className="text-xs sm:text-sm">
                      {auxChangePercent >= 0 ? "+" : ""}
                      {auxChangePercent.toFixed(2)}%
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Tokens Remaining */}
              <div className="p-4 sm:p-8">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 rounded-full"></div>
                  <h3 className="text-white font-semibold text-base sm:text-lg">Tokens Remaining</h3>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-4xl font-bold text-yellow-400 mb-2">
                    {tokensRemaining.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div className="text-gray-400 text-sm sm:text-lg">available</div>
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div className="p-4 sm:p-8">
              <div className="h-48 sm:h-64 lg:h-80 relative bg-black/30 rounded-xl overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 1200 300" preserveAspectRatio="none">
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <line
                      key={`h-${i}`}
                      x1="0"
                      y1={i * 60}
                      x2="1200"
                      y2={i * 60}
                      stroke="rgba(255, 255, 255, 0.05)"
                      strokeWidth="1"
                    />
                  ))}
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                    <line
                      key={`v-${i}`}
                      x1={i * 120}
                      y1="0"
                      x2={i * 120}
                      y2="300"
                      stroke="rgba(255, 255, 255, 0.05)"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Gold price line (red) */}
                  <polyline
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    points={generateChartPath(true)}
                    style={{
                      filter: "drop-shadow(0 0 4px rgba(239, 68, 68, 0.5))",
                    }}
                  />

                  {/* AUX1 price line (yellow) */}
                  <polyline
                    fill="none"
                    stroke="#eab308"
                    strokeWidth="2"
                    points={generateChartPath(false)}
                    style={{
                      filter: "drop-shadow(0 0 4px rgba(234, 179, 8, 0.5))",
                    }}
                  />
                </svg>

                {/* Time labels */}
                <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 flex justify-between text-gray-400 text-sm sm:text-lg px-4 sm:px-8">
                  <span>09:30</span>
                  <span>16:00</span>
                </div>

                {/* Performance indicators */}
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 text-right">
                  <div
                    className={`text-lg sm:text-2xl font-bold mb-1 ${goldData.changePercent >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {goldData.changePercent >= 0 ? "+" : ""}
                    {goldData.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Sources Information */}
          <Card className="mt-4 sm:mt-6 bg-black/40 border-white/10">
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-white font-semibold mb-4 text-center sm:text-left">Live Data Sources</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm">
                <div className="text-gray-300 text-center sm:text-left">
                  <div className="font-semibold text-red-400">LBMA (40% weight)</div>
                  <div>London Bullion Market Association</div>
                  <div>Global benchmark pricing</div>
                </div>
                <div className="text-gray-300 text-center sm:text-left">
                  <div className="font-semibold text-yellow-400">COMEX (25% weight)</div>
                  <div>CME Group Futures</div>
                  <div>Real-time trading prices</div>
                </div>
                <div className="text-gray-300 text-center sm:text-left">
                  <div className="font-semibold text-blue-400">Forex (20% weight)</div>
                  <div>XAU/USD Currency Pairs</div>
                  <div>Interbank trading</div>
                </div>
                <div className="text-gray-300 text-center sm:text-left">
                  <div className="font-semibold text-green-400">Dealers (15% weight)</div>
                  <div>Bullion Dealers Aggregate</div>
                  <div>Retail-focused pricing</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Legend for mobile */}
        <div className="flex justify-center gap-4 sm:gap-6 mt-4 sm:mt-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-300 text-xs sm:text-sm">Live Gold Price</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-300 text-xs sm:text-sm">AUX1 Token Price</span>
          </div>
        </div>
      </div>
    </div>
  )
}
