import { describe, it } from 'vitest'
import { AddressApi } from '../src/libs/address/address'

describe('AddressApi', () => {
  it('parseTextAddress', () => {
    AddressApi.parseTextAddress('AA100002353843408046')
  })

  it('evmAddressToTextAddress', () => {
    AddressApi.evmAddressToTextAddress('0x000000000000000000000000800140000300001C')
  })
})
