export enum AlgorandOperationType {
    PAYMENT = 'pay',               // Payment transaction
    KEY_REGISTRATION = 'keyreg',    // Key registration transaction
    ASSET_TRANSFER = 'axfer',       // Asset transfer transaction
    ASSET_FREEZE = 'afrz',          // Asset freeze transaction
    ASSET_CONFIG = 'acfg',          // Asset configuration transaction
    APPLICATION_CALL = 'appl',      // Application call (smart contract interaction)
    STATE_PROOF = 'stpf',           // State proof transaction
}
