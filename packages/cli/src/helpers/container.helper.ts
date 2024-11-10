import { ux } from '@oclif/core'
import crypto from 'crypto'
import { readFileSync } from 'node:fs'
import { prompt } from 'enquirer'

export enum TaskState {
  Cancelled,
  Pending,
  Deploy,
  Running,
  Rejected,
  HandOver
}

export const TaskStateMap = {
  [TaskState.Cancelled]: 'Cancelled',
  [TaskState.Pending]: 'Pending',
  [TaskState.Deploy]: 'Deploy',
  [TaskState.Running]: 'Running',
  [TaskState.Rejected]: 'Rejected',
  [TaskState.HandOver]: 'HandOver'
}

export function bytesToString(bytesHex: string) {
  // Создаем новую переменную для работы с обрезанным значением
  let hexString = bytesHex

  // Убираем префикс "0x", если он есть
  if (hexString.startsWith('0x')) {
    hexString = hexString.slice(2)
  }

  // Декодируем строку из шестнадцатеричного представления в UTF-8
  const decodedString = hexString
    .match?.(/.{1,2}/g)
    ?.map(byte => String.fromCharCode(parseInt(byte, 16)))
    .join('')

  // Удаляем нулевые символы, которые могут быть добавлены для заполнения
  const str = decodedString?.replace(/\0/g, '')

  return str
}

export function stringToBytes32(str: string) {
  // Ensure the string is no longer than 32 characters
  if (str.length > 32) {
    throw new Error('String must be no longer than 32 characters')
  }

  // Convert each character to its hexadecimal representation
  let hexStr = '0x'
  for (let i = 0; i < str.length; ) {
    hexStr += str.charCodeAt(i).toString(16).padStart(2, '0')
    // Increment explicitly
    i += 1
  }

  // Pad the hex string with zeroes to ensure it's 32 bytes long (64 hex characters)
  while (hexStr.length < 66) {
    hexStr += '0'
  }

  return hexStr as `0x${string}`
}

export function createCompactPublicKey(jwkPublicKey: crypto.JsonWebKey) {
  if (jwkPublicKey.x && jwkPublicKey.y) {
    const xBuffer = Buffer.from(jwkPublicKey.x, 'base64')
    const yBuffer = Buffer.from(jwkPublicKey.y, 'base64')

    const yLastByte = yBuffer[yBuffer.length - 1]

    const parityIndicator = yLastByte && yLastByte % 2 === 0 ? 2 : 3

    const compactPublicKey = Buffer.concat([
      Uint8Array.from([parityIndicator]),
      Uint8Array.from(xBuffer)
    ])

    const base64 = compactPublicKey
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/[=]+$/, '')

    return {
      buffer: compactPublicKey,
      base64
    }
  }
  return null
}

export function formatDate(timestamp: number) {
  const date = new Date(timestamp)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  const formattedDate = `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`
  return formattedDate
}

export async function importContainerKey(containerKeyFilePath: string, containerPassword: string) {
  const containerKeyFile = readFileSync(containerKeyFilePath, 'utf8')

  try {
    const privateKeyPem = crypto.createPrivateKey({
      key: containerKeyFile,
      type: 'pkcs8',
      format: 'pem',
      passphrase: containerPassword
    })

    return privateKeyPem
  } catch (error) {
    ux.action.stop()
    const { password }: { password: string } = await prompt({
      message: 'Please, enter your account keyFile password',
      name: 'password',
      type: 'password'
    })
    const privateKeyPem = crypto.createPrivateKey({
      key: containerKeyFile,
      type: 'pkcs8',
      format: 'pem',
      passphrase: password
    })
    ux.action.start('Loading')
    return privateKeyPem
  }
}
