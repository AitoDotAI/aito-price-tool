import { expect } from 'chai'
import 'mocha'

import * as Calculator from '../src/index'
import { DailyUsage } from '../src/index'

describe('Pricing module', () => {
  const minPriceForDay = Calculator.DATA_PRICE_RANGES[0]
  const minPricePerQuery = Calculator.QUERY_PRICE_RANGES[1]

  it('should give prize 0 for empty array', () => {
    expect(Calculator.calculatePrice([])).to.equal(0)
  })

  it('should give min price for single min data', () => {

    expect(Calculator.calculatePrice([new DailyUsage(0, 0)])).to.equal(minPriceForDay)
  })

  it('should allow first 1000 queries for free', () => {
    expect(Calculator.calculatePrice([new DailyUsage(0, 1)])).to.equal(minPriceForDay)
    expect(Calculator.calculatePrice([new DailyUsage(0, 999)])).to.equal(minPriceForDay)
    expect(Calculator.calculatePrice([new DailyUsage(0, 1000)])).to.equal(minPriceForDay)
  })

  it('should start accumulating query costs after 1000', () => {
    expect(Calculator.calculatePrice([new DailyUsage(0, 1001)])).to.equal(minPriceForDay + minPricePerQuery)
  })

  it('should not break for invalid numbers', () => {
    expect(Calculator.calculatePrice([new DailyUsage(0, -1)])).to.equal(minPriceForDay)
  })

})
