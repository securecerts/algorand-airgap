import {
    AirGapBlockExplorer,
    AirGapModule,
    AirGapOfflineProtocol,
    AirGapOnlineProtocol,
    AirGapV3SerializerCompanion,
    createSupportedProtocols,
    ModuleNetworkRegistry,
    ProtocolConfiguration,
    ProtocolNetwork
} from '@airgap/module-kit'
import { MyProtocol, MY_PROTOCOL_MAINNET_NETWORK, MY_PROTOCOL_TESTNET_NETWORK } from '../protocol-full.ts'
import { MyOfflineProtocol } from '../protocol-offline.ts'
import { MY_ONLINE_PROTOCOL_MAINNET_NETWORK } from '../protocol-online.ts'
import { MyProtocolBlockExplorer } from './protocol-full-block-explorer.ts'
import { MyOnlineProtocolBlockExplorer } from '../block-explorer/AlloExplorer.ts'
import { MyV3SerializerCompanion } from '../v3serializer.ts'

export class AlgorandModule implements AirGapModule {
    /**
     * A set of protocols supported by this module along with their configuration.
     * Grouped by the protocol identifier.
     */
    supportedProtocols: Record<string, ProtocolConfiguration> = createSupportedProtocols(
        { /* online protocols */
            'online-only-protocol': new ModuleNetworkRegistry({
                supportedNetworks: [MY_ONLINE_PROTOCOL_MAINNET_NETWORK]
            }),
            'offline-and-online-protocol': new ModuleNetworkRegistry({
                supportedNetworks: [MY_PROTOCOL_MAINNET_NETWORK, MY_PROTOCOL_TESTNET_NETWORK]
            })
        },
        [ /* offline protocols */
            'offline-only-protocol',
            'offline-and-online-protocol'
        ]
    )

    /**
     * Create an offline protocol instance, if supported.
     *
     * @param identifier - The identifier of the protocol whose instance should be created
     * @returns A protocol instance or `undefined` if the type of protocol is not supported
     */
    createOfflineProtocol(identifier: string): Promise<AirGapOfflineProtocol | undefined> {
        switch (identifier) {
            case 'offline-only-protocol':
                return new MyOfflineProtocol()
            case 'offline-and-online-protocol':
                return new MyProtocol()
            default:
                return undefined
        }
    }

    /**
     * Create an online protocol instance, if supported.
     *
     * @param identifier - The identifier of the protocol whose instance should be created
     * @param networkOrId - A protocol network or its ID which should be used to create the protocol instance
     * @returns A protocol instance or `undefined` if the type of protocol is not supported
     */
    createOnlineProtocol(identifier: string, networkOrId?: string | ProtocolNetwork): Promise<AirGapOnlineProtocol | undefined> {
        const network = /* get the network configuration based on `networkOrId` */

        switch (identifier) {
            case 'online-only-protocol':
                return new MyOnlineProtocol(network)
            case 'offline-and-online-protocol':
                return new MyProtocol(network)
            default:
                return undefined
        }
    }

   /**
     * Create a block explorer, if online protocols are supported.
     *
     * @param identifier - The identifier of the protocol for which a block explorer instance should be created
     * @param networkOrId - A protocol network or its ID which should be used to create the block explorer instance
     * @returns A block explorer instance or `undefined` if online protocols aren't supported
     */
    createBlockExplorer(identifier: string, networkOrId?: string | ProtocolNetwork): Promise<AirGapBlockExplorer | undefined> {
        const network = /* get the network configuration based on `networkOrId` */

        switch (identifier) {
            case 'online-only-protocol':
                return new MyOnlineProtocolBlockExplorer(network)
            case 'offline-and-online-protocol':
                return new MyProtocolBlockExplorer(network)
            default:
                return undefined
        }
    }

    /**
     * Create AirGap's V3 Serializer companion object.
     * @returns A V3 Serializer companion instance.
     */
    createV3SerializerCompanion(): Promise<AirGapV3SerializerCompanion> {
        return new MyV3SerializerCompanion()
    }
}