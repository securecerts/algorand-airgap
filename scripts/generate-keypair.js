const { generateKeyPair } = require('@stablelib/ed25519')

const _keyPair = generateKeyPair()
const keyPair = {
  secretKey: Buffer.from(_keyPair.secretKey).toString('hex'),
  publicKey: Buffer.from(_keyPair.publicKey).toString('hex')
}

console.log(JSON.stringify(keyPair, null, 2))