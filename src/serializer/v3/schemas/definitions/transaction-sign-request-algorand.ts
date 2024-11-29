import { TransactionSignRequest } from '@airgap/serializer'

import { AlgorandUnsignedTransaction } from '../../../../types/transaction'
//just copied bitcoin implemetation. change omit if we have to provide support for ASAs. To-do more research
export interface AlgorandTransactionSignRequest extends TransactionSignRequest<Omit<AlgorandUnsignedTransaction, 'type'>> {}