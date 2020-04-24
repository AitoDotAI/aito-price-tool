import Dinero from 'dinero.js'

import {
  assert,
  expect
} from 'chai'
import 'mocha'

import { Product } from '../src/index'
import * as Calculator from '../src/index'

describe('Pricing module', () => {
  const twoFourNine = Dinero({ amount: 249 * 100, currency: 'EUR' })
  const thirtyNine = Dinero({ amount: 39 * 100, currency: 'EUR' })
  const fourtyNine = Dinero({ amount: 49 * 100, currency: 'EUR' })

  const zeroPrice = Dinero({ amount: 0, currency: 'EUR'})

  const invalidProductSetups: Calculator.Product[][] = [
    [Product.Sandbox, Product.PlusOneGigabyte],
    [Product.Developer, Product.PlusOneGigabyte],
    [Product.PlusOneGigabyte],
    [Product.PlusOneGigabyte, Product.PlusOneGigabyte],
    [Product.PlusOneGigabyte, Product.PlusOneGigabyte, Product.PlusOneGigabyte],
  ]

  it('should give prize 0 for empty array', () => {
    let price = Calculator.calculatePrice([], 1)
    expect(price.totalAmount.equalsTo(zeroPrice)).to.equal(true)

    price = Calculator.calculatePrice([], 10000)
    expect(price.totalAmount.equalsTo(zeroPrice)).to.equal(true)
  })

  it('should charge nothing for sandbox', () => {
    let price = Calculator.calculatePrice([Product.Sandbox], 1)
    expect(price.totalAmount.equalsTo(zeroPrice)).to.equal(true)

    price = Calculator.calculatePrice([Product.Sandbox], 10)
    expect(price.totalAmount.equalsTo(zeroPrice)).to.equal(true)

    price = Calculator.calculatePrice([Product.Sandbox], 100000000)
    expect(price.totalAmount.equalsTo(zeroPrice)).to.equal(true)
  })

  it('should not charge anything for no time', () => {
    expect(Calculator.calculatePrice([Product.Production], 0).
      totalAmount.equalsTo(zeroPrice)).to.equal(true)
  })

  it('should throw error for invalid time', () => {
    try {
      Calculator.calculatePrice([Product.Sandbox], -1)
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
    const price = Calculator.calculatePrice([Product.Production], 1)

    expect(price.totalAmount.equalsTo(twoFourNine)).to.equal(true)
    expect(price.vatAmount.equalsTo(zeroPrice)).to.equal(true)

    expect(price.vatPercentage).to.equal(0)
  })

  it('should calculate prices for combined products', () => {
    const prodPlusGigabyte = Calculator.calculatePrice([Product.Production, Product.PlusOneGigabyte], 1)
    expect(prodPlusGigabyte.productAmount.equalsTo(twoFourNine.add(fourtyNine))).
      to.equal(true)

    const prodPlusDeveloper = Calculator.calculatePrice([Product.Production, Product.Developer], 1)
    expect(prodPlusDeveloper.productAmount.equalsTo(twoFourNine.add(thirtyNine))).
      to.equal(true)
  })

  it('should calculate prices for random ordered combined products', () => {
    expect(Calculator.calculatePrice(
      [Product.PlusOneGigabyte, Product.Production, Product.PlusOneGigabyte,
        Product.Developer, Product.Sandbox], 1).productAmount.getAmount()).
    to.be.greaterThan(0)

    expect(Calculator.calculatePrice([Product.Sandbox, Product.Developer, Product.Developer], 1).
      productAmount.getAmount()).to.be.greaterThan(0)

    expect(Calculator.calculatePrice(
      [Product.PlusOneGigabyte, Product.Production, Product.Production, Product.Production, Product.Production],
      1).productAmount.getAmount()).to.be.greaterThan(0)
  })

  it('should return the vat amount and percentage as part of the response', () => {
    const price = Calculator.calculatePrice([Product.Production], 1, 24)

    expect(price.productAmount.equalsTo(twoFourNine)).to.equal(true)
    expect(price.vatPercentage).to.equal(24)

    expect(price.vatAmount.getAmount()).to.equal(5976)
    expect(price.vatAmount.getCurrency()).to.equal('EUR')

    expect(price.totalAmount.getAmount()).to.equal(24900 + 5976)
  })

  it('should round vat sum up by default', () => {
    const price = Calculator.calculatePrice([Product.Developer], 1, 1.5)

    expect(price.vatPercentage).to.equal(1.5)

    expect(price.vatAmount.getAmount()).to.equal(59)
    expect(price.vatAmount.getCurrency()).to.equal('EUR')
  })

  describe(' without product validation ', () => {
    it('should allow calculation of prices for invalid product setups', () => {
      for (const ips of invalidProductSetups) {
        const price = Calculator.calculatePrice(ips, 1, 0, false)
        expect(price.totalAmount.getAmount()).to.be.greaterThan(0)
      }
    })

    it('should allow getting just the price of data', () => {
      const dataArray: Product[] = Array(4)
      dataArray.fill(Product.PlusOneGigabyte, 0, 4)

      const price = Calculator.calculatePrice(dataArray, 1, 0, false)
      expect(price.totalAmount.getAmount()).to.equal(196 * 100)
    })
  })
})
