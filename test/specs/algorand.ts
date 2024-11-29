import { Amount, PublicKey, SecretKey, Signature } from '@airgap/module-kit'
import { TestProtocolSpec } from '../implementation.spec'
import algosdk, { SuggestedParams } from 'algosdk'
import { AlgorandProtocolStub } from '../stubs/algorand.stub'
import { AlgorandProtocol, createAlgorandProtocol } from '../../src/protocol/AlgorandProtocol'
import { AlgorandSignedTransaction, AlgorandUnsignedTransaction } from '../../src/types/transaction'
import { AlgorandUnits } from '../../src/types/protocol'

// Generate a key pair for Algorand
const account = algosdk.generateAccount()
const mnemonic = algosdk.secretKeyToMnemonic(account.sk)  // Convert private key to mnemonic for storage

// Algorand test protocol specification class
export class AlgorandTestProtocolSpec extends TestProtocolSpec<AlgorandProtocol> {
  public name = 'Algorand'
  public lib = createAlgorandProtocol()
  
  // Stub can simulate network conditions (this would be an Algorand-specific stub)
  public stub = new AlgorandProtocolStub()

  public validAddresses = [
    account.addr,
    algosdk.generateAccount().addr,  // Random valid address
    algosdk.generateAccount().addr
  ]

  public wallet = {
    secretKey: {
      type: 'priv',
      format: 'hex',
      value: Buffer.from(account.sk).toString('hex')
    } as SecretKey,
    publicKey: {
      type: 'pub',
      format: 'hex',
      value: Buffer.from(account.addr).toString('hex')
    } as PublicKey,
    addresses: [account.addr]
  }

  public txs = [
    {
      to: [algosdk.generateAccount().addr],
      from: [account.addr],
      amount: {
        value: '1000000',
        unit: 'microAlgo'
      } as Amount<AlgorandUnits>,
      fee: {
        value: '1000',
        unit: 'microAlgo'
      } as Amount<AlgorandUnits>,
      unsignedTx: {
        type: 'unsigned',
        from: account.addr,
        to: algosdk.generateAccount().addr,
        amount: 1000000,
        suggestedParams: {} as SuggestedParams  // Populate with actual Algorand suggested params
      } as AlgorandUnsignedTransaction,
      signedTx: {
        type: 'signed',
        txn: {
          type: 'unsigned', // Ensure type consistency with AlgorandUnsignedTransaction
          from: account.addr,
          to: algosdk.generateAccount().addr,
          amount: 1000000,
          suggestedParams: {} as SuggestedParams
        },
        sig: Buffer.from(
          algosdk.signTransaction(
            {
              from: account.addr,
              to: algosdk.generateAccount().addr,
              amount: 1000000,
              suggestedParams: {} as SuggestedParams
            },
            account.sk
          ).blob
        )
      } as AlgorandSignedTransaction
    }
  ]

  public messages = [
    {
      message: 'example message',
      signature: {
        value: algosdk.signBytes(new TextEncoder().encode('example message'), account.sk).toString(),
        format: 'hex'
      } as Signature
    }
  ]

  public encryptAsymmetric = [
    {
      message: 'example message',
      encrypted: 'encrypted_message_placeholder'  // Placeholder
    }
  ]

  public encryptAES = [
    {
      message: 'example message',
      encrypted: '66d61968bb57ff709c571c52ec25f5d8!8f50c743642317a0ecff076fc5ea7c!0db54d642df745113a1dce524b0a7bc6' // Placeholder
    }
  ]

  public transactionList(address: string): { first: any[]; next: any[] } {
    // Placeholder transaction list for testing
    return {
      first: [
        {
          type: 'pay',
          from: address,
          to: algosdk.generateAccount().addr,
          amount: 1000000,
          fee: 1000,
          note: 'Transaction 1',
          confirmedRound: 1
        }
      ],
      next: [
        {
          type: 'pay',
          from: address,
          to: algosdk.generateAccount().addr,
          amount: 500000,
          fee: 1000,
          note: 'Transaction 2',
          confirmedRound: 2
        }
      ]
    }
  }

  public seed(): string {
    return Buffer.from(account.sk).toString('hex')
  }

  public mnemonic(): string {
    return mnemonic
  }

  public validUnsignedTransactions: AlgorandUnsignedTransaction[] = [
    {
      type: 'unsigned',
      from: account.addr,
      to: algosdk.generateAccount().addr,
      amount: 1000000,
      suggestedParams: {} as SuggestedParams
    }
  ]

  public validSignedTransactions: AlgorandSignedTransaction[] = [
    {
      type: 'signed',
      txn: {
        type: 'unsigned',  // Ensure this aligns with AlgorandUnsignedTransaction
        from: account.addr,
        to: algosdk.generateAccount().addr,
        amount: 1000000,
        suggestedParams: {} as SuggestedParams
      },
      sig: Buffer.from(
        algosdk.signTransaction(
          {
            from: account.addr,
            to: algosdk.generateAccount().addr,
            amount: 1000000,
            suggestedParams: {} as SuggestedParams
          },
          account.sk
        ).blob
      )
    }
  ]
}
