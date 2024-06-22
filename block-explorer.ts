// block-explorer.ts

import { AirGapBlockExplorer, BlockExplorerMetadata } from "@airgap/module-kit";

class MyProtocolBlockExplorer implements AirGapBlockExplorer {
  /**
   * Get this block explorer's metadata.
   *
   * @returns The metadata
   */
  getMetadata(): Promise<BlockExplorerMetadata> {
    /* ... */
  }

  /**
   * Create a URL that links to the account's details page.
   *
   * @param address - The account's address
   * @returns The URL of the account's details page
   */
  createAddressUrl(address: string): Promise<string> {
    /* ... */
  }

  /**
   * Create a URL that links to the transaction's details page.
   *
   * @param transactionId - The transaction's identifier
   * @returns The URL of the transaction's details page
   */
  createTransactionUrl(transactionId: string): Promise<string> {
    /* ... */
  }
}