import { Domain, MainProtocolSymbols } from '@airgap/coinlib-core'
import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber'
import { BalanceError, ConditionViolationError } from '@airgap/coinlib-core/errors'
import { encodeDerivative } from '@airgap/crypto'
import algosdk, { SignedTransaction, SuggestedParams, Transaction } from "algosdk"
import { hash } from '@stablelib/blake2b'; // Importing hash function for hashing public keys
import * as bs58 from 'bs58';
import { algodClient, indexerClient } from "../config/algosdk"
import {
  Address,
  AirGapProtocol,
  AirGapTransaction,
  AirGapTransactionsWithCursor,
  Amount,
  Balance,
  CryptoDerivative,
  FeeDefaults,
  KeyPair,
  newAmount,
  newPlainUIText,
  newPublicKey,
  newSecretKey,
  newSignedTransaction,
  newUnsignedTransaction,
  newWarningUIAlert,
  ProtocolMetadata,
  ProtocolUnitsMetadata,
  PublicKey,
  RecursivePartial,
  SecretKey,
  TransactionDetails,
  TransactionFullConfiguration,
  TransactionSimpleConfiguration
} from '@airgap/module-kit'
import { AlgorandCryptoConfiguration } from '../types/crypto'
import { ALGORAND_PROTOCOL_MAINNET_NETWORK, AlgorandProtocolNetwork, AlgorandProtocolOptions, AlgorandUnits, ProtocolIdentifier } from '../types/protocol'
import { AlgorandSignedTransaction, AlgorandTransactionCursor, AlgorandUnsignedTransaction } from '../types/transaction'
import { convertEncodedBytesString, convertHexBytesString } from '../utils/convert'
import { BASE58_PREFIX, decodeBase58, encodeBase58 } from '../utils/encoding'
import { AlgorandWrappedOperation } from '../types/operations/AlgorandWrappedOperation'

export type AlgorandInfoClientTransaction = Omit<AirGapTransaction, 'network'>
//have to import client and indexer



export interface RawAlgorandTransaction {
  txID: string;
  unsignedTxn: Uint8Array;
}

class AlgorandAddress {
  constructor(public readonly value: string) { }

  // Generates Algorand address from a public key
  public static fromPublicKey(publicKey: PublicKey): AlgorandAddress {
    // Convert the public key to the correct format if necessary
    const convertedPublicKey = this.convertPublicKey(publicKey, 'hex', 'algorandPublicKey');
    // Generate and return the Algorand address
    return new AlgorandAddress(this.algorandAddress(convertedPublicKey.value));
  }

  // Creates an Algorand address from a public key using Algorand's checksum method
  private static algorandAddress(publicKeyHex: string): string {
    // Convert the hex public key to a Uint8Array
    const publicKeyBytes = Buffer.from(publicKeyHex, 'hex');
    // Encode the public key as an Algorand address using algosdk's built-in function
    return algosdk.encodeAddress(publicKeyBytes);
  }

  // Verifies if a given address is a valid Algorand address
  public static isAlgorandAddress(address: string): boolean {
    // Use algosdk to check if the address is valid
    return algosdk.isValidAddress(address);
  }

  // Converts the class instance into a string (the Algorand address as a string)
  public asString(): string {
    return this.value;
  }

  // Converts the public key to Algorand-compatible formats
  public static convertPublicKey(
    publicKey: PublicKey,
    targetFormat: PublicKey['format'],
    type:
      | 'algorandPublicKey'
      | 'algorandAccountAddress'
      | 'algorandPrivateKey'
      | 'algorandSeed'
      | 'algorandMultisigAddress'
      | 'algorandVotingKey'
      | 'algorandVoteFirstRound'
      | 'algorandVoteLastRound'
      | 'algorandAccountMicro' = 'algorandPublicKey'
  ): PublicKey {
    if (publicKey.format === targetFormat) {
      return publicKey;
    }

    switch (publicKey.format) {
      case 'encoded':
        return newPublicKey(convertEncodedBytesString(type, publicKey.value, targetFormat), targetFormat);
      case 'hex':
        return newPublicKey(convertHexBytesString(type, publicKey.value, targetFormat), targetFormat);
      default:
        throw new Error('Unsupported public key format.');
    }
  }

