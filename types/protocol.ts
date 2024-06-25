import { ProtocolNetwork } from '@airgap/module-kit'

export type AlgorandUnits = 'ALGORAND'

export type AlgorandNetworkType = 'mainnet' | 'testnet'

export interface AlgorandProtocolNetwork extends ProtocolNetwork {
  blockExplorerApi: string
  algorandType: AlgorandNetworkType
}

export interface AlgorandProtocolOptions {
  network: AlgorandProtocolNetwork
}