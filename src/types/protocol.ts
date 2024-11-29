import { ProtocolNetwork } from '@airgap/module-kit'
import { NetworkType } from '@airgap/coinlib-core'
import { ProtocolOptions } from '@airgap/coinlib-core/utils/ProtocolOptions'

// Custom identifier for Algorand
export enum ProtocolIdentifier {
  ALGORAND = "algorand"
}

// Units for Algorand
export type AlgorandUnits = 'ALGO' | 'microAlgo'

// Define network-specific configurations for Algorand
interface AlgorandBaseProtocolNetwork extends ProtocolNetwork {
  indexerUrl: string
}

// Standard networks for Algorand
export interface AlgorandStandardProtocolNetwork extends AlgorandBaseProtocolNetwork {
  type: 'mainnet' | 'testnet'
}

// Custom networks for Algorand, if needed
export interface AlgorandCustomProtocolNetwork extends AlgorandBaseProtocolNetwork {
  type: 'custom'
}

// Union type for all Algorand networks
export type AlgorandProtocolNetwork = AlgorandStandardProtocolNetwork | AlgorandCustomProtocolNetwork

// Block Explorer for Algorand
export class AlgorandBlockExplorer {
  constructor(public readonly blockExplorerUrl: string) {}

  public async getAddressLink(address: string): Promise<string> {
    return `${this.blockExplorerUrl}/address/${address}`
  }

  public async getTransactionLink(transactionId: string): Promise<string> {
    return `${this.blockExplorerUrl}/tx/${transactionId}`
  }
}

// Configuration for Algorand Protocol
export class AlgorandProtocolConfig {
  constructor(public readonly algodToken?: string) {}
}

// Algorand Protocol Options
export interface AlgorandProtocolOptions {
  network: AlgorandProtocolNetwork
  config: AlgorandProtocolConfig
}

// Mainnet network configuration
export const ALGORAND_PROTOCOL_MAINNET_NETWORK: AlgorandStandardProtocolNetwork = {
  name: "Mainnet",
  type: 'mainnet',
  rpcUrl: "https://mainnet-api.algonode.cloud",
  indexerUrl: "https://algoindexer.algoexplorerapi.io",
  blockExplorerUrl: "https://algoexplorer.io",

}

// Testnet network configuration
export const ALGORAND_PROTOCOL_TESTNET_NETWORK: AlgorandStandardProtocolNetwork = {
  name: "Testnet",
  type: 'testnet',
  rpcUrl: "https://testnet-api.algonode.cloud",
  indexerUrl: "https://testnet-algoindexer.algoexplorerapi.io",
  blockExplorerUrl: "https://testnet.algoexplorer.io",
}

// Example Protocol Options for Mainnet
export const ALGONODE_PROTOCOL_OPTIONS: AlgorandProtocolOptions = {
  network: ALGORAND_PROTOCOL_MAINNET_NETWORK,
  config: new AlgorandProtocolConfig("YOUR_ALGOD_MAINNET_TOKEN")
}

// Example Protocol Options for Testnet
export const ALGONODE_PROTOCOL_TESTNET_OPTIONS: AlgorandProtocolOptions = {
  network: ALGORAND_PROTOCOL_TESTNET_NETWORK,
  config: new AlgorandProtocolConfig("YOUR_ALGOD_TESTNET_TOKEN")
}