  public static fromValue(value: string): AlgorandAddress {
    if (!this.isAlgorandAddress(value)) {
      throw new Error(`Invalid address. Expected an 'Algorand' address, got ${JSON.stringify(value)}`);
    }
    return new AlgorandAddress(value);
  }
}


//Interface
export interface AlgorandProtocol
  extends AirGapProtocol<{
    AddressResult: Address
    ProtocolNetwork: AlgorandProtocolNetwork
    CryptoConfiguration: AlgorandCryptoConfiguration
    Units: AlgorandUnits
    SignedTransaction: AlgorandSignedTransaction
    UnsignedTransaction: AlgorandUnsignedTransaction
    TransactionCursor: AlgorandTransactionCursor
  }> { }

//Implementation
export class AlgorandProtocolImpl implements AlgorandProtocol {


  private options: AlgorandProtocolOptions;

  constructor(options: AlgorandProtocolOptions) {
    this.options = options; // Store the options for use in other methods
  }


  //common
  private readonly units: ProtocolUnitsMetadata<AlgorandUnits> = {
    ALGO: {
      symbol: { value: 'ALGO', market: 'algo' },
      decimals: 6
    },
    microAlgo: {
      symbol: { value: 'microAlgo' },
      decimals: 0
    }
  }

  private readonly feeDefaults: FeeDefaults<AlgorandUnits> = {
    low: newAmount(1000, 'microAlgo'),
    medium: newAmount(1000, 'microAlgo'),
    high: newAmount(1000, 'microAlgo')
  }

  private readonly metadata: ProtocolMetadata<AlgorandUnits> = {
    identifier: ProtocolIdentifier.ALGORAND,
    name: 'Algorand',

    units: this.units,
    mainUnit: 'ALGO',

    fee: {
      defaults: this.feeDefaults
    },

    account: {
      standardDerivationPath: `m'/44'/283'/0'/0/0`,
      address: {
        isCaseSensitive: true,
        regex: '^[A-Z2-7]{57}[AEIMQUY4]$'
      }
    }
  }

  public async getMetadata(): Promise<ProtocolMetadata<AlgorandUnits>> {
    return this.metadata
  }

  private readonly cryptoConfiguration: AlgorandCryptoConfiguration = {
    algorithm: 'ed25519'
  }

  public async getCryptoConfiguration(): Promise<AlgorandCryptoConfiguration> {
    return this.cryptoConfiguration
  }


  //check it

  public async getKeyPairFromDerivative(derivative: CryptoDerivative): Promise<KeyPair> {
    // Convert secret key to hex format
    const secretKeyHex = Buffer.from(derivative.secretKey, 'hex').toString('hex');

    // Encode the public key as an Algorand address
    const algorandAddress = algosdk.encodeAddress(Buffer.from(derivative.publicKey, 'hex'));

    return {
      secretKey: newSecretKey(secretKeyHex, 'hex'), // Return the secret key in hex format
      publicKey: newPublicKey(algorandAddress)      // Use algorandAddress directly as a string
    };
  }

