import { Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { BalanceError, ConditionViolationError } from '@airgap/coinlib-core/errors'
import { encodeDerivative } from '@airgap/crypto'
import {encodeAddress} from "algosdk"
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
    }
  }

  private readonly feeDefaults: FeeDefaults<AlgorandUnits> = {
    low: newAmount(0.0001, 'ALGO'),
    medium: newAmount(0.0001, 'ALGO'),
    high: newAmount(0.0001, 'ALGO')
  }

  private readonly metadata: ProtocolMetadata<AlgorandUnits> = {
    identifier: ProtocolIdentifier.ALGORAND,
    name: 'Algorand',

    units: this.units,
    mainUnit: 'ALGO',

    fee: {
      defaults: this.feeDefaults
    },

    //derivation to-do
  
  }

  public async getMetadata(): Promise<ProtocolMetadata<AlgorandUnits>> {
    return this.metadata
  }

  private readonly cryptoConfiguration: AlgorandCryptoConfiguration = {
    algorithm: 'secp256k1'
  }

  public async getCryptoConfiguration(): Promise<AlgorandCryptoConfiguration> {
    return this.cryptoConfiguration
  }

//offline

  //getKeyPairFromDerivative

  //get address from public key

  //sign transaction with secret key

  //get details of transaction

//online

  //get address from public key

  //Get details of list of transaction

  //Get balance of public key

  //Get maximum amount that can be transacted

  //Get transaction fee from public key

  //get details from unsigned transaction

  //get details from signed transaction

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