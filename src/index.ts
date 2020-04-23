// tslint:disable:object-literal-sort-keys
import Dinero from 'dinero.js'

export type Product = 'SANDBOX' | 'DEVELOPER' | 'PRODUCTION' | 'PLUS_ONE_GB'

const EURO = 100

export interface IProductConfig {
  price: Dinero.Dinero
}

const ZERO_PRICE = Dinero({ amount: 0, currency: 'EUR' })

/**
 * Prices given in cents per month
 */
export const PRODUCT_CONFIG: { [key in Product]: IProductConfig } = {
  SANDBOX: { price: ZERO_PRICE },
  DEVELOPER: { price: Dinero({ amount: 39 * EURO, currency: 'EUR' })},
  PRODUCTION: { price: Dinero({ amount: 249 * EURO, currency: 'EUR' })},
  PLUS_ONE_GB: { price: Dinero({ amount: 49 * EURO, currency: 'EUR' })},
}

/**
 *
 */
export interface ITotalPrice {
  totalAmount: Dinero.Dinero,
  vatAmount: Dinero.Dinero,
  vatPercentage: number,
  productAmount: Dinero.Dinero
}

const add = (accumulator: number, current: number) => accumulator + current

/**
 * Value added tax should be given in percentage, not fraction
 * @param vatPercent
 */
function assertVatIsPercent(vatPercent: number): boolean {
  if (vatPercent > 0 && vatPercent < 1) {
    throw new Error(`Vat percent should be given as percent, not fraction. ${vatPercent}`)
  }
  return true
}

function assertProductSetup(products: Product[] = []): boolean {
  if (!products) {
    throw new Error(`Invalid. Undefined or null products.`)
  }

  if (products.indexOf('PLUS_ONE_GB') !== -1 && products.indexOf('PRODUCTION') === -1) {
    throw new Error(`Additional data can only be bought for the production subscription (${products.join(', ')})`)
  }

  return true
}

function assertUsageTime(months: number): boolean {
  if (months < 0) {
    throw new Error(`Cannot calculate prices for negative times (months provided '${months}')`)
  }
  return true
}

export function calculatePrice(
  products: Product[],
  months: number,
  vatPercentage: number = 0,
): ITotalPrice {
  assertProductSetup(products)
  assertUsageTime(months)
  assertVatIsPercent(vatPercentage)

  if (products.length === 0) {
    return {
      totalAmount: ZERO_PRICE,
      vatAmount: ZERO_PRICE,
      productAmount: ZERO_PRICE,
      vatPercentage,
    }
  }

  const basePrice: Dinero.Dinero = products.map(p => PRODUCT_CONFIG[p].price).
    reduce((a: Dinero.Dinero, b: Dinero.Dinero) => a.add(b), ZERO_PRICE)

  const productPriceOverMonths = basePrice.multiply(months)
  const vatAmount = basePrice.multiply(vatPercentage, 'HALF_UP').divide(100, 'HALF_UP')

  return {
    totalAmount: productPriceOverMonths.add(vatAmount),
    vatAmount,
    productAmount: productPriceOverMonths,
    vatPercentage,
  }

}
