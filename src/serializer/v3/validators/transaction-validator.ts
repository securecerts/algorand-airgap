// tslint:disable: max-classes-per-file
import { async } from '@airgap/coinlib-core/dependencies/src/validate.js-0.13.1/validate';
import { TransactionValidator, TransactionValidatorV2, validateSyncScheme } from '@airgap/serializer';

import { AlgorandTransactionSignRequest } from '../schemas/definitions/transaction-sign-request-algorand';
import { AlgorandTransactionSignResponse } from '../schemas/definitions/transaction-sign-response-algorand';
import { AlgorandUnsignedTransaction, AlgorandSignedTransaction } from '../../../types/transaction';

const unsignedTransactionConstraints = {
  from: {
    presence: { allowEmpty: false },
    type: 'String',
    format: {
      pattern: '^[A-Z2-7]{58}$', // Algorand address format
      message: 'is not a valid Algorand address',
    },
  },
  to: {
    presence: { allowEmpty: false },
    type: 'String',
    format: {
      pattern: '^[A-Z2-7]{58}$', // Algorand address format
      message: 'is not a valid Algorand address',
    },
  },
  amount: {
    presence: { allowEmpty: false },
    numericality: { greaterThan: 0 }, // Amount should be positive
  },
  fee: {
    presence: { allowEmpty: false },
    numericality: { greaterThanOrEqualTo: 1000 }, // Minimum fee in microAlgos
  },
  suggestedParams: {
    presence: { allowEmpty: false },
    type: 'Object',
    keys: {
      genesisHash: { presence: true, type: 'String' },
      genesisID: { presence: true, type: 'String' },
      firstRound: { presence: true, numericality: { onlyInteger: true, greaterThan: 0 } },
      lastRound: { presence: true, numericality: { onlyInteger: true, greaterThanOrEqualTo: 0 } },
      fee: { presence: true, numericality: { greaterThanOrEqualTo: 1000 } },
    },
  },
  note: {
    type: 'String',
    presence: { allowEmpty: true }, // Optional field
  },
};

const signedTransactionConstraints = {
  transaction: {
    presence: { allowEmpty: false },
    type: 'Object',
    isValidAlgorandSignedTransaction: true, // Custom validator to check Algorand signed transaction format
  },
};

const success = () => undefined;
const error = (errors: any) => errors;

export class AlgorandTransactionValidator implements TransactionValidator, TransactionValidatorV2 {
  public validateUnsignedTransaction(request: AlgorandTransactionSignRequest): Promise<any> {
    const transaction = request.transaction as AlgorandUnsignedTransaction;
    validateSyncScheme({});

    return async(transaction, unsignedTransactionConstraints).then(success, error);
  }

  public validateSignedTransaction(signedTx: AlgorandTransactionSignResponse): any {
    return async(signedTx, signedTransactionConstraints).then(success, error);
  }
}
