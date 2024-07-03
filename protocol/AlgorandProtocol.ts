import { Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { BalanceError, ConditionViolationError } from '@airgap/coinlib-core/errors'
import { encodeDerivative } from '@airgap/crypto'
import algosdk from "algosdk"
import {algodClient, indexerClient} from "../config/algosdk"
import {
  Address,
  AirGapProtocol,
  AirGapTransaction,
  AirGapTransactionsWithCursor,
  Amount,
  Balance,
  CryptoDerivative,
  FeeDefaults,
  KeyPair,
  newAmount,
  newSignedTransaction,
  newUnsignedTransaction,
  ProtocolMetadata,
  ProtocolUnitsMetadata,
  PublicKey,
  RecursivePartial,
  SecretKey,
  TransactionDetails,
  TransactionFullConfiguration,
  TransactionSimpleConfiguration
} from '@airgap/module-kit'
import { AlgorandCryptoConfiguration } from '../types/crypto'
import { AlgorandNetworkType, AlgorandProtocolNetwork, AlgorandProtocolOptions, AlgorandUnits, ProtocolIdentifier } from '../types/protocol'

//have to import client and indexer



//Interface
export interface AlgorandProtocol
  extends AirGapProtocol<{
    AddressResult: Address
    ProtocolNetwork: AlgorandProtocolNetwork
    CryptoConfiguration: AlgorandCryptoConfiguration
    Units: AlgorandUnits
    SignedTransaction: AlgorandSignedTransaction
    UnsignedTransaction: AlgorandUnsignedTransaction
    TransactionCursor: AlgorandTransactionCursor
}> {}

//Implementation
export class AlgorandProtocolImpl implements AlgorandProtocol {

//common
  private readonly units: ProtocolUnitsMetadata<AlgorandUnits> = {
    ALGO: {
      symbol: { value: 'ALGO', market: 'algo' },
      decimals: 6
    },
    microAlgo: {
      symbol:{ value: 'microAlgo'},
      decimals: 0
    }
  }

  private readonly feeDefaults: FeeDefaults<AlgorandUnits> = {
    low: newAmount(1000, 'microAlgo'),
    medium: newAmount(1000, 'microAlgo'),
    high: newAmount(1000, 'microAlgo')
  }

  private readonly metadata: ProtocolMetadata<AlgorandUnits> = {
    identifier: ProtocolIdentifier.ALGORAND,
    name: 'Algorand',

    units: this.units,
    mainUnit: 'ALGO',

    fee: {
      defaults: this.feeDefaults
    },

    account: {
      standardDerivationPath: `m'/44'/283'/0'/0/0`,
      address: {
        isCaseSensitive: true,
        regex: '^[A-Z2-7]{57}[AEIMQUY4]$'
      }
    }
  }

  public async getMetadata(): Promise<ProtocolMetadata<AlgorandUnits>> {
    return this.metadata
  }

  private readonly cryptoConfiguration: AlgorandCryptoConfiguration = {
    algorithm: 'ed25519'
  }

  public async getCryptoConfiguration(): Promise<AlgorandCryptoConfiguration> {
    return this.cryptoConfiguration
  }


//offline

  //derive key-value from derivative 

  //get address from public key
    //convert publickey to uint8array
    //derive address using sdk
    private async getAddressFromPublicKey(publicKey: PublicKey): Promise<string>{
      const addr = algosdk.encodeAddress(publicKey);
    }

  //sign transaction with secret key

  //get details of transaction

//online

  //Get details of list of transaction

  //Get balance of public key
  public async getBalanceOfPublicKey(publicKey: PublicKey, configuration?: undefined): Promise<Balance<'ALGO'>> {

    //generate address
    //get balance from address
    
  }

  //Get maximum amount that can be transacted
  public async getTransactionMaxAmountWithPublicKey(publicKey: PublicKey, to: string[], configuration?: TransactionFullConfiguration<'ALGO'> | undefined): Promise<Amount<'ALGO'>> {
    const account_info = await algodClient.accountInformation(address).do()
    const availableBalance = algosdk.microalgosToAlgos(
      (account_info["amount"] - account_info["min-balance"])
    )
  }

  
  public async  prepareTransactionWithPublicKey(publicKey: PublicKey, details: TransactionDetails<AlgorandUnits>[], configuration?: TransactionFullConfiguration<AlgorandUnits> | undefined): Promise<AlgorandUnsignedTransaction> {
    const AlgorandUnsignedTransaction = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from,
      to,
      amount,
      closeRemainderTo,
      note,
      suggestedParams
    })
  }


  //get details from signed transaction
  public async getDetailsFromUnsignedTransaction(transaction: AlgorandnUnsignedTransaction): Promise<AirGapTransaction<AlgoUnits>[]>{
    return [
      {
        from,
        to,
        amount,
        fee,
        note,
        network
      }
    ]
  }

  //get details from unsigned transaction

  //broadcast transaction
  
}

export const ALGORAND_PROTOCOL_MAINNET_NETWORK: AlgorandProtocolNetwork = {
  name: "Mainnet",
  type: "mainnet",
  rpcUrl: "https://mainnet-api.algonode.cloud",
  blockExplorerUrl: "https://allo.info/",
};

export const ALGORAND_PROTOCOL_TESTNET_NETWORK: AlgorandProtocolNetwork = {
  name: "Testnet",
  type: "testnet",
  rpcUrl: "https://testnet-api.algonode.cloud",
  blockExplorerUrl: "https://testnet.allo.info/",
};