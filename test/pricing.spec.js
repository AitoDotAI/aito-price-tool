import { expect } from 'chai'
import 'mocha'

import * as Calculator from '../dist/src/index'

describe('Pricing module', () => {
  const minPriceForDay = Calculator.DATA_PRICE_RANGES[0]
  const minPricePerQuery = Calculator.QUERY_PRICE_RANGES[1]

  it('should give prize 0 for empty array', () => {
    expect(Calculator.calculatePrice([])).to.equal(0)
  })

  it('should calculate sum even when nulls in array', () => {
    expect(Calculator.sumOfArray([null, 1, null, 2, null, 3])).to.equal(6)
  })

  it('should calculate sum even when undefineds in array', () => {
    expect(Calculator.sumOfArray([undefined, 19, undefined, 17, undefined])).to.equal(36)
  })
})
