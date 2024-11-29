import { Balance } from '@airgap/module-kit';
import { ProtocolHTTPStub, TestProtocolSpec } from '../implementation.spec';
import algosdk from 'algosdk';
import * as sinon from 'sinon';
import { AlgorandProtocol } from '../../src/protocol/AlgorandProtocol';

export class AlgorandProtocolStub implements ProtocolHTTPStub<AlgorandProtocol> {
  
  public async registerStub(testProtocolSpec: TestProtocolSpec<AlgorandProtocol>) {
    const algodClient = new algosdk.Algodv2('', 'https://algorand-node.testnet', '');

    // Stub for fetching balance
    sinon
      .stub(algodClient, 'accountInformation')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(
        Promise.resolve({
          amount: 100000000,  // Set a mock balance in microAlgos
          'min-balance': 100000,
          status: 'Online'
        })
      );

    // Stub for fetching transaction parameters (for fee estimation, etc.)
    sinon.stub(algodClient, 'getTransactionParams').returns(
      Promise.resolve({
        fee: 1000,  // mock flat fee
        firstRound: 1000,
        lastRound: 2000,
        genesisID: 'testnet-v1.0',
        genesisHash: 'SG2y0+2z5ROqxHY4HZy',
        minFee: 1000
      })
    );

    // Stub for account information
    sinon.stub(algodClient, 'accountInformation').returns(
      Promise.resolve({
        address: testProtocolSpec.wallet.addresses[0],
        amount: 100000000,  // mock balance in microAlgos
        'min-balance': 100000,
        status: 'Online'
      })
    );

    return algodClient;
  }

  public async noBalanceStub(testProtocolSpec: TestProtocolSpec<AlgorandProtocol>) {
    const algodClient = new algosdk.Algodv2('', 'https://algorand-node.testnet', '');

    // Stub for no balance
    sinon
      .stub(algodClient, 'accountInformation')
      .withArgs(testProtocolSpec.wallet.addresses[0])
      .returns(
        Promise.resolve({
          amount: 0,  // Set balance to zero
          'min-balance': 100000,
          status: 'Offline'
        })
      );
  }

  public async transactionListStub(testProtocolSpec: TestProtocolSpec<AlgorandProtocol>, address: string): Promise<any> {
    const indexerClient = new algosdk.Indexer('', 'https://algorand-indexer.testnet', '');

    const transactions = testProtocolSpec.transactionList(address);

    // Stub for fetching transactions
    sinon
      .stub(indexerClient, 'searchForTransactions')
      .withArgs(sinon.match({ address }))
      .returns(
        Promise.resolve({
          transactions: [
            {
              id: 'TXID1234567890',
              fee: 1000,
              sender: address,
              paymentTransaction: {
                receiver: 'RECEIVER_ADDRESS',
                amount: 5000000  // Amount in microAlgos
              },
              confirmedRound: 2000,
              note: new TextEncoder().encode('Test transaction')
            },
            // Add more mock transactions as needed
          ]
        })
      );

    return indexerClient;
  }
}
