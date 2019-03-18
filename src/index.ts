export const QUERY_LIMIT_RANGES = [
  0,
  1000,
  10000,
  100000,
  1000000,
  10000000,
  100000000,
  1000000000,
  10000000000,
  100000000000,
]

export const QUERY_PRICE_RANGES = [
  0.00000000,
  0.01000000,
  0.00655555,
  0.00110000,
  0.00021111,
  0.00004333,
  0.00001655,
  0.00001000,
  0.00000165,
  0.00000165,
]

export const DATA_LIMIT_RANGES = [
  0,
  1,
  2,
  4,
  8,
  16,
  32,
  64,
  128,
  256,
  512,
  1024,
]

export const DATA_PRICE_RANGES = [
  6.00000000,
  3.00000000,
  2.00000000,
  0.75000000,
  0.37500000,
  0.25000000,
  0.09375000,
  0.04687500,
  0.03125000,
  0.01171875,
  0.00585937,
  0.00585937,
]

export class DailyUsage {
  public dataUsage: number
  public totalCalls: number

  constructor(dataUsage: number, totalCalls: number) {
    this.dataUsage = dataUsage
    this.totalCalls = totalCalls
  }
}

export const MIN_DATA_PRICE = Math.round(DATA_PRICE_RANGES[0])

/**
 * A custom function to calculate price of Aito queries.
 *
 * @param {Number} queryCount The number of queries made to Aito
 * @param {Array} queryRangeLimits List of query limits which start a new pricing range.
 *  Array length must match the pricingForRangeLimits.
 * @param {Array} pricingForRangeLimits List of prices per query for given query range
 *  limits. Array length must match the queryRangeLimits.
 * @return {Number} Price in euros.
 * @customfunction
 */
function calculateQueryPrice(queryCount: number, queryRangeLimits: number[], pricingForRangeLimits: number[]) {
  if (queryRangeLimits.length !== pricingForRangeLimits.length) {
    throw new Error('queryRangeLimits and pricingForRangeLimits have same amount of elements')
  }

  let queriesLeft = queryCount
  let price = 0
  let priceRangeIndex = 0
  while (queriesLeft > 0) {
    const queryRangePricePerQuery = pricingForRangeLimits[priceRangeIndex]
    const queryRangeStart = queryRangeLimits[priceRangeIndex]
    const queryRangeEnd = priceRangeIndex + 1 > queryRangeLimits.length
      ? Infinity
      : queryRangeLimits[priceRangeIndex + 1]

    // If the last range is exceeded, this calculation will be
    //   queriesLeft - (Infinity - queryRangeStart) > 0
    // where the numeric value will always evaluate to -Infinity and the expression evaluates
    // to false. This means that there are no more queries than the range specifies, and all the
    // rest of the queries are calculated with the same price as the final price range specifies
    const isThereMoreQueriesThanTheRange = queriesLeft - (queryRangeEnd - queryRangeStart) > 0
    const queriesFromThisRange = isThereMoreQueriesThanTheRange
      ? queryRangeEnd - queryRangeStart
      : queriesLeft

    price += queriesFromThisRange * queryRangePricePerQuery
    priceRangeIndex += 1
    queriesLeft -= queriesFromThisRange
  }

  return price
}

/**
 * A custom function to calculate price of data stored in Aito.
 *
 * @param {Number} dataAmountInGb The amount of data stored in Aito in GB
 * @param {Number} dayCount Amount of days the data is stored.
 * @param {Array} dataRangeLimits List of data limits which start a new pricing range.
 *  Array length must match the pricingPerDayForRangeLimits.
 * @param {Array} pricingPerDayForRangeLimits List of prices per GBs stored per day
 *  for given data range limits. Array length must match the dataRangeLimits.
 * @return {Number} Price in euros.
 * @customfunction
 */
function calculateDataPrice(dataAmountInGb: number, dayCount: number,
                            dataRangeLimits: number[], pricingPerDayForRangeLimits: number[]) {
  if (dataRangeLimits.length !== pricingPerDayForRangeLimits.length) {
    throw new Error('queryRangeLimits and pricingPerDayForRangeLimits have same amount of elements')
  }

  let dataLeft = dataAmountInGb
  let price = 0
  let priceRangeIndex = 0
  while (dataLeft > 0) {
    const dataRangePricePerQuery = pricingPerDayForRangeLimits[priceRangeIndex]
    const dataRangeStart = dataRangeLimits[priceRangeIndex]
    const dataRangeEnd = priceRangeIndex + 1 > dataRangeLimits.length
      ? Infinity
      : dataRangeLimits[priceRangeIndex + 1]

    // If the last range is exceeded, this calculation will be
    //   dataLeft - (dataRangeEnd - dataRangeStart) > 0
    // where the numeric value will always evaluate to -Infinity and the expression evaluates
    // to false. This means that there are no more data than the range specifies, and all the
    // rest of the data are calculated with the same price as the final price range specifies
    const isThereMoreQueriesThanTheRange = dataLeft - (dataRangeEnd - dataRangeStart) > 0
    const dataFromThisRange = isThereMoreQueriesThanTheRange
      ? dataRangeEnd - dataRangeStart
      : dataLeft

    price += dataFromThisRange * dataRangePricePerQuery
    priceRangeIndex += 1
    dataLeft -= dataFromThisRange
  }

  return Math.max(price, MIN_DATA_PRICE) * dayCount
}

export function sumOfArray(array: number[]): number {
  return array.filter(n => !isNaN(n)).reduce((a, b) => a + b, 0)
}

function averageOfArray(array: number[]): number {
  return sumOfArray(array) / (1.0 * array.length)
}

export function calculateNumberOfQueries(dailyData: DailyUsage[]): number {
  return sumOfArray(dailyData.map(dd => dd.totalCalls))
}

export function calculateAverageNumberOfQueries(dailyData: DailyUsage[]): number {
  return averageOfArray(dailyData.map(dd => dd.totalCalls))
}

export function calculateMaxData(dailyData: DailyUsage[]): number {
  const dailyUsages = dailyData.map(dd => dd.dataUsage)
  return Math.max(...dailyUsages)
}

export function calculateAverageData(dailyData: DailyUsage[]): number {
  return averageOfArray(dailyData.map(dd => dd.dataUsage))
}

export function calculatePrice(dailyData: DailyUsage[]): number {
  const queryPrice: number = calculateQueryPrice(
    sumOfArray(dailyData.map(dayData => dayData.totalCalls)),
    QUERY_LIMIT_RANGES,
    QUERY_PRICE_RANGES,
  )

  const dataPrice: number = sumOfArray(dailyData.map(o => o.dataUsage)
    .map(dayData => calculateDataPrice(dayData, 1, DATA_LIMIT_RANGES, DATA_PRICE_RANGES)))

  return Math.round((queryPrice + dataPrice) * 100) / 100
}
