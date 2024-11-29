// tslint:disable no-floating-promises
import { AirGapTransaction } from '@airgap/module-kit'
import chai = require('chai')
import chaiAsPromised = require('chai-as-promised')
import 'mocha'
import sinon = require('sinon')

import { TestProtocolSpec } from './implementation.spec'
import { AlgorandTestProtocolSpec } from './specs/algorand'
import { AlgorandUnits } from '../types/protocol' // Ensure this points to Algorand types
import { AlgorandSignedTransaction , AlgorandUnsignedTransaction} from '../types/transaction'
import { AlgorandProtocol } from '../protocol/AlgorandProtocol'

// Use chai-as-promised for async assertions
chai.use(chaiAsPromised)
const expect = chai.expect

// Apply the required generic parameters explicitly
const protocols = [
    new AlgorandTestProtocolSpec() // No type arguments needed
  ]
  

const itIf = (condition, title, test) => {
  return condition ? it(title, test) : it.skip(title, test)
}

Promise.all(
  protocols.map(async (protocol: TestProtocolSpec<AlgorandProtocol, AlgorandUnits, AlgorandUnsignedTransaction, AlgorandSignedTransaction>) => {
    const protocolMetadata = await protocol.lib.getMetadata()

    describe(`Protocol ${protocol.name}`, () => {
      describe(`KeyPair`, () => {
        beforeEach(async () => {
          await protocol.stub.registerStub(protocol)
        })

        afterEach(async () => {
          sinon.restore()
        })

        it('should generate a key pair from a derivative and match expected keys', async () => {
          const { secretKey, publicKey } = await protocol.lib.getKeyPairFromDerivative(await protocol.derivative())
          expect(secretKey).to.deep.equal(protocol.wallet.secretKey)
          expect(publicKey).to.deep.equal(protocol.wallet.publicKey)
        })

        it('should derive a valid address from a given publicKey', async () => {
          const { publicKey } = await protocol.lib.getKeyPairFromDerivative(await protocol.derivative())
          const address = await protocol.lib.getAddressFromPublicKey(publicKey)

          if (protocolMetadata.account?.address?.regex) {
            expect(address).to.match(new RegExp(protocolMetadata.account.address.regex))
          }
          expect(address).to.equal(protocol.wallet.addresses[0], 'address does not match')
        })
      })

      describe(`Transaction Preparation`, () => {
        beforeEach(async () => {
          await protocol.stub.registerStub(protocol)
        })

        afterEach(async () => {
          sinon.restore()
        })

        it('should prepare a transaction using the public key and correct amount and fees', async () => {
          const preparedTx = await protocol.lib.prepareTransactionWithPublicKey(
            protocol.wallet.publicKey,
            [{ to: protocol.txs[0].to[0], amount: protocol.txs[0].amount }],
            { fee: protocol.txs[0].fee }
          )

          protocol.txs.forEach((tx) => {
            expect(preparedTx).to.deep.include(tx.unsignedTx)
          })
        })

        it('should handle zero-amount transactions appropriately', async () => {
          await protocol.lib.prepareTransactionWithPublicKey(
            protocol.wallet.publicKey,
            [{ to: protocol.txs[0].to[0], amount: { value: '0', unit: 'microAlgo' } }],
            { fee: protocol.txs[0].fee }
          )

          sinon.restore()
          await protocol.stub.noBalanceStub(protocol)

          await expect(
            protocol.lib.prepareTransactionWithPublicKey(
              protocol.wallet.publicKey,
              [{ to: protocol.txs[0].to[0], amount: { value: '0', unit: 'microAlgo' } }],
              { fee: protocol.txs[0].fee }
            )
          ).to.be.rejectedWith(/balance/)
        })
      })

      describe(`Transaction Signing`, () => {
        beforeEach(async () => {
          await protocol.stub.registerStub(protocol)
        })

        afterEach(async () => {
          sinon.restore()
        })

        it('should sign a transaction using a SecretKey and match expected signedTx', async () => {
          const { secretKey } = await protocol.lib.getKeyPairFromDerivative(await protocol.derivative())
          const txs = await Promise.all(
            protocol.txs.map(async ({ unsignedTx }) =>
              protocol.lib.signTransactionWithSecretKey(unsignedTx, secretKey)
            )
          )

          txs.forEach((signedTx, index) => {
            expect(signedTx).to.deep.equal(protocol.txs[index].signedTx)
          })
        })
      })

      describe(`Transaction Details Extraction`, () => {
        it('should extract all necessary properties from an unsigned transaction', async () => {
          for (const tx of protocol.txs) {
            const airgapTxs: AirGapTransaction[] = await protocol.lib.getDetailsFromTransaction(
              { ...tx.unsignedTx, memo: 'memo' },
              protocol.wallet.publicKey
            )

            expect(airgapTxs).to.have.lengthOf(1)
            const airgapTx = airgapTxs[0]

            expect(airgapTx.to).to.deep.equal(tx.to)
            expect(airgapTx.from).to.deep.equal(tx.from)
            expect(airgapTx.amount).to.deep.equal(protocol.txs[0].amount)
            expect(airgapTx.fee).to.deep.equal(protocol.txs[0].fee)
            expect(airgapTx.arbitraryData).to.be.undefined
          }
        })
      })

      describe(`Message Signing and Verification`, () => {
        afterEach(async () => {
          sinon.restore()
        })

        itIf(protocol.messages.length > 0, 'should sign a message with key pair and verify the signature', async () => {
          const { secretKey, publicKey } = await protocol.lib.getKeyPairFromDerivative(await protocol.derivative())

          for (const messageObject of protocol.messages) {
            const signature = await protocol.lib.signMessageWithKeyPair(messageObject.message, { publicKey, secretKey })
            expect(signature).to.deep.equal(messageObject.signature)

            const isValid = await protocol.lib.verifyMessageWithPublicKey(messageObject.message, signature, publicKey)
            expect(isValid).to.be.true
          }
        })

        itIf(protocol.messages.length > 0, 'should verify that an incorrect signature fails verification', async () => {
          const { publicKey } = await protocol.lib.getKeyPairFromDerivative(await protocol.derivative())
          const invalidMessage = "this is an invalid message"

          for (const messageObject of protocol.messages) {
            const isValid = await protocol.lib.verifyMessageWithPublicKey(invalidMessage, messageObject.signature, publicKey)
            expect(isValid).to.be.false
          }
        })
      })

      describe(`Symmetric Message Encryption/Decryption`, () => {
        afterEach(async () => {
          sinon.restore()
        })

        itIf(protocol.encryptAES.length > 0, 'should encrypt and decrypt a message with a SecretKey', async () => {
          const { secretKey } = await protocol.lib.getKeyPairFromDerivative(await protocol.derivative())

          for (const messageObject of protocol.encryptAES) {
            const encryptedPayload = await protocol.lib.encryptAESWithSecretKey(messageObject.message, secretKey)
            const decryptedPayload = await protocol.lib.decryptAESWithSecretKey(encryptedPayload, secretKey)

            expect(decryptedPayload).to.equal(messageObject.message)
          }
        })
      })

      describe(`Asymmetric Message Encryption/Decryption`, () => {
        afterEach(async () => {
          sinon.restore()
        })

        itIf(protocol.encryptAsymmetric.length > 0, 'should encrypt and decrypt a message with asymmetric keys', async () => {
          const { secretKey, publicKey } = await protocol.lib.getKeyPairFromDerivative(await protocol.derivative())

          for (const messageObject of protocol.encryptAsymmetric) {
            const encryptedPayload = await protocol.lib.encryptAsymmetricWithPublicKey(messageObject.message, publicKey)
            const decryptedPayload = await protocol.lib.decryptAsymmetricWithKeyPair(encryptedPayload, { publicKey, secretKey })

            expect(decryptedPayload).to.equal(messageObject.message)
          }
        })

        itIf(protocol.encryptAsymmetric.length > 0, 'should fail to decrypt with incorrect keys', async () => {
          const { secretKey, publicKey } = await protocol.lib.getKeyPairFromDerivative(await protocol.derivative())
          const incorrectSecretKey = 'someothersecretkey' // Placeholder for incorrect key

          for (const messageObject of protocol.encryptAsymmetric) {
            const encryptedPayload = await protocol.lib.encryptAsymmetricWithPublicKey(messageObject.message, publicKey)

            await expect(
              protocol.lib.decryptAsymmetricWithKeyPair(encryptedPayload, { publicKey, secretKey: incorrectSecretKey })
            ).to.be.rejectedWith(/decryption failed/)
          }
        })
      })
    })
  })
).then(() => {
  // Uncomment if Mocha automatically runs tests
  // run()
})