  public async signTransactionWithSecretKey(transaction: AlgorandUnsignedTransaction, secretKey: SecretKey): Promise<AlgorandSignedTransaction> {
    // Step 1: Create a transaction object from the given parameters using algosdk
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: transaction.from,
      to: transaction.to,
      amount: transaction.amount,
      note: transaction.note,
      closeRemainderTo: transaction.closeRemainderTo,
      suggestedParams: transaction.suggestedParams
    });

    // Step 2: Sign the transaction using the secret key
    const signedTxn = txn.signTxn(Buffer.from(secretKey.value, 'hex'));

    // Step 3: Decode the signed transaction
    const decodedTxn = algosdk.decodeSignedTransaction(signedTxn);

    // Step 4: Ensure it satisfies AlgorandSignedTransaction by setting the missing 'type' property
    const algorandSignedTxn: AlgorandSignedTransaction = {
      ...decodedTxn,
      type: 'signed', // Add the appropriate type (e.g., 'pay' for a payment transaction)
      txn: transaction // Ensure the original unsigned transaction is included
    };

    return algorandSignedTxn;
  }


  public async getTransactionsForPublicKey(
    publicKey: PublicKey,
    limit: number,
    cursor?: AlgorandTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<AlgorandTransactionCursor, AlgorandUnits, AlgorandUnits>> {
    // Get the Algorand address from the public key
    const address: string = await this.getAddressFromPublicKey(publicKey);

    // Fetch transactions for the resolved address
    return this.getTransactionsForAddress(address, limit, cursor);
  }

  public async getTransactionsForAddress(
    address: string,
    limit: number,
    cursor?: AlgorandTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<AlgorandTransactionCursor, AlgorandUnits, AlgorandUnits>> {
    // Fetch transactions for the single address
    return this.getTransactionsForAddresses([address], limit, cursor);
  }


  public async getTransactionsForAddresses(
    addresses: string[],
    limit: number,
    cursor?: AlgorandTransactionCursor
  ): Promise<AirGapTransactionsWithCursor<AlgorandTransactionCursor, AlgorandUnits, AlgorandUnits>> {
    if (addresses.length === 0) {
      throw new Error('At least one address must be provided.');
    }

    const singleLimit = new BigNumber(limit).div(addresses.length).decimalPlaces(0, BigNumber.ROUND_FLOOR).toNumber();
    const singleLimitCompensation = Math.max(limit - addresses.length * singleLimit, 0);

    const allTransactions = await Promise.all(
      addresses.map(async (address, index) => {
        const addressLimit = index === 0 ? singleLimit + singleLimitCompensation : singleLimit;
        const response = await indexerClient
          .searchForTransactions()
          .address(address)
          .limit(addressLimit)
          .nextToken(cursor?.next || '')
          .do();

        return [address, response.transactions] as [string, algosdk.Transaction[]];
      })
    );

    // Flatten and map all transactions with cursors for each address
    const reducedResult = allTransactions.reduce<AirGapTransactionsWithCursor<AlgorandTransactionCursor, AlgorandUnits>>(
      (acc, [address, txs]) => {
        const mappedTransactions = txs.map((tx) => {



          return {
            from: [tx['sender']],  // Access the sender via tx['sender']
            to: [tx['payment-transaction']?.receiver],
            amount: newAmount(algosdk.microalgosToAlgos(tx['payment-transaction']?.amount || 0), 'ALGO'),
            fee: newAmount(algosdk.microalgosToAlgos(tx.fee || 0), 'ALGO'),
            isInbound: tx['payment-transaction']?.receiver === address,
            network: this.options.network,
            arbitraryData: tx.note ? Buffer.from(tx.note).toString('utf-8') : '',
            extra: {}
          } as AirGapTransaction<AlgorandUnits, AlgorandUnits>;
        });

        return {
          transactions: acc.transactions.concat(mappedTransactions),
          cursor: {
            hasNext: acc.cursor.hasNext || txs.length >= singleLimit,
            next: acc.cursor.next || '' // Use appropriate logic to fetch the next page cursor if needed
          }
        };
      },
      {
        transactions: [],
        cursor: { hasNext: false, next: '' }
      }
    );

    return reducedResult;
  }




  // public async getDetailsFromWrappedOperation(
  //   wrappedOperation: AlgorandWrappedOperation
  // ): Promise<AirGapTransaction<AlgorandUnits, AlgorandUnits>[]> {
  //   return this.getDetailsFromWrappedOperation(wrappedOperation)
  // }

  public async prepareTransactionFromPublicKey(
    publicKey: PublicKey,
    recipient: string,
    value: string,
    fee: string,
    data?: { note?: string }
  ): Promise<RawAlgorandTransaction> {
    // Convert the transaction amount and fee to BigNumber instances for accuracy
    const wrappedValue = new BigNumber(value);
    const wrappedFee = new BigNumber(fee);

    // Step 1: Retrieve sender address from the public key
    const fromAddress = await this.getAddressFromPublicKey(publicKey);

    // Step 2: Fetch account info and check balance
    const accountInfo = await algodClient.accountInformation(fromAddress).do();
    const balance = new BigNumber(accountInfo.amount);

    // Step 3: Verify that balance is sufficient for the transaction + fee
    if (balance.lt(wrappedValue.plus(wrappedFee))) {
      throw new Error('Insufficient balance to cover transaction amount and fee');
    }

    // Step 4: Fetch suggested transaction parameters (firstRound, lastRound, minFee)
    const suggestedParams: SuggestedParams = await algodClient.getTransactionParams().do();

    // Step 5: Create a single transaction with the provided parameters
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: fromAddress,
      to: recipient,
      amount: wrappedValue.toNumber(),
      note: data?.note ? new TextEncoder().encode(data.note) : undefined,
      suggestedParams: { ...suggestedParams, flatFee: true, fee: wrappedFee.toNumber() },
    });

    // Step 6: Serialize the transaction for output
    const unsignedTxn = txn.toByte();

    return {
      txID: txn.txID().toString(),
      unsignedTxn,
    };
  }
  // Implementing the missing method to estimate the transaction fee
  public async getTransactionFeeWithPublicKey(
    publicKey: PublicKey,
    details: TransactionDetails<AlgorandUnits>[]
  ): Promise<FeeDefaults<AlgorandUnits>> {
    // Fetch suggested params from the Algod client
    const suggestedParams = await algodClient.getTransactionParams().do();
    const baseFeeInMicroAlgos = suggestedParams.fee;

    // Create a sample transaction to estimate the size
    const from = await this.getAddressFromPublicKey(publicKey);
    const to = details[0].to;
    const amount = algosdk.algosToMicroalgos(parseFloat(details[0].amount.value));

    const transaction = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from,
      to,
      amount,
      suggestedParams
    });

    // Estimate the serialized transaction size
    const estimatedSize = transaction.bytesToSign().length;

    // Calculate fees based on transaction size
    const feeMultiplier = Math.ceil(estimatedSize / 1024); // Scale up if size > 1 KB
    const baseCalculatedFee = baseFeeInMicroAlgos * feeMultiplier;

    // Define fee levels
    const feeDefaults: FeeDefaults<AlgorandUnits> = {
      low: newAmount(algosdk.microalgosToAlgos(baseCalculatedFee), 'ALGO'),
      medium: newAmount(algosdk.microalgosToAlgos(baseCalculatedFee * 1.2), 'ALGO'),  // 20% increase for medium
      high: newAmount(algosdk.microalgosToAlgos(baseCalculatedFee * 1.5), 'ALGO')    // 50% increase for high
    };

    return feeDefaults;
  }




  public async getDetailsFromTransaction(
    transaction: AlgorandUnsignedTransaction | AlgorandSignedTransaction,
    publicKey: PublicKey
  ): Promise<AirGapTransaction<AlgorandUnits, AlgorandUnits>[]> {
    // Extract common fields
    let fromAddress: string;
    let toAddress: string;
    let amount: number | bigint;
    let fee: number;
    let note: string = '';

    // Determine if it's a signed or unsigned transaction
    if ('txn' in transaction) {
      // Signed transaction, access the unsigned transaction within it
      const unsignedTxn = transaction.txn;
      fromAddress = unsignedTxn.from;
      toAddress = unsignedTxn.to;
      amount = unsignedTxn.amount;
      fee = unsignedTxn.suggestedParams.fee;
      if (unsignedTxn.note) {
        note = Buffer.from(unsignedTxn.note).toString('utf-8');
      }
    } else {
      // Unsigned transaction
      fromAddress = transaction.from;
      toAddress = transaction.to;
      amount = transaction.amount;
      fee = transaction.suggestedParams.fee;
      if (transaction.note) {
        note = Buffer.from(transaction.note).toString('utf-8');
      }
    }

    // Convert amount and fee from microAlgos to Algos
    const amountInAlgos = algosdk.microalgosToAlgos(typeof amount === 'bigint' ? Number(amount) : amount);
    const feeInAlgos = algosdk.microalgosToAlgos(fee);

    const transactionDetails: AirGapTransaction<AlgorandUnits, AlgorandUnits> = {
      from: [fromAddress],
      to: [toAddress],
      amount: newAmount(amountInAlgos, 'ALGO'),
      fee: newAmount(feeInAlgos, 'ALGO'),
      isInbound: false, // This can be modified based on your specific logic
      status: { type: 'unknown', hash: '' }, // Default status, can be updated based on transaction status
      network: this.options?.network, // Use network from options
      arbitraryData: note, // Transaction note, if available
      extra: {} // Additional fields can be added if needed
    };

    return [transactionDetails]; // Return an array of AirGapTransaction
  }





  public async getNetwork(): Promise<AlgorandProtocolNetwork> {
    return this.options.network; // Assuming `options` contains the network configuration
  }




  public static convertEncodedBytesString(
    type: keyof typeof BASE58_PREFIX,
    encoded: string,
    targetFormat: 'encoded' | 'hex'
  ): string {
    switch (targetFormat) {
      case 'encoded':
        return encoded; // No conversion needed, return as is
      case 'hex':
        const decodedBytes = decodeBase58(encoded, type); // Decode the base58 to bytes
        return Buffer.from(decodedBytes).toString('hex'); // Convert bytes to hex
      default:
        throw new Error('Unsupported bytes string format.'); // Handle unsupported format
    }
  }

  public static convertHexBytesString(
    type: keyof typeof BASE58_PREFIX,
    value: string,
    targetFormat: 'encoded' | 'hex'
  ): string {
    const bytes = Buffer.from(value, 'hex'); // Convert hex string to bytes
    switch (targetFormat) {
      case 'encoded':
        return encodeBase58(bytes, type); // Convert bytes to base58
      case 'hex':
        return value; // No conversion needed, return as is
      default:
        throw new Error('Unsupported bytes string format.'); // Handle unsupported format
    }
  }

  public async getAddressFromPublicKey(publicKey: PublicKey): Promise<string> {
    return AlgorandAddress.fromPublicKey(publicKey).asString();
  }


  //sign transaction with secret key

  //get details of transaction

  //online

  //Get details of list of transaction

  //Get balance of public key
  public async getBalanceOfPublicKey(publicKey: PublicKey, configuration?: undefined): Promise<Balance<'ALGO'>> {
    const address = await this.getAddressFromPublicKey(publicKey);
    const accountInfo = await algodClient.accountInformation(address).do();

    return {
      total: newAmount(accountInfo.amount, 'ALGO'),
      transferable: newAmount(accountInfo.amount - accountInfo['min-balance'], 'ALGO')
    };
  }


  //Get maximum amount that can be transacted
  public async getTransactionMaxAmountWithPublicKey(publicKey: PublicKey, to: string[], configuration?: TransactionFullConfiguration<'ALGO'>): Promise<Amount<'ALGO'>> {
    const address = await this.getAddressFromPublicKey(publicKey);
    const accountInfo = await algodClient.accountInformation(address).do();
    const availableBalance = algosdk.microalgosToAlgos(accountInfo.amount - accountInfo['min-balance']);

    return newAmount(availableBalance, 'ALGO');
  }



  public async prepareTransactionWithPublicKey(
    publicKey: PublicKey,
    details: TransactionDetails<AlgorandUnits>[],
    configuration?: TransactionFullConfiguration<AlgorandUnits>
  ): Promise<AlgorandUnsignedTransaction> {

    // Get the 'from' address using the public key
    const from = await this.getAddressFromPublicKey(publicKey);

    // Get the 'to' address and amount from the details array
    const to = details[0].to;

    // Ensure that amount is converted to a number before passing to 'algosToMicroalgos'
    const amount = parseFloat(details[0].amount.value);

    // Fetch suggested transaction parameters from the Algod client
    const suggestedParams: SuggestedParams = await algodClient.getTransactionParams().do();

    // Create the payment transaction with suggested params
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from,
      to,
      amount: algosdk.algosToMicroalgos(amount), // Convert amount to microAlgos
      closeRemainderTo: undefined,
      suggestedParams // Pass the suggestedParams directly
    });

    // Construct and return the unsigned transaction object, including the 'type' field
    const unsignedTxn: AlgorandUnsignedTransaction = {
      from: algosdk.encodeAddress(txn.from.publicKey),
      to: algosdk.encodeAddress(txn.to.publicKey),
      amount: txn.amount,
      closeRemainderTo: txn.closeRemainderTo ? algosdk.encodeAddress(txn.closeRemainderTo.publicKey) : undefined,
      note: txn.note,
      suggestedParams: {
        fee: suggestedParams.fee,
        firstRound: suggestedParams.firstRound,
        lastRound: suggestedParams.lastRound,
        genesisID: suggestedParams.genesisID,
        genesisHash: suggestedParams.genesisHash,
      },
      type: 'unsigned' // Specify the transaction type as 'pay'
    };

    return unsignedTxn; // Return the unsigned transaction object
  }





  //get details from signed transaction
  public async getDetailsFromSignedTransaction(
    transaction: Uint8Array // The serialized transaction in Uint8Array format
  ): Promise<AirGapTransaction<AlgorandUnits>[]> {
    try {
      // Decode the signed transaction using algosdk
      const decodedTxn: SignedTransaction = algosdk.decodeSignedTransaction(transaction);

      const txn = decodedTxn.txn; // This contains the actual transaction details

      // Extract sender, receiver, amount, fee, etc.
      const from = algosdk.encodeAddress(txn.from.publicKey); // Convert Address to string
      const to = txn.to ? algosdk.encodeAddress(txn.to.publicKey) : ''; // Receiver address (if present)
      const amount = txn.amount; // Amount in microAlgos (1 ALGO = 1e6 microAlgos)
      const fee = txn.fee; // Fee in microAlgos
      const note = txn.note ? Buffer.from(txn.note).toString('utf-8') : ''; // Optional transaction note

      // Handle 'bigint' values by converting to number (ensure they are safe)
      const safeAmount = typeof amount === 'bigint' ? Number(amount) : amount;
      const safeFee = typeof fee === 'bigint' ? Number(fee) : fee;

      // Return the transaction details
      return [
        {
          from: [from],
          to: [to],
          isInbound: false,

          amount: newAmount(algosdk.microalgosToAlgos(safeAmount), 'ALGO'), // Convert microAlgos to ALGO
          fee: newAmount(algosdk.microalgosToAlgos(safeFee), 'ALGO'), // Convert microAlgos to ALGO

          network: this.options?.network, // Provide a default or use the options object
          status: {
            type: 'unknown',
            hash: decodedTxn.sig ? Buffer.from(decodedTxn.sig).toString('hex') : 'unknown' // Handle undefined sig
          },
          arbitraryData: note, // Transaction note if available
          extra: {
            genesisHash: txn.genesisHash.toString('base64'),
            genesisId: txn.genesisID,
            firstRound: txn.firstRound,
            lastRound: txn.lastRound
          }
        }
      ];
    } catch (error) {
      throw new Error(`Error decoding signed transaction: ${error.message}`);
    }
  }


  // Update broadcastTransaction to accept a Uint8Array
  //fixing this encoding for uint6 conversion
  public async broadcastTransaction(transaction: AlgorandSignedTransaction): Promise<string> {
    try {
      // Serialize AlgorandSignedTransaction to Uint8Array using algosdk
      const signedTransaction: Uint8Array = algosdk.encodeObj(transaction);

      // Broadcast the serialized transaction using the algodClient
      const response = await algodClient.sendRawTransaction(signedTransaction).do();

      // Return the transaction ID (hash) if successful
      return response.txId;
    } catch (error) {
      // Handle any errors, potentially wrapping it in a custom error like NetworkError
      throw new Error(`Error broadcasting Transaction: ${error.message}`);

    }
  }

}


