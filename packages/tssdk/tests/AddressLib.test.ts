import { describe, it } from 'vitest'
import { AddressApi } from '../src/libs/address/address'

// Test data setup

describe('AddressApi', () => {
  // Test for encoding a private address
  it('parseTextAddress', () => {
    AddressApi.parseTextAddress('AA100002353843408046')
  })
})
