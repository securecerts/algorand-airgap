import { assertNever, Domain } from '@airgap/coinlib-core';
import { UnsupportedError } from '@airgap/coinlib-core/errors';
import { newPublicKey, newSecretKey, PublicKey, SecretKey } from '@airgap/module-kit';
import { convertEncodedBytesString, convertHexBytesString } from './convert';
import { BASE58_PREFIX } from './encoding';

// Ensure that BASE58_PREFIX contains the correct keys
type AlgorandSecretKeyType = keyof typeof BASE58_PREFIX; // Add this type to help with type checking

// Function to convert an Algorand Secret Key
export function convertSecretKey(
  secretKey: SecretKey,
  targetFormat: SecretKey['format'],
  type: AlgorandSecretKeyType = 'algorandPrivateKey' // Update default type to a valid key
): SecretKey {
  if (secretKey.format === targetFormat) {
    return secretKey; // Return if already in target format
  }

  switch (secretKey.format) {
    case 'encoded':
      return newSecretKey(convertEncodedBytesString(type, secretKey.value, targetFormat), targetFormat);
    case 'hex':
      return newSecretKey(convertHexBytesString(type, secretKey.value, targetFormat), targetFormat);
    default:
      assertNever(secretKey.format); // Ensure exhaustive checking
      throw new UnsupportedError(Domain.ALGORAND, 'Unsupported secret key format.'); // Change domain to Algorand
  }
}

// Function to convert an Algorand Public Key
export function convertPublicKey(
  publicKey: PublicKey,
  targetFormat: PublicKey['format'],
  type: AlgorandSecretKeyType = 'algorandPublicKey' // Update default type to a valid key
): PublicKey {
  if (publicKey.format === targetFormat) {
    return publicKey; // Return if already in target format
  }

  switch (publicKey.format) {
    case 'encoded':
      return newPublicKey(convertEncodedBytesString(type, publicKey.value, targetFormat), targetFormat);
    case 'hex':
      return newPublicKey(convertHexBytesString(type, publicKey.value, targetFormat), targetFormat);
    default:
      assertNever(publicKey.format); // Ensure exhaustive checking
      throw new UnsupportedError(Domain.ALGORAND, 'Unsupported public key format.'); // Change domain to Algorand
  }
}
