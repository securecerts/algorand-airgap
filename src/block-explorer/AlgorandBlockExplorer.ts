// Implemented Allo Block Explorer

import { AirGapBlockExplorer, BlockExplorerMetadata } from "@airgap/module-kit";

export class AlgorandBlockExplorer implements AirGapBlockExplorer {

  private readonly metadata: BlockExplorerMetadata = {
    name: 'Allo',
    url: this.url
  }

  public constructor(private readonly url: string) {}

  public async getMetadata(): Promise<BlockExplorerMetadata> {
    return this.metadata
  }

  public async createAddressUrl(address: string): Promise<string> {
    return `${this.url}/account/${address}`
  }

  public async createTransactionUrl(transactionId: string): Promise<string> {
    return `${this.url}/tx/${transactionId}`
  }

}