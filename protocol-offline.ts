import {
    AddressCursor,
    AddressWithCursor,
    AirGapOfflineProtocol,
    AirGapTransaction,
    CryptoConfiguration,
    CryptoDerivative,
    KeyPair,
    ProtocolMetadata,
    PublicKey,
    SecretKey,
    SignedTransaction,
    UnsignedTransaction,
  } from "@airgap/module-kit";
  
  class MyOfflineProtocol implements AirGapOfflineProtocol {
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
     * Get this protocol's crypto configuration.
     *
     * The crypto configuration will be used to create a derivative from a secret
     * which can be used in the protocol to further derive a key pair.
     *
     * @returns The configuration
     */
    getCryptoConfiguration(): Promise<CryptoConfiguration> {
      /* ... */
    }
  
    /**
     * Derive a key pair from a secret derivative.
     *
     * @param derivative - Data derived from a secret based on this protocol crypto configuration
     * @returns The derived key pair
     */
    getKeyPairFromDerivative(derivative: CryptoDerivative): Promise<KeyPair> {
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
     * Sign the transaction with the secret key.
     *
     * @param transaction - The transaction to be signed
     * @param secretKey - The secret key to be used for signing
     * @returns A signed transaction
     */
    signTransactionWithSecretKey(
      transaction: UnsignedTransaction,
      secretKey: SecretKey
    ): Promise<SignedTransaction> {
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
  }