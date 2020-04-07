// tslint:disable:object-literal-sort-keys
const EURO = 100

export type Product = 'SANDBOX' | 'DEVELOPER' | 'PRODUCTION' | 'PLUS_ONE_GB'
export interface IProductConfig {
  price: number
}

/**
 * Prices given in cents per month
 */
export const PRODUCT_CONFIG: { [key in Product]: IProductConfig } = {
  SANDBOX: { price: 0 * EURO },
  DEVELOPER: { price: 29 * EURO },
  PRODUCTION: { price: 249 * EURO },
  PLUS_ONE_GB: { price: 49 * EURO },
}

const add = (accumulator: number, current: number) => accumulator + current

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
): number {
  assertProductSetup(products)
  assertUsageTime(months)
  if (products.length === 0) {
    return 0
  }
  return products.map(p => PRODUCT_CONFIG[p].price).reduce(add, 0) * months
}
