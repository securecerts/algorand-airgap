// details of a transaction fetched from transaction id
export interface PaymentTransaction {
    from: string
    to: string
    amount: number | bigint
    note?: Uint8Array
    dateTime: string
}
