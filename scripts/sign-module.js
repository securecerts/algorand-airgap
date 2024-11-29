const fs = require('fs')
const { sign } = require('@stablelib/ed25519')

const modulePath = './module'
const keyPair = JSON.parse(fs.readFileSync('./keypair.json').toString('utf-8'))
const secretKey = Buffer.from(keyPair.secretKey, 'hex')

const manifestBytes = fs.readFileSync(`${modulePath}/manifest.json`)
const manifest = JSON.parse(manifestBytes.toString('utf-8'))

const includeBytes = Buffer.concat(manifest.include.map((path) => fs.readFileSync(`${modulePath}/${path}`)))
const filesBytes = Buffer.concat([includeBytes, manifestBytes])

const signature = sign(secretKey, filesBytes)
fs.writeFileSync(`${modulePath}/module.sig`, signature)

console.log(Buffer.from(signature).toString('hex'))