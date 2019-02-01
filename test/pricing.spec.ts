import { expect } from 'chai'
import 'mocha'

import { calculatePrice } from '../src/index'

describe('Pricing module', () => {

  it('should give prize 0 for empty array', () => {
    expect(calculatePrice([])).to.equal(0)
  })
})
