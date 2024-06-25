import { Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import { ConditionViolationError } from '@airgap/coinlib-core/errors'
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
    ProtocolNetwork
} from '@airgap/module-kit'
import { AlgorandBlockExplorer } from '../block-explorer/AlgorandBlockExplorer'
import { createAlgorandProtocol, ALGORAND_MAINNET_PROTOCOL_NETWORK} from '../protocol/AlgorandProtocol'
import { AlgorandV3SerializerCompanion } from '../serializer/v3/serializer-companion'
import { AlgorandProtocolNetwork} from '../types/protocol'

//type SupportedProtocols = MainProtocolSymbols.ALGORAND

export class AlgorandModule implements AirGapModule 
{

    private readonly networkRegistries: Record<string, ModuleNetworkRegistry>
    public readonly supportedProtocols: Record<string, ProtocolConfiguration>

    public constructor() {
        const networkRegistry: ModuleNetworkRegistry = new ModuleNetworkRegistry({
          supportedNetworks: [ALGORAND_MAINNET_PROTOCOL_NETWORK]
        })
    
        this.networkRegistries = {
          [MainProtocolSymbols.ALGORAND]: networkRegistry
        }
        this.supportedProtocols = createSupportedProtocols(this.networkRegistries)

    }

    public async createOfflineProtocol(identifier: string): Promise<AirGapOfflineProtocol | undefined> {
        return this.createProtocol(identifier)
    }

    public async createOnlineProtocol(
        identifier: string,
        networkOrId?: AlgorandProtocolNetwork | string
      ): Promise<AirGapOnlineProtocol | undefined> {
        const network: ProtocolNetwork | undefined =
          typeof networkOrId === 'object' ? networkOrId : this.networkRegistries[identifier]?.findNetwork(networkOrId)
    
        if (network === undefined) {
          throw new ConditionViolationError(Domain.ALGORAND, 'Protocol network type not supported.')
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
          throw new ConditionViolationError(Domain.ALGORAND, 'Block Explorer network type not supported.')
        }
    
        return new AlgorandBlockExplorer(network.blockExplorerUrl)
    }

    public async createV3SerializerCompanion(): Promise<AirGapV3SerializerCompanion> {
        return new AlgorandV3SerializerCompanion()
    }

    private createProtocol(identifier: string, network?: ProtocolNetwork): AirGapProtocol {
        switch (identifier) {
          case MainProtocolSymbols.ALGORAND:
            return createAlgorandProtocol({ network })
          default:
            throw new ConditionViolationError(Domain.ALGORAND, `Protocol ${identifier} not supported.`)
        }
    }
}