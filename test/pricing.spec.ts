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

  it('should start accumulating query costs after 1000 divided on multiple days', () => {
    const day1 = new DailyUsage(0, 333)
    const day2 = new DailyUsage(0, 334)
    const day3 = new DailyUsage(0, 334)

    expect(Calculator.calculatePrice([day1, day2, day3])).to.equal(3 * minPriceForDay + minPricePerQuery)
  })

  it('should not break for invalid numbers', () => {
    expect(Calculator.calculatePrice([new DailyUsage(0, -1)])).to.equal(minPriceForDay)
  })

  it('should calculate max and average queries', () => {
    const day1 = new DailyUsage(0, 333)
    const day2 = new DailyUsage(0, 334)
    const day3 = new DailyUsage(0, 334)

    expect(Calculator.calculateNumberOfQueries([day1, day2, day3])).to.equal(1001)
    expect(Calculator.calculateAverageNumberOfQueries([day1, day2, day3])).to.be.within(333, 334)
  })

  it('should calculate the max data correctly', () => {
    const day1 = new DailyUsage(11, 0)
    const day2 = new DailyUsage(23, 0)
    const day3 = new DailyUsage(13, 0)

    expect(Calculator.calculateMaxData([day1, day2, day3])).to.equal(23)
  })

  it('should calculate the average data correctly', () => {
    const day1 = new DailyUsage(1, 0)
    const day2 = new DailyUsage(2, 0)
    const day3 = new DailyUsage(3, 0)

    expect(Calculator.calculateAverageData([day1, day2, day3])).to.equal(2)
  })
})
