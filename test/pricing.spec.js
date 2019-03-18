import { expect } from 'chai'
import 'mocha'

import * as Calculator from '../dist/src/index'
import { DailyUsage } from '../dist/src/index'


describe('Pricing module', () => {
  const minPriceForDay = Calculator.DATA_PRICE_RANGES[0]
  const minPricePerQuery = Calculator.QUERY_PRICE_RANGES[1]

  it('should give prize 0 for empty array', () => {
    expect(Calculator.calculatePrice([])).to.equal(0)
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

  it('should calculate sum even when nulls in array', () => {
    expect(Calculator.sumOfArray([null, 1, null, 2, null, 3])).to.equal(6)
  })

  it('should calculate sum even when undefineds in array', () => {
    expect(Calculator.sumOfArray([undefined, 19, undefined, 17, undefined])).to.equal(36)
  })

  it('should calculate the api calls correctly on undefineds', () => {
    const dayPrice = 5 * minPriceForDay
    const queryPrice = 2*1000 * minPricePerQuery

    const day1 = new DailyUsage(0, 1000)
    const day2 = new DailyUsage(0, undefined)
    const day3 = new DailyUsage(0, 1000)
    const day4 = new DailyUsage(0, undefined)
    const day5 = new DailyUsage(0, 1000)

    expect(Calculator.calculatePrice([day1, day2, day3, day4, day5])).to.equal(dayPrice + queryPrice)
  })
})
