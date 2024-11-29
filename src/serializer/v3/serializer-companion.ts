import { AirGapV3SerializerCompanion, SignedTransaction, UnsignedTransaction } from '@airgap/module-kit'
import { V3SchemaConfiguration } from '@airgap/module-kit/types/serializer'
import { IACMessageType, SchemaRoot, TransactionSignRequest, TransactionSignResponse } from '@airgap/serializer'

import { ProtocolIdentifier } from '../../types/protocol'
import {
  AlgorandSignedTransaction,
  AlgorandUnsignedTransaction
} from '../../types/transaction'

import {

  algorandSignedTransactionToResponse,
  algorandTransactionSignRequestToUnsigned,
  algorandTransactionSignResponseToSigned,
  algorandUnsignedTransactionToRequest
} from './schemas/converter/transaction-converter'
import { AlgorandTransactionSignResponse } from './schemas/definitions/transaction-sign-response-algorand'
import { AlgorandTransactionValidator } from './validators/transaction-validator'

const algorandTransactionSignRequest: SchemaRoot = require('./schemas/generated/transaction-sign-request-algorand.json')
const algorandTransactionSignResponse: SchemaRoot = require('./schemas/generated/transaction-sign-response-algorand.json')

const algorandSegwitTransactionSignRequest: SchemaRoot = require('./schemas/generated/transaction-sign-request-algorand-segwit.json')
const algorandSegwitTransactionSignResponse: SchemaRoot = require('./schemas/generated/transaction-sign-response-algorand-segwit.json')

export class AlgorandV3SerializerCompanion implements AirGapV3SerializerCompanion {
  public readonly schemas: V3SchemaConfiguration[] = [
    {
      type: IACMessageType.TransactionSignRequest,
      schema: { schema: algorandTransactionSignRequest },
      protocolIdentifier: ProtocolIdentifier.ALGORAND
    },
    {
      type: IACMessageType.TransactionSignResponse,
      schema: { schema: algorandTransactionSignResponse },
      protocolIdentifier: ProtocolIdentifier.ALGORAND
    },
   
  ]

  private readonly algorandTransactionValidator: AlgorandTransactionValidator = new AlgorandTransactionValidator()

  public async toTransactionSignRequest(
    identifier: string,
    unsignedTransaction: UnsignedTransaction,
    publicKey: string,
    callbackUrl?: string
  ): Promise<TransactionSignRequest> {
    switch (identifier) {
      case ProtocolIdentifier.ALGORAND:
        return algorandUnsignedTransactionToRequest(unsignedTransaction as AlgorandUnsignedTransaction, publicKey, callbackUrl)
      
      default:
        throw new Error(`Protocol ${identifier} not supported`)
    }
  }

  public async fromTransactionSignRequest(
    identifier: string,
    transactionSignRequest: TransactionSignRequest
  ): Promise<AlgorandUnsignedTransaction> {
    switch (identifier) {
      case ProtocolIdentifier.ALGORAND:
        return algorandTransactionSignRequestToUnsigned(transactionSignRequest)
      default:
        throw new Error(`Protocol ${identifier} not supported`)
    }
  }

  public async validateTransactionSignRequest(identifier: string, transactionSignRequest: TransactionSignRequest): Promise<boolean> {
    switch (identifier) {
      case ProtocolIdentifier.ALGORAND:
        try {
          await this.algorandTransactionValidator.validateUnsignedTransaction(transactionSignRequest)

          return true
        } catch {
          return false
        }
      default:
        throw new Error(`Protocol ${identifier} not supported`)
    }
  }

  public async toTransactionSignResponse(
    identifier: string,
    signedTransaction: SignedTransaction,
    accountIdentifier: string
  ): Promise<TransactionSignResponse> {
    switch (identifier) {
      case ProtocolIdentifier.ALGORAND:
        return algorandSignedTransactionToResponse(signedTransaction as AlgorandSignedTransaction, accountIdentifier)
     
      default:
        throw new Error(`Protocol ${identifier} not supported`)
    }
  }

  public async fromTransactionSignResponse(
    identifier: string,
    transactionSignResponse: TransactionSignResponse
  ): Promise<SignedTransaction> {
    switch (identifier) {
      case ProtocolIdentifier.ALGORAND:
        return algorandTransactionSignResponseToSigned(transactionSignResponse as AlgorandTransactionSignResponse)
     
      default:
        throw new Error(`Protocol ${identifier} not supported`)
    }
  }

  public async validateTransactionSignResponse(identifier: string, transactionSignResponse: TransactionSignResponse): Promise<boolean> {
    switch (identifier) {
      case ProtocolIdentifier.ALGORAND:
        try {
          await this.algorandTransactionValidator.validateSignedTransaction(transactionSignResponse as AlgorandTransactionSignResponse)

          return true
        } catch {
          return false
        }
      
      default:
        throw new Error(`Protocol ${identifier} not supported`)
    }
  }
}