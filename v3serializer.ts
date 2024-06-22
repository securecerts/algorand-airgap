// v3serializer.ts

import { AirGapV3SerializerCompanion, SignedTransaction, UnsignedTransaction, V3SchemaConfiguration } from '@airgap/module-kit'
import { IACMessageType, TransactionSignRequest, TransactionSignResponse } from '@airgap/serializer'

class MyV3SerializerCompanion implements AirGapV3SerializerCompanion {
    /**
     * A list of AirGap's V3 Serializer schema configurations.
     *
     * This list will be used to register the schemas
     * in the V3 Serializer instance running in the applications.
     */
    schemas: V3SchemaConfiguration[] = [
        {
            type: IACMessageType.TransactionSignRequest,
            schema: { schema: /* ... */ },
            protocolIdentifier: 'my-protocol'
        },
        {
            type: IACMessageType.TransactionSignResponse,
            schema: { schema: /* ... */ },
            protocolIdentifier: 'my-protocol'
        }
    ]

    /**
     * Transform an unsigned transaction to Serializer's transaction sign request.
     *
     * @param identifier - The identifier of the protocol which created the transaction
     * @param unsignedTransaction - The transaction to be transformed
     * @param publicKey - The sender of the transaction
     * @param callbackUrl - The callback URL used in deeplinking
     * @returns A transaction sign request object
     */
    toTransactionSignRequest(identifier: string, unsignedTransaction: UnsignedTransaction, publicKey: string, callbackUrl?: string): Promise<TransactionSignRequest> { /* ... */ }

    /**
     * Transform Serializer's transaction sign request to an unsigned transaction.
     *
     * @param identifier - The identifier of the protocol which created the transaction
     * @param transactionSignRequest - The transaction sign request to be transformed
     * @returns An unsigned transaction
     */
    fromTransactionSignRequest(identifier: string, transactionSignRequest: TransactionSignRequest): Promise<UnsignedTransaction> { /* ... */ }

    /**
     * Validate the transaction sign request.
     *
     * @param identifier - The identifier of the protocol which created the transaction
     * @param transactionSignRequest - The transaction sign request to be validated
     * @returns `true` if the request is valid, `false` otherwise
     */
    validateTransactionSignRequest(identifier: string, transactionSignRequest: TransactionSignRequest): Promise<boolean> { /* ... */ }

    /**
     * Transform a signed transaction to Serializer's transaction sign response.
     *
     * @param identifier - The identifier of the protocol which created the transaction
     * @param signedTransaction - The transaction to be transformed
     * @param accountIdentifier - The identifier of the account which is sender of the transaction
     * @returns A transaction sign response object
     */
    toTransactionSignResponse(identifier: string, signedTransaction: SignedTransaction, accountIdentifier: string): Promise<TransactionSignResponse> { /* ... */ }

    /**
     * Transform Serializer's transaction sign response to a signed transaction.
     *
     * @param identifier - The identifier of the protocol which created the transaction
     * @param transactionSignResponse - The transaction sign response to be transformed
     * @returns A signed transaction
     */
    fromTransactionSignResponse(identifier: string, transactionSignResponse: TransactionSignResponse): Promise<SignedTransaction> { /* ... */ }

    /**
     * Validate the transaction sign response.
     *
     * @param identifier - The identifier of the protocol which created the transaction
     * @param transactionSignResponse - The transaction sign response to be validated
     * @returns `true` if the response is valid, `false` otherwise
     */
    validateTransactionSignResponse(identifier: string, transactionSignResponse: TransactionSignResponse): Promise<boolean> { /* ... */ }
}
