import Dinero from 'dinero.js'

import {
  expect,
  fail
} from 'chai'
import 'mocha'

import * as Calculator from '../dist/src/index'

describe('Pricing module', () => {
  const twoFourNine = Dinero({
    amount: 249 * 100,
    currency: 'EUR'
  })
  const thirtyNine = Dinero({
    amount: 39 * 100,
    currency: 'EUR'
  })
  const fourtyNine = Dinero({
    amount: 49 * 100,
    currency: 'EUR'
  })

  const zeroPrice = Dinero({
    amount: 0,
    currency: 'EUR'
  })

  const invalidProductSetups = [
    ['SANDBOX', 'PLUS_ONE_GB'],
    ['DEVELOPER', 'PLUS_ONE_GB'],
    ['PLUS_ONE_GB'],
    ['PLUS_ONE_GB', 'PLUS_ONE_GB'],
    ['PLUS_ONE_GB', 'PLUS_ONE_GB', 'PLUS_ONE_GB'],
  ]

  it('should give prize 0 for empty array', () => {
    let price = Calculator.calculatePrice([], 1)
    expect(price.totalAmount.equalsTo(zeroPrice)).to.equal(true)

    price = Calculator.calculatePrice([], 10000)
    expect(price.totalAmount.equalsTo(zeroPrice)).to.equal(true)
  })

  it('should charge nothing for sandbox', () => {
    let price = Calculator.calculatePrice(['SANDBOX'], 1)
    expect(price.totalAmount.equalsTo(zeroPrice)).to.equal(true)

    price = Calculator.calculatePrice(['SANDBOX'], 10)
    expect(price.totalAmount.equalsTo(zeroPrice)).to.equal(true)

    price = Calculator.calculatePrice(['SANDBOX'], 100000000)
    expect(price.totalAmount.equalsTo(zeroPrice)).to.equal(true)
  })

  it('should not charge anything for no time', () => {
    expect(Calculator.calculatePrice(['PRODUCTION'], 0).totalAmount.equalsTo(zeroPrice)).to.equal(true)
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
    const price = Calculator.calculatePrice(['PRODUCTION'], 1)

    expect(price.totalAmount.equalsTo(twoFourNine)).to.equal(true)
    expect(price.vatAmount.equalsTo(zeroPrice)).to.equal(true)

    expect(price.vatPercentage).to.equal(0)
  })

  it('should calculate prices for combined products', () => {
    const prodPlusGigabyte = Calculator.calculatePrice(['PRODUCTION', 'PLUS_ONE_GB'], 1)
    expect(prodPlusGigabyte.productAmount.equalsTo(twoFourNine.add(fourtyNine))).
    to.equal(true)

    const prodPlusDeveloper = Calculator.calculatePrice(['PRODUCTION', 'DEVELOPER'], 1)
    expect(prodPlusDeveloper.productAmount.equalsTo(twoFourNine.add(thirtyNine))).
    to.equal(true)
  })

  it('should calculate prices for random ordered combined products', () => {
    expect(Calculator.calculatePrice(
      ['PLUS_ONE_GB', 'PRODUCTION', 'PLUS_ONE_GB', 'DEVELOPER', 'SANDBOX'], 1).productAmount.getAmount()).
    to.be.greaterThan(0)

    expect(Calculator.calculatePrice(
      ['SANDBOX', 'DEVELOPER', 'DEVELOPER'], 1).productAmount.getAmount()).to.be.greaterThan(0)

    expect(Calculator.calculatePrice(
      ['PLUS_ONE_GB', 'PRODUCTION', 'PRODUCTION', 'PRODUCTION', 'PRODUCTION'],
      1).productAmount.getAmount()).to.be.greaterThan(0)
  })
})
