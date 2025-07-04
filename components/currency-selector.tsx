"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CurrencySelectorProps {
  value: string
  onValueChange: (value: string) => void
}

const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
]

export function CurrencySelector({ value, onValueChange }: CurrencySelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-20 sm:w-32 bg-gray-800 border-gray-600 text-white text-xs sm:text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-gray-800 border-gray-600">
        {currencies.map((currency) => (
          <SelectItem
            key={currency.code}
            value={currency.code}
            className="text-white hover:bg-gray-700 text-xs sm:text-sm"
          >
            {currency.code}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
