import { AddressApi } from '@thepowereco/tssdk'

type ParsedItem =
  | number
  | bigint
  | string
  | null
  | `0x${string}`
  | boolean
  | ParsedItem[]
  | { [key: string]: ParsedItem }

export class ParamsParser {
  numberRegex = /^-?\d+(\.\d+)?$/

  bigIntRegex = /^-?\d+n$/

  stringRegex = /^'.*'$/

  arrayRegex = /^\[.*\]$/

  objectRegex = /^\{.*\}$/

  publicHexAddressWithCS = /^([a-zA-Z]{2}[01-9]{18})$/

  stringHex = /^0x[0-9a-fA-F]+$/

  parseItem(item: string): ParsedItem {
    const newItem = item.trim()

    if (newItem === 'false') {
      return false
    }
    if (newItem === 'true') {
      return true
    }
    if (newItem === 'null') {
      return null
    }
    if (this.stringHex.test(newItem)) {
      return newItem
    }
    if (this.publicHexAddressWithCS.test(newItem)) {
      return AddressApi.textAddressToEvmAddress(newItem)
    }
    if (this.numberRegex.test(newItem)) {
      return parseFloat(newItem)
    }
    if (this.bigIntRegex.test(newItem)) {
      return BigInt(newItem.slice(0, -1))
    }
    if (this.stringRegex.test(newItem)) {
      // Remove the single quotes
      return newItem.slice(1, -1)
    }
    if (this.arrayRegex.test(newItem)) {
      // Recursively parse the array
      return this.parseArray(newItem)
    }
    if (this.objectRegex.test(newItem)) {
      // Parse the object
      return this.parseObject(newItem)
    }

    return newItem
  }

  parseArray(arrayStr: string): ParsedItem[] {
    const newArrayStr = arrayStr.slice(1, -1).trim()

    // Handle nested arrays and objects
    let nestedLevel = 0
    let currentItem = ''
    const items: string[] = []
    let isInsideString = false

    for (const char of newArrayStr) {
      if (char === "'" && !isInsideString) {
        isInsideString = true
      } else if (char === "'" && isInsideString) {
        isInsideString = false
      }

      if (!isInsideString) {
        if (char === '[' || char === '{') {
          nestedLevel += 1
        }
        if (char === ']' || char === '}') {
          nestedLevel -= 1
        }
      }

      if (char === ',' && nestedLevel === 0) {
        items.push(currentItem.trim())
        currentItem = ''
      } else {
        currentItem += char
      }
    }
    if (currentItem) {
      items.push(currentItem.trim())
    }

    return items.map(item => this.parseItem(item))
  }

  parseObject(objectStr: string): Record<string, ParsedItem> {
    // Remove the outer curly braces
    const newObjectStr = objectStr.slice(1, -1).trim()

    const obj: Record<string, ParsedItem> = {}
    // eslint-disable-next-line no-useless-escape
    const keyValuePairs = newObjectStr.split(/,(?![^{}\[\]]*\])/)

    keyValuePairs.forEach(pair => {
      const [key, value] = pair.split(':').map(str => str.trim())
      const cleanedKey = key?.startsWith("'") && key.endsWith("'") ? key.slice(1, -1) : key
      if (obj && value && cleanedKey) {
        obj[cleanedKey] = this.parseItem(value)
      }
    })

    return obj
  }

  public parse(input: string): ParsedItem[] {
    const trimmedInput = input.trim()

    if (this.arrayRegex.test(trimmedInput)) {
      return this.parseArray(trimmedInput)
    }
    if (this.objectRegex.test(trimmedInput)) {
      return [this.parseObject(trimmedInput)]
    }

    return [this.parseItem(trimmedInput)]
  }
}
