import { ProtocolNetwork } from '@airgap/module-kit'

//custom identifier
export enum ProtocolIdentifier {
  ALGORAND = "algorand"
}

export type AlgorandUnits = 'ALGO'

export type AlgorandNetworkType = 'mainnet' | 'testnet'

export interface AlgorandProtocolNetwork extends ProtocolNetwork {
  blockExplorerUrl: string
  type: AlgorandNetworkType
}

export interface AlgorandProtocolOptions {
  network: AlgorandProtocolNetwork
}