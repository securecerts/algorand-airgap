// protocol-online.ts

import { AirGapOnlineProtocol, ProtocolNetwork } from "@airgap/module-kit";

class MyOnlineProtocol implements AirGapOnlineProtocol {
  constructor(network: ProtocolNetwork) {}

  /**
   * Get this protocol's metadata, i.e. its unique configuration.
   *
   * The metadata will be used to identify the protocol, display its details
   * and help building customized forms.
   *
   * @returns The metadata
   */
  getMetadata(): Promise<ProtocolMetadata> {
    /* ... */
  }

  /**
   * Get this protocol's network configuration.
   *
   * The network configuration will be used to create
   * companion objects for this protocol (e.g. block explorer),
   * and identify different instances of this protocol
   * operating on different networks (e.g. mainnet and testnet).
   *
   * @returns The network configuration
   */
  getNetwork(): Promise<ProtocolNetwork> {
    /* ... */
  }

  /**
   * Derives an address from a public key.
   *
   * @param publicKey - The public key from which the address should be derived
   * @returns The address
   */
  getAddressFromPublicKey(publicKey: PublicKey): Promise<AddressResult> {
    /* ... */
  }

  /**
   * Get a list of transactions involving the specified account.
   *
   * @param publicKey - The account's public key which should be a sender or reciever of the transactions
   * @param limit - The maximum number of transactions to return
   * @param cursor - A paging cursor specifying how to proceed with the fetching
   * @returns A list of transactions with a cursor which can be used to fetch another portion of data
   */
  getTransactionsForPublicKey(
    publicKey: PublicKey,
    limit: number,
    cursor?: TransactionCursor
  ): Promise<AirGapTransactionsWithCursor> {
    /* ... */
  }

  /**
   * Get the balance of the account.
   *
   * @param publicKey - The account's public key
   * @returns The balance
   */
  getBalanceOfPublicKey(publicKey: PublicKey): Promise<Balance> {
    /* ... */
  }

  /**
   * Estimate the maximum transaction amount.
   *
   * @param publicKey - The sender of the transaction
   * @param to - Recipients
   * @param configuration - Additional transaction configuration
   * @returns The estimated maximum amount
   */
  getTransactionMaxAmountWithPublicKey(
    publicKey: PublicKey,
    to: Address[],
    configuration?: TransactionConfiguration
  ): Promise<Amount> {
    /* ... */
  }

  /**
   * Estimate the fee which will be paid for the submission of the transaction.
   *
   * @param publicKey - The sender of the transaction
   * @param details - Transaction details
   * @returns The estimated fee, either an amount or a set of amounts
   */
  getTransactionFeeWithPublicKey(
    publicKey: PublicKey,
    details: TransactionDetails[]
  ): Promise<FeeEstimation> {
    /* ... */
  }

  /**
   * Create an unsigned transaction.
   *
   * @param publicKey - The sender of the transaction
   * @param details - Transaction details
   * @param configuration - Additional transaction configuration
   * @returns An unsigned transaction
   */
  prepareTransactionWithPublicKey(
    publicKey: PublicKey,
    details: TransactionDetails[],
    configuration?: TransactionConfiguration
  ): Promise<UnsignedTransaction> {
    /* ... */
  }

  /**
   * Transform the transaction to a unified form which will be
   * further used to display the details about this transaction.
   *
   * @param transaction - The transaction to be processed
   * @param publicKey - The public key of the creator of the transaction
   * @returns A list of unified transaction details
   */
  getDetailsFromTransaction(
    transaction: UnsignedTransaction | SignedTransaction,
    publicKey: PublicKey
  ): Promise<AirGapTransaction[]> {
    /* ... */
  }

  /**
   * Submit the transaction.
   *
   * @param transaction - The transaction to be submitted
   * @returns The transaction hash
   */
  broadcastTransaction(transaction: SignedTransaction): Promise<string> {
    /* ... */
  }
}

const MY_ONLINE_PROTOCOL_MAINNET_NETWORK: ProtocolNetwork = {
  name: "Mainnet",
  type: "mainnet",
  rpcUrl: "...",
  blockExplorerUrl: "...",
};