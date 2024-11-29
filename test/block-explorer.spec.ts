// tslint:disable no-floating-promises
import { AirGapBlockExplorer } from '@airgap/module-kit'
import chai = require('chai')
import chaiAsPromised = require('chai-as-promised')
import 'mocha'
import { AlgorandBlockExplorer } from '../block-explorer/AlgorandBlockExplorer'
import { ALGORAND_PROTOCOL_MAINNET_NETWORK } from '../types/protocol'


// use chai-as-promised plugin
chai.use(chaiAsPromised)
const expect = chai.expect

const blockExplorers: AirGapBlockExplorer[] = [new AlgorandBlockExplorer(ALGORAND_PROTOCOL_MAINNET_NETWORK.blockExplorerUrl)]

Promise.all(
  blockExplorers.map(async (blockExplorer: AirGapBlockExplorer) => {
    const blockExplorerMetadata = await blockExplorer.getMetadata()

    const address = 'dummyAlgorandAddress'
    const txId = 'dummyTxId'

    const addressUrl = await blockExplorer.createAddressUrl(address)
    const transactionUrl = await blockExplorer.createTransactionUrl(txId)

    describe(`Algorand Block Explorer ${blockExplorerMetadata.name}`, () => {
      it('should replace address', async () => {
        expect(addressUrl).to.contain(address)
      })

      it('should replace txId', async () => {
        expect(transactionUrl).to.contain(txId)
      })

      it('should contain block explorer url', async () => {
        expect(addressUrl).to.contain(blockExplorerMetadata.url)
        expect(transactionUrl).to.contain(blockExplorerMetadata.url)
      })

      it('should not contain placeholder brackets', async () => {
        expect(addressUrl).to.not.contain('{{')
        expect(addressUrl).to.not.contain('}}')
        expect(transactionUrl).to.not.contain('{{')
        expect(transactionUrl).to.not.contain('}}')
      })

      it('should always use https://', async () => {
        expect(addressUrl).to.not.contain('http://')
        expect(transactionUrl).to.not.contain('http://')
        expect(addressUrl).to.contain('https://')
        expect(transactionUrl).to.contain('https://')
      })

      it('should never contain 2 / after each other', async () => {
        expect(addressUrl.split('https://').join('')).to.not.contain('//')
        expect(transactionUrl.split('https://').join('')).to.not.contain('//')
      })
    })
  })
).then(() => {
  run()
})
