import algosdk from 'algosdk';
import { AirGapTransaction, newAmount, Amount } from '@airgap/module-kit';
import { AlgorandProtocolNetwork, AlgorandUnits } from '../types/protocol';
import { AlgorandWrappedOperation } from '../types/operations/AlgorandWrappedOperation';
import { UnsupportedError, NotFoundError, ConditionViolationError } from '@airgap/coinlib-core/errors';
import { assertNever, Domain } from '@airgap/coinlib-core';
import { AlgorandOperationType } from '../types/AlgorandOperationType';

export class AlgorandAccountant<_Units extends AlgorandUnits> {
  public constructor(protected readonly network: AlgorandProtocolNetwork) {}

  /**
   * Extract transaction details from a wrapped operation
   */
  // public async getDetailsFromWrappedOperation(
  //   wrappedOperation: AlgorandWrappedOperation
  // ): Promise<AirGapTransaction<_Units, AlgorandUnits>[]> {
  //   return Promise.all(
  //     wrappedOperation.contents.map(async (content) => {
  //       let partialTxs: Partial<AirGapTransaction<_Units, AlgorandUnits>>[] = [];
  
  //       switch (content.kind) {
  //         case AlgorandOperationType.PAYMENT:
  //           partialTxs = this.getPaymentTransactionDetails(content);
  //           break;
  
  //         case AlgorandOperationType.ASSET_TRANSFER:
  //           partialTxs = this.getAssetTransferTransactionDetails(content);
  //           break;
  
  //         case AlgorandOperationType.APPLICATION_CALL:
  //           partialTxs = this.getApplicationCallTransactionDetails(content);
  //           break;
  
  //         case AlgorandOperationType.ASSET_FREEZE:
  //           partialTxs = this.getAssetFreezeTransactionDetails(content);
  //           break;
  
  //         case AlgorandOperationType.KEY_REGISTRATION:
  //         case AlgorandOperationType.ASSET_CONFIG:
  //         case AlgorandOperationType.STATE_PROOF:
  //           throw new UnsupportedError(Domain.ALGORAND, `Unsupported operation type: ${content.kind}`);
  //         default:
  //           assertNever(content.kind);
  //           throw new NotFoundError(Domain.ALGORAND, `No operation found for ${content.kind}`);
  //       }
  
  //       return partialTxs.map((partialTx) => ({
  //         from: [],
  //         to: [],
  //         isInbound: false,
  //         amount: newAmount('0', 'ALGO') as Amount<_Units>,
  //         fee: content.fee ? (newAmount(content.fee, 'ALGO') as Amount<_Units>) : newAmount('0', 'ALGO') as Amount<_Units>, // Provide default fee
  //         network: this.network,
  //         json: content,
  //         ...partialTx
  //       }));
  //     })
  //   ).then((txs) =>
  //     txs.reduce((flatten, next) => flatten.concat(next), [])
  //   );
  // }
  

  /**
   * Payment transaction details extraction
   */
  private getPaymentTransactionDetails(content: any): Partial<AirGapTransaction<_Units, AlgorandUnits>>[] {
    return [
      {
        from: [content.from],
        to: [content.to],
        amount: newAmount(content.amount, 'ALGO') as Amount<_Units>,
        fee: content.fee ? (newAmount(content.fee, 'ALGO') as Amount<_Units>) : undefined,
      },
    ];
  }

  /**
   * Asset transfer transaction details extraction
   */
  private getAssetTransferTransactionDetails(content: any): Partial<AirGapTransaction<_Units, AlgorandUnits>>[] {
    return [
      {
        from: [content.from],
        to: [content.to],
        amount: newAmount(content.assetAmount, 'asset') as Amount<_Units>,
        fee: content.fee ? (newAmount(content.fee, 'ALGO') as Amount<_Units>) : undefined,
        extra: { assetID: content.assetID },
      },
    ];
  }

  /**
   * Application call transaction details extraction
   */
  private getApplicationCallTransactionDetails(content: any): Partial<AirGapTransaction<_Units, AlgorandUnits>>[] {
    return [
      {
        from: [content.from],
        to: ['Application Call'],
        amount: newAmount('0', 'ALGO') as Amount<_Units>,
        fee: content.fee ? (newAmount(content.fee, 'ALGO') as Amount<_Units>) : undefined,
        extra: { appIndex: content.appIndex, appArgs: content.appArgs || [] },
      },
    ];
  }

  /**
   * Asset freeze transaction details extraction
   */
  private getAssetFreezeTransactionDetails(content: any): Partial<AirGapTransaction<_Units, AlgorandUnits>>[] {
    return [
      {
        from: [content.manager],
        to: [content.target],
        amount: newAmount('0', 'ALGO') as Amount<_Units>,
        fee: content.fee ? (newAmount(content.fee, 'ALGO') as Amount<_Units>) : undefined,
        extra: { assetID: content.assetID, frozen: content.newFreezeStatus },
      },
    ];
  }

  /**
   * Un-forge a transaction by decoding it into a wrapped operation
   */


  
  
}
