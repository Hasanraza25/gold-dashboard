// Gold Price API Integration
export interface GoldPriceSource {
  name: string
  price: number
  currency: string
  timestamp: string
  weight: number // For weighted average calculation
}

export interface GoldRateData {
  price: number
  change: number
  changePercent: number
  currency: string
  sources: GoldPriceSource[]
  lastUpdated: string
}

export interface CurrencyRates {
  [key: string]: number
}

// LBMA Gold Price API (Mock implementation - replace with real API)
export async function fetchLBMAPrice(): Promise<GoldPriceSource> {
  try {
    // In production, replace with actual LBMA API call
    // const response = await fetch('https://api.lbma.org.uk/v1/gold-price');

    // Mock data simulating LBMA AM/PM fix
    const mockPrice = 2650 + (Math.random() - 0.5) * 50

    return {
      name: "LBMA",
      price: mockPrice,
      currency: "USD",
      timestamp: new Date().toISOString(),
      weight: 0.4, // Highest weight for LBMA as it's the benchmark
    }
  } catch (error) {
    console.error("LBMA API error:", error)
    throw error
  }
}

// COMEX Futures Price (CME Group)
export async function fetchCOMEXPrice(): Promise<GoldPriceSource> {
  try {
    // In production, replace with actual CME/COMEX API
    // const response = await fetch('https://api.cmegroup.com/v1/gold-futures');

    const mockPrice = 2655 + (Math.random() - 0.5) * 40

    return {
      name: "COMEX",
      price: mockPrice,
      currency: "USD",
      timestamp: new Date().toISOString(),
      weight: 0.25,
    }
  } catch (error) {
    console.error("COMEX API error:", error)
    throw error
  }
}

// Forex XAU/USD Price
export async function fetchForexPrice(): Promise<GoldPriceSource> {
  try {
    // In production, use forex APIs like OANDA, Alpha Vantage, or Fixer.io
    // const response = await fetch('https://api.fixer.io/latest?symbols=XAU&base=USD');

    const mockPrice = 2648 + (Math.random() - 0.5) * 45

    return {
      name: "Forex (XAU/USD)",
      price: mockPrice,
      currency: "USD",
      timestamp: new Date().toISOString(),
      weight: 0.2,
    }
  } catch (error) {
    console.error("Forex API error:", error)
    throw error
  }
}

// Bullion Dealers Aggregate (Kitco, APMEX, etc.)
export async function fetchBullionDealersPrice(): Promise<GoldPriceSource> {
  try {
    // In production, aggregate from multiple dealer APIs
    // const kitcoResponse = await fetch('https://api.kitco.com/v1/gold-price');
    // const apmexResponse = await fetch('https://api.apmex.com/v1/spot-prices');

    const mockPrice = 2652 + (Math.random() - 0.5) * 35

    return {
      name: "Bullion Dealers",
      price: mockPrice,
      currency: "USD",
      timestamp: new Date().toISOString(),
      weight: 0.15,
    }
  } catch (error) {
    console.error("Bullion Dealers API error:", error)
    throw error
  }
}

// Currency conversion rates
export async function fetchCurrencyRates(): Promise<CurrencyRates> {
  try {
    // In production, use ECB, OANDA, or similar forex API
    // const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');

    // Mock currency rates
    return {
      USD: 1.0,
      EUR: 0.85,
      GBP: 0.73,
      JPY: 110.0,
      CAD: 1.25,
      AUD: 1.35,
      CHF: 0.92,
      CNY: 6.45,
    }
  } catch (error) {
    console.error("Currency API error:", error)
    return { USD: 1.0 } // Fallback to USD only
  }
}

// Calculate weighted average from multiple sources
export function calculateWeightedAverage(sources: GoldPriceSource[]): number {
  const totalWeight = sources.reduce((sum, source) => sum + source.weight, 0)
  const weightedSum = sources.reduce((sum, source) => sum + source.price * source.weight, 0)

  return weightedSum / totalWeight
}

// Main function to fetch aggregated gold price
export async function fetchAggregatedGoldPrice(currency = "USD"): Promise<GoldRateData> {
  try {
    // Fetch from all sources in parallel
    const [lbma, comex, forex, dealers, currencyRates] = await Promise.allSettled([
      fetchLBMAPrice(),
      fetchCOMEXPrice(),
      fetchForexPrice(),
      fetchBullionDealersPrice(),
      fetchCurrencyRates(),
    ])

    // Collect successful sources
    const sources: GoldPriceSource[] = []

    if (lbma.status === "fulfilled") sources.push(lbma.value)
    if (comex.status === "fulfilled") sources.push(comex.value)
    if (forex.status === "fulfilled") sources.push(forex.value)
    if (dealers.status === "fulfilled") sources.push(dealers.value)

    if (sources.length === 0) {
      throw new Error("No gold price sources available")
    }

    // Calculate weighted average price in USD
    const avgPriceUSD = calculateWeightedAverage(sources)

    // Convert to requested currency
    const rates = currencyRates.status === "fulfilled" ? currencyRates.value : { USD: 1.0 }
    const conversionRate = rates[currency] || 1.0
    const finalPrice = avgPriceUSD * conversionRate

    // Calculate change (mock for now - in production, compare with previous price)
    const previousPrice = finalPrice * (1 + (Math.random() - 0.5) * 0.02)
    const change = finalPrice - previousPrice
    const changePercent = (change / previousPrice) * 100

    return {
      price: finalPrice,
      change: change,
      changePercent: changePercent,
      currency: currency,
      sources: sources,
      lastUpdated: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Error fetching aggregated gold price:", error)
    throw error
  }
}

// Real-time price streaming simulation
export class GoldPriceStream {
  private listeners: ((data: GoldRateData) => void)[] = []
  private interval: NodeJS.Timeout | null = null
  private currency = "USD"

  constructor(currency = "USD") {
    this.currency = currency
  }

  subscribe(callback: (data: GoldRateData) => void) {
    this.listeners.push(callback)

    if (this.listeners.length === 1) {
      this.startStreaming()
    }
  }

  unsubscribe(callback: (data: GoldRateData) => void) {
    this.listeners = this.listeners.filter((listener) => listener !== callback)

    if (this.listeners.length === 0) {
      this.stopStreaming()
    }
  }

  private async startStreaming() {
    // Initial fetch
    try {
      const data = await fetchAggregatedGoldPrice(this.currency)
      this.notifyListeners(data)
    } catch (error) {
      console.error("Initial gold price fetch failed:", error)
    }

    // Set up periodic updates (every 30 seconds for production, 5 seconds for demo)
    this.interval = setInterval(async () => {
      try {
        const data = await fetchAggregatedGoldPrice(this.currency)
        this.notifyListeners(data)
      } catch (error) {
        console.error("Gold price update failed:", error)
      }
    }, 5000) // 5 seconds for demo, use 30000 (30 seconds) for production
  }

  private stopStreaming() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  }

  private notifyListeners(data: GoldRateData) {
    this.listeners.forEach((listener) => listener(data))
  }

  changeCurrency(newCurrency: string) {
    this.currency = newCurrency
    // Restart streaming with new currency
    if (this.interval) {
      this.stopStreaming()
      this.startStreaming()
    }
  }
}
