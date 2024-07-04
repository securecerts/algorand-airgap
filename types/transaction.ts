import { SignedTransaction, TransactionCursor, UnsignedTransaction } from '@airgap/module-kit'

interface SuggestedParams {
    fee: number
    firstRound: number
    flatFee?: boolean
    genesisHash: string
    genesisID: string
    lastRound: number
}

export interface AlgorandUnsignedTransaction extends UnsignedTransaction{
    from: string
    to: string
    amount: number | bigint
    closeRemainderTo: string
    note: Uint8Array
    suggestedParams: SuggestedParams
    rekeyTo?: string
}

interface EncodedSubsig{
    pk: Uint8Array
    s?: Uint8Array
} 

interface EncodedMultisig{
    subsig: EncodedSubsig[]
    thr: number
    v: number
}

interface EncodedLogicSig{
    arg?: Uint8Array[]
    l: Uint8Array
    msig?: EncodedMultisig
    sig?: Uint8Array
}

export interface AlgorandSignedTransaction extends SignedTransaction {
    lsig?: EncodedLogicSig
    msig?: EncodedMultisig
    sgnr?: Buffer
    sig?: Buffer
    txn: AlgorandUnsignedTransaction
}

export interface AlgorandTransactionCursor extends TransactionCursor {
    next: string
}