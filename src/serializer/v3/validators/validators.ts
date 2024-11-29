import BigNumber from '@airgap/coinlib-core/dependencies/src/bignumber.js-9.0.0/bignumber';
import algosdk, { SuggestedParams } from 'algosdk';
import { createAlgorandProtocol } from '../../../protocol/AlgorandProtocol';
import { newPublicKey, newSignedTransaction, newUnsignedTransaction, PublicKey } from '@airgap/module-kit';
import { AlgorandSignedTransaction, AlgorandUnsignedTransaction } from '../../../types/transaction';
import { algodClient } from '../../../config/algosdk';

export const algorandValidators = {
  // Validate transaction inputs for Algorand
  isValidAlgorandInput: async (inputs: unknown) => {
    if (!Array.isArray(inputs)) {
      return 'Input is not an array';
    }

    for (const input of inputs) {
      // Check txID and validate format
      if (!input.hasOwnProperty('txId') || typeof input.txId !== 'string' || !/^[A-Z2-7]{52}$/.test(input.txId)) {
        return "'txId' is invalid or missing in input";
      }

      // Check if 'amount' is a valid BigNumber
      if (!input.hasOwnProperty('amount') || !BigNumber.isBigNumber(input.amount)) {
        return "'amount' is not a valid BigNumber or is missing in input";
      }

      // Validate 'from' address format using Algorand SDK
      if (!input.hasOwnProperty('from') || !algosdk.isValidAddress(input.from)) {
        return "'from' is not a valid Algorand address or is missing in input";
      }
    }

    return null;
  },

  // Validate transaction outputs for Algorand
  isValidAlgorandOutput: async (outputs: unknown) => {
    if (!Array.isArray(outputs)) {
      return 'Output is not an array';
    }

    for (const output of outputs) {
      // Validate recipient address
      if (!output.hasOwnProperty('recipient') || !algosdk.isValidAddress(output.recipient)) {
        return "'recipient' is not a valid Algorand address or is missing in output";
      }

      // Check if 'value' is a valid BigNumber
      if (!output.hasOwnProperty('value') || !BigNumber.isBigNumber(output.value)) {
        return "'value' is not a valid BigNumber or is missing in output";
      }
    }

    return null;
  },

  // Validate an array of Algorand addresses
  isValidAlgorandAddressArray: async (addresses: unknown) => {
    if (!Array.isArray(addresses)) {
      return 'Address input is not an array';
    }

    for (const address of addresses) {
      if (!algosdk.isValidAddress(address)) {
        return `${address} is not a valid Algorand address`;
      }
    }

    return null;
  },

  // Validate a single Algorand address
  isValidAlgorandAddress: (address: string) => {
    return algosdk.isValidAddress(address) ? null : 'Address is not a valid Algorand address';
  },


  // Validate an Algorand transaction string to check if it is valid
  isValidAlgorandTxString: (transaction: string) => {
    if (!transaction) {
      return 'Transaction is null or undefined';
    }

    try {
      algosdk.decodeSignedTransaction(Buffer.from(transaction, 'base64'));
      return null;
    } catch (error) {
      return 'Transaction is not a valid base64-encoded Algorand transaction';
    }
  },


  
};