// Default network configuration for Algorand (Mainnet)
const DEFAULT_ALGORAND_PROTOCOL_NETWORK: AlgorandProtocolNetwork = ALGORAND_PROTOCOL_MAINNET_NETWORK;

// Define the default protocol options, including an empty config
const DEFAULT_ALGORAND_PROTOCOL_OPTIONS: AlgorandProtocolOptions = {
  network: DEFAULT_ALGORAND_PROTOCOL_NETWORK,
  config: {} // Ensure config is provided, even if empty
};

// Function to create Algorand protocol options with merged defaults
export function createAlgorandProtocolOptions(
  network: RecursivePartial<AlgorandProtocolNetwork> = {}
): AlgorandProtocolOptions {
  return {
    ...DEFAULT_ALGORAND_PROTOCOL_OPTIONS,
    network: {
      ...DEFAULT_ALGORAND_PROTOCOL_NETWORK,
      blockExplorerUrl: network.blockExplorerUrl || DEFAULT_ALGORAND_PROTOCOL_NETWORK.blockExplorerUrl,
      rpcUrl: network.rpcUrl || DEFAULT_ALGORAND_PROTOCOL_NETWORK.rpcUrl,
      name: network.name || DEFAULT_ALGORAND_PROTOCOL_NETWORK.name,
      type: network.type || DEFAULT_ALGORAND_PROTOCOL_NETWORK.type,
    }
  };
}

// Function to create an instance of AlgorandProtocolImpl
export function createAlgorandProtocol(options: RecursivePartial<AlgorandProtocolOptions> = {}): AlgorandProtocol {
  // Use createAlgorandProtocolOptions to ensure all defaults are set
  const protocolOptions: AlgorandProtocolOptions = createAlgorandProtocolOptions(options.network || {});
  return new AlgorandProtocolImpl(protocolOptions);
}