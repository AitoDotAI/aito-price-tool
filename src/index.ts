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

export const MIN_DATA_PRICE = Math.round(DATA_PRICE_RANGES[0]);

/**
 * A custom function to calculate price of Aito queries.
 *
 * @param {Number} queryCount The number of queries made to Aito
 * @param {Array} queryRangeLimits List of query limits which start a new pricing range. Array length must match the pricingForRangeLimits.
 * @param {Array} pricingForRangeLimits List of prices per query for given query range limits. Array length must match the queryRangeLimits.
 * @return {Number} Price in euros.
 * @customfunction
 */
function calculateQueryPrice(queryCount: number, queryRangeLimits: number[], pricingForRangeLimits: number[]) {
  if (queryRangeLimits.length !== pricingForRangeLimits.length) {
    throw new Error('queryRangeLimits and pricingForRangeLimits have same amount of elements');
  }

  var queriesLeft = queryCount;
  var price = 0;
  var priceRangeIndex = 0;
  while (queriesLeft > 0) {
    var queryRangePricePerQuery = pricingForRangeLimits[priceRangeIndex];
    var queryRangeStart = queryRangeLimits[priceRangeIndex];
    var queryRangeEnd = priceRangeIndex + 1 > queryRangeLimits.length
      ? Infinity
      : queryRangeLimits[priceRangeIndex + 1];

    // If the last range is exceeded, this calculation will be
    //   queriesLeft - (Infinity - queryRangeStart) > 0
    // where the numeric value will always evaluate to -Infinity and the expression evaluates
    // to false. This means that there are no more queries than the range specifies, and all the
    // rest of the queries are calculated with the same price as the final price range specifies
    var isThereMoreQueriesThanTheRange = queriesLeft - (queryRangeEnd - queryRangeStart) > 0;
    var queriesFromThisRange = isThereMoreQueriesThanTheRange
      ? queryRangeEnd - queryRangeStart
      : queriesLeft;

    price += queriesFromThisRange * queryRangePricePerQuery;
    priceRangeIndex += 1;
    queriesLeft -= queriesFromThisRange;
  }

  return price
}

/**
 * A custom function to calculate price of data stored in Aito.
 *
 * @param {Number} dataAmountInGb The amount of data stored in Aito in GB
 * @param {Number} dayCount Amount of days the data is stored.
 * @param {Array} dataRangeLimits List of data limits which start a new pricing range. Array length must match the pricingPerDayForRangeLimits.
 * @param {Array} pricingPerDayForRangeLimits List of prices per GBs stored per day for given data range limits. Array length must match the dataRangeLimits.
 * @return {Number} Price in euros.
 * @customfunction
 */
function calculateDataPrice(dataAmountInGb: number, dayCount: number, dataRangeLimits: number[], pricingPerDayForRangeLimits: number[]) {
  if (dataRangeLimits.length !== pricingPerDayForRangeLimits.length) {
    throw new Error('queryRangeLimits and pricingPerDayForRangeLimits have same amount of elements');
  }

  var dataLeft = dataAmountInGb;
  var price = 0;
  var priceRangeIndex = 0;
  while (dataLeft > 0) {
    var dataRangePricePerQuery = pricingPerDayForRangeLimits[priceRangeIndex];
    var dataRangeStart = dataRangeLimits[priceRangeIndex];
    var dataRangeEnd = priceRangeIndex + 1 > dataRangeLimits.length
      ? Infinity
      : dataRangeLimits[priceRangeIndex + 1];

    // If the last range is exceeded, this calculation will be
    //   dataLeft - (dataRangeEnd - dataRangeStart) > 0
    // where the numeric value will always evaluate to -Infinity and the expression evaluates
    // to false. This means that there are no more data than the range specifies, and all the
    // rest of the data are calculated with the same price as the final price range specifies
    var isThereMoreQueriesThanTheRange = dataLeft - (dataRangeEnd - dataRangeStart) > 0;
    var dataFromThisRange = isThereMoreQueriesThanTheRange
      ? dataRangeEnd - dataRangeStart
      : dataLeft;

    price += dataFromThisRange * dataRangePricePerQuery;
    priceRangeIndex += 1;
    dataLeft -= dataFromThisRange;
  }

  return Math.max(price, MIN_DATA_PRICE) * dayCount;
}

export function calculatePrice(dailyData: { dataUsage: number, totalCalls: number }[]) {
  const queryPrice: number = calculateQueryPrice(
    dailyData.map(o => o.totalCalls).reduce((a, b) => a + b, 0),
    QUERY_LIMIT_RANGES,
    QUERY_PRICE_RANGES
  )
  
  const dataPrice: number = dailyData.map(o => o.dataUsage)
    .map(dayData => calculateDataPrice(dayData, 1, DATA_LIMIT_RANGES, DATA_PRICE_RANGES))
    .reduce((a, b) => a + b, 0)

  return Math.round((queryPrice + dataPrice) * 100) / 100
}
