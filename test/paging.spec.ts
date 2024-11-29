// tslint:disable no-floating-promises
import chai = require('chai')
import chaiAsPromised = require('chai-as-promised')
import 'mocha'
import sinon = require('sinon')

import { TestProtocolSpec } from './implementation.spec'
import { AlgorandTestProtocolSpec } from './specs/algorand'
import { AlgorandSignedTransaction } from '../types/transaction'

// use chai-as-promised plugin
chai.use(chaiAsPromised)
const expect = chai.expect

const protocols = [new AlgorandTestProtocolSpec()]

// Define the structure for mock paginated transactions
type AlgorandPagedTxsResponse = {
  transactions: AlgorandSignedTransaction[]
  nextToken?: string
}

Promise.all(
  protocols.map(async (protocol: TestProtocolSpec<any>) => {
    describe(`Transaction Paging`, () => {
      afterEach(async () => {
        sinon.restore()
      })

      it(`should properly page transactions for ${protocol.name.toUpperCase()}`, async () => {
        const address = protocol.validAddresses[0]

        // Create mock transactions following the AlgorandPagedTxsResponse structure
        const mockTransactions: { first: AlgorandPagedTxsResponse; next: AlgorandPagedTxsResponse } = protocol.transactionList(address)

        await protocol.stub.transactionListStub(protocol, address)

        // Helper function to get the transaction limit from the response
        const limitFromResponse = (transactions: AlgorandPagedTxsResponse) => transactions.transactions.length

        // Fetch the first page of transactions
        const firstTransactions = await protocol.lib.getTransactionsForAddress(
          address,
          limitFromResponse(mockTransactions.first)
        )
        
        // Fetch the next page using the cursor's `next` property as `nextToken`
        const nextTransactions = await protocol.lib.getTransactionsForAddress(
          address,
          limitFromResponse(mockTransactions.next),
          firstTransactions.cursor.next
        )

        // Validate first transactions page
        expect(firstTransactions.transactions.length).to.be.eq(mockTransactions.first.transactions.length)
        expect(firstTransactions.cursor.hasNext, 'expected first transaction cursor to have `hasNext: true`').to.be.true
        expect(firstTransactions.cursor.offset).to.be.eq(mockTransactions.first.transactions.length)

        // Validate next transactions page
        expect(nextTransactions.transactions.length).to.be.eq(mockTransactions.next.transactions.length)
        expect(nextTransactions.cursor.hasNext, 'expected next transaction cursor to have `hasNext: false`').to.be.false
        expect(nextTransactions.cursor.offset).to.be.eq(
          mockTransactions.first.transactions.length + mockTransactions.next.transactions.length
        )
      })
    })
  })
).then(() => {
  // Remove if Mocha automatically detects tests
})
