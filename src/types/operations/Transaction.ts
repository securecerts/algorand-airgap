import algosdk from 'algosdk';

// Algorand-specific transaction operation types
export enum AlgorandOperationType {
  PAYMENT = 'pay',          // Payment Transaction
  ASSET_TRANSFER = 'axfer',  // Asset Transfer Transaction
  APPLICATION_CALL = 'appl', // Application Call Transaction
}

// Algorand application call parameters, equivalent to `parameters` in Tezos
export interface AlgorandApplicationCallParameters {
  appIndex: number            // Application ID
  appArgs?: Uint8Array[]      // Arguments for the application call
}

// Wrapped Algorand transaction operation, similar to `TezosWrappedTransactionOperation`
export interface AlgorandWrappedTransactionOperation {
  contents: AlgorandTransactionOperation[]   // List of Algorand transactions
  signature: string                          // Transaction signature
}

// Core Algorand transaction operation, equivalent to `TezosTransactionOperation`
export interface AlgorandTransactionOperation {
  kind: AlgorandOperationType                // Type of transaction: pay, axfer, appl
  sender: string                             // Source account (sender in Algorand)
  fee: number                                // Fee in microAlgos
  firstRound: number                         // First valid round
  lastRound: number                          // Last valid round
  genesisID: string                          // Genesis ID
  genesisHash: string                        // Genesis hash
  note?: Uint8Array                          // Optional transaction note
  group?: Uint8Array                         // Optional group ID for atomic transfers

  // Fields for payment transactions (equivalent to `TezosTransactionOperation`)
  receiver?: string                          // Receiver account for payments
  amount?: number                            // Amount in microAlgos for payments

  // Fields for asset transfer transactions (similar to `axfer` type)
  assetIndex?: number                        // Asset ID for asset transfers
  assetReceiver?: string                     // Receiver for asset transfers
  assetAmount?: number                       // Amount of asset to transfer

  // Fields for application call transactions (similar to `parameters` in Tezos)
  appParams?: AlgorandApplicationCallParameters  // Application call parameters
}
