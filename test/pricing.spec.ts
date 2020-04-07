import {
  assert,
  expect
} from 'chai'
import 'mocha'

import * as Calculator from '../src/index'

describe('Pricing module', () => {

  const invalidProductSetups: Calculator.Product[][] = [
    ['SANDBOX', 'PLUS_ONE_GB'],
    ['DEVELOPER', 'PLUS_ONE_GB'],
    ['PLUS_ONE_GB'],
    ['PLUS_ONE_GB', 'PLUS_ONE_GB'],
    ['PLUS_ONE_GB', 'PLUS_ONE_GB', 'PLUS_ONE_GB'],
  ]

  it('should give prize 0 for empty array', () => {
    expect(Calculator.calculatePrice([], 1)).to.equal(0)
    expect(Calculator.calculatePrice([], 10000)).to.equal(0)
  })

  it('should charge nothing for sandbox', () => {
    expect(Calculator.calculatePrice(['SANDBOX'], 1)).to.equal(0)
    expect(Calculator.calculatePrice(['SANDBOX'], 10)).to.equal(0)
    expect(Calculator.calculatePrice(['SANDBOX'], 100000000)).to.equal(0)
  })

  it('should not charge anything for no time', () => {
    expect(Calculator.calculatePrice(['PRODUCTION'], 0)).to.equal(0)
  })

  it('should throw error for invalid time', () => {
    try {
      Calculator.calculatePrice(['SANDBOX'], -1)
      assert.fail(`Accepted negative time (-1)`)
    } catch (error) {
      expect(error.message).to.contain('negative time')
      // passed
    }
  })

  it('should throw error for invalid products', () => {
    for (const ips of invalidProductSetups) {
      try {
        Calculator.calculatePrice(ips, 0)
        assert.fail(`Accepted mismatched product setup`)
      } catch (error) {
        expect(error.message).to.contain('only be bought')
        // passed
      }
    }
  })

  it('should calculate prices for single products', () => {
    expect(Calculator.calculatePrice(['PRODUCTION'], 1)).to.equal(24900)
  })

  it('should calculate prices for combined products', () => {
    expect(Calculator.calculatePrice(['PRODUCTION', 'PLUS_ONE_GB'], 1)).to.equal(24900 + 4900)
    expect(Calculator.calculatePrice(['PRODUCTION', 'DEVELOPER'], 1)).to.equal(24900 + 3900)
  })

  it('should calculate prices for random ordered combined products', () => {
    expect(Calculator.calculatePrice(
      ['PLUS_ONE_GB', 'PRODUCTION', 'PLUS_ONE_GB', 'DEVELOPER', 'SANDBOX'], 1)).to.be.greaterThan(0)

    expect(Calculator.calculatePrice(
      ['SANDBOX', 'DEVELOPER', 'DEVELOPER'], 1)).to.be.greaterThan(0)

    expect(Calculator.calculatePrice(
      ['PLUS_ONE_GB', 'PRODUCTION', 'PRODUCTION', 'PRODUCTION', 'PRODUCTION'],
      1)).to.be.greaterThan(0)
  })
})
