import { derive, mnemonicToSeed } from '@airgap/crypto'
import * as BIP39 from '@airgap/coinlib-core/dependencies/src/bip39-2.5.0/index
import {
    AirGapProtocol,
  Amount,
  CryptoDerivative,
  PublicKey,
  SecretKey,
  Signature,
  SignedTransaction,
  UnsignedTransaction
} from '@airgap/module-kit'
import { algod, getTransactionParams, signTransaction, sendTransaction } from '@algorand/client-sdk'

const mnemonic: string = 'spell device they juice trial skirt amazing boat badge steak usage february virus art survey'

interface ProtocolHTTPStub<_Protocol extends AirGapProtocol> {
  registerStub(testProtocolSpec: TestProtocolSpec<_Protocol>): Promise<any>
  noBalanceStub(testProtocolSpec: TestProtocolSpec<_Protocol>): Promise<any>
  transactionListStub(testProtocolSpec: TestProtocolSpec<_Protocol>, address: string): Promise<any>
}

abstract class TestProtocolSpec<
  _Protocol extends AirGapProtocol<{ Units: _Units; UnsignedTransaction: _UnsignedTransaction; SignedTransaction: _SignedTransaction }>,
  _Units extends string = string,
  _UnsignedTransaction extends UnsignedTransaction = UnsignedTransaction,
  _SignedTransaction extends SignedTransaction = SignedTransaction
> {
  public name: string = 'TEST'
  public abstract lib: _Protocol
  public abstract stub: ProtocolHTTPStub<_Protocol>
  public validAddresses: string[] = []
  public abstract wallet: {
    secretKey: SecretKey
    publicKey: PublicKey
    addresses: string[]
  }
  public txs: {
    to: string[]
    from: string[]
    amount: Amount<_Units>
    fee: Amount<_Units>
    unsignedTx: _UnsignedTransaction
    signedTx: _SignedTransaction
  }[] = []
  public messages: { message: string; signature: Signature }[] = []
  public encryptAsymmetric: { message: string; encrypted: string }[] = []
  public encryptAES: { message: string; encrypted: string }[] = []

  // Retrieve transactions for a given address
  public transactionList(address: string): { first: any[]; next: any[] } {
    return { first: [], next: [] }
  }

  // Seed derivation (in Algorand, this is through BIP39 and an Ed25519 key)
  public seed(): string {
    return BIP39.mnemonicToSeedHex(mnemonic)
  }

  // Retrieve the mnemonic
  public mnemonic(): string {
    return mnemonic
  }

  // Deriving a crypto key based on Algorand's HD path and mnemonic
  public async derivative(derivationPath?: string): Promise<CryptoDerivative> {
    const [metadata, cryptoConfiguration] = await Promise.all([this.lib.getMetadata(), this.lib.getCryptoConfiguration()])

    return derive(
      cryptoConfiguration,
      await mnemonicToSeed(cryptoConfiguration, this.mnemonic()),
      derivationPath ?? metadata.account.standardDerivationPath
    )
  }
}

  // Create an Algorand transaction (e.g., a Payment Transaction)


export { mnemonic, TestProtocolSpec, ProtocolHTTPStub }
