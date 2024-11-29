import {
  AirGapBlockExplorer,
  AirGapModule,
  AirGapOfflineProtocol,
  AirGapOnlineProtocol,
  AirGapProtocol,
  AirGapV3SerializerCompanion,
  createSupportedProtocols,
  ModuleNetworkRegistry,
  ProtocolConfiguration,
  ProtocolNetwork,
  RecursivePartial
} from '@airgap/module-kit'

import { AlgorandBlockExplorer } from '../block-explorer/AlgorandBlockExplorer'
import { createAlgorandProtocol } from '../protocol/AlgorandProtocol'
import { ALGORAND_PROTOCOL_MAINNET_NETWORK } from '../types/protocol'
import { AlgorandV3SerializerCompanion } from '../serializer/v3/serializer-companion'
import { AlgorandProtocolNetwork, ProtocolIdentifier } from '../types/protocol'

export class AlgorandModule implements AirGapModule {
  private readonly networkRegistries: Record<string, ModuleNetworkRegistry>
  public readonly supportedProtocols: Record<string, ProtocolConfiguration>

  public constructor() {
      // Initialize the network registry with Algorand's mainnet configuration
      const networkRegistry: ModuleNetworkRegistry = new ModuleNetworkRegistry({
          supportedNetworks: [ALGORAND_PROTOCOL_MAINNET_NETWORK]
      })

      this.networkRegistries = {
          [ProtocolIdentifier.ALGORAND]: networkRegistry
      }

      // Create supported protocols based on the network registries
      this.supportedProtocols = createSupportedProtocols(this.networkRegistries)
  }

  public async createOfflineProtocol(identifier: string): Promise<AirGapOfflineProtocol | undefined> {
      return this.createProtocol(identifier)
  }

  public async createOnlineProtocol(
      identifier: string,
      networkOrId?: AlgorandProtocolNetwork | string
  ): Promise<AirGapOnlineProtocol | undefined> {
      // Determine the network either by provided object or by finding it in the registry
      const network: ProtocolNetwork | undefined =
          typeof networkOrId === 'object' ? networkOrId : this.networkRegistries[identifier]?.findNetwork(networkOrId)

      if (network === undefined) {
          throw new Error('Protocol network type not supported.')
      }

      return this.createProtocol(identifier, network)
  }

  public async createBlockExplorer(
      identifier: string,
      networkOrId?: AlgorandProtocolNetwork | string
  ): Promise<AirGapBlockExplorer | undefined> {
      const network: ProtocolNetwork | undefined =
          typeof networkOrId === 'object' ? networkOrId : this.networkRegistries[identifier]?.findNetwork(networkOrId)

      if (network === undefined) {
          throw new Error('Block Explorer network type not supported.')
      }

      return new AlgorandBlockExplorer(network.blockExplorerUrl)
  }

  public async createV3SerializerCompanion(): Promise<AirGapV3SerializerCompanion> {
      return new AlgorandV3SerializerCompanion()
  }

  // Private method to create an Algorand protocol instance
  private createProtocol(identifier: string, network?: ProtocolNetwork): AirGapProtocol {
    switch (identifier) {
        case ProtocolIdentifier.ALGORAND:
            // Cast the network to `RecursivePartial<AlgorandProtocolNetwork>` to ensure compatibility
            return createAlgorandProtocol({
                network: network as RecursivePartial<AlgorandProtocolNetwork>
            })
        default:
            throw new Error(`Protocol ${identifier} not supported.`)
    }
}
}
