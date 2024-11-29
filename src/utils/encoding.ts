import { Domain } from '@airgap/coinlib-core'
// @ts-ignore
import * as bs58check from '@airgap/coinlib-core/dependencies/src/bs58check-2.1.2/index'
import { ConditionViolationError, UnsupportedError } from '@airgap/coinlib-core/errors'
import { hexToBytes } from '@airgap/coinlib-core/utils/hex'

interface Base58Prefix {
  prefix: string
  bytes: Buffer
  bytesLength: number
  encodedLength: number
}

function createBase58PrefixEntry(prefix: string, bytes: number[], bytesLength: number, encodedLength: number): Base58Prefix {
  return {
    prefix,
    bytes: Buffer.from(new Uint8Array(bytes)),
    bytesLength,
    encodedLength
  }
}

export const BASE58_PREFIX = {
    algorandPublicKey: createBase58PrefixEntry('ALGO', [1, 32], 32, 52), // ALGO(52)
    algorandAccountAddress: createBase58PrefixEntry('ALGO', [2, 32], 32, 52), // ALGO(52)
    algorandPrivateKey: createBase58PrefixEntry('SK', [3, 32], 64, 98), // SK(98)
    algorandSeed: createBase58PrefixEntry('S', [4, 32], 32, 54), // S(54)
    algorandMultisigAddress: createBase58PrefixEntry('MS', [5, 20], 20, 36), // MS(36)
    
    // Additional entries
    algorandVotingKey: createBase58PrefixEntry('VK', [6, 32], 64, 98), // VK(98)
    algorandVoteFirstRound: createBase58PrefixEntry('VFR', [7, 32], 32, 54), // VFR(54)
    algorandVoteLastRound: createBase58PrefixEntry('VLR', [8, 32], 32, 54), // VLR(54)
    algorandAccountMicro: createBase58PrefixEntry('AM', [9, 32], 32, 52) // AM(52)
  };

export function encodeBase58(bytes: string | Uint8Array | Buffer, type: keyof typeof BASE58_PREFIX): string {
  const buffer: Buffer = hexToBytes(bytes)
  const prefix: Base58Prefix = BASE58_PREFIX[type]
  
  if (buffer.length !== prefix.bytesLength) {
    throw new ConditionViolationError(Domain.ALGORAND, `Invalid ${type} bytes`)
  }

  const encoded: string = bs58check.encode(Buffer.concat([prefix.bytes, buffer]))
  
  if (!encoded.startsWith(prefix.prefix) || encoded.length !== prefix.encodedLength) {
    throw new ConditionViolationError(Domain.ALGORAND, `Invalid ${type} bytes`)
  }

  return encoded
}

export function decodeBase58(value: string, type?: keyof typeof BASE58_PREFIX): Buffer {
  const prefix: Base58Prefix | undefined =
    type !== undefined ? BASE58_PREFIX[type] : Object.values(BASE58_PREFIX).find((prefix: Base58Prefix) => value.startsWith(prefix.prefix))

  if (prefix === undefined || !value.startsWith(prefix.prefix) || value.length !== prefix.encodedLength) {
    throw new UnsupportedError(Domain.ALGORAND, `Unknown base58 encoded value ${value}`)
  }

  const decoded: Buffer = bs58check.decode(value)

  return decoded.slice(prefix.bytes.length)
}
